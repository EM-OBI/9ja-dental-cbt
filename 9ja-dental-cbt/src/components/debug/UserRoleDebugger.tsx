"use client";

import { useUserStore } from "@/store/userStore";
import { refreshUserData } from "@/store/userStore";
import { useState } from "react";

/**
 * Debug component to check and refresh user role
 * Remove this component in production
 */
export function UserRoleDebugger() {
  const { user } = useUserStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshUserData();
      console.log("User data refreshed successfully");
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold">No User Found</h3>
        <p className="text-sm">User is not authenticated</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-sm border border-gray-700">
      <h3 className="font-bold mb-2">User Role Debug Info</h3>
      <div className="space-y-1 text-sm">
        <p>
          <span className="font-semibold">ID:</span> {user.id}
        </p>
        <p>
          <span className="font-semibold">Name:</span> {user.name}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold">Role:</span>{" "}
          <span
            className={`px-2 py-0.5 rounded ${
              user.role === "admin"
                ? "bg-green-600"
                : user.role === "superadmin"
                ? "bg-purple-600"
                : "bg-gray-600"
            }`}
          >
            {user.role || "user"}
          </span>
        </p>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
      >
        {isRefreshing ? "Refreshing..." : "Refresh User Data"}
      </button>
      <p className="text-xs text-gray-400 mt-2">
        Click refresh after updating role in database
      </p>
    </div>
  );
}
