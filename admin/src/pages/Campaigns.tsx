import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ban } from "lucide-react";
import api, {
  asCount,
  asList,
  type AdminCampaign,
  type Paginated,
} from "@/lib/api";
import { date, inr, num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import {
  Badge,
  Button,
  Card,
  Empty,
  ErrorNote,
  Field,
  Input,
  Pager,
  Select,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui";

interface Row extends AdminCampaign {
  brand_name?: string;
  company_name?: string;
  budget?: number | string | null;
  budget_type?: string;
  applications_count?: number;
  admin_closed?: boolean;
}

const tone = (status: string) =>
  status === "active"
    ? "success"
    : status === "completed"
      ? "brand"
      : status === "closed" || status === "cancelled"
        ? "danger"
        : "neutral";

export const Campaigns = () => {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [status, search]);

  const params = useMemo(
    () => ({
      ...(status ? { status } : {}),
      ...(search ? { search } : {}),
      page,
    }),
    [status, search, page]
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaigns", params],
    queryFn: async () =>
      (
        await api.get<Paginated<Row> | Row[]>("/admin-panel/campaigns/", {
          params,
        })
      ).data,
    placeholderData: (prev) => prev,
  });

  const rows = asList(data);
  const total = asCount(data);

  const close = useMutation({
    mutationFn: (id: number) =>
      api.post(`/admin-panel/campaigns/${id}/force-close/`, {
        reason: "Closed by admin",
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["campaigns"] });
      void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });

  return (
    <>
      <PageHead
        title="Campaigns"
        sub={total ? `${num(total)} campaigns` : "Every campaign on the platform."}
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label="Search">
              <Input
                placeholder="Campaign title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Field>
          </div>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Spinner label="Loading campaigns" />
        ) : error ? (
          <ErrorNote error={error} />
        ) : rows.length === 0 ? (
          <Empty title="No campaigns match" sub="Try a different filter." />
        ) : (
          <>
            <Table>
              <thead>
                <tr>
                  <Th>Campaign</Th>
                  <Th>Brand</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Budget</Th>
                  <Th className="text-right">Applications</Th>
                  <Th>Created</Th>
                  <Th className="text-right">Action</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40">
                    <Td>
                      <p className="font-medium">{c.title}</p>
                      {c.admin_closed && (
                        <span className="text-xs text-destructive">
                          force-closed by an admin
                        </span>
                      )}
                    </Td>
                    <Td className="text-muted-foreground">
                      {c.company_name || c.brand_name || "—"}
                    </Td>
                    <Td>
                      <Badge tone={tone(String(c.status))}>{c.status}</Badge>
                    </Td>
                    <Td className="nums text-right">
                      {c.budget != null && c.budget !== ""
                        ? inr(Number(c.budget))
                        : "—"}
                    </Td>
                    <Td className="nums text-right text-muted-foreground">
                      {num(c.applications_count ?? 0)}
                    </Td>
                    <Td className="nums text-muted-foreground">
                      {date(c.created_at)}
                    </Td>
                    <Td className="text-right">
                      {c.status === "active" && (
                        <Button
                          size="sm"
                          variant="outline"
                          busy={close.isPending}
                          onClick={() => close.mutate(c.id)}
                          title="Force close this campaign"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Close
                        </Button>
                      )}
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
