import { db } from "./firebase";
import { collection, doc, setDoc, writeBatch } from "firebase/firestore";

export interface CreateListData {
  fileName: string;
  vehicleColumnIndex: number;
  vehicleColumnName: string;
  agentViewColumns: number[];
  columnHeaders: Array<{ index: number; name: string }>;
  sampleData: any[][];
}

export interface ListMetadata {
  id: string;
  fileName: string;
  vehicleColumnName: string;
  agentColumns: string[];
  totalRecords: number;
  uploadDate: string;
  createdBy: string;
  status: "active" | "inactive";
}

export interface VehicleRecord {
  id: string;
  vehicleNumber: string;
  lastFourDigits: string;
  listParentId: string;
  rowIndex: number;
  createdAt: string;
  [key: string]: any; // Dynamic properties for each column
}

export async function createList(data: CreateListData): Promise<void> {
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

  // Get agent column names
  const agentColumnNames = agentViewColumns.map(
    (index) => columnHeaders[index]?.name || `Column_${index}`
  );

  // For testing - only process first 5 rows
  const dataRows = sampleData.slice(1, 6); // Skip header, take first 5

  try {
    // Step 1: Store list metadata in 'lists' collection
    const listMetadata: ListMetadata = {
      id: listId,
      fileName,
      vehicleColumnName,
      agentColumns: agentColumnNames,
      totalRecords: dataRows.length,
      uploadDate: now.toISOString(),
      createdBy: "admin", // TODO: Replace with actual user info
      status: "active",
    };

    await setDoc(doc(db, "lists", listId), listMetadata);

    // Step 2: Store individual vehicle records in 'vehicleno' collection
    const batch = writeBatch(db);
    const vehiclenoCollection = collection(db, "vehicleno");

    dataRows.forEach((row, index) => {
      const vehicleNumber = String(row[vehicleColumnIndex] || "");
      const lastFourDigits = vehicleNumber.slice(-4); // Extract last 4 characters
      const recordId = `${listId}_${vehicleNumber}_${index}`;

      // Create vehicle record with required fields
      const vehicleRecord: VehicleRecord = {
        id: recordId,
        vehicleNumber,
        lastFourDigits,
        listParentId: listId,
        rowIndex: index,
        createdAt: now.toISOString(),
      };

      // Add all column data as dynamic properties
      columnHeaders.forEach((header) => {
        vehicleRecord[header.name] = row[header.index] || "";
      });

      // Use the record ID as document ID to ensure uniqueness
      batch.set(doc(vehiclenoCollection, recordId), vehicleRecord);
    });

    await batch.commit();

    console.log(`Successfully created list ${listId}`);
    console.log(`Lists table: 1 record added`);
    console.log(`Vehicleno table: ${dataRows.length} records added`);
  } catch (error) {
    console.error("Error creating list:", error);
    throw error;
  }
}
