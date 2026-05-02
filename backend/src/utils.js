/**
 * Generates a UUID (Universally Unique Identifier)
 * This follows the standard UUID v4 format
 * @returns {string} UUID string
 */
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generates a highly unique identifier
 * Combines UUID v4 format with timestamp for guaranteed uniqueness
 *
 * @returns {string} Unique identifier
 */
function generateUniqueId() {
  // Create UUID v4 component (RFC4122)
  const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      // Use crypto.getRandomValues if available (more secure)
      let r;
      if (
        typeof crypto !== "undefined" &&
        typeof crypto.getRandomValues === "function"
      ) {
        const array = new Uint8Array(1);
        crypto.getRandomValues(array);
        r = ((array[0] / 255) * 16) | 0;
      } else {
        // Fall back to Math.random
        r = (Math.random() * 16) | 0;
      }
      const v = c === "x" ? r : (r & 0x3) | 0x8; // For 'y', ensures RFC4122 variant
      return v.toString(16);
    }
  );

  // Add timestamp component for additional uniqueness
  const timestamp = Date.now().toString(36);

  // Combine the two with a separator
  return `${uuid}_${timestamp}`;
}

// Example usage:
// const id = generateUniqueId();
// Result: "f47ac10b-58cc-4372-a567-0e02b2c3d479_lq1xpz"

// Example usage:
// const simpleId = generateRandomId();                 // e.g., "a7bF9cD2"
// const prefixedId = generatePrefixedId('branch');     // e.g., "branch_lq1p3q_8xf4ds"
// const uuid = generateUUID();                         // e.g., "f47ac10b-58cc-4372-a567-0e02b2c3d479"

// console.log(generateUniqueId())
export {
  generateUUID,
  generateUniqueId
};