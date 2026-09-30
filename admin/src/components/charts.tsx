import { useState, type ReactNode } from "react";
import { BarChart3, Table2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Card } from "./ui";

/* ------------------------------------------------------------ palette
 *
 * Validated with the dataviz skill's validate_palette.js against the white
 * card surface these charts render on (--mode light --pairs all):
 *   lightness band PASS, chroma PASS, CVD dE 26.3 (target >= 8),
 *   normal-vision dE 29.4 (floor 15), contrast >= 3:1 -- no warnings.
 *
 * Slot 1 is NOT the brand aubergine itself. hsl(288 42% 20%) (#401d48)
 * fails the lightness band (L 0.30 vs 0.43-0.77) and the chroma floor
 * (0.085 vs 0.10): at that darkness it reads as near-black and cannot carry
 * a series' identity. #7d3c98 is the darkest step in the same family that
 * passes, so it stays as close to the brand as the checks allow.
 *
 * Fixed order, never cycled. No chart here has more than two series; a
 * third would need re-validating, not a generated hue. */
export const SERIES = ["#7d3c98", "#eb6834"] as const;

/* Solid hairlines one shade off the surface. Dashed grids read as a
   projection or threshold rather than as a grid. */
export const GRID = "hsl(38 22% 89%)";
export const AXIS_INK = "hsl(30 7% 40%)";

export const axisTick = { fontSize: 11, fill: AXIS_INK };

export const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid hsl(38 22% 89%)",
  fontSize: 12,
  boxShadow: "0 8px 18px -12px hsl(288 42% 20% / 0.22)",
};

/* ------------------------------------------------------------ labels */

export type Granularity = "day" | "week" | "month";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Bucket keys arrive as YYYY-MM-DD in UTC. Parse the parts rather than
 *  `new Date(key)`, which would shift the day in any timezone west of UTC. */
export const bucketLabel = (key: string, granularity: Granularity, long = false) => {
  const [y, m, d] = key.split("-").map(Number);
  const month = MONTHS[m - 1];
  if (granularity === "month") return long ? `${month} ${y}` : `${month} ${String(y).slice(2)}`;
  if (granularity === "week") return long ? `Week of ${d} ${month} ${y}` : `${d} ${month}`;
  return long ? `${d} ${month} ${y}` : `${d} ${month}`;
};

/* ------------------------------------------------------------ legend */

/** Present whenever a chart has two or more series, so identity is never
 *  carried by colour alone. Text stays in ink; the swatch carries the hue. */
export const Legend = ({ items }: { items: { label: string; color: string }[] }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
    {items.map((it) => (
      <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="h-0.5 w-3.5 rounded-full" style={{ background: it.color }} />
        {it.label}
      </span>
    ))}
  </div>
);

/* ------------------------------------------------------------ card */

export interface TableColumn {
  label: string;
  align?: "left" | "right";
}

/**
 * A chart with its table-view twin.
 *
 * The table is the accessible equivalent of the plot -- every value is
 * reachable without hovering -- so it is one toggle away on every chart,
 * not an afterthought.
 */
export const ChartCard = ({
  title,
  sub,
  legend,
  columns,
  rows,
  children,
  className,
}: {
  title: string;
  sub?: string;
  legend?: ReactNode;
  columns: TableColumn[];
  rows: (string | number)[][];
  children: ReactNode;
  className?: string;
}) => {
  const [asTable, setAsTable] = useState(false);

  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-4">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <button
          type="button"
          onClick={() => setAsTable((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-pressed={asTable}
        >
          {asTable ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
          {asTable ? "Chart" : "Table"}
        </button>
      </div>

      {legend && !asTable && <div className="px-5 pt-3">{legend}</div>}

      <div className="flex-1 px-2 pb-3 pt-2">
        {asTable ? (
          <div className="max-h-72 overflow-auto px-3">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th
                      key={c.label}
                      className={cn(
                        "sticky top-0 border-b border-border bg-card py-2 text-xs font-semibold text-muted-foreground",
                        c.align === "right" ? "text-right" : "text-left"
                      )}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    {r.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "py-1.5",
                          columns[j]?.align === "right" ? "nums text-right" : "text-left"
                        )}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </Card>
  );
};
