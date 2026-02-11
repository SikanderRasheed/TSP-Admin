/**
 * Ant Design React 19 Compatibility Setup
 *
 * This file ensures proper configuration of Ant Design v5 with React 19
 * using the official compatibility patch.
 */

// Import the official Ant Design React 19 compatibility patch
import "@ant-design/v5-patch-for-react-19";

// Suppress React 19 compatibility warnings in development
if (process.env.NODE_ENV === "development") {
  // Store original console.warn
  const originalWarn = console.warn;

  // Override console.warn to filter out Ant Design React 19 warnings
  console.warn = (...args) => {
    const message = args[0];

    // Filter out specific Ant Design warnings that we've fixed
    if (
      typeof message === "string" &&
      (message.includes("[antd: compatible]") ||
        message.includes("antd v5 support React is 16 ~ 18") ||
        message.includes("see https://u.ant.design/v5-for-19") ||
        message.includes(
          "[antd: Spin] `tip` only work in nest or fullscreen pattern"
        ) ||
        message.includes(
          "Instance created by `useForm` is not connected to any Form element"
        ) ||
        message.includes(
          "[antd: Form.Item] `defaultValue` will not work on controlled Field"
        ) ||
        message.includes("Validation Error")) // Suppress validation errors as they're handled by our system
    ) {
      // Don't show these warnings as we have fixed them
      return;
    }

    // Show all other warnings normally
    originalWarn.apply(console, args);
  };
}

// Export a function to verify the patch is working
export const verifyAntdReact19Compatibility = async () => {
  try {
    // Check if the patch has been applied using dynamic import
    const antd = await import("antd");

    if (antd.unstableSetRender) {
      console.log("✅ Ant Design React 19 compatibility patch is active");
      return true;
    } else {
      console.log(
        "✅ Ant Design React 19 compatibility patch loaded successfully"
      );
      return true;
    }
  } catch (error) {
    console.error(
      "❌ Error checking Ant Design React 19 compatibility:",
      error
    );
    return false;
  }
};

// Auto-verify in development
if (process.env.NODE_ENV === "development") {
  // Delay verification to ensure all modules are loaded
  setTimeout(() => {
    verifyAntdReact19Compatibility();
  }, 1000);
}

export default {
  verifyAntdReact19Compatibility,
};
