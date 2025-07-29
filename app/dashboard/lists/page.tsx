"use client";

import { useState } from "react";
import Link from "next/link";
import { useLists } from "@/lib/hooks/useLists";
import { ListMetadata } from "@/lib/createList";

export default function ListsPage() {
  const { data: lists, isLoading, error, refetch } = useLists();
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredLists =
    lists?.filter((list) => {
      if (filter === "all") return true;
      return list.status === filter;
    }) || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Lists</h1>
          </div>
        </div>
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
                Error loading lists
              </h3>
              <p className="text-sm text-red-700 mt-1">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Vehicle Lists</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your uploaded vehicle lists and Excel data.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/dashboard/lists/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:w-auto"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload New List
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(["all", "active", "inactive"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                filter === tab
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab} (
              {lists?.filter((l) => tab === "all" || l.status === tab).length ||
                0}
              )
            </button>
          ))}
        </nav>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                    <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-4">
                    <div className="w-3/4 h-5 bg-gray-200 rounded"></div>
                    <div className="w-full h-4 bg-gray-200 rounded mt-2"></div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && (!lists || lists.length === 0) && (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No lists found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first Excel file.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/lists/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Upload Excel File
            </Link>
          </div>
        </div>
      )}

      {/* Lists Grid */}
      {!isLoading && filteredLists.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLists.map((list) => (
            <div
              key={list.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
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
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        list.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {list.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {list.fileName}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Vehicle Column: {list.vehicleColumnName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {list.rows.filter((row) => row.showtoagent).length} of{" "}
                    {list.rows.length} columns visible to agents
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {list.totalRecords}{" "}
                    {list.totalRecords === 1 ? "vehicle" : "vehicles"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(list.uploadDate)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-5 py-3">
                <div className="flex justify-between">
                  <Link
                    href={`/dashboard/lists/${list.id}`}
                    className="text-sm font-medium text-green-700 hover:text-green-900"
                  >
                    View Vehicles
                  </Link>
                  <span className="text-xs text-gray-500">ID: {list.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
