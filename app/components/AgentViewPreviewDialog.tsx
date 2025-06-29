"use client";

import { useState, useMemo } from "react";
import { validateVehicleNumbers } from "@/lib/validation";

interface ColumnHeader {
  index: number;
  name: string;
}

interface AgentViewPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  vehicleColumnIndex: number;
  agentViewColumns: number[];
  columnHeaders: ColumnHeader[];
  sampleData: any[][]; // Raw Excel data
  fileName: string;
}

export default function AgentViewPreviewDialog({
  isOpen,
  onClose,
  onSave,
  vehicleColumnIndex,
  agentViewColumns,
  columnHeaders,
  sampleData,
  fileName,
}: AgentViewPreviewDialogProps) {
  const [isSaving, setIsSaving] = useState(false);

  // Validate vehicle numbers from first 5 rows only (always called before early return)
  const vehicleValidation = useMemo(() => {
    if (!isOpen || sampleData.length <= 1) return null;

    const vehicleNumbers = sampleData
      .slice(1, 6) // Only check first 5 rows
      .map((row) => {
        const vehicleValue = row[vehicleColumnIndex];
        return vehicleValue ? String(vehicleValue) : "";
      })
      .filter(Boolean);

    return validateVehicleNumbers(vehicleNumbers);
  }, [isOpen, sampleData, vehicleColumnIndex]);

  if (!isOpen) return null;

  // Get ordered columns for agent view (vehicle column first, then others)
  const orderedColumns = [
    vehicleColumnIndex,
    ...agentViewColumns.filter((col) => col !== vehicleColumnIndex),
  ];
  const visibleColumnHeaders = orderedColumns
    .map((index) => columnHeaders[index])
    .filter(Boolean);

  // Get sample data for preview (first 5 rows after header)
  const previewData = sampleData
    .slice(1, 6)
    .map((row) => orderedColumns.map((colIndex) => row[colIndex] || "-"));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Agent View Preview
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Review what agents will see before saving to the system
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* File Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-blue-400 mr-3"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Source File: {fileName}
                </p>
                <p className="text-xs text-blue-600">
                  Showing {visibleColumnHeaders.length} columns •{" "}
                  {previewData.length} sample rows
                </p>
              </div>
            </div>
          </div>

          {/* Column Selection Summary */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Selected Columns for Agent View:
            </h4>
            <div className="flex flex-wrap gap-2">
              {visibleColumnHeaders.map((header, index) => (
                <span
                  key={header.index}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    index === 0
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-indigo-100 text-indigo-800"
                  }`}
                >
                  {index === 0 && (
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {header.name}
                  {index === 0 && (
                    <span className="ml-1 text-xs">(Vehicle)</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Vehicle Number Validation Warning */}
          {vehicleValidation && vehicleValidation.invalidCount > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3 flex-1">
                  <h5 className="text-sm font-medium text-yellow-800">
                    Vehicle Number Format Warning
                  </h5>
                  <p className="text-sm text-yellow-700 mt-1">
                    {vehicleValidation.invalidCount} out of{" "}
                    {vehicleValidation.totalCount} vehicle numbers don't match
                    the expected format (e.g., DLFAPATW00347). Please review
                    these entries.
                  </p>

                  {vehicleValidation.invalidNumbers.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-yellow-800 mb-2">
                        Invalid entries (showing first 5):
                      </p>
                      <div className="space-y-1">
                        {vehicleValidation.invalidNumbers
                          .slice(0, 5)
                          .map((invalid, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-yellow-100 px-2 py-1 rounded text-xs"
                            >
                              <span className="font-mono text-yellow-900">
                                Row {invalid.rowIndex}: "{invalid.value}"
                              </span>
                              <span className="text-yellow-600 text-xs">
                                {invalid.error}
                              </span>
                            </div>
                          ))}
                        {vehicleValidation.invalidNumbers.length > 5 && (
                          <p className="text-xs text-yellow-600 mt-1">
                            + {vehicleValidation.invalidNumbers.length - 5} more
                            invalid entries
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                    <p className="text-xs font-medium text-yellow-800 mb-1">
                      Expected Vehicle Number Formats:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
                      <code className="bg-white px-2 py-1 rounded">
                        DLFAPATW00347
                      </code>
                      <code className="bg-white px-2 py-1 rounded">
                        DL01AB1234
                      </code>
                      <code className="bg-white px-2 py-1 rounded">
                        MH12DE3456
                      </code>
                      <code className="bg-white px-2 py-1 rounded">
                        KA03HG7890
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Number Validation Success */}
          {vehicleValidation && vehicleValidation.invalidCount === 0 && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-400 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h5 className="text-sm font-medium text-green-800">
                    All Vehicle Numbers Valid ✓
                  </h5>
                  <p className="text-sm text-green-600">
                    All {vehicleValidation.totalCount} vehicle numbers match the
                    expected format.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h4 className="text-sm font-medium text-gray-900">
                Data Preview
              </h4>
              <p className="text-xs text-gray-500 mt-1">
                This is how the data will appear to agents
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {visibleColumnHeaders.map((header, index) => (
                      <th
                        key={header.index}
                        className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          index === 0 ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {index === 0 && (
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span>{header.name}</span>
                          {index === 0 && (
                            <span className="text-green-600">(Vehicle)</span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-4 py-3 text-sm text-gray-900 ${
                            cellIndex === 0 ? "font-medium bg-green-50" : ""
                          }`}
                        >
                          {cell || <span className="text-gray-400">-</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sampleData.length > 6 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  + {sampleData.length - 6} more rows will be imported
                </p>
              </div>
            )}
          </div>

          {/* Info Cards */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-green-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-green-800">
                    Vehicle Numbers Included
                  </h5>
                  <p className="text-xs text-green-600 mt-1">
                    Agents will be able to see vehicle numbers for
                    identification
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 text-blue-400 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="ml-3">
                  <h5 className="text-sm font-medium text-blue-800">
                    Additional Details
                  </h5>
                  <p className="text-xs text-blue-600 mt-1">
                    {agentViewColumns.length - 1} additional columns selected
                    for context
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Edit
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Recheck Settings
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Save to System
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
