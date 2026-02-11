const formatFieldName = (name) => {
  if (typeof name !== "string") return "";
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const validations = {
  required: (fieldName) => ({
    required: true,
    message: `${formatFieldName(fieldName)} is required`,
  }),

  email: () => ({
    pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    message: "Enter Valid email",
  }),

  minLength: (length) => (fieldName) => ({
    min: length,
    message: `${formatFieldName(
      fieldName
    )} must be at least ${length} characters`,
  }),

  maxLength: (length) => (fieldName) => ({
    max: length,
    message: `${formatFieldName(
      fieldName
    )} must not be greater than ${length} characters`,
  }),
  password: () => ({
    pattern: /^.{6,}$/,
    message: "Password must be at least 6 characters long",
  }),
  passwordCharacters: () => ({
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
    message:
      "Password must include uppercase, lowercase, number, and special character",
  }),
  phone: () => ({
    pattern: /^\(\d{3}\)\s\d{3}-\d{4}$/,
    message: "Phone number must be exactly 10 digits",
  }),
  otp: () => ({
    pattern: /^\d{6}$/,
    message: "OTP must be exactly 6 numeric digits",
  }),
  greaterThanOne: (fieldName) => ({
    validator: (_, value) => {
      if (value === undefined || value === null || value === "") {
        return Promise.resolve(); // Allow empty for required rule to handle
      }
      if (typeof value === "string") {
        value = parseFloat(value);
      }
      if (isNaN(value) || value <= 0) {
        return Promise.reject(
          new Error(`${formatFieldName(fieldName)} must be greater than 0`)
        );
      }
      return Promise.resolve();
    },
  }),
};

export const combineRules = (fieldName, ...rules) => {
  return rules.map((rule) => {
    if (typeof rule === "function") {
      return rule(fieldName);
    }
    return rule;
  });
};
export const formatPhoneNumber = (value) => {
  if (!value) return value;

  // Keep only digits
  const digits = value.toString().replace(/[^\d]/g, "").slice(0, 10);

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return digits;
};
