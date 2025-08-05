"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateList } from "@/lib/hooks/useCreateList";
import ColumnSelector from "@/app/components/ColumnSelector";
import MultiColumnSelector from "@/app/components/MultiColumnSelector";
import AgentViewPreviewDialog from "@/app/components/AgentViewPreviewDialog";
import { filterAndCleanVehicleData } from "@/lib/validation";

interface ColumnHeader {
  index: number;
  name: string;
}

interface ValidationResult {
  cleanedData: any[][];
  validCount: number;
  invalidCount: number;
  invalidRows: Array<{
    rowIndex: number;
    originalValue: string;
    cleanedValue: string;
    error: string;
  }>;
}

export default function CreateListPage() {
  const router = useRouter();
  const createListMutation = useCreateList();
  const [file, setFile] = useState<File | null>(null);
  const [columnHeaders, setColumnHeaders] = useState<ColumnHeader[]>([]);
  const [rawExcelData, setRawExcelData] = useState<any[][]>([]);
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVehicleColumn, setSelectedVehicleColumn] = useState<
    number | null
  >(null);
  const [selectedAgentViewColumns, setSelectedAgentViewColumns] = useState<
    number[]
  >([]);
  const [showPreview, setShowPreview] = useState(false);

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

      // Run validation when vehicle column is selected
      if (rawExcelData.length > 0) {
        const result = filterAndCleanVehicleData(rawExcelData, columnIndex);
        setValidationResult(result);
      }
    } else {
      // Remove vehicle column from agent view if vehicle column is cleared
      setSelectedAgentViewColumns((prev) =>
        prev.filter((col) => col !== selectedVehicleColumn)
      );
      setValidationResult(null);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setColumnHeaders([]);
      setRawExcelData([]);
      setSelectedVehicleColumn(null);
      setSelectedAgentViewColumns([]);
      setValidationResult(null);
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
      setRawExcelData([]);
      setSelectedVehicleColumn(null);
      setSelectedAgentViewColumns([]);
      setValidationResult(null);
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSelectedVehicleColumn(null); // Reset vehicle column selection for new file
    setSelectedAgentViewColumns([]); // Reset agent view columns for new file
    setValidationResult(null);
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
            setRawExcelData(jsonData as any[][]); // Store raw data for preview
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
    setRawExcelData([]);
    setSelectedVehicleColumn(null);
    setSelectedAgentViewColumns([]);
    setValidationResult(null);
    setError(null);
    // Reset file input
    const fileInput = document.getElementById("excel-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handlePreviewAndSave = () => {
    if (
      selectedVehicleColumn === null ||
      selectedAgentViewColumns.length === 0
    ) {
      setError(
        "Please select a vehicle column and at least one agent view column"
      );
      return;
    }
    setShowPreview(true);
  };

  const handleSaveToFirestore = async () => {
    if (!file || selectedVehicleColumn === null || !validationResult) return;

    const vehicleColumnName =
      columnHeaders[selectedVehicleColumn]?.name ||
      `Column_${selectedVehicleColumn}`;

    const createListData = {
      fileName: file.name,
      vehicleColumnIndex: selectedVehicleColumn,
      vehicleColumnName,
      agentViewColumns: selectedAgentViewColumns,
      columnHeaders,
      sampleData: validationResult.cleanedData, // Use cleaned data instead of raw data
    };

    createListMutation.mutate(createListData, {
      onSuccess: (data) => {
        setShowPreview(false);
        // Show success message with creation/update stats
        const message = `List created successfully! ${data.newVehicles} new vehicles added, ${data.updatedVehicles} existing vehicles updated.`;
        console.log(message);
        // You could add a toast notification here if you have a toast system
        router.push("/dashboard/lists");
      },
      onError: (error) => {
        console.error("Error creating list:", error);
        setError("Failed to save list. Please try again.");
      },
    });
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

      {/* Vehicle Number Validation Results */}
      {validationResult && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Vehicle Number Validation
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Vehicle numbers are cleaned and validated according to Indian RTO
              standards.
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800">
                      Valid Vehicles
                    </p>
                    <p className="text-2xl font-bold text-blue-900">
                      {validationResult.validCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-red-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800">
                      Invalid Vehicles
                    </p>
                    <p className="text-2xl font-bold text-red-900">
                      {validationResult.invalidCount}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-800">
                      Success Rate
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      {validationResult.validCount +
                        validationResult.invalidCount >
                      0
                        ? Math.round(
                            (validationResult.validCount /
                              (validationResult.validCount +
                                validationResult.invalidCount)) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Invalid Vehicle Numbers Details */}
            {validationResult.invalidRows.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Invalid Vehicle Numbers (will be excluded):
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {validationResult.invalidRows
                      .slice(0, 10)
                      .map((row, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 font-medium">
                              Row {row.rowIndex}:
                            </span>
                            <span className="text-gray-700">
                              {row.originalValue}
                            </span>
                            <span className="text-gray-500">→</span>
                            <span className="text-gray-700">
                              {row.cleanedValue || "N/A"}
                            </span>
                          </div>
                          <span className="text-red-600 text-xs">
                            {row.error}
                          </span>
                        </div>
                      ))}
                    {validationResult.invalidRows.length > 10 && (
                      <div className="text-xs text-gray-500 pt-2">
                        ... and {validationResult.invalidRows.length - 10} more
                        invalid entries
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Validation Info */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs font-medium text-yellow-800 mb-2">
                Vehicle Number Cleaning Rules:
              </p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• All special characters and spaces are removed</li>
                <li>• Converted to uppercase</li>
                <li>• Must follow Indian RTO format standards</li>
                <li>• Invalid vehicle numbers are excluded from processing</li>
              </ul>
            </div>
          </div>
        </div>
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

      {/* Save Section */}
      {selectedVehicleColumn !== null &&
        selectedAgentViewColumns.length > 0 &&
        validationResult &&
        validationResult.validCount > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Ready to Save
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Your list configuration is complete.{" "}
                {validationResult.validCount} valid vehicle numbers will be
                processed.
                {validationResult.invalidCount > 0 &&
                  ` ${validationResult.invalidCount} invalid vehicle numbers will be excluded.`}
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Vehicle column selected
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedAgentViewColumns.length} agent columns selected
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      {validationResult.validCount} valid vehicles ready
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePreviewAndSave}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Preview & Save
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Preview Dialog */}
      {file && selectedVehicleColumn !== null && validationResult && (
        <AgentViewPreviewDialog
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          onSave={handleSaveToFirestore}
          vehicleColumnIndex={selectedVehicleColumn}
          agentViewColumns={selectedAgentViewColumns}
          columnHeaders={columnHeaders}
          sampleData={validationResult.cleanedData}
          fileName={file.name}
          isLoading={createListMutation.isPending}
        />
      )}
    </div>
  );
}
