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
}

export interface ColumnRow {
  name: string; // Column header name
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
  } = data;

  // Generate list ID: fileName_date
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  const listId = `${fileName.replace(/[^a-zA-Z0-9]/g, "_")}_${dateStr}`;

  // Clean and filter vehicle data
  const { cleanedData, validCount, invalidCount, invalidRows } =
    filterAndCleanVehicleData(sampleData, vehicleColumnIndex);

  // For testing - only process first 5 rows of cleaned data
  const dataRows = cleanedData.slice(1, 6); // Skip header, take first 5

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
  const rows: ColumnRow[] = columnHeaders.map((header) => ({
    name: header.name,
    showtoagent: agentViewColumns.includes(header.index), // Only selected columns are shown to agents
  }));

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

    // Step 2: Store individual vehicle records in 'vehicleno' collection
    const batch = writeBatch(db);
    const vehiclenoCollection = collection(db, "vehicleno");

    let newVehicles = 0;
    let updatedVehicles = 0;

    for (let index = 0; index < dataRows.length; index++) {
      const row = dataRows[index];
      const vehicleNumber = String(row[vehicleColumnIndex] || "");
      const lastFourDigits = vehicleNumber.slice(-4); // Extract last 4 characters

      // All vehicle records are shown to agents by default
      // (the column-level visibility is controlled by the rows array)
      const showtoagent = true;

      // Check if vehicle already exists
      const vehicleDocRef = doc(vehiclenoCollection, vehicleNumber);
      const vehicleDoc = await getDoc(vehicleDocRef);

      if (vehicleDoc.exists()) {
        // Vehicle exists - update it with new data
        const existingData = vehicleDoc.data();

        // Create update object with new data
        const updateData: Partial<VehicleRecord> = {
          updatedAt: now.toISOString(),
          listParentId: listId, // Update to new list
          rowIndex: index,
          showtoagent,
        };

        // Add all column data as dynamic properties
        columnHeaders.forEach((header) => {
          updateData[header.name] = row[header.index] || "";
        });

        // Use updateDoc to preserve existing fields and update with new data
        batch.update(vehicleDocRef, updateData);
        updatedVehicles++;

        console.log(`Updating existing vehicle: ${vehicleNumber}`);
      } else {
        // Vehicle doesn't exist - create new record
        const vehicleRecord: VehicleRecord = {
          id: vehicleNumber, // Use vehicle number as ID
          vehicleNumber,
          lastFourDigits,
          listParentId: listId,
          rowIndex: index,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          showtoagent,
        };

        // Add all column data as dynamic properties
        columnHeaders.forEach((header) => {
          vehicleRecord[header.name] = row[header.index] || "";
        });

        // Use the vehicle number as document ID
        batch.set(vehicleDocRef, vehicleRecord);
        newVehicles++;

        console.log(`Creating new vehicle: ${vehicleNumber}`);
      }
    }

    await batch.commit();

    console.log(`Successfully created list ${listId}`);
    console.log(`Lists table: 1 record added with ${rows.length} columns`);
    console.log(
      `Vehicleno table: ${newVehicles} new records created, ${updatedVehicles} existing records updated`
    );
    console.log(
      `Columns visible to agents: ${rows.filter((r) => r.showtoagent).length}/${
        rows.length
      }`
    );

    return {
      newVehicles,
      updatedVehicles,
      totalVehicles: newVehicles + updatedVehicles,
      listId,
    };
  } catch (error) {
    console.error("Error creating list:", error);
    throw error;
  }
}
