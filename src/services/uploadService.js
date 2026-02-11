import apiClient from "./apiClient";

/**
 * Upload service for handling both profile and cover image uploads
 * Uses the allTypeFileUpload API endpoint with FormData
 */
const uploadService = {
  /**
   * Upload profile image
   * @param {File} imageFile - The image file to upload
   * @param {Object} options - Additional options for the request
   * @returns {Promise} - Promise that resolves to the API response
   */
  async uploadProfileImage(imageFile, options = {}) {
    const formData = new FormData();
    formData.append("key", "profile_image"); // Key: profile_image, Value: binary file
    formData.append("image", imageFile); // Key: profile_image, Value: binary file

    return await apiClient.request("allTypeFileUpload", {
      data: formData,
      useFormData: true,
      showSuccessNotification: options.showSuccessNotification || false,
      ...options,
    });
  },

  /**
   * Upload cover image
   * @param {File} imageFile - The image file to upload
   * @param {Object} options - Additional options for the request
   * @returns {Promise} - Promise that resolves to the API response
   */
  async uploadCoverImage(imageFile, options = {}) {
    const formData = new FormData();
    formData.append("key", "profile_image");
    formData.append("image", imageFile); // Key: cover_image, Value: binary file

    return await apiClient.request("allTypeFileUpload", {
      data: formData,
      useFormData: true,
      showSuccessNotification: options.showSuccessNotification || false,
      ...options,
    });
  },

  /**
   * Generic upload method for any type of image
   * @param {File} imageFile - The image file to upload
   * @param {string} imageType - Type of image ('profile_image' or 'cover_image')
   * @param {Object} options - Additional options for the request
   * @returns {Promise} - Promise that resolves to the API response
   */
  async uploadImage(imageType, imageFile, options = {}) {
    if (!["profile_image", "cover_image"].includes(imageType)) {
      throw new Error(
        "Invalid image type. Must be 'profile_image' or 'cover_image'"
      );
    }

    const formData = new FormData();
    formData.append(imageType, imageFile); // Key: imageType, Value: binary file

    return await apiClient.request("allTypeFileUpload", {
      data: formData,
      useFormData: true,
      showSuccessNotification: options.showSuccessNotification || false,
      ...options,
    });
  },

  /**
   * Validate image file before upload
   * @param {File} file - The file to validate
   * @param {Object} options - Validation options
   * @returns {Object} - Validation result with isValid and error message
   */
  validateImageFile(file, options = {}) {
    const {
      maxSize = 2 * 1024 * 1024, // 2MB default
      allowedTypes = ["image/jpeg", "image/png", "image/jpg"],
    } = options;

    if (!file) {
      return { isValid: false, error: "No file selected" };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Only ${allowedTypes.join(
          ", "
        )} are allowed.`,
      };
    }

    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      return {
        isValid: false,
        error: `File size must be less than ${maxSizeMB}MB`,
      };
    }

    return { isValid: true };
  },
};

export default uploadService;
