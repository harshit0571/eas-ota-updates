"use client";

import { useState } from "react";

interface ColumnHeader {
  index: number;
  name: string;
}

interface MultiColumnSelectorProps {
  columnHeaders: ColumnHeader[];
  selectedColumns: number[];
  onColumnsSelect: (columnIndexes: number[]) => void;
  title: string;
  description: string;
  placeholder?: string;
  required?: boolean;
  excludeColumns?: number[]; // Columns to exclude from selection (e.g., vehicle column)
}

export default function MultiColumnSelector({
  columnHeaders,
  selectedColumns,
  onColumnsSelect,
  title,
  description,
  placeholder = "Select columns...",
  required = false,
  excludeColumns = [],
}: MultiColumnSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Filter out excluded columns
  const availableColumns = columnHeaders.filter(
    (col) => !excludeColumns.includes(col.index)
  );

  const selectedColumnData = selectedColumns
    .map((index) => columnHeaders.find((col) => col.index === index))
    .filter(Boolean) as ColumnHeader[];

  const handleColumnToggle = (columnIndex: number) => {
    const newSelection = selectedColumns.includes(columnIndex)
      ? selectedColumns.filter((index) => index !== columnIndex)
      : [...selectedColumns, columnIndex];

    onColumnsSelect(newSelection);
  };

  const selectAll = () => {
    const allAvailableIndexes = availableColumns.map((col) => col.index);
    onColumnsSelect(allAvailableIndexes);
  };

  const clearAll = () => {
    onColumnsSelect([]);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              {title}
              {required && <span className="text-red-500 ml-1">*</span>}
            </h3>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {selectedColumns.length} of {availableColumns.length} columns
            selected
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Column Selection Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableColumns.map((column) => {
            const isSelected = selectedColumns.includes(column.index);

            return (
              <div
                key={column.index}
                onClick={() => handleColumnToggle(column.index)}
                className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "border-indigo-300 bg-indigo-50 ring-1 ring-indigo-300"
                    : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                {/* Checkbox */}
                <div className="flex-shrink-0 mr-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Column Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mr-2">
                      {column.index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${
                          isSelected ? "text-indigo-900" : "text-gray-900"
                        }`}
                      >
                        {column.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Column {column.index + 1}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Columns Summary */}
        {selectedColumnData.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0"
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
                <p className="text-sm font-medium text-indigo-800">
                  Selected {selectedColumnData.length} columns for agent view:
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedColumnData.map((column) => (
                    <span
                      key={column.index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {column.name}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleColumnToggle(column.index);
                        }}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:text-indigo-600 hover:bg-indigo-200"
                      >
                        <svg
                          className="w-2 h-2"
                          fill="currentColor"
                          viewBox="0 0 8 8"
                        >
                          <path
                            d="M1.5 1.5l5 5m0-5l-5 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Selection State */}
        {selectedColumns.length === 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="ml-3 text-sm text-yellow-800">
                Please select at least one column that agents will be able to
                view.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
