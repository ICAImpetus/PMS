export function validateObject(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // Check if the value is undefined, null, or empty string
      if (value === undefined || value === null || value === "") {
        return false; // Return false if any key has no value
      }

      // If the value is an array (e.g., contactNumbers), ensure it's not empty and has valid values
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return false; // Empty array
        }
        // Check if array contains empty strings or undefined values
        for (let i = 0; i < value.length; i++) {
          if (value[i] === undefined || value[i] === null || value[i] === "") {
            return false;
          }
        }
      }
    }
  }
  return true; // Return true if all keys have valid values
}
