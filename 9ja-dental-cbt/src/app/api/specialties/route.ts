import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { specialties } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import {
  createKVCacheFromContext,
  CACHE_KEYS,
  CACHE_TTL,
} from "@/services/kvCache";

/**
 * GET /api/specialties
 * Fetch all active specialties from the database
 * Optional query params:
 *   - includeQuestionCount: Include total questions per specialty
 * Implements KV caching with 1-hour TTL
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeQuestionCount =
      searchParams.get("includeQuestionCount") === "true";

    // Initialize KV cache using Cloudflare context
    const cache = await createKVCacheFromContext();
    const cacheKey = includeQuestionCount
      ? `${CACHE_KEYS.SPECIALTIES}:with-counts`
      : CACHE_KEYS.SPECIALTIES;

    // Try to get from cache
    const cached = await cache.get<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: true,
        data: cached,
        cached: true,
      });
    }

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

      // Cache the result
      await cache.set(cacheKey, result, CACHE_TTL.SPECIALTIES);

      return NextResponse.json({
        success: true,
        data: result,
        cached: false,
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

    // Cache the result
    await cache.set(cacheKey, allSpecialties, CACHE_TTL.SPECIALTIES);

    return NextResponse.json({
      success: true,
      data: allSpecialties,
      cached: false,
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
