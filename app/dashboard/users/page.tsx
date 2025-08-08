"use client";

import { useState } from "react";
import {
  useUsers,
  useUpdateUserVerification,
  useUpdateUserPassword,
  useUpdateUserDeviceId,
  User,
} from "../../../lib/hooks/useUsers";

export default function UsersPage() {
  const { data: users = [], isLoading, error } = useUsers();
  const updateVerification = useUpdateUserVerification();
  const updatePassword = useUpdateUserPassword();
  const updateDeviceId = useUpdateUserDeviceId();
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState<Set<string>>(new Set());
  const [passwordModal, setPasswordModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    newPassword: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
    newPassword: "",
  });
  const [deviceIdModal, setDeviceIdModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    currentDeviceId: string;
    newDeviceId: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
    currentDeviceId: "",
    newDeviceId: "",
  });

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleVerificationToggle = async (
    userId: string,
    currentStatus: string
  ) => {
    try {
      setLoadingUsers((prev) => new Set(prev).add(userId));
      const newStatus = currentStatus === "pending" ? "verified" : "pending";
      await updateVerification.mutateAsync({ userId, status: newStatus });
    } catch (error) {
      console.error("Error updating verification status:", error);
    } finally {
      setLoadingUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordModal.newPassword || passwordModal.newPassword.length < 6) {
      alert("Password must be at least 6 characters long");
      return;
    }

    try {
      await updatePassword.mutateAsync({
        userId: passwordModal.userId,
        password: passwordModal.newPassword,
      });

      // Close modal and reset
      setPasswordModal({
        isOpen: false,
        userId: "",
        userName: "",
        newPassword: "",
      });

      alert("Password updated successfully!");
    } catch (error: any) {
      console.error("Error updating password:", error);
      alert(error.message || "Failed to update password");
    }
  };

  const openPasswordModal = (userId: string, userName: string) => {
    setPasswordModal({
      isOpen: true,
      userId,
      userName,
      newPassword: "",
    });
  };

  const handleDeviceIdChange = async () => {
    if (!deviceIdModal.newDeviceId.trim()) {
      alert("Device ID cannot be empty");
      return;
    }

    try {
      await updateDeviceId.mutateAsync({
        userId: deviceIdModal.userId,
        deviceId: deviceIdModal.newDeviceId.trim(),
      });

      // Close modal and reset
      setDeviceIdModal({
        isOpen: false,
        userId: "",
        userName: "",
        currentDeviceId: "",
        newDeviceId: "",
      });

      alert("Device ID updated successfully!");
    } catch (error: any) {
      console.error("Error updating device ID:", error);
      alert(error.message || "Failed to update device ID");
    }
  };

  const openDeviceIdModal = (
    userId: string,
    userName: string,
    currentDeviceId: string
  ) => {
    setDeviceIdModal({
      isOpen: true,
      userId,
      userName,
      currentDeviceId,
      newDeviceId: currentDeviceId,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "verified":
        return "Verified";
      case "rejected":
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const ToggleSwitch = ({
    userId,
    currentStatus,
    isLoading,
  }: {
    userId: string;
    currentStatus: string;
    isLoading: boolean;
  }) => {
    const isVerified = currentStatus === "verified";

    return (
      <div className="flex items-center space-x-3">
        <span
          className={`text-sm font-medium transition-colors ${
            isVerified ? "text-gray-400" : "text-gray-900"
          }`}
        >
          Pending
        </span>
        <button
          onClick={() => handleVerificationToggle(userId, currentStatus)}
          disabled={isLoading}
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 shadow-md ${
            isVerified
              ? "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600"
              : "bg-gray-300 hover:bg-gray-400"
          }`}
        >
          <span
            className={`h-5 w-5 transform rounded-full bg-white transition-all duration-300 ease-in-out shadow-lg flex items-center justify-center ${
              isVerified ? "translate-x-6" : "translate-x-1"
            }`}
          >
            {isLoading ? (
              <svg
                className="h-3 w-3 animate-spin text-gray-400"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : isVerified ? (
              <svg
                className="h-3 w-3 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-3 w-3 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </span>
        </button>
        <span
          className={`text-sm font-medium transition-colors ${
            isVerified ? "text-gray-900" : "text-gray-400"
          }`}
        >
          Verified
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 mt-4">Loading users...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-red-400 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-800 font-medium">
            Error loading users: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-lg text-gray-700">
            Manage user verification status and view user information.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-lg">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, phone, city, or device ID..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all duration-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Count & Stats */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="text-sm text-gray-700">
          Showing{" "}
          <span className="font-bold text-gray-900">
            {filteredUsers.length}
          </span>{" "}
          of <span className="font-bold text-gray-900">{users.length}</span>{" "}
          users
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 shadow-sm"></div>
            <span className="text-gray-700">
              <span className="font-bold text-green-600">
                {
                  users.filter((u) => u.verification_status === "verified")
                    .length
                }
              </span>{" "}
              Verified
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 shadow-sm"></div>
            <span className="text-gray-700">
              <span className="font-bold text-yellow-600">
                {
                  users.filter((u) => u.verification_status === "pending")
                    .length
                }
              </span>{" "}
              Pending
            </span>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="mb-2 text-xs text-gray-500 text-right">
          <span className="inline-flex items-center">
            <svg
              className="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
            Scroll horizontally to see all columns
          </span>
        </div>
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <table className="w-full min-w-[1200px] divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="w-64 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  User
                </th>
                <th className="w-48 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="w-24 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="w-48 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Device ID
                </th>
                <th className="w-32 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-40 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Verification
                </th>
                <th className="w-44 px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-16 h-16 text-gray-300 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-xl font-medium text-gray-900 mb-2">
                        No users found
                      </p>
                      <p className="text-sm text-gray-500">
                        Try adjusting your search terms or check back later.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`hover:bg-blue-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <span className="text-xs font-bold text-white">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 truncate">
                            {user.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.phone}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {user.city}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 capitalize border border-blue-200">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="text-xs font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded border max-w-28 truncate"
                          title={user.deviceId || "Not set"}
                        >
                          {user.deviceId || "Not set"}
                        </div>
                        <button
                          onClick={() =>
                            openDeviceIdModal(user.id, user.name, user.deviceId)
                          }
                          className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                          title="Change Device ID"
                        >
                          <svg
                            className="w-3 h-3"
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
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            user.verification_status === "verified"
                              ? "bg-green-500"
                              : user.verification_status === "rejected"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            user.verification_status
                          )}`}
                        >
                          {getStatusText(user.verification_status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <ToggleSwitch
                        userId={user.id}
                        currentStatus={user.verification_status}
                        isLoading={loadingUsers.has(user.id)}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => openPasswordModal(user.id, user.name)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        <svg
                          className="w-3 h-3 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                        Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">Total Users</div>
              <div className="mt-1 text-3xl font-bold">{users.length}</div>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">
                Verified Users
              </div>
              <div className="mt-1 text-3xl font-bold">
                {
                  users.filter((u) => u.verification_status === "verified")
                    .length
                }
              </div>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-xl shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium opacity-90">
                Pending Verification
              </div>
              <div className="mt-1 text-3xl font-bold">
                {
                  users.filter((u) => u.verification_status === "pending")
                    .length
                }
              </div>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div> */}

      {/* Device ID Change Modal */}
      {deviceIdModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Change Device ID
                </h3>
                <button
                  onClick={() =>
                    setDeviceIdModal({
                      isOpen: false,
                      userId: "",
                      userName: "",
                      currentDeviceId: "",
                      newDeviceId: "",
                    })
                  }
                  className="text-gray-400 hover:text-gray-600"
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

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Changing device ID for:{" "}
                  <span className="font-semibold">
                    {deviceIdModal.userName}
                  </span>
                </p>

                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Device ID
                  </label>
                  <div className="text-sm font-mono text-gray-600 bg-gray-100 px-3 py-2 rounded border">
                    {deviceIdModal.currentDeviceId || "Not set"}
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Device ID
                </label>
                <input
                  type="text"
                  value={deviceIdModal.newDeviceId}
                  onChange={(e) =>
                    setDeviceIdModal({
                      ...deviceIdModal,
                      newDeviceId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  placeholder="Enter new device ID"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Device ID is used to restrict user access to a specific device
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setDeviceIdModal({
                      isOpen: false,
                      userId: "",
                      userName: "",
                      currentDeviceId: "",
                      newDeviceId: "",
                    })
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeviceIdChange}
                  disabled={updateDeviceId.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateDeviceId.isPending ? (
                    <div className="flex items-center">
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    "Update Device ID"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Change Password
                </h3>
                <button
                  onClick={() =>
                    setPasswordModal({
                      isOpen: false,
                      userId: "",
                      userName: "",
                      newPassword: "",
                    })
                  }
                  className="text-gray-400 hover:text-gray-600"
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

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Changing password for:{" "}
                  <span className="font-semibold">
                    {passwordModal.userName}
                  </span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordModal.newPassword}
                  onChange={(e) =>
                    setPasswordModal({
                      ...passwordModal,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password (min 6 characters)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setPasswordModal({
                      isOpen: false,
                      userId: "",
                      userName: "",
                      newPassword: "",
                    })
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  disabled={updatePassword.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatePassword.isPending ? (
                    <div className="flex items-center">
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </div>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
