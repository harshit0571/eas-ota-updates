"use client";

import { useState } from "react";
import Link from "next/link";
import ColumnSelector from "@/app/components/ColumnSelector";
import MultiColumnSelector from "@/app/components/MultiColumnSelector";

interface ColumnHeader {
  index: number;
  name: string;
}

export default function CreateListPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeader[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleColumn, setSelectedVehicleColumn] = useState<
    number | null
  >(null);
  const [selectedAgentViewColumns, setSelectedAgentViewColumns] = useState<
    number[]
  >([]);

  // Handler for vehicle column selection that also adds it to agent view
  const handleVehicleColumnSelect = (columnIndex: number | null) => {
    setSelectedVehicleColumn(columnIndex);

    if (columnIndex !== null) {
      // Automatically include vehicle column in agent view if not already included
      setSelectedAgentViewColumns((prev) => {
        if (!prev.includes(columnIndex)) {
          return [...prev, columnIndex];
        }
        return prev;
      });
    } else {
      // Remove vehicle column from agent view if vehicle column is cleared
      setSelectedAgentViewColumns((prev) =>
        prev.filter((col) => col !== selectedVehicleColumn)
      );
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setColumnHeaders([]);
      setSelectedVehicleColumn(null);
      setSelectedAgentViewColumns([]);
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
    ];

    if (
      !allowedTypes.includes(selectedFile.type) &&
      !selectedFile.name.toLowerCase().endsWith(".xlsx") &&
      !selectedFile.name.toLowerCase().endsWith(".xls")
    ) {
      setError("Please select a valid Excel file (.xlsx or .xls)");
      setSelectedVehicleColumn(null);
      setSelectedAgentViewColumns([]);
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSelectedVehicleColumn(null); // Reset vehicle column selection for new file
    setSelectedAgentViewColumns([]); // Reset agent view columns for new file
    setIsProcessing(true);

    try {
      await processExcelFile(selectedFile);
    } catch (err) {
      setError("Error processing Excel file. Please try again.");
      console.error("Excel processing error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const processExcelFile = async (file: File) => {
    // Import xlsx dynamically to avoid SSR issues
    const XLSX = await import("xlsx");

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });

          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON to get headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length > 0) {
            const headers = (jsonData[0] as string[]).map((header, index) => ({
              index,
              name: header || `Column ${index + 1}`,
            }));

            setColumnHeaders(headers);
          } else {
            setError("No data found in the Excel file");
          }

          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsBinaryString(file);
    });
  };

  const removeFile = () => {
    setFile(null);
    setColumnHeaders([]);
    setSelectedVehicleColumn(null);
    setSelectedAgentViewColumns([]);
    setError(null);
    // Reset file input
    const fileInput = document.getElementById("excel-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New List</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload an Excel file to create a new list from your data.
          </p>
        </div>
        <Link
          href="/dashboard/lists"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          ← Back to Lists
        </Link>
      </div>

      {/* File Upload Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Upload Excel File
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Select an Excel file (.xlsx or .xls) to import your data.
          </p>
        </div>

        <div className="p-6">
          <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="excel-file"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                >
                  <span>Upload an Excel file</span>
                  <input
                    id="excel-file"
                    name="excel-file"
                    type="file"
                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">
                Excel files only (.xlsx, .xls)
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Selected File Display */}
          {file && (
            <div className="mt-4 p-4 border border-green-300 rounded-md bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-green-400 hover:text-green-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
            <p className="text-gray-600">Processing Excel file...</p>
          </div>
        </div>
      )}

      {/* Column Headers Display */}
      {columnHeaders.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Column Headers
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Found {columnHeaders.length} columns in your Excel file.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {columnHeaders.map((header) => (
                <div
                  key={header.index}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-800 text-sm font-medium">
                      {header.index + 1}
                    </span>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {header.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Column {header.index + 1}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Number Column Selection */}
      {columnHeaders.length > 0 && (
        <ColumnSelector
          columnHeaders={columnHeaders}
          selectedColumn={selectedVehicleColumn}
          onColumnSelect={handleVehicleColumnSelect}
          title="Select Vehicle Number Column"
          description="Choose which column contains the vehicle numbers from your Excel file. This column will be automatically included in agent view."
          placeholder="Choose vehicle number column..."
          required={true}
        />
      )}

      {/* Agent Viewable Columns Selection */}
      {columnHeaders.length > 0 && (
        <MultiColumnSelector
          columnHeaders={columnHeaders}
          selectedColumns={selectedAgentViewColumns}
          onColumnsSelect={setSelectedAgentViewColumns}
          title="Select Details Viewable to Agents"
          description="Choose which columns/details agents will be able to view from your Excel file. The vehicle number column will be automatically included when selected above."
          required={true}
        />
      )}
    </div>
  );
}
