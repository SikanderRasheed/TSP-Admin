import api from "./api";
import { notification } from "antd";
import Swal from "sweetalert2";
import "@/hooks/sweetalert.css";

// No need to import Helper, we'll use window.helper

/**
 * Simple fetch client for API requests
 */
const apiClient = {
  /**
   * Create a fetch request with common headers and options
   * @param {string} url - API URL
   * @param {Object} options - Fetch options
   * @param {string} endpoint - API endpoint name for token logic
   * @returns {Promise} - Fetch promise
   */
  async fetchApi(url, options = {}, endpoint = "") {
    const {
      data,
      useFormData = false,
      customHeaders = {},
      ...fetchOptions
    } = options;

    // Set up headers with CORS support
    const headers = new Headers();

    headers.append("Accept", "application/json");

    // Don't set Content-Type for FormData
    if (!useFormData && options.method !== "GET") {
      headers.append("Content-Type", "application/json");
    }

    // Define endpoints that should NOT send token
    const publicEndpoints = [
      "login",
      "signup",
      "forgotPassword",
      "verifyOtp",
      "resetPassword",
    ];

    // Add auth token if available and not a public endpoint
    if (
      window.user &&
      (window.user.api_token || window.user.access_token || window.user.token) &&
      !publicEndpoints.includes(endpoint)
    ) {
      const token = window.user.api_token || window.user.access_token || window.user.token;
      headers.append("Authorization", `Bearer ${token}`);
      console.log(`🔐 [${endpoint}] Authorization header added:`, `Bearer ${token.substring(0, 20)}...`);
    } else if (!publicEndpoints.includes(endpoint)) {
      console.warn(`⚠️ [${endpoint}] No token found! window.user:`, window.user);
    }

    // Add custom headers
    Object.entries(customHeaders).forEach(([key, value]) => {
      headers.append(key, value);
    });

    // Prepare request options with CORS support
    const requestOptions = {
      ...fetchOptions,
      headers,
    };

    // Add body for non-GET and non-DELETE requests
    if (data && options.method !== "GET" && options.method !== "DELETE") {
      if (useFormData) {
        // Check if data is already a FormData object
        if (data instanceof FormData) {
          requestOptions.body = data;
        } else {
          // Create FormData from regular object
          const formData = new FormData();
          Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value);
          });
          requestOptions.body = formData;
        }
      } else {
        requestOptions.body = JSON.stringify(data);
      }
    }

    return fetch(url, requestOptions);
  },

  /**
   * Handle API response
   * @param {Response} response - Fetch response
   * @param {boolean} showSuccessNotification - Whether to show success notifications
   * @param {string} endpoint - API endpoint name
   * @param {string} method - HTTP method used for the request
   * @returns {Promise} - Parsed response data
   */
  async handleResponse(
    response,
    showSuccessNotification = false,
    endpoint = "",
    method = ""
  ) {
    // Get all headers into a plain object before consuming the response body
    const headers = {};
    for (const [key, value] of response.headers.entries()) {
      headers[key.toLowerCase()] = value;
    }
    const pagination = {
      currentPage: parseInt(headers["x-current-page"]),
      pageLimit: parseInt(headers["x-page-limit"]),
      totalCount: parseInt(headers["x-total-count"]),
      totalPages: parseInt(headers["x-total-pages"]),
    };

    const data = await response.json(); // Consume the response body

    if (response.ok) {
      // Handle token updates from response headers for login and signup
      const tokenUpdateEndpoints = ["signup", "login"];

      if (tokenUpdateEndpoints.includes(endpoint)) {
        // Check for access_token in response headers (try multiple header names)
        const accessToken =
          headers["access_token"] ||
          headers["access-token"] ||
          headers["authorization"];

        if (accessToken) {
          // Clean the token (remove 'Bearer ' prefix if present)
          const cleanToken = accessToken.replace(/^Bearer\s+/i, "");

          // Add token to response data if not already present
          if (!data.access_token && !data.api_token) {
            data.api_token = cleanToken;
          }

          // Update the global user object and storage for login/signup
          if (window.user) {
            // Store token in both fields for compatibility
            window.user.api_token = cleanToken;
            window.user.access_token = cleanToken;

            // Update storage with the new token
            if (window.helper && window.helper.setStorageData) {
              try {
                await window.helper.setStorageData("session", window.user);
              } catch (error) {
                console.error("Error updating storage with new token:", error);
              }
            }
          }
        }
      }

      // Show success messages for POST, PUT, PATCH, DELETE API calls when explicitly enabled
      if (
        (method === "POST" ||
          method === "PUT" ||
          method === "PATCH" ||
          method === "DELETE") &&
        showSuccessNotification
      ) {
        // First check for x-status-message header, then data.message
        const statusMessage = headers["x-status-message"] || data.message;

        if (statusMessage) {
          notification.success({
            message: "Success",
            description: statusMessage,
            duration: 4,
          });
        }
      }
      return { data, pagination }; // Return both data and pagination
    }

    // Always handle errors with notifications
    if (response.status === 401) {
      // Log detailed auth error info for debugging
      console.error("❌ 401 Unauthorized Error:", {
        endpoint,
        errorKey: data.errorKey,
        errorDesc: data.errorDesc,
        hasWindowUser: !!window.user,
        hasToken: !!(window.user?.token || window.user?.api_token || window.user?.access_token),
      });

      // Show SweetAlert for 401 errors and handle storage clearing
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: "custom-swal-confirm-btn",
          cancelButton: "custom-swal-cancel-btn",
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          content: "custom-swal-content",
        },
      });

      await swalWithBootstrapButtons
        .fire({
          title: "Session Expired",
          text: data.errorDesc || "Your session has expired. Please log in again.",
          icon: "warning",
          confirmButtonText: "OK",
          allowOutsideClick: false,
          allowEscapeKey: false,
        })
        .then(() => {
          // Clear storage and redirect after user clicks OK
          if (window.helper && window.helper.removeStorageData) {
            window.helper.removeStorageData();
          } else {
            // Fallback if helper is not available
            localStorage.clear();
            window.user = {};
            // Use window.location.replace to prevent back navigation
            window.location.replace("/login");
          }
        });
    } else if (response.status === 400 || response.status === 422) {
      // Handle 400 and 422 validation errors
      if (data.message && Array.isArray(data.message)) {
        // Backend returns array of error strings
        data.message.forEach((errorMessage, index) => {
          notification.error({
            message: "Validation Error",
            description: errorMessage,
            duration: 4,
            key: `validation-error-${index}`, // Unique key to prevent duplicates
          });
        });
      }
      if (data.error) {
        notification.error({
          message: "Error",
          description: data.error,
          duration: 4,
        });
      } else if (data.errors && typeof data.errors === "object") {
        // Laravel/standard validation format (object)
        Object.entries(data.errors).forEach(([field, message]) => {
          notification.error({
            message: "Validation Error",
            description: `${Array.isArray(message) ? message[0] : message}`,
            duration: 4,
          });
        });
      } else if (data.message && typeof data.message === "string") {
        // Single error message
        notification.error({
          message: "Error",
          description: data.message,
          duration: 4,
        });
      } else if (Array.isArray(data)) {
        // Direct array of error messages
        data.forEach((errorMessage, index) => {
          notification.error({
            message: "Error",
            description: errorMessage,
            duration: 4,
            // key: `validation-error-${index}`,
          });
        });
      }
    } else if (data.data) {
      // Handle errors inside data.data structure
      if (typeof data.data === "object" && !Array.isArray(data.data)) {
        // Handle object with multiple key-value pairs
        Object.entries(data.data).forEach(([field, message]) => {
          // Handle different types of message values
          if (typeof message === "string") {
            notification.error({
              message: `Validation Error`,
              description: message,
              duration: 4,
            });
          } else if (Array.isArray(message)) {
            // If message is an array, show the first item
            notification.error({
              message: `Error: ${field}`,
              description: message[0],
              duration: 4,
            });
          } else if (typeof message === "object") {
            // If message is an object, stringify it
            notification.error({
              message: `Error: ${field}`,
              description: JSON.stringify(message),
              duration: 4,
            });
          }
        });
      } else if (typeof data.data === "string") {
        // Handle simple string error in data.data
        notification.error({
          message: "Error",
          description: data.data,
          duration: 4,
        });
      }
    } else {
      notification.error({
        message: "Error",
        description: data.message || "Something went wrong",
        duration: 4,
      });
    }

    throw { status: response.status, ...data };
  },

  /**
   * Get the full URL for an API endpoint
   * @param {string} endpoint - API endpoint key
   * @param {Object} params - URL parameters
   * @param {string} slug - Optional URL slug
   * @returns {string} - Full URL
   */
  getUrl(endpoint, params = {}, slug = "") {
    if (!api[endpoint]) {
      throw new Error(`API endpoint "${endpoint}" not found`);
    }

    const { url } = api[endpoint];
    const baseUrl =
      window.constants?.api_base_url ||
      "https://sphere-qa-89d7.up.railway.app/api/";

    // Build the URL with the slug if provided
    let fullUrl = `${baseUrl}${url}`;

    // Append the slug to the URL if provided
    if (slug) {
      fullUrl = `${fullUrl}/${slug}`;
    }

    // Add query params
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      fullUrl += fullUrl.includes("?") ? `&${queryString}` : `?${queryString}`;
    }

    return fullUrl;
  },

  /**
   * Make a request to the API
   * @param {string} endpoint - API endpoint key
   * @param {Object} options - Request options
   * @returns {Promise} - Promise that resolves to the API response
   */
  async request(endpoint, options = {}) {
    if (!api[endpoint]) {
      throw new Error(`API endpoint "${endpoint}" not found`);
    }

    const {
      params,
      slug,
      method: customMethod, // Allow overriding the method
      showSuccessNotification = false,
      ...fetchOptions
    } = options;
    // Use the custom method if provided, otherwise use the endpoint's method
    const method = customMethod || api[endpoint].method;

    try {
      const url = this.getUrl(endpoint, params, slug);
      const response = await this.fetchApi(
        url,
        { method, ...fetchOptions },
        endpoint
      );

      return this.handleResponse(
        response,
        showSuccessNotification,
        endpoint,
        method
      );
    } catch (error) {
      // Check if it's a network error (not handled by handleResponse)
      if (!error.status) {
        // Show network/CORS errors
        notification.error({
          message: "Network Error",
          description:
            error.message ||
            "Failed to connect to the server. Please check your internet connection.",
          duration: 6,
        });
      }

      // Re-throw error for React Query to handle
      throw error;
    }
  },
};

export default apiClient;
