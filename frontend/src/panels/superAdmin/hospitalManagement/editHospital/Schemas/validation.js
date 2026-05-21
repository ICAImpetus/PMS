export const cleanCSVRows = (rows = []) => {
    return rows.map((row) => {
        const cleaned = {};

        Object.keys(row).forEach((key) => {
            cleaned[key.trim()] =
                typeof row[key] === "string"
                    ? row[key].trim()
                    : row[key];
        });

        return cleaned;
    });
};
export const validateCSVRows = ({
    rows = [],
    validations = {},
}) => {
    if (!rows.length) {
        return {
            success: false,
            message: "CSV file is empty",
        };
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        for (const column in validations) {
            const rules = validations[column];
            const value = row[column];

            // Required validation
            if (rules.required) {
                const isEmpty =
                    value === undefined ||
                    value === null ||
                    (typeof value === "string" &&
                        value.trim() === "");

                if (isEmpty) {
                    return {
                        success: false,
                        message: `Row ${i + 2}: ${column} is required`,
                    };
                }
            }

            // Skip further validation if value empty
            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                continue;
            }

            // Type validation
            if (rules.type) {
                switch (rules.type) {
                    case "string":
                        if (typeof value !== "string") {
                            return {
                                success: false,
                                message: `Row ${i + 2}: ${column} must be string`,
                            };
                        }
                        break;

                    case "number":
                        if (isNaN(Number(value))) {
                            return {
                                success: false,
                                message: `Row ${i + 2}: ${column} must be number`,
                            };
                        }
                        break;

                    case "boolean":
                        if (
                            !["true", "false", true, false].includes(value)
                        ) {
                            return {
                                success: false,
                                message: `Row ${i + 2}: ${column} must be boolean`,
                            };
                        }
                        break;

                    case "array":
                        try {
                            const parsed =
                                typeof value === "string"
                                    ? JSON.parse(value)
                                    : value;

                            if (!Array.isArray(parsed)) {
                                return {
                                    success: false,
                                    message: `Row ${i + 2}: ${column} must be array`,
                                };
                            }

                            // Allowed values check
                            if (rules.allowedValues?.length) {
                                const invalidValue = parsed.find(
                                    (item) =>
                                        !rules.allowedValues.includes(item)
                                );

                                if (invalidValue) {
                                    return {
                                        success: false,
                                        message: `Row ${i + 2}: Invalid value "${invalidValue}" in ${column}`,
                                    };
                                }
                            }
                        } catch {
                            return {
                                success: false,
                                message: `Row ${i + 2}: ${column} invalid array format`,
                            };
                        }

                        break;

                    default:
                        break;
                }
            }

            // Min number validation
            if (
                rules.min !== undefined &&
                !isNaN(Number(value))
            ) {
                if (Number(value) < rules.min) {
                    return {
                        success: false,
                        message: `Row ${i + 2}: ${column} minimum is ${rules.min}`,
                    };
                }
            }

            // Max number validation
            if (
                rules.max !== undefined &&
                !isNaN(Number(value))
            ) {
                if (Number(value) > rules.max) {
                    return {
                        success: false,
                        message: `Row ${i + 2}: ${column} maximum is ${rules.max}`,
                    };
                }
            }

            // Custom validator
            if (typeof rules.validate === "function") {
                const customError = rules.validate(value, row);

                if (customError) {
                    return {
                        success: false,
                        message: `Row ${i + 2}: ${customError}`,
                    };
                }
            }
        }
    }

    return {
        success: true,
        data: rows,
    };
};