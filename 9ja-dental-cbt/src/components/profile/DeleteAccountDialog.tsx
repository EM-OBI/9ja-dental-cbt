"use client";

import React, { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  userName: string;
}

export function DeleteAccountDialog({
  isOpen,
  onOpenChange,
  onConfirmDelete,
  userName,
}: DeleteAccountDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmationText !== "DELETE") {
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirmDelete();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    setIsDeleting(false);
    onOpenChange(false);
  };

  const isConfirmationValid = confirmationText === "DELETE";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <DialogTitle className="text-destructive">
              Delete Account
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            You are about to permanently delete your account for{" "}
            <strong>{userName}</strong>. This action cannot be undone and will
            result in the immediate and permanent loss of all your data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning List */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <h4 className="font-medium text-destructive mb-2">
              This will permanently delete:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                <span>All your quiz progress and achievements</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                <span>Your subscription and billing history</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                <span>All study materials and personal notes</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                <span>Your profile and account preferences</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-destructive rounded-full"></div>
                <span>Access to all premium features and content</span>
              </li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <Label htmlFor="confirmation-input" className="text-sm font-medium">
              To confirm deletion, type{" "}
              <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">
                DELETE
              </code>{" "}
              in the field below:
            </Label>
            <Input
              id="confirmation-input"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className={
                confirmationText && !isConfirmationValid
                  ? "border-destructive"
                  : ""
              }
              disabled={isDeleting}
            />
            {confirmationText && !isConfirmationValid && (
              <p className="text-xs text-destructive">
                You must type &quot;DELETE&quot; exactly to proceed
              </p>
            )}
          </div>

          {/* Final Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Last chance!</strong> Once you delete your account, there
              is no way to recover it. Consider downloading any important data
              before proceeding.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmationValid || isDeleting}
            className="flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
