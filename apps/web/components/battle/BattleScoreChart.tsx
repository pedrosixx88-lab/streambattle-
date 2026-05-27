"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface GiftEvent {
  created_at: string;
  team: string | null;
  diamond_value: number | null;
  repeat_count: number | null;
}

interface Props {
  giftEvents: GiftEvent[];
  teamAName: string;
  teamBName: string;
  teamAColor: string;
  teamBColor: string;
  startedAt: string | null;
}

interface ChartPoint {
  time: string;
  teamA: number;
  teamB: number;
}

export function BattleScoreChart({
  giftEvents,
  teamAName,
  teamBName,
  teamAColor,
  teamBColor,
  startedAt,
}: Props) {
  if (!giftEvents.length) {
    return (
      <div className="flex items-center justify-center h-40 text-text-muted text-sm">
        Sem dados de presentes para exibir
      </div>
    );
  }

  // Build cumulative score progression bucketed by minute
  const start = startedAt ? new Date(startedAt).getTime() : new Date(giftEvents[0].created_at).getTime();

  let runningA = 0;
  let runningB = 0;
  const points: ChartPoint[] = [];
  const bucketed = new Map<number, { a: number; b: number }>();

  for (const e of giftEvents) {
    const ts = new Date(e.created_at).getTime();
    const minuteBucket = Math.floor((ts - start) / 60000);
    const pts = (e.diamond_value ?? 1) * (e.repeat_count ?? 1);

    const existing = bucketed.get(minuteBucket) ?? { a: 0, b: 0 };
    if (e.team === "A") existing.a += pts;
    else if (e.team === "B") existing.b += pts;
    bucketed.set(minuteBucket, existing);
  }

  const maxMinute = Math.max(...Array.from(bucketed.keys()), 0);

  for (let m = 0; m <= maxMinute; m++) {
    const bucket = bucketed.get(m);
    if (bucket) {
      runningA += bucket.a;
      runningB += bucket.b;
    }
    points.push({
      time: `${m}min`,
      teamA: runningA,
      teamB: runningB,
    });
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2A2A32" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#6B6B80", fontSize: 10 }}
          axisLine={{ stroke: "#2A2A32" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6B6B80", fontSize: 10 }}
          axisLine={{ stroke: "#2A2A32" }}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A1A1F",
            border: "1px solid #2A2A32",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#F0F0F5",
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: "11px", color: "#6B6B80" }}
        />
        <Line
          type="monotone"
          dataKey="teamA"
          name={teamAName}
          stroke={teamAColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
        <Line
          type="monotone"
          dataKey="teamB"
          name={teamBName}
          stroke={teamBColor}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
