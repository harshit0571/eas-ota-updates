import Header from "../components/Header";
import RouteGuard from "../components/RouteGuard";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-white shadow-sm min-h-screen">
            <nav className="mt-8">
              <div className="px-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Modules
                </h3>
                <div className="mt-2 space-y-1">
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard/users"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Users
                  </Link>
                  <Link
                    href="/dashboard/lists"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Lists
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">{children}</div>
        </div>
      </div>
    </RouteGuard>
  );
}
