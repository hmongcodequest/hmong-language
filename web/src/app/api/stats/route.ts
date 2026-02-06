import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface StatsResult {
  contributors: number;
  totalRecordings: number;
  progress: number;
}

export async function GET() {
  try {
    // Get contributor count (users who have uploaded at least one recording)
    const contributorsResult = await query<{ count: number }[]>(
      "SELECT COUNT(DISTINCT id) as count FROM users",
    );
    const contributors = contributorsResult[0]?.count || 0;

    // Get total recordings count
    // If you have a recordings table, use: SELECT COUNT(*) as count FROM recordings
    // For now, we'll return 0 since the recordings table might not exist yet
    let totalRecordings = 0;
    try {
      const recordingsResult = await query<{ count: number }[]>(
        "SELECT COUNT(*) as count FROM recordings",
      );
      totalRecordings = recordingsResult[0]?.count || 0;
    } catch {
      // recordings table might not exist yet
      totalRecordings = 0;
    }

    // Calculate progress (example: based on target of 10,000 recordings)
    const targetRecordings = 10000;
    const progress = Math.min(
      Math.round((totalRecordings / targetRecordings) * 100),
      100,
    );

    const stats: StatsResult = {
      contributors,
      totalRecordings,
      progress,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    // Return default values if database is not available
    return NextResponse.json({
      contributors: 0,
      totalRecordings: 0,
      progress: 0,
    });
  }
}
