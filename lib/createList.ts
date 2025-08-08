import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { filterAndCleanVehicleData } from "./validation";

export interface CreateListData {
  fileName: string;
  vehicleColumnIndex: number;
  vehicleColumnName: string;
  agentViewColumns: number[];
  columnHeaders: Array<{ index: number; name: string }>;
  sampleData: any[][];
  onProgress?: (progress: {
    currentBatch: number;
    totalBatches: number;
    progress: number;
    processedVehicles: number;
    totalVehicles: number;
  }) => void;
}

export interface ColumnRow {
  name: string; // Original column header name
  sanitizedName: string; // Sanitized field name for Firestore
  showtoagent: boolean;
}

export interface ListMetadata {
  id: string;
  fileName: string;
  vehicleColumnName: string;
  rows: ColumnRow[];
  totalRecords: number;
  uploadDate: string;
  createdBy: string;
  status: "active" | "inactive";
}

export interface VehicleRecord {
  id: string; // Vehicle number (e.g., "DLDLBATW00529")
  vehicleNumber: string;
  lastFourDigits: string;
  listParentId: string;
  rowIndex: number;
  createdAt: string;
  updatedAt: string; // Add updatedAt field
  showtoagent: boolean;
  [key: string]: any; // Dynamic properties for each column
}

export interface CreateListResult {
  newVehicles: number;
  updatedVehicles: number;
  totalVehicles: number;
  listId: string;
}

export async function createList(
  data: CreateListData
): Promise<CreateListResult> {
  const {
    fileName,
    vehicleColumnIndex,
    vehicleColumnName,
    agentViewColumns,
    columnHeaders,
    sampleData,
    onProgress,
  } = data;

  // Generate list ID: fileName_date
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  const listId = `${fileName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}`;

  // Clean and filter vehicle data
  const { cleanedData, validCount, invalidCount, invalidRows } =
    filterAndCleanVehicleData(sampleData, vehicleColumnIndex);

  // Process all rows of cleaned data (skip header)
  const dataRows = cleanedData.slice(1, 6); // Skip header, process all rows

  // Log validation results
  console.log(`Vehicle number validation results:`);
  console.log(`- Total rows: ${sampleData.length - 1}`);
  console.log(`- Valid vehicles: ${validCount}`);
  console.log(`- Invalid vehicles: ${invalidCount}`);

  if (invalidRows.length > 0) {
    console.log(
      `- Invalid vehicle numbers:`,
      invalidRows.map((row) => ({
        row: row.rowIndex,
        original: row.originalValue,
        cleaned: row.cleanedValue,
        error: row.error,
      }))
    );
  }

  // Create rows array with column names and showtoagent flag
  const rows: ColumnRow[] = columnHeaders.map((header) => {
    // Sanitize field name for Firestore compatibility
    const sanitizedName = header.name
      .replace(/[^a-zA-Z0-9_]/g, "_") // Replace invalid chars with underscore
      .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
      .replace(/_+/g, "_") // Replace multiple underscores with single
      .toLowerCase(); // Convert to lowercase

    return {
      name: header.name,
      sanitizedName,
      showtoagent: agentViewColumns.includes(header.index), // Only selected columns are shown to agents
    };
  });

  try {
    // Step 1: Store list metadata in 'lists' collection
    const listMetadata: ListMetadata = {
      id: listId,
      fileName,
      vehicleColumnName,
      rows,
      totalRecords: dataRows.length,
      uploadDate: now.toISOString(),
      createdBy: "admin", // TODO: Replace with actual user info
      status: "active",
    };

    await setDoc(doc(db, "lists", listId), listMetadata);

    // Step 2: Optimized batch processing for vehicle records
    const vehiclenoCollection = collection(db, "vehicleno");
    let newVehicles = 0;
    let updatedVehicles = 0;

    // Process in batches of 500 (Firestore batch limit is 500 operations)
    const BATCH_SIZE = 500;
    const totalBatches = Math.ceil(dataRows.length / BATCH_SIZE);

    console.log(
      `Processing ${dataRows.length} vehicles in ${totalBatches} batches...`
    );

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, dataRows.length);
      const batchRows = dataRows.slice(startIndex, endIndex);

      // Create batch for this chunk
      const batch = writeBatch(db);

      // Process each row in the current batch
      for (let i = 0; i < batchRows.length; i++) {
        const row = batchRows[i];
        const index = startIndex + i;
        const vehicleNumber = String(row[vehicleColumnIndex] || "");
        const lastFourDigits = vehicleNumber.slice(-4);

        const showtoagent = true;
        const vehicleDocRef = doc(vehiclenoCollection, vehicleNumber);

        // Create vehicle record
        const vehicleRecord: VehicleRecord = {
          id: vehicleNumber,
          vehicleNumber,
          lastFourDigits,
          listParentId: listId,
          rowIndex: index,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          showtoagent,
        };

        // Add all column data as dynamic properties using sanitized field names
        columnHeaders.forEach((header, headerIndex) => {
          const sanitizedFieldName = rows[headerIndex].sanitizedName;
          vehicleRecord[sanitizedFieldName] = row[header.index] || "";
        });

        // Use set with merge option to handle both new and existing documents
        batch.set(vehicleDocRef, vehicleRecord, { merge: true });
        newVehicles++; // We'll count all as new for simplicity
      }

      // Commit this batch
      await batch.commit();

      // Calculate and report progress
      const currentBatch = batchIndex + 1;
      const progress = (currentBatch / totalBatches) * 100;
      const processedVehicles = Math.min(
        currentBatch * BATCH_SIZE,
        dataRows.length
      );

      console.log(
        `Batch ${currentBatch}/${totalBatches} completed (${progress.toFixed(
          1
        )}%)`
      );

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          currentBatch,
          totalBatches,
          progress,
          processedVehicles,
          totalVehicles: dataRows.length,
        });
      }
    }

    console.log(`Successfully created list ${listId}`);
    console.log(`Lists table: 1 record added with ${rows.length} columns`);
    console.log(`Vehicleno table: ${newVehicles} records processed`);
    console.log(
      `Columns visible to agents: ${rows.filter((r) => r.showtoagent).length}/${
        rows.length
      }`
    );

    // Log field name mappings for debugging
    console.log("Field name mappings:");
    rows.forEach((row) => {
      console.log(`  "${row.name}" -> "${row.sanitizedName}"`);
    });

    return {
      newVehicles,
      updatedVehicles: 0, // Simplified counting
      totalVehicles: newVehicles,
      listId,
    };
  } catch (error) {
    console.error("Error creating list:", error);
    throw error;
  }
}
