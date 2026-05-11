"use client";

interface SparklineChartProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function SparklineChart({ data, color, width = 120, height = 40 }: SparklineChartProps) {
  if (!data || data.length < 2) return null;

  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = color ?? (isPositive ? "#10b981" : "#ef4444");

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
