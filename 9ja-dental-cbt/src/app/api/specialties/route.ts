import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDb } from "@/db";
import { specialties } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/specialties
 * Fetch all active specialties from the database
 * Optional query params:
 *   - includeQuestionCount: Include total questions per specialty
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeQuestionCount =
      searchParams.get("includeQuestionCount") === "true";

    const db = await getDb();

    if (includeQuestionCount) {
      // Use raw SQL to get specialties with question counts
      // This is more reliable than trying to use Drizzle's subquery syntax
      const result = await db.all(sql`
        SELECT 
          s.id,
          s.name,
          s.slug,
          s.description,
          s.icon,
          s.color,
          s.sort_order as sortOrder,
          CAST(COUNT(q.id) AS INTEGER) as questionCount
        FROM specialties s
        LEFT JOIN questions q ON s.id = q.specialty_id AND q.is_active = 1
        WHERE s.is_active = 1
        GROUP BY s.id, s.name, s.slug, s.description, s.icon, s.color, s.sort_order
        ORDER BY s.sort_order
      `);

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Fetch specialties without counts
    const allSpecialties = await db
      .select({
        id: specialties.id,
        name: specialties.name,
        slug: specialties.slug,
        description: specialties.description,
        icon: specialties.icon,
        color: specialties.color,
        sortOrder: specialties.sortOrder,
      })
      .from(specialties)
      .where(eq(specialties.isActive, true))
      .orderBy(specialties.sortOrder);

    // Try to cache in KV if available
    try {
      const { env } = await getCloudflareContext();
      if (env?.KV_DENTAL) {
        await env.KV_DENTAL.put(
          "specialties:all",
          JSON.stringify(allSpecialties),
          { expirationTtl: 3600 } // Cache for 1 hour
        );
      }
    } catch (kvError) {
      // KV caching is optional, don't fail if it doesn't work
      console.warn("Failed to cache specialties in KV:", kvError);
    }

    return NextResponse.json({
      success: true,
      data: allSpecialties,
    });
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch specialties",
      },
      { status: 500 }
    );
  }
}
