"use client";

import { useAuth } from "../context/AuthContext";
import LogoutButton from "./LogoutButton";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Welcome, {user?.email}
            </span>
            <LogoutButton variant="header" showConfirmation={true} />
          </div>
        </div>
      </div>
    </header>
  );
}
