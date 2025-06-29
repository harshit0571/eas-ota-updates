"use client";

import { useState } from "react";

interface ColumnHeader {
  index: number;
  name: string;
}

interface ColumnSelectorProps {
  columnHeaders: ColumnHeader[];
  selectedColumn: number | null;
  onColumnSelect: (columnIndex: number | null) => void;
  title: string;
  description: string;
  placeholder?: string;
  required?: boolean;
}

export default function ColumnSelector({
  columnHeaders,
  selectedColumn,
  onColumnSelect,
  title,
  description,
  placeholder = "Select a column...",
  required = false,
}: ColumnSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedColumnData =
    selectedColumn !== null
      ? columnHeaders.find((col) => col.index === selectedColumn)
      : null;

  const handleColumnSelect = (columnIndex: number) => {
    onColumnSelect(columnIndex);
    setIsOpen(false);
  };

  const clearSelection = () => {
    onColumnSelect(null);
    setIsOpen(false);
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              selectedColumnData ? "text-gray-900" : "text-gray-500"
            }`}
          >
            <span className="block truncate">
              {selectedColumnData
                ? `Column ${selectedColumnData.index + 1}: ${
                    selectedColumnData.name
                  }`
                : placeholder}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </button>

          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
              {/* Clear Selection Option */}
              {selectedColumn !== null && (
                <>
                  <button
                    onClick={clearSelection}
                    className="text-red-600 hover:bg-red-50 relative cursor-pointer select-none py-2 pl-3 pr-9 w-full text-left"
                  >
                    <span className="block truncate font-medium">
                      Clear Selection
                    </span>
                  </button>
                  <div className="border-t border-gray-200 my-1"></div>
                </>
              )}

              {/* Column Options */}
              {columnHeaders.map((column) => (
                <button
                  key={column.index}
                  onClick={() => handleColumnSelect(column.index)}
                  className={`${
                    selectedColumn === column.index
                      ? "text-indigo-900 bg-indigo-100"
                      : "text-gray-900 hover:bg-gray-50"
                  } relative cursor-pointer select-none py-2 pl-3 pr-9 w-full text-left`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-medium mr-3">
                      {column.index + 1}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`block truncate ${
                          selectedColumn === column.index
                            ? "font-semibold"
                            : "font-normal"
                        }`}
                      >
                        {column.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Column {column.index + 1}
                      </span>
                    </div>
                  </div>

                  {selectedColumn === column.index && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg
                        className="h-5 w-5 text-indigo-600"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Column Preview */}
        {selectedColumnData && (
          <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-indigo-400"
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
                <p className="text-sm font-medium text-indigo-800">
                  Selected: Column {selectedColumnData.index + 1}
                </p>
                <p className="text-sm text-indigo-600">
                  "{selectedColumnData.name}" will be used as the vehicle number
                  column and automatically included in agent view
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
