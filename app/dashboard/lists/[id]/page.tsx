"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useList, useUpdateListColumns } from "@/lib/hooks/useList";
import { ColumnRow } from "@/lib/createList";

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;

  const { data: list, isLoading, error } = useList(listId);
  const updateListMutation = useUpdateListColumns();

  const [localRows, setLocalRows] = useState<ColumnRow[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Initialize local rows when list data is loaded
  useEffect(() => {
    if (list?.rows && localRows.length === 0) {
      setLocalRows([...list.rows]);
    }
  }, [list?.rows, localRows.length]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleToggleShowToAgent = (index: number) => {
    const updatedRows = [...localRows];
    updatedRows[index] = {
      ...updatedRows[index],
      showtoagent: !updatedRows[index].showtoagent,
    };
    setLocalRows(updatedRows);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      await updateListMutation.mutateAsync({
        listId,
        updatedRows: localRows,
      });
      setHasChanges(false);
      setNotification({
        type: "success",
        message: "Column visibility settings saved successfully!",
      });
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      console.error("Error saving changes:", error);
      setNotification({
        type: "error",
        message: "Failed to save changes. Please try again.",
      });
      // Clear notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleResetChanges = () => {
    if (list?.rows) {
      setLocalRows([...list.rows]);
      setHasChanges(false);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
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
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading list
              </h3>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
              <div className="mt-4">
                <Link
                  href="/dashboard/lists"
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  ← Back to Lists
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between">
            <div className="w-32 h-8 bg-gray-200 rounded"></div>
            <div className="w-24 h-10 bg-gray-200 rounded"></div>
          </div>
          <div className="mt-6">
            <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-4 bg-gray-200 rounded mt-2"></div>
          </div>
          <div className="mt-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            List not found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            The list you're looking for doesn't exist or has been deleted.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/lists"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              ← Back to Lists
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const visibleColumnsCount = localRows.filter((row) => row.showtoagent).length;

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`rounded-md p-4 ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
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
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${
                  notification.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {notification.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setNotification(null)}
                className={`inline-flex rounded-md p-1.5 ${
                  notification.type === "success"
                    ? "text-green-500 hover:bg-green-100"
                    : "text-red-500 hover:bg-red-100"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
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
        </div>
      )}

      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/lists"
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              ← Back to Lists
            </Link>
            <span
              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                list.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {list.status}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">
            {list.fileName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage column visibility settings for agents
          </p>
        </div>
        {hasChanges && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={handleResetChanges}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={updateListMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateListMutation.isPending ? (
                <svg
                  className="w-4 h-4 mr-2 animate-spin"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
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
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* List Metadata */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            List Information
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created By</dt>
              <dd className="mt-1 text-sm text-gray-900">{list.createdBy}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatDate(list.uploadDate)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Total Records
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {list.totalRecords} vehicles
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Vehicle Column
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {list.vehicleColumnName}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">
                Visible Columns
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {visibleColumnsCount} of {localRows.length}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Column Configuration */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Column Visibility Settings
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure which columns are visible to agents. Use the toggle
            switches to show or hide columns.
          </p>

          <div className="space-y-3">
            {localRows.map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">
                      {row.name}
                    </div>
                    {row.name === list.vehicleColumnName && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Vehicle Column
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Field name:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {row.sanitizedName}
                    </code>
                  </div>
                </div>

                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleToggleShowToAgent(index)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                      row.showtoagent ? "bg-green-600" : "bg-gray-200"
                    }`}
                    role="switch"
                    aria-checked={row.showtoagent}
                  >
                    <span className="sr-only">
                      {row.showtoagent ? "Hide" : "Show"} {row.name} from agents
                    </span>
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${
                        row.showtoagent ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="ml-3 text-sm">
                    <span className="font-medium text-gray-900">
                      {row.showtoagent ? "Visible" : "Hidden"}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
