"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

interface LogoutButtonProps {
  variant?: "header" | "sidebar" | "menu";
  showConfirmation?: boolean;
}

export default function LogoutButton({
  variant = "header",
  showConfirmation = true,
}: LogoutButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    if (showConfirmation) {
      setShowDialog(true);
    } else {
      await logout();
    }
  };

  const confirmLogout = async () => {
    setShowDialog(false);
    await logout();
  };

  const baseClasses =
    "inline-flex items-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";

  const variants = {
    header:
      "px-3 py-2 border border-transparent text-xs leading-4 rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-red-500",
    sidebar:
      "w-full px-3 py-2 text-sm text-left text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md",
    menu: "block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600",
  };

  return (
    <>
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`${baseClasses} ${variants[variant]} ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {loading ? "Logging out..." : "Logout"}
      </button>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mt-5">
                Confirm Logout
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to logout? You will need to sign in
                  again to access your dashboard.
                </p>
              </div>
              <div className="items-center px-4 py-3 space-x-3 flex justify-center">
                <button
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-24 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-24 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
