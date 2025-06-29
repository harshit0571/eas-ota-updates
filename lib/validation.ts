import { z } from "zod";

// Vehicle number validation schema
// Supports formats like: DLFAPATW00347, DL01AB1234, MH12DE3456, etc.
export const vehicleNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}[0-9A-Z]{2}[A-Z]{2}[A-Z0-9]{2}[0-9]{4,5}$/,
    "Invalid vehicle number format. Expected format: DLFAPATW00347"
  );

// Alternative patterns for different vehicle number formats
export const alternativeVehiclePatterns = [
  /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/, // Format: DL01AB1234
  /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/, // Format: DL01A1234
  /^[A-Z]{2}[0-9]{2}[0-9]{4}$/, // Format: DL011234
];

export function validateVehicleNumber(vehicleNumber: string): {
  isValid: boolean;
  error?: string;
} {
  if (!vehicleNumber || typeof vehicleNumber !== "string") {
    return {
      isValid: false,
      error: "Vehicle number is required",
    };
  }

  // Clean the vehicle number (remove spaces, convert to uppercase)
  const cleanedNumber = vehicleNumber.trim().toUpperCase().replace(/\s+/g, "");

  // Try primary pattern first
  const primaryResult = vehicleNumberSchema.safeParse(cleanedNumber);
  if (primaryResult.success) {
    return { isValid: true };
  }

  // Try alternative patterns
  for (const pattern of alternativeVehiclePatterns) {
    if (pattern.test(cleanedNumber)) {
      return { isValid: true };
    }
  }

  return {
    isValid: false,
    error:
      "Invalid vehicle number format. Expected formats: DLFAPATW00347, DL01AB1234, MH12DE3456",
  };
}

// Batch validation for multiple vehicle numbers
export function validateVehicleNumbers(vehicleNumbers: string[]): {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  invalidNumbers: Array<{ value: string; error: string; rowIndex: number }>;
} {
  const results = vehicleNumbers.map((number, index) => ({
    ...validateVehicleNumber(number),
    value: number,
    rowIndex: index + 1,
  }));

  const invalidNumbers = results
    .filter((result) => !result.isValid)
    .map((result) => ({
      value: result.value,
      error: result.error || "Invalid format",
      rowIndex: result.rowIndex,
    }));

  return {
    totalCount: vehicleNumbers.length,
    validCount: results.filter((r) => r.isValid).length,
    invalidCount: invalidNumbers.length,
    invalidNumbers,
  };
}
