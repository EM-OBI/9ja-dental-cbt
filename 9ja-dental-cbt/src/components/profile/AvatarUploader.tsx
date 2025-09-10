"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvatarUploaderProps {
  currentAvatar?: string;
  userName?: string;
  onAvatarChange?: (file: File | null) => void;
  className?: string;
}

export function AvatarUploader({
  currentAvatar,
  userName = "User",
  onAvatarChange,
  className,
}: AvatarUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onAvatarChange?.(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className="relative group">
        <Avatar className="h-24 w-24 md:h-32 md:w-32">
          <AvatarImage src={preview || currentAvatar} alt={userName} />
          <AvatarFallback className="text-lg md:text-xl font-semibold">
            {getInitials(userName)}
          </AvatarFallback>
        </Avatar>

        {/* Overlay with camera icon */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          onClick={handleUploadClick}
        >
          <Camera className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Upload Photo
        </Button>

        {preview && preview !== currentAvatar && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPreview(currentAvatar || null);
              onAvatarChange?.(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            Reset
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload profile picture"
      />

      <p className="text-xs text-muted-foreground text-center max-w-xs">
        Upload a profile picture. Recommended size: 400x400px. Max file size:
        5MB.
      </p>
    </div>
  );
}
