"use client";

import { useState, useMemo } from "react";

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
  sampleData: any[][]; // Cleaned Excel data (invalid rows already filtered out)
  fileName: string;
  isLoading?: boolean;
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
  isLoading = false,
}: AgentViewPreviewDialogProps) {
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
                  {previewData.length} sample rows (all vehicle numbers
                  validated and cleaned)
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

          {/* Data Validation Success */}
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="ml-3 flex-1">
                <h5 className="text-sm font-medium text-green-800">
                  Vehicle Numbers Validated and Cleaned
                </h5>
                <p className="text-sm text-green-700 mt-1">
                  All vehicle numbers have been cleaned (special characters
                  removed, converted to uppercase) and validated according to
                  Indian RTO standards. Invalid entries have been automatically
                  excluded.
                </p>
              </div>
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Sample Data Preview (First 5 Rows):
            </h4>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {visibleColumnHeaders.map((header, index) => (
                      <th
                        key={header.index}
                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          index === 0 ? "bg-green-50" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          {header.name}
                          {index === 0 && (
                            <svg
                              className="w-4 h-4 ml-1 text-green-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
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
                          className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                            cellIndex === 0 ? "font-mono font-medium" : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expected Format Info */}
          <div className="mt-6 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-xs font-medium text-yellow-800 mb-1">
              Expected Vehicle Number Formats:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-yellow-700">
              <code className="bg-white px-2 py-1 rounded">DL01AB1234</code>
              <code className="bg-white px-2 py-1 rounded">DL01A1234</code>
              <code className="bg-white px-2 py-1 rounded">DL011234</code>
              <code className="bg-white px-2 py-1 rounded">DLFAPATW00347</code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>
              Ready to save {sampleData.length - 1} validated vehicle records to
              the system
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save to System"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
