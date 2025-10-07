import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import { getUserById, updateUser } from "@/services/serverData";

// GET /api/users/[id] - Get user by ID
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

    // Get user from database
    const userData = await getUserById(id);

    return NextResponse.json({
      success: true,
      data: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        avatar: userData.image,
        subscription: "free", // Default subscription
        level: 1, // Default level
        xp: 0, // Default XP
        points: 0, // Default points
        streak_count: 0, // Default streak
        created_at: userData.createdAt.toISOString(),
        updated_at: userData.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
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
    const updateData = (await request.json()) as {
      name?: string;
      avatar?: string;
    };

    // Check if user exists and is the same as session user
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update user in database
    const updatedUser = await updateUser(id, {
      name: updateData.name,
      image: updateData.avatar,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.image,
        subscription: "free",
        level: 1,
        xp: 0,
        points: 0,
        streak_count: 0,
        created_at: updatedUser.createdAt.toISOString(),
        updated_at: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
