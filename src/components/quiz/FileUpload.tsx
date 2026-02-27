"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept: string;
  maxSizeMB: number;
  file: File | null;
  onFileChange: (file: File | null) => void;
  icon: "pdf" | "image";
}

export default function FileUpload({
  accept,
  maxSizeMB,
  file,
  onFileChange,
  icon,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (f: File) => {
      if (f.size > maxSizeMB * 1024 * 1024) {
        alert(`파일 크기는 최대 ${maxSizeMB}MB까지 가능합니다.`);
        return;
      }
      onFileChange(f);
    },
    [maxSizeMB, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const Icon = icon === "pdf" ? FileText : ImageIcon;

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border p-4">
        <Icon className="h-8 w-8 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onFileChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer ${
        dragOver
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground text-center">
        파일을 드래그하거나 클릭하여 선택
      </p>
      <p className="text-xs text-muted-foreground">최대 {maxSizeMB}MB</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
