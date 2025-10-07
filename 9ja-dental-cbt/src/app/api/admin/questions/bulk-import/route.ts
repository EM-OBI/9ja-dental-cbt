import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { questions, specialties } from "@/db/schema";
import { verifyAdminAccess } from "@/lib/auth-helpers";

interface ImportQuestion {
  specialtyId: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  type?: "mcq" | "true-false" | "image-based";
  timeEstimate?: number;
  tags?: string[];
  imageUrl?: string;
  reference?: string;
}

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

/**
 * POST /api/admin/questions/bulk-import
 * Bulk import questions from JSON or CSV
 */
export async function POST(req: NextRequest) {
  // Verify admin access
  const { authorized, error } = await verifyAdminAccess(req);
  if (!authorized) {
    return NextResponse.json(
      { success: false, error: error || "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as {
      questions: Array<Record<string, unknown>>;
    };
    const { questions: importQuestions } = body;

    if (!Array.isArray(importQuestions)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid format: expected array of questions",
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const result: ImportResult = {
      success: true,
      imported: 0,
      failed: 0,
      errors: [],
    };

    // Fetch all specialties to validate IDs
    const allSpecialties = await db
      .select({ id: specialties.id })
      .from(specialties);
    const validSpecialtyIds = new Set(allSpecialties.map((s) => s.id));

    // Process each question
    for (let i = 0; i < importQuestions.length; i++) {
      const q = importQuestions[i] as unknown as ImportQuestion;
      const rowNum = i + 2; // +2 because row 1 is header and arrays are 0-indexed

      try {
        // Validation
        if (!q.specialtyId || !validSpecialtyIds.has(q.specialtyId)) {
          result.errors.push({
            row: rowNum,
            error: `Invalid specialty ID: ${q.specialtyId}`,
          });
          result.failed++;
          continue;
        }

        if (!q.text || !q.text.trim()) {
          result.errors.push({
            row: rowNum,
            error: "Question text is required",
          });
          result.failed++;
          continue;
        }

        if (!Array.isArray(q.options) || q.options.length < 2) {
          result.errors.push({
            row: rowNum,
            error: "Must provide at least 2 options",
          });
          result.failed++;
          continue;
        }

        if (
          q.correctAnswer === undefined ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= q.options.length
        ) {
          result.errors.push({
            row: rowNum,
            error: `Invalid correct answer index: ${q.correctAnswer}`,
          });
          result.failed++;
          continue;
        }

        if (
          !q.difficulty ||
          !["easy", "medium", "hard"].includes(q.difficulty)
        ) {
          result.errors.push({
            row: rowNum,
            error: `Invalid difficulty: ${q.difficulty}`,
          });
          result.failed++;
          continue;
        }

        // Generate question ID
        const questionId = `q_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Insert question
        await db.insert(questions).values({
          id: questionId,
          specialtyId: q.specialtyId,
          text: q.text,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || null,
          difficulty: q.difficulty,
          type: q.type || "mcq",
          timeEstimate: q.timeEstimate || 60,
          tags: q.tags && q.tags.length > 0 ? JSON.stringify(q.tags) : null,
          imageUrl: q.imageUrl || null,
          reference: q.reference || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        result.imported++;

        // Small delay to avoid overwhelming the database
        if (i % 10 === 0 && i > 0) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error importing question at row ${rowNum}:`, error);
        result.errors.push({
          row: rowNum,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        result.failed++;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process import",
      },
      { status: 500 }
    );
  }
}
