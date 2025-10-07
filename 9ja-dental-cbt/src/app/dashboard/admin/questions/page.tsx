"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Question } from "@/types/definitions";

interface QuestionWithSpecialty extends Question {
  specialtyName?: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<QuestionWithSpecialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [specialties, setSpecialties] = useState<
    Array<{ id: string; name: string; slug: string }>
  >([]);

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
        }
      } catch (error) {
        console.error("Failed to load specialties:", error);
      }
    };
    loadSpecialties();
  }, []);

  // Fetch questions
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/admin/questions?includeAll=true";
      if (filterSpecialty !== "all") {
        url += `&specialtyId=${filterSpecialty}`;
      }
      if (filterDifficulty !== "all") {
        url += `&difficulty=${filterDifficulty}`;
      }

      const response = await fetch(url);
      const result = (await response.json()) as {
        success: boolean;
        data?: QuestionWithSpecialty[];
      };
      if (result.success && result.data) {
        setQuestions(result.data);
      }
    } catch (error) {
      console.error("Failed to load questions:", error);
    } finally {
      setLoading(false);
    }
  }, [filterSpecialty, filterDifficulty]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Delete question
  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (result.success) {
        loadQuestions();
      } else {
        alert("Failed to delete question: " + result.error);
      }
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Failed to delete question");
    }
  };

  // Filter questions by search term
  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Question Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your quiz question bank
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/questions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Specialty Filter */}
          <div>
            <select
              aria-label="Filter by specialty"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Specialties</option>
              {specialties.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              aria-label="Filter by difficulty"
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filteredQuestions.length} of {questions.length} questions
          </p>
          <Button variant="outline" size="sm" onClick={loadQuestions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-4">Loading questions...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No questions found</p>
          <Link href="/dashboard/admin/questions/new">
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Question
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getDifficultyColor(question.difficulty)}>
                      {question.difficulty}
                    </Badge>
                    {question.specialtyName && (
                      <Badge variant="outline">{question.specialtyName}</Badge>
                    )}
                    <Badge variant="secondary">{question.type}</Badge>
                  </div>
                  <h3 className="font-medium mb-2">{question.text}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {question.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${
                          idx === question.correctAnswer
                            ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                            : "bg-muted"
                        }`}
                      >
                        <span className="font-semibold mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        {option}
                      </div>
                    ))}
                  </div>
                  {question.explanation && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <span className="font-semibold">Explanation:</span>{" "}
                      {question.explanation}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Link href={`/dashboard/admin/questions/${question.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(question.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
