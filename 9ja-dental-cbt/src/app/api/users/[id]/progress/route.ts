import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getUserProgress } from "@/services/serverData";
import { calculateLevelFromXp, calculateXpForLevel } from "@/lib/leveling";

// GET /api/users/[id]/progress - Get user progress
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

    const { progressData, quizStats, currentStreak, recentActivity } =
      await getUserProgress(id);

    const recentActivityList = recentActivity ?? [];

    // Calculate progress metrics from real data
    const stats = quizStats || {
      totalQuizzes: 0,
      averageScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    };
    const streakData = currentStreak;
    const userProgressData = progressData;

    // Transform daily activity into weekly progress
    const weeklyProgress = recentActivityList
      .map((activity) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const date = new Date(activity.activityDate);
        const correctAnswers = activity.correctAnswers || 0;
        const questionsAnswered = activity.questionsAnswered || 0;
        return {
          day: days[date.getDay()],
          score:
            questionsAnswered > 0
              ? Math.round((correctAnswers / questionsAnswered) * 100)
              : 0,
          time: activity.studyMinutes || 0,
        };
      })
      .slice(0, 7);

    // Transform recent activity for display
    const formattedActivity = recentActivityList
      .slice(0, 3)
      .map((activity, index) => {
        const quizzesCompleted = activity.quizzesCompleted || 0;
        const questionsAnswered = activity.questionsAnswered || 0;
        const correctAnswers = activity.correctAnswers || 0;
        const studyMinutes = activity.studyMinutes || 0;

        return {
          id: `activity-${index + 1}`,
          type: quizzesCompleted > 0 ? "quiz_completed" : "study_session",
          title: quizzesCompleted > 0 ? "Quiz Completed" : "Study Session",
          description:
            quizzesCompleted > 0
              ? `Answered ${questionsAnswered} questions`
              : `Studied for ${studyMinutes} minutes`,
          timestamp: new Date(activity.activityDate),
          metadata: {
            score:
              questionsAnswered > 0
                ? Math.round((correctAnswers / questionsAnswered) * 100)
                : 0,
            duration: studyMinutes,
          },
        };
      });

    const totalXp = Number(userProgressData?.xpEarned) || 0;
    const currentLevel = calculateLevelFromXp(totalXp);
    const nextLevel = currentLevel + 1;
    const xpForNextLevel = calculateXpForLevel(nextLevel);
    const pointsToNextLevel = Math.max(xpForNextLevel - totalXp, 0);

    const progressMetrics = {
      totalQuizzes: Number(stats.totalQuizzes) || 0,
      completedQuizzes: Number(stats.totalQuizzes) || 0,
      averageScore: Math.round(Number(stats.averageScore)) || 0,
      totalStudyTime: userProgressData?.totalStudyMinutes || 0,
      currentStreak: streakData?.currentCount || 0,
      longestStreak: streakData?.bestCount || 0,
      currentLevel,
      pointsToNextLevel,
      weeklyProgress:
        weeklyProgress.length > 0
          ? weeklyProgress
          : [
              { day: "Mon", score: 0, time: 0 },
              { day: "Tue", score: 0, time: 0 },
              { day: "Wed", score: 0, time: 0 },
              { day: "Thu", score: 0, time: 0 },
              { day: "Fri", score: 0, time: 0 },
              { day: "Sat", score: 0, time: 0 },
              { day: "Sun", score: 0, time: 0 },
            ],
      recentActivity: formattedActivity.length > 0 ? formattedActivity : [],
      upcomingGoals: [
        {
          id: "goal-1",
          title: "Complete more quizzes",
          description: "Keep learning and practicing",
          progress: Number(stats.totalQuizzes) || 0,
          target: Math.max((Number(stats.totalQuizzes) || 0) + 5, 10),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "goal-2",
          title: "Maintain study streak",
          description: "Study consistently every day",
          progress: streakData?.currentCount || 0,
          target: Math.max((streakData?.currentCount || 0) + 2, 7),
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: progressMetrics,
    });
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
