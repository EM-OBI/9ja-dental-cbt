import { NextRequest, NextResponse } from "next/server";
import { getAuthInstance as getAuth } from "@/modules/auth/utils/auth-utils";
import {
  getUserPreferences,
  updateUserPreferences,
} from "@/services/serverData";
import type { UserPreferences } from "@/store/types";

type PreferenceUpdate = Partial<UserPreferences> & {
  notifications?: Partial<UserPreferences["notifications"]>;
  quiz?: Partial<UserPreferences["quiz"]>;
  study?: Partial<UserPreferences["study"]>;
};

// GET /api/users/[id]/preferences - Get user preferences (with KV fallback)
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

    // Try to get from KV first (faster)
    try {
      const env = process.env as unknown as { KV_DENTAL: KVNamespace };
      const kv = env.KV_DENTAL;

      if (kv) {
        const cachedPrefs = await kv.get(`user:${id}:preferences`, "json");
        if (cachedPrefs) {
          return NextResponse.json({
            success: true,
            data: cachedPrefs,
            source: "cache",
          });
        }
      }
    } catch (kvError) {
      console.warn("KV not available, falling back to database:", kvError);
    }

    // Fallback to database
    const preferences = await getUserPreferences(id);

    // Cache in KV for next time
    try {
      const env = process.env as unknown as { KV_DENTAL: KVNamespace };
      const kv = env.KV_DENTAL;
      if (kv && preferences) {
        await kv.put(
          `user:${id}:preferences`,
          JSON.stringify(preferences),
          { expirationTtl: 60 * 60 * 24 } // 24 hours
        );
      }
    } catch (kvError) {
      console.warn("Failed to cache preferences in KV:", kvError);
    }

    return NextResponse.json({
      success: true,
      data: preferences,
      source: "database",
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/preferences - Update user preferences
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
    const preferences = (await request.json()) as PreferenceUpdate;

    // Check if user is updating their own preferences
    if (session.user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update preferences in database
    const updatedPreferences = await updateUserPreferences(id, preferences);

    // Also cache in KV
    try {
      const env = process.env as unknown as { KV_DENTAL: KVNamespace };
      const kv = env.KV_DENTAL;
      if (kv && updatedPreferences) {
        await kv.put(
          `user:${id}:preferences`,
          JSON.stringify(updatedPreferences),
          { expirationTtl: 60 * 60 * 24 } // 24 hours
        );
      }
    } catch (kvError) {
      console.warn("Failed to cache updated preferences in KV:", kvError);
    }

    return NextResponse.json({
      success: true,
      data: updatedPreferences,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
