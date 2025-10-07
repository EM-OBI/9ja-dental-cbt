import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getUserStreaks } from "@/services/serverData";

// GET /api/users/[id]/streaks - Get user streak data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if user is accessing their own data
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch streaks from database
    const streaks = await getUserStreaks(id);

    // Calculate streak statistics
    const dailyQuizStreak = streaks.find((s) => s.streakType === "daily_quiz");
    const studyStreak = streaks.find((s) => s.streakType === "study_session");
    const loginStreak = streaks.find((s) => s.streakType === "login");

    const streakData = {
      currentStreak: dailyQuizStreak?.currentCount || 0,
      longestStreak: dailyQuizStreak?.bestCount || 0,
      lastActivityDate: dailyQuizStreak?.lastActivityDate || null,
      streaks: {
        dailyQuiz: dailyQuizStreak,
        study: studyStreak,
        login: loginStreak,
      },
      allStreaks: streaks,
    };

    return NextResponse.json({
      success: true,
      data: streakData,
    });
  } catch (error) {
    console.error("Error fetching user streaks:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
