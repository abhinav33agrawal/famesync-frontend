import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api, { asCount, asList, type Paginated } from "@/lib/api";
import { dateTime, num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import {
  Badge,
  Card,
  Empty,
  ErrorNote,
  Field,
  Pager,
  Select,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui";

interface Log {
  id: string;
  admin_username?: string;
  action_type?: string;
  target_type?: string;
  target_name?: string;
  target_id?: string | null;
  details?: string;
  ip_address?: string | null;
  timestamp?: string;
  changes_before?: Record<string, unknown> | null;
  changes_after?: Record<string, unknown> | null;
}

/* What the API records (admin_api/views.py _audit), in words. */
const ACTIONS: Record<string, string> = {
  approve_user: "Approved user",
  reject_user: "Rejected user",
  suspend_user: "Suspended user",
  reactivate_user: "Reactivated user",
  update_user: "Edited user",
  delete_user: "Deleted user",
  adjust_credits: "Adjusted credits",
  message_user: "Messaged user",
  force_close_campaign: "Closed campaign",
  message_applicants: "Messaged applicants",
  broadcast: "Broadcast",
};

const TONE: Record<string, "success" | "warning" | "danger" | "brand" | "neutral"> = {
  approve_user: "success",
  reactivate_user: "success",
  reject_user: "danger",
  suspend_user: "danger",
  delete_user: "danger",
  force_close_campaign: "danger",
  adjust_credits: "warning",
};

const show = (v: unknown) => (typeof v === "boolean" ? (v ? "yes" : "no") : String(v ?? "—"));

/** "credits 3 → 8", "is_active yes → no", "recipients 12" */
const changeText = (l: Log) => {
  const before = l.changes_before ?? {};
  const after = l.changes_after ?? {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
  return keys
    .map((k) =>
      k in before && k in after
        ? `${k.replace(/_/g, " ")} ${show(before[k])} → ${show(after[k])}`
        : `${k.replace(/_/g, " ")} ${show(after[k] ?? before[k])}`
    )
    .join(" · ");
};

const targetLink = (l: Log) =>
  !l.target_id ? null : l.target_type === "user" ? `/users/${l.target_id}` : l.target_type === "campaign" ? `/campaigns/${l.target_id}` : null;

export const AuditLogs = () => {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  useEffect(() => setPage(1), [action]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", page, action],
    queryFn: async () =>
      (
        await api.get<Paginated<Log> | Log[]>("/admin-panel/audit-logs/", {
          params: { page, ...(action ? { action_type: action } : {}) },
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  const rows = asList(data);
  const total = asCount(data);

  return (
    <>
      <PageHead
        title="Audit log"
        sub={
          total
            ? `${num(total)} recorded admin actions`
            : "Actions taken by admin accounts."
        }
      />

      <Card className="mb-4 p-4">
        <Field label="Action">
          <Select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">Everything</option>
            {Object.entries(ACTIONS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      <Card>
        {isLoading ? (
          <Spinner label="Loading audit log" />
        ) : error ? (
          <ErrorNote error={error} />
        ) : rows.length === 0 ? (
          <Empty
            title="No entries yet"
            sub="Admin actions are recorded here as they happen."
          />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>Admin</Th>
                  <Th>Action</Th>
                  <Th>Target</Th>
                  <Th>Change</Th>
                  <Th>Reason / message</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <Td className="nums whitespace-nowrap text-muted-foreground">
                      <span title={l.ip_address ? `from ${l.ip_address}` : undefined}>{dateTime(l.timestamp)}</span>
                    </Td>
                    <Td className="font-medium">{l.admin_username ?? "—"}</Td>
                    <Td>
                      {l.action_type ? (
                        <Badge tone={TONE[l.action_type] ?? "brand"}>
                          {ACTIONS[l.action_type] ?? l.action_type}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="text-muted-foreground">
                      {targetLink(l) ? (
                        <Link to={targetLink(l)!} className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline">
                          {l.target_name || l.target_type}
                        </Link>
                      ) : (
                        l.target_name || l.target_type || "—"
                      )}
                    </Td>
                    <Td className="nums whitespace-nowrap text-muted-foreground">{changeText(l) || "—"}</Td>
                    <Td className="max-w-xs truncate text-muted-foreground" >
                      <span title={l.details || undefined}>{l.details || "—"}</span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Pager page={page} count={total} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  );
};
