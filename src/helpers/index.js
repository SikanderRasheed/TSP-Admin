const secretKey = "app.resarchHound753";
import _ from "lodash";
import Swal from "sweetalert2";
import { notification, message } from "antd";
import { dateHelper } from "./dateHelper";
// Helper functions for native crypto operations
const deriveKey = async (password, salt) => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptData = async (data, password) => {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(data)
  );

  // Combine salt, iv, and encrypted data
  const combined = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
};

const decryptData = async (encryptedData, password) => {
  try {
    // Convert from base64
    const combined = new Uint8Array(
      atob(encryptedData)
        .split("")
        .map((char) => char.charCodeAt(0))
    );

    // Extract salt, iv, and encrypted data
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);

    const key = await deriveKey(password, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

const Helper = {
  devLog: function (message, params = "") {
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "dev"
    ) {
    }
    return;
  },
  truncateText: function (text, maxLength) {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  },
  getStorageData: async function (key) {
    let data = localStorage.getItem(key);
    if (_.isEmpty(data)) {
      return {};
    }

    // Decrypt using native crypto
    try {
      const decryptedString = await decryptData(data, secretKey);
      if (decryptedString) {
        const decryptedData = JSON.parse(decryptedString);
        return _.isEmpty(decryptedData) ? {} : decryptedData;
      }
      return {};
    } catch (error) {
      console.error("Error decrypting storage data:", error);
      return {};
    }
  },
  setStorageData: async function (key, value) {
    console.log("key",key);
    console.log("value",value);
    try {
      // Encrypt using native crypto
      const ciphertext = await encryptData(JSON.stringify(value), secretKey);
      localStorage.setItem(key, ciphertext);
    } catch (error) {
      console.error("Error encrypting storage data:", error);
    }
  },
  removeStorageData: function () {
    localStorage.clear();
    window.user = {};
    // Use window.location.replace to prevent back navigation
    window.location.replace("/login");
  },

  loadScript(src) {
    var tag = document.createElement("script");
    tag.async = false;
    tag.src = src;
    var body = document.getElementsByTagName("body")[0];
    body.appendChild(tag);
  },

  overlay(is_show = false) {
    if (is_show === true) {
      if (document.getElementById("overlay"))
        document.getElementById("overlay").style.display = "block";
    } else {
      if (document.getElementById("overlay"))
        document.getElementById("overlay").style.display = "none";
    }
  },

  dateFormat(given_date) {
    return moment(given_date).format("YYYY-MM-DD hh:mm:ss");
  },
  dateFormattoYMD(given_date) {
    console.log(moment(given_date).format("L"));
    return moment(given_date).format("YYYY-MM-DD");
  },
  dateFormattoYMDSlashes(given_date) {
    // console.log(moment(given_date).format('L'))
    return moment(given_date).format("L");
  },

  dayFromdate(given_date) {
    const date = moment(given_date);
    // console.log(moment(date).format('dddd'))
    return date.format("dddd");
  },
  formatPhoneNumber(number) {
    // Ensure the number starts with a country code and remove the '+' sign
    if (!number || typeof number !== "string") {
      return "";
    }

    // Slice off the leading '+' and the country code
    const countryCode = number.slice(0, 2); // "+1"
    const areaCode = number.slice(2, 5); // "323"
    const firstPart = number.slice(5, 8); // "648"
    const secondPart = number.slice(8); // "4282"

    // Format as desired: +1 (323) 648-4282
    const formattedNumber = `+${countryCode} (${areaCode}) ${firstPart}-${secondPart}`;

    return formattedNumber;
  },

  randomid(length) {
    let result = [];
    let characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charactersLength = characters.length;

    // Use crypto-secure random generation
    const randomValues = crypto.getRandomValues(new Uint8Array(length));

    for (let i = 0; i < length; i++) {
      result.push(characters.charAt(randomValues[i] % charactersLength));
    }
    return result.join("");
  },
  encryptCryptoString: async function (data) {
    try {
      // Use the same encryption method as setStorageData but with different key
      const secret = window.constants?.crypto_secret || secretKey;
      const ciphertext = await encryptData(data, secret);
      return ciphertext;
    } catch (error) {
      console.error("Error encrypting crypto string:", error);
      return data; // Return original data if encryption fails
    }
  },
  timeDiff(sTime, eTime) {
    const startTime = moment(sTime, "HH:mm:ss");
    const endTime = moment(eTime, "HH:mm:ss");
    time_diff = moment.duration(endTime.diff(startTime));
    time_diff =
      time_diff > 0 ? time_diff : moment.duration(startTime.diff(endTime));
    return time_diff.hours() + ":" + time_diff.minutes();
  },
  getUid() {
    // Use crypto-secure random generation for UID
    const randomValues = crypto.getRandomValues(new Uint32Array(1));
    // Scale to range 100000000 - 999999999
    const number = 100000000 + (randomValues[0] % 900000000);
    return number;
  },
  sendNotification: (
    type = "success",
    message = "Success",
    description = "..."
  ) => {
    notification[type]({ message, description });
  },
  successMessage: (data) => {
    return message.info(data);
  },
  sweetAlert: async function (
    type = "success",
    title = "Success",
    msg = "success",
    callback = () => {}
  ) {
    return Swal.fire({
      title: title,
      text: msg,
      icon: type,
      confirmButtonText: "OK",
    }).then(callback);
  },
  generateRanges: (step = 50, max = 1000) => {
    const ranges = [];
    for (let i = 0; i < max; i += step) {
      const range = `${i}-${i + step}`;
      ranges.push({ key: range, value: range });
    }
    return ranges;
  },
  formatPhoneNumber: (phoneNumber) => {
    // Remove any non-numeric characters (except +)
    const cleaned = phoneNumber.replace(/[^\d+]/g, "");

    // Extract country code (assuming it's always +1 in this case)
    const countryCode = cleaned.substring(0, 2); // +1
    const areaCode = cleaned.substring(2, 5); // First 3 digits after +1
    const firstPart = cleaned.substring(5, 8); // Next 3 digits
    const secondPart = cleaned.substring(8, 11); // Last 3 digits

    // Format the number
    return `${countryCode} ${areaCode} ${firstPart} ${secondPart}`;
  },

  /**
   * Get label from value using predefined mappings
   * @param {string} type - The type of mapping to use
   * @param {any} value - The value to get label for
   * @returns {string} - The corresponding label or the original value if not found
   */
  getLabel: function (type, value) {
    // Define all value-to-label mappings
    const mappings = {
      // Professional types
      professional_type: {
        broker: "Real Estate Broker",
        lender: "Lender/ mtg Broker",
        commercial: "Commercial Agent",
      },

      // Boolean mappings
      boolean: {
        true: "Yes",
        false: "No",
        1: "Yes",
        0: "No",
      },

      // Multi-state license (specific boolean case)
      multi_state_license: {
        true: "Yes",
        false: "No",
        1: "Yes",
        0: "No",
      },

      // Status mappings
      status: {
        active: "Active",
        inactive: "Inactive",
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
      },

      // User roles
      user_role: {
        admin: "Administrator",
        user: "User",
        moderator: "Moderator",
        agent: "Agent",
        broker: "Broker",
      },
    };

    // Get the mapping for the specified type
    const typeMapping = mappings[type];

    if (!typeMapping) {
      console.warn(`No mapping found for type: ${type}`);
      return value;
    }

    // Convert value to string for consistent lookup
    const stringValue = String(value);

    // Return the label if found, otherwise return the original value
    return typeMapping[stringValue] || value;
  },

  // Add date helper to main helper object
  date: dateHelper,

  // Add notification helper for easy access
  notification: {
    success: (message, description = "") => {
      notification.success({ message, description, duration: 4 });
    },
    error: (message, description = "") => {
      notification.error({ message, description, duration: 4 });
    },
    info: (message, description = "") => {
      notification.info({ message, description, duration: 4 });
    },
    warning: (message, description = "") => {
      notification.warning({ message, description, duration: 4 });
    },
  },
};

export default Helper;
