import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { user } from "@/db/schema";
import { desc, isNotNull } from "drizzle-orm";

/**
 * GET /api/users/recent
 * Fetch recent users for social proof display
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    const db = await getDb();

    // Get recent users with images
    const recentUsers = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(isNotNull(user.image)) // Only users with profile images
      .orderBy(desc(user.createdAt))
      .limit(Math.min(limit, 10)); // Max 10 users

    // Get total user count
    const totalUsersResult = await db.select({ count: user.id }).from(user);

    const totalUsers = totalUsersResult.length;

    return NextResponse.json({
      success: true,
      data: {
        users: recentUsers,
        totalCount: totalUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching recent users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recent users",
        data: {
          users: [],
          totalCount: 0,
        },
      },
      { status: 500 }
    );
  }
}
