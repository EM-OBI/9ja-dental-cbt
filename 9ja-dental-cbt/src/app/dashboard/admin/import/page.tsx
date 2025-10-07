"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Upload,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export default function ImportQuestionsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      let questions: Record<string, unknown>[];

      if (file.name.endsWith(".json")) {
        questions = JSON.parse(text);
      } else if (file.name.endsWith(".csv")) {
        questions = parseCSV(text);
      } else {
        alert("Unsupported file format. Please use JSON or CSV.");
        setImporting(false);
        return;
      }

      // Validate and import
      const response = await fetch("/api/admin/questions/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      const importResult = await response.json();
      setResult(importResult as ImportResult);
    } catch (error) {
      console.error("Import failed:", error);
      alert("Failed to import questions. Check file format.");
    } finally {
      setImporting(false);
    }
  };

  const parseCSV = (csvText: string): Record<string, unknown>[] => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const questions: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length === 0) continue;

      const question: Record<string, unknown> = {};
      headers.forEach((header, index) => {
        question[header] = values[index]?.trim() || "";
      });

      // Parse options (assuming they're in format: option1|option2|option3|option4)
      if (question.options && typeof question.options === "string") {
        question.options = question.options
          .split("|")
          .map((opt: string) => opt.trim());
      }

      // Parse tags
      if (question.tags && typeof question.tags === "string") {
        question.tags = question.tags
          .split("|")
          .map((tag: string) => tag.trim());
      }

      // Convert correctAnswer to number
      if (
        question.correctAnswer &&
        typeof question.correctAnswer === "string"
      ) {
        question.correctAnswer = parseInt(question.correctAnswer, 10);
      }

      questions.push(question);
    }

    return questions;
  };

  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const downloadTemplate = (format: "json" | "csv") => {
    if (format === "json") {
      const template = [
        {
          specialtyId: "spec_conservative_001",
          text: "What is the primary goal of conservative dentistry?",
          options: [
            "Extract all damaged teeth",
            "Preserve natural tooth structure",
            "Replace teeth with implants",
            "Whiten teeth",
          ],
          correctAnswer: 1,
          explanation:
            "Conservative dentistry focuses on preserving natural teeth through preventive care and minimally invasive procedures.",
          difficulty: "easy",
          type: "mcq",
          timeEstimate: 60,
          tags: ["fundamentals", "conservative"],
          reference: "Dental Fundamentals, Chapter 5",
        },
      ];
      downloadJSON(template, "question-template.json");
    } else {
      const csv = `specialtyId,text,options,correctAnswer,explanation,difficulty,type,timeEstimate,tags,reference
spec_conservative_001,"What is the primary goal of conservative dentistry?","Extract all damaged teeth|Preserve natural tooth structure|Replace teeth with implants|Whiten teeth",1,"Conservative dentistry focuses on preserving natural teeth through preventive care and minimally invasive procedures.",easy,mcq,60,"fundamentals|conservative","Dental Fundamentals, Chapter 5"`;
      downloadCSV(csv, "question-template.csv");
    }
  };

  const downloadJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Bulk Import Questions</h1>
          <p className="text-muted-foreground mt-1">
            Import multiple questions from CSV or JSON files
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Download Templates */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Download Templates</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Download a template file to see the required format for importing
            questions.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => downloadTemplate("json")}>
              <FileJson className="h-4 w-4 mr-2" />
              JSON Template
            </Button>
            <Button variant="outline" onClick={() => downloadTemplate("csv")}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              CSV Template
            </Button>
          </div>
        </Card>

        {/* Upload File */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Upload File</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Select CSV or JSON file</Label>
              <input
                id="file"
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                aria-label="Upload CSV or JSON file"
                className="w-full mt-2 p-2 border border-input rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>

            {file && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <span className="font-semibold">Selected file:</span>{" "}
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <Button
              onClick={handleImport}
              disabled={!file || importing}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? "Importing..." : "Import Questions"}
            </Button>
          </div>
        </Card>

        {/* Import Results */}
        {result && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Import Results</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">
                  Successfully imported: {result.imported} questions
                </span>
              </div>

              {result.failed > 0 && (
                <>
                  <div className="flex items-center gap-2 text-red-600">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">
                      Failed: {result.failed} questions
                    </span>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 rounded-md">
                      <p className="font-semibold text-sm mb-2">Errors:</p>
                      <ul className="text-sm space-y-1">
                        {result.errors.map((err, idx) => (
                          <li key={idx}>
                            Row {err.row}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {result.imported > 0 && (
                <Link href="/dashboard/admin/questions">
                  <Button className="mt-4">View Imported Questions</Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Format Guide */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Format Guide</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Required Fields:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <code>specialtyId</code> - Must match an existing specialty ID
                </li>
                <li>
                  <code>text</code> - The question text
                </li>
                <li>
                  <code>options</code> - Array of answer options (JSON) or
                  pipe-separated (CSV)
                </li>
                <li>
                  <code>correctAnswer</code> - Index of correct answer (0-based)
                </li>
                <li>
                  <code>difficulty</code> - easy, medium, or hard
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Optional Fields:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <code>explanation</code> - Explanation of the correct answer
                </li>
                <li>
                  <code>type</code> - mcq, true-false, or image-based (default:
                  mcq)
                </li>
                <li>
                  <code>timeEstimate</code> - Time in seconds (default: 60)
                </li>
                <li>
                  <code>tags</code> - Array (JSON) or pipe-separated (CSV)
                </li>
                <li>
                  <code>reference</code> - Source reference
                </li>
                <li>
                  <code>imageUrl</code> - URL to question image
                </li>
              </ul>
            </div>

            <div className="p-3 bg-muted rounded-md">
              <p className="font-semibold mb-1">CSV Format Note:</p>
              <p className="text-muted-foreground">
                In CSV files, use the pipe character (|) to separate multiple
                values in the options and tags fields. Example:{" "}
                <code>&quot;Option 1|Option 2|Option 3|Option 4&quot;</code>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
