export function processString(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (value === "submit") {
        return "submit";
    } else if (value === "next") {
        return "next";
    } else if (!isNaN(value)) {
        return parseInt(value, 10);
    } else {
        return null; // Return null for invalid input
    }
}