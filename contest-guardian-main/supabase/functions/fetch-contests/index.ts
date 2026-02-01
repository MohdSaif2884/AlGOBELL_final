import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CodeforcesContest {
  id: number;
  name: string;
  type: string;
  phase: string;
  frozen: boolean;
  durationSeconds: number;
  startTimeSeconds?: number;
  relativeTimeSeconds?: number;
}

interface TransformedContest {
  name: string;
  url: string;
  start_time: string;
  duration: string;
  site: string;
  status: string;
}

async function fetchCodeforcesContests(): Promise<TransformedContest[]> {
  try {
    const response = await fetch("https://codeforces.com/api/contest.list", {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    if (!response.ok) {
      console.error("Codeforces API error:", response.status);
      return [];
    }

    const data = await response.json();
    
    if (data.status !== "OK") {
      console.error("Codeforces API returned non-OK status");
      return [];
    }

    const now = Math.floor(Date.now() / 1000);
    
    return data.result
      .filter((contest: CodeforcesContest) => 
        contest.phase === "BEFORE" || contest.phase === "CODING"
      )
      .slice(0, 20)
      .map((contest: CodeforcesContest) => ({
        name: contest.name,
        url: `https://codeforces.com/contest/${contest.id}`,
        start_time: contest.startTimeSeconds 
          ? new Date(contest.startTimeSeconds * 1000).toISOString()
          : new Date().toISOString(),
        duration: String(contest.durationSeconds),
        site: "CodeForces",
        status: contest.phase === "CODING" ? "CODING" : "BEFORE",
      }));
  } catch (error) {
    console.error("Error fetching Codeforces:", error);
    return [];
  }
}

async function fetchAtCoderContests(): Promise<TransformedContest[]> {
  try {
    // AtCoder Problems API (community maintained, reliable)
    const response = await fetch("https://kenkoooo.com/atcoder/resources/contests.json", {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!response.ok) {
      console.error("AtCoder API error:", response.status);
      return [];
    }

    const contests = await response.json();
    const now = Math.floor(Date.now() / 1000);
    
    return contests
      .filter((contest: { start_epoch_second: number }) => 
        contest.start_epoch_second > now
      )
      .slice(0, 10)
      .map((contest: { id: string; title: string; start_epoch_second: number; duration_second: number }) => ({
        name: contest.title,
        url: `https://atcoder.jp/contests/${contest.id}`,
        start_time: new Date(contest.start_epoch_second * 1000).toISOString(),
        duration: String(contest.duration_second),
        site: "AtCoder",
        status: "BEFORE",
      }));
  } catch (error) {
    console.error("Error fetching AtCoder:", error);
    return [];
  }
}

// Generate some upcoming LeetCode weekly contests (they follow a predictable schedule)
function generateLeetCodeContests(): TransformedContest[] {
  const contests: TransformedContest[] = [];
  const now = new Date();
  
  // LeetCode Weekly: Every Sunday 10:30 AM UTC
  // LeetCode Biweekly: Every other Saturday 2:30 PM UTC
  
  for (let i = 0; i < 4; i++) {
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + ((7 - now.getDay()) % 7) + (i * 7));
    nextSunday.setUTCHours(10, 30, 0, 0);
    
    if (nextSunday > now) {
      const weekNumber = Math.floor((nextSunday.getTime() - new Date('2023-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)) + 330;
      contests.push({
        name: `Weekly Contest ${weekNumber}`,
        url: "https://leetcode.com/contest/",
        start_time: nextSunday.toISOString(),
        duration: "5400", // 1.5 hours
        site: "LeetCode",
        status: "BEFORE",
      });
    }
  }
  
  return contests;
}

// Generate CodeChef contests (they have regular starters)
function generateCodeChefContests(): TransformedContest[] {
  const contests: TransformedContest[] = [];
  const now = new Date();
  
  // CodeChef Starters: Every Wednesday 8:00 PM IST (2:30 PM UTC)
  for (let i = 0; i < 4; i++) {
    const nextWednesday = new Date(now);
    const daysUntilWed = (3 - now.getDay() + 7) % 7 || 7;
    nextWednesday.setDate(now.getDate() + daysUntilWed + (i * 7));
    nextWednesday.setUTCHours(14, 30, 0, 0);
    
    if (nextWednesday > now) {
      const starterNumber = 170 + i;
      contests.push({
        name: `Starters ${starterNumber}`,
        url: "https://www.codechef.com/contests",
        start_time: nextWednesday.toISOString(),
        duration: "7200", // 2 hours
        site: "CodeChef",
        status: "BEFORE",
      });
    }
  }
  
  return contests;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching contests from multiple APIs...");
    
    // Fetch from multiple sources in parallel
    const [codeforces, atcoder] = await Promise.all([
      fetchCodeforcesContests(),
      fetchAtCoderContests(),
    ]);
    
    // Add generated contests for platforms without reliable APIs
    const leetcode = generateLeetCodeContests();
    const codechef = generateCodeChefContests();
    
    const allContests = [...codeforces, ...atcoder, ...leetcode, ...codechef];
    
    console.log(`Total contests fetched: ${allContests.length}`);
    console.log(`- Codeforces: ${codeforces.length}`);
    console.log(`- AtCoder: ${atcoder.length}`);
    console.log(`- LeetCode: ${leetcode.length}`);
    console.log(`- CodeChef: ${codechef.length}`);

    // Sort by start time
    allContests.sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return new Response(
      JSON.stringify({ contests: allContests }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error fetching contests:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
