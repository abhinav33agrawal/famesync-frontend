import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api, { asCount, asList, type Paginated } from "@/lib/api";
import { dateTime, num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import {
  Badge,
  Card,
  Empty,
  ErrorNote,
  Pager,
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
}

export const AuditLogs = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: async () =>
      (
        await api.get<Paginated<Log> | Log[]>("/admin-panel/audit-logs/", {
          params: { page },
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
                  <Th>Details</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/40">
                    <Td className="nums whitespace-nowrap text-muted-foreground">
                      {dateTime(l.timestamp)}
                    </Td>
                    <Td className="font-medium">{l.admin_username ?? "—"}</Td>
                    <Td>
                      {l.action_type ? (
                        <Badge tone="brand">{l.action_type}</Badge>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td className="text-muted-foreground">
                      {l.target_name || l.target_type || "—"}
                      {l.target_id != null && (
                        <span className="nums ml-1 text-xs">#{l.target_id}</span>
                      )}
                    </Td>
                    <Td className="max-w-sm truncate text-muted-foreground">
                      {l.details || "—"}
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
