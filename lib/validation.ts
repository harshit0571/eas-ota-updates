import { z } from "zod";

// Enhanced vehicle number cleaning function
export function cleanVehicleNumber(vehicleNumber: string): string {
  if (!vehicleNumber || typeof vehicleNumber !== "string") {
    return "";
  }

  // Remove all special characters, spaces, and convert to uppercase
  // Keep only letters and numbers
  return vehicleNumber
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ""); // Remove everything except letters and numbers
}

// Indian RTO vehicle number validation patterns
// Standard formats:
// 1. DL01AB1234 (State code + 2 digits + 2 letters + 4 digits)
// 2. DL01A1234 (State code + 2 digits + 1 letter + 4 digits)
// 3. DL011234 (State code + 2 digits + 4 digits)
// 4. DLFAPATW00347 (State code + letters + numbers - older format)

export const vehicleNumberSchema = z
  .string()
  .regex(
    /^[A-Z]{2}[0-9A-Z]{2}[A-Z]{2}[A-Z0-9]{2}[0-9]{4,5}$/,
    "Invalid vehicle number format. Expected format: DLFAPATW00347"
  );

// Comprehensive Indian RTO vehicle number patterns
export const indianRTOVehiclePatterns = [
  // Standard format: DL01AB1234
  /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
  // Alternative format: DL01A1234
  /^[A-Z]{2}[0-9]{2}[A-Z]{1}[0-9]{4}$/,
  // Simple format: DL011234
  /^[A-Z]{2}[0-9]{2}[0-9]{4}$/,
  // Old format: DLFAPATW00347
  /^[A-Z]{2}[A-Z]{2,}[A-Z0-9]{2}[0-9]{4,5}$/,
  // Military format: DL01AB1234
  /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/,
];

// State codes for validation
export const indianStateCodes = [
  "AN",
  "AP",
  "AR",
  "AS",
  "BR",
  "CH",
  "CT",
  "DL",
  "DN",
  "GA",
  "GJ",
  "HR",
  "HP",
  "JK",
  "JH",
  "KA",
  "KL",
  "MP",
  "MH",
  "MN",
  "ML",
  "MZ",
  "NL",
  "OR",
  "PY",
  "PB",
  "RJ",
  "SK",
  "TN",
  "TS",
  "TR",
  "UP",
  "UT",
  "WB",
];

export function validateVehicleNumber(vehicleNumber: string): {
  isValid: boolean;
  cleanedNumber?: string;
  error?: string;
} {
  if (!vehicleNumber || typeof vehicleNumber !== "string") {
    return {
      isValid: false,
      error: "Vehicle number is required",
    };
  }

  // Clean the vehicle number
  const cleanedNumber = cleanVehicleNumber(vehicleNumber);

  if (!cleanedNumber) {
    return {
      isValid: false,
      error: "Vehicle number is empty after cleaning",
    };
  }

  // Check minimum length (should be at least 8 characters)
  if (cleanedNumber.length < 8) {
    return {
      isValid: false,
      cleanedNumber,
      error: "Vehicle number too short after cleaning",
    };
  }

  // Check maximum length (should not exceed 15 characters)
  if (cleanedNumber.length > 15) {
    return {
      isValid: false,
      cleanedNumber,
      error: "Vehicle number too long after cleaning",
    };
  }

  // Validate state code (first two characters)
  const stateCode = cleanedNumber.substring(0, 2);
  if (!indianStateCodes.includes(stateCode)) {
    return {
      isValid: false,
      cleanedNumber,
      error: `Invalid state code: ${stateCode}. Must be a valid Indian state code.`,
    };
  }

  // Try all Indian RTO patterns
  for (const pattern of indianRTOVehiclePatterns) {
    if (pattern.test(cleanedNumber)) {
      return {
        isValid: true,
        cleanedNumber,
      };
    }
  }

  return {
    isValid: false,
    cleanedNumber,
    error: "Invalid vehicle number format. Must follow Indian RTO standards.",
  };
}

// Enhanced batch validation with cleaning and filtering
export function validateVehicleNumbers(vehicleNumbers: string[]): {
  totalCount: number;
  validCount: number;
  invalidCount: number;
  cleanedNumbers: string[];
  invalidNumbers: Array<{
    originalValue: string;
    cleanedValue: string;
    error: string;
    rowIndex: number;
  }>;
} {
  const results = vehicleNumbers.map((number, index) => {
    const validation = validateVehicleNumber(number);
    return {
      ...validation,
      originalValue: number,
      rowIndex: index + 1,
    };
  });

  const validNumbers = results
    .filter((result) => result.isValid)
    .map((result) => result.cleanedNumber!);

  const invalidNumbers = results
    .filter((result) => !result.isValid)
    .map((result) => ({
      originalValue: result.originalValue,
      cleanedValue: result.cleanedNumber || "",
      error: result.error || "Invalid format",
      rowIndex: result.rowIndex,
    }));

  return {
    totalCount: vehicleNumbers.length,
    validCount: validNumbers.length,
    invalidCount: invalidNumbers.length,
    cleanedNumbers: validNumbers,
    invalidNumbers,
  };
}

// Function to filter and clean vehicle data
export function filterAndCleanVehicleData(
  data: any[][],
  vehicleColumnIndex: number
): {
  cleanedData: any[][];
  validCount: number;
  invalidCount: number;
  invalidRows: Array<{
    rowIndex: number;
    originalValue: string;
    cleanedValue: string;
    error: string;
  }>;
} {
  const cleanedData: any[][] = [];
  const invalidRows: Array<{
    rowIndex: number;
    originalValue: string;
    cleanedValue: string;
    error: string;
  }> = [];

  // Keep header row
  if (data.length > 0) {
    cleanedData.push(data[0]);
  }

  // Process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const vehicleNumber = String(row[vehicleColumnIndex] || "");
    const validation = validateVehicleNumber(vehicleNumber);

    if (validation.isValid && validation.cleanedNumber) {
      // Create new row with cleaned vehicle number
      const cleanedRow = [...row];
      cleanedRow[vehicleColumnIndex] = validation.cleanedNumber;
      cleanedData.push(cleanedRow);
    } else {
      // Add to invalid rows list
      invalidRows.push({
        rowIndex: i + 1, // +1 because we're 1-indexed for display
        originalValue: vehicleNumber,
        cleanedValue: validation.cleanedNumber || "",
        error: validation.error || "Invalid vehicle number",
      });
    }
  }

  return {
    cleanedData,
    validCount: cleanedData.length - 1, // Subtract header row
    invalidCount: invalidRows.length,
    invalidRows,
  };
}
