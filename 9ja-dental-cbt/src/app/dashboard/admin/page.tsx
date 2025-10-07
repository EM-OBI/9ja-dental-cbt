"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Upload,
  Plus,
  Database,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage questions, users, and system settings
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Question Management */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mt-4">Question Bank</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Add, edit, and manage quiz questions
          </p>
          <div className="mt-4 space-y-2">
            <Link href="/dashboard/admin/questions">
              <Button className="w-full" variant="default">
                <FileText className="h-4 w-4 mr-2" />
                Manage Questions
              </Button>
            </Link>
            <Link href="/dashboard/admin/questions/new">
              <Button className="w-full" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Question
              </Button>
            </Link>
          </div>
        </Card>

        {/* Bulk Import */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Upload className="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mt-4">Bulk Import</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Import questions from CSV or JSON files
          </p>
          <div className="mt-4">
            <Link href="/dashboard/admin/import">
              <Button className="w-full" variant="default">
                <Upload className="h-4 w-4 mr-2" />
                Import Questions
              </Button>
            </Link>
          </div>
        </Card>

        {/* Database Stats */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Database className="h-6 w-6 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mt-4">Database Stats</h3>
          <p className="text-sm text-muted-foreground mt-2">
            View system statistics and analytics
          </p>
          <div className="mt-4">
            <Link href="/dashboard/admin/stats">
              <Button className="w-full" variant="outline">
                <Database className="h-4 w-4 mr-2" />
                View Statistics
              </Button>
            </Link>
          </div>
        </Card>

        {/* User Management */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Users className="h-6 w-6 text-orange-600 dark:text-orange-300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mt-4">User Management</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Manage users and permissions
          </p>
          <div className="mt-4">
            <Link href="/dashboard/admin/users">
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
            </Link>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mt-4">Settings</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Configure system settings and preferences
          </p>
          <div className="mt-4">
            <Link href="/dashboard/admin/settings">
              <Button className="w-full" variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
