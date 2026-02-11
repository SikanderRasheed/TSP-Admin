import { useState } from "react";
import { message } from "antd";
import uploadService from "@/services/uploadService";

/**
 * Custom hook for handling image uploads (profile and cover images)
 * Provides loading states, error handling, and success callbacks
 */
const useImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload profile image
   * @param {File} imageFile - The image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} - Upload result
   */
  const uploadProfileImage = async (imageFile, options = {}) => {
    const {
      onSuccess,
      onError,
      showSuccessMessage = true,
      validateFile = true,
    } = options;

    try {
      setLoading(true);
      setUploadProgress(0);

      // Validate file if enabled
      if (validateFile) {
        const validation = uploadService.validateImageFile(imageFile);
        if (!validation.isValid) {
          message.error(validation.error);
          if (onError) onError(new Error(validation.error));
          return { success: false, error: validation.error };
        }
      }

      setUploadProgress(50); // Simulate progress

      const result = await uploadService.uploadProfileImage(imageFile, {
        showSuccessNotification: false,
      });

      setUploadProgress(100);
      if (onSuccess) onSuccess(result);
      return { success: true, data: result };
    } catch (error) {
      console.error("Profile image upload failed:", error);
      if (onError) onError(error);
      return { success: false, error: error.message || "Upload failed" };
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after delay
    }
  };

  /**
   * Upload cover image
   * @param {File} imageFile - The image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} - Upload result
   */
  const uploadCoverImage = async (imageFile, options = {}) => {
    const {
      onSuccess,
      onError,
      showSuccessMessage = true,
      validateFile = true,
    } = options;

    try {
      setLoading(true);
      setUploadProgress(0);

      // Validate file if enabled
      if (validateFile) {
        const validation = uploadService.validateImageFile(imageFile);
        if (!validation.isValid) {
          message.error(validation.error);
          if (onError) onError(new Error(validation.error));
          return { success: false, error: validation.error };
        }
      }

      setUploadProgress(50); // Simulate progress

      const result = await uploadService.uploadCoverImage(imageFile, {
        showSuccessNotification: false,
      });

      setUploadProgress(100);

      if (onSuccess) onSuccess(result);
      return { success: true, data: result };
    } catch (error) {
      console.error("Cover image upload failed:", error);
      if (onError) onError(error);
      return { success: false, error: error.message || "Upload failed" };
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000); // Reset progress after delay
    }
  };

  /**
   * Generic upload method
   * @param {string} imageType - 'profile_image' or 'cover_image'
   * @param {File} imageFile - The image file to upload
   * @param {Object} options - Upload options
   * @returns {Promise} - Upload result
   */
  const uploadImage = async (imageType, imageFile, options = {}) => {
    if (imageType === "profile_image") {
      return uploadProfileImage(imageFile, options);
    } else if (imageType === "cover_image") {
      return uploadCoverImage(imageFile, options);
    } else {
      throw new Error(
        "Invalid image type. Must be 'profile_image' or 'cover_image'"
      );
    }
  };

  return {
    loading,
    uploadProgress,
    uploadProfileImage,
    uploadCoverImage,
    uploadImage,
  };
};

export default useImageUpload;
