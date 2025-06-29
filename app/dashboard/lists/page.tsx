"use client";

import { useState } from "react";
import Link from "next/link";

interface ListItem {
  id: number;
  title: string;
  description: string;
  itemCount: number;
  createdAt: string;
  status: "active" | "archived";
}

const mockLists: ListItem[] = [
  {
    id: 1,
    title: "Product Backlog",
    description: "Main product development tasks",
    itemCount: 24,
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    title: "Marketing Campaigns",
    description: "Upcoming marketing initiatives",
    itemCount: 12,
    createdAt: "2024-01-20",
    status: "active",
  },
  {
    id: 3,
    title: "Bug Reports",
    description: "Issues reported by users",
    itemCount: 8,
    createdAt: "2024-01-10",
    status: "active",
  },
  {
    id: 4,
    title: "Old Project Tasks",
    description: "Completed project from last quarter",
    itemCount: 45,
    createdAt: "2023-12-01",
    status: "archived",
  },
];

export default function ListsPage() {
  const [lists, setLists] = useState<ListItem[]>(mockLists);
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");

  const filteredLists = lists.filter((list) => {
    if (filter === "all") return true;
    return list.status === filter;
  });

  const toggleListStatus = (id: number) => {
    setLists(
      lists.map((list) =>
        list.id === id
          ? {
              ...list,
              status: list.status === "active" ? "archived" : "active",
            }
          : list
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Lists</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your lists and organize your tasks efficiently.
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
            Create List
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(["all", "active", "archived"] as const).map((tab) => (
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
              {lists.filter((l) => tab === "all" || l.status === tab).length})
            </button>
          ))}
        </nav>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLists.map((list) => (
          <div
            key={list.id}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
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
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
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
                <button className="text-gray-400 hover:text-gray-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                  </svg>
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {list.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{list.description}</p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(list.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-5 py-3">
              <div className="flex justify-between">
                <button className="text-sm font-medium text-green-700 hover:text-green-900">
                  View Items
                </button>
                <button
                  onClick={() => toggleListStatus(list.id)}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  {list.status === "active" ? "Archive" : "Restore"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
