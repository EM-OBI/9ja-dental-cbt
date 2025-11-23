import LeaderboardClient from "./LeaderboardClient";
import {
  getLeaderboardEntries,
  type LeaderboardPeriod,
} from "@/services/leaderboardService";

const DEFAULT_PERIOD: LeaderboardPeriod = "weekly";
const DEFAULT_LIMIT = 15;

export default async function LeaderboardPage() {
  const initialEntries = await getLeaderboardEntries(
    DEFAULT_PERIOD,
    DEFAULT_LIMIT
  );

  return (
    <div className="py-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 md:px-6">
        <LeaderboardClient
          initialEntries={initialEntries}
          initialPeriod={DEFAULT_PERIOD}
          limit={DEFAULT_LIMIT}
        />
      </div>
    </div>
  );
}
