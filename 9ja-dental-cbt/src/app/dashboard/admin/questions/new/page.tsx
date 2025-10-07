"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Specialty {
  id: string;
  name: string;
  slug: string;
}

export default function NewQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const [formData, setFormData] = useState({
    specialtyId: "",
    text: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    type: "mcq" as "mcq" | "true-false" | "image-based",
    timeEstimate: 60,
    reference: "",
    imageUrl: "",
    tags: "",
  });

  // Fetch specialties
  useEffect(() => {
    const loadSpecialties = async () => {
      try {
        const response = await fetch("/api/specialties");
        const result = (await response.json()) as {
          success: boolean;
          data?: Array<{ id: string; name: string; slug: string }>;
        };
        if (result.success && result.data) {
          setSpecialties(result.data);
          if (result.data.length > 0 && result.data[0]) {
            setFormData((prev) => ({
              ...prev,
              specialtyId: result.data![0].id,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to load specialties:", error);
      }
    };
    loadSpecialties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.text.trim()) {
      alert("Question text is required");
      return;
    }
    if (formData.options.some((opt) => !opt.trim())) {
      alert("All options must be filled");
      return;
    }
    if (!formData.specialtyId) {
      alert("Please select a specialty");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags
            ? formData.tags.split(",").map((t) => t.trim())
            : [],
        }),
      });

      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (result.success) {
        alert("Question created successfully!");
        router.push("/dashboard/admin/questions");
      } else {
        alert("Failed to create question: " + result.error);
      }
    } catch (error) {
      console.error("Failed to create question:", error);
      alert("Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addOption = () => {
    setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) {
      alert("Must have at least 2 options");
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions,
      correctAnswer:
        formData.correctAnswer >= newOptions.length
          ? 0
          : formData.correctAnswer,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/admin/questions">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Add New Question</h1>
          <p className="text-muted-foreground mt-1">
            Create a new quiz question
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6">
          {/* Specialty */}
          <div>
            <Label htmlFor="specialty">Specialty *</Label>
            <select
              id="specialty"
              aria-label="Select specialty"
              value={formData.specialtyId}
              onChange={(e) =>
                setFormData({ ...formData, specialtyId: e.target.value })
              }
              className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
              required
            >
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div>
            <Label htmlFor="text">Question Text *</Label>
            <textarea
              id="text"
              value={formData.text}
              onChange={(e) =>
                setFormData({ ...formData, text: e.target.value })
              }
              className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background mt-1"
              placeholder="Enter the question text..."
              required
            />
          </div>

          {/* Question Type & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="type">Question Type</Label>
              <select
                id="type"
                aria-label="Select question type"
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as
                      | "mcq"
                      | "true-false"
                      | "image-based",
                  })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
              >
                <option value="mcq">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="image-based">Image-Based</option>
              </select>
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                aria-label="Select difficulty level"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as "easy" | "medium" | "hard",
                  })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <Label htmlFor="timeEstimate">Time (seconds)</Label>
              <Input
                id="timeEstimate"
                type="number"
                value={formData.timeEstimate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    timeEstimate: parseInt(e.target.value) || 60,
                  })
                }
                min={10}
                max={300}
                className="mt-1"
              />
            </div>
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Answer Options *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 flex gap-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="correctAnswer"
                        aria-label={`Option ${String.fromCharCode(
                          65 + index
                        )} is correct`}
                        checked={formData.correctAnswer === index}
                        onChange={() =>
                          setFormData({ ...formData, correctAnswer: index })
                        }
                        className="h-4 w-4"
                      />
                      <span className="ml-2 text-sm font-medium">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />
                  </div>
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select the correct answer by clicking the radio button
            </p>
          </div>

          {/* Explanation */}
          <div>
            <Label htmlFor="explanation">Explanation</Label>
            <textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) =>
                setFormData({ ...formData, explanation: e.target.value })
              }
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background mt-1"
              placeholder="Explain why the correct answer is right..."
            />
          </div>

          {/* Image URL */}
          <div>
            <Label htmlFor="imageUrl">Image URL (optional)</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData({ ...formData, imageUrl: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
          </div>

          {/* Reference & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) =>
                  setFormData({ ...formData, reference: e.target.value })
                }
                placeholder="Textbook, page number, etc."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="anatomy, clinical, diagnosis"
                className="mt-1"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Question"}
            </Button>
            <Link href="/dashboard/admin/questions" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </Card>
      </form>
    </div>
  );
}
