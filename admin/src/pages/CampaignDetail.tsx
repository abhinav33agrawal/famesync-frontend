import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Ban, Send } from "lucide-react";
import api, { type AdminCampaign } from "@/lib/api";
import { date, dateTime, inr, num } from "@/lib/format";
import {
  Badge,
  Button,
  Card,
  CardHead,
  Empty,
  ErrorNote,
  Field,
  Input,
  Select,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui";

/* One campaign: what it is, who unlocked and applied, and the two things an
   admin does to it -- message its applicants, or close it with a reason.
   Both are recorded in the audit log by the API. */

interface Campaign extends AdminCampaign {
  brand: string;
  brand_name?: string;
  company_name?: string | null;
  category?: string;
  budget?: number | string | null;
  budget_type?: string;
  admin_closed?: boolean;
  applications_count?: { total: number; pending: number; accepted: number; rejected: number };
  unlocks_count?: number;
}

interface Applicant {
  id: string;
  influencer: string;
  influencer_name: string;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  applied_at: string;
}

const TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "brand"> = {
  active: "success",
  accepted: "success",
  pending: "warning",
  paused: "warning",
  rejected: "danger",
  cancelled: "danger",
  completed: "brand",
  draft: "neutral",
};

const MessageApplicants = ({ campaign, onDone }: { campaign: Campaign; onDone: (sent: string) => void }) => {
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");
  const counts = campaign.applications_count;
  const recipients =
    filter === "all" ? counts?.total ?? 0 : (counts?.[filter as "pending" | "accepted" | "rejected"] ?? 0);

  const m = useMutation({
    mutationFn: async () =>
      (await api.post<{ message: string }>(`/admin-panel/campaigns/${campaign.id}/notify-applicants/`, {
        message: message.trim(),
        filter,
      })).data,
    onSuccess: (res) => onDone(res.message),
  });

  return (
    <Card className="mb-6 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Send to">
          <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All applicants</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Declined</option>
          </Select>
        </Field>
        <p className="nums pb-2.5 text-xs text-muted-foreground">
          {num(recipients)} recipient{recipients === 1 ? "" : "s"}
        </p>
      </div>
      <div className="mt-3">
        <Field label="Message" hint="Appears in each creator's notification list. No email is sent.">
          <textarea
            rows={3}
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. The brand has moved the post date to 12 Nov."
            className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </Field>
      </div>
      <div className="mt-3 flex gap-2">
        <Button busy={m.isPending} disabled={!message.trim() || recipients === 0} onClick={() => m.mutate()}>
          <Send className="h-3.5 w-3.5" />
          Send
        </Button>
        <Button variant="ghost" onClick={() => onDone("")}>
          Cancel
        </Button>
      </div>
      {m.isError && <ErrorNote error={m.error} />}
    </Card>
  );
};

/** Closing used to be one click with a fixed "Closed by admin". The reason
 *  goes to the brand and into the audit log; refunding returns the 1 credit
 *  the brand spent to publish. */
const ClosePanel = ({ campaign, onDone }: { campaign: Campaign; onDone: (closed: boolean) => void }) => {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(false);
  const m = useMutation({
    mutationFn: () =>
      api.post(`/admin-panel/campaigns/${campaign.id}/force-close/`, {
        reason: reason.trim(),
        refund_credits: refund,
      }),
    onSuccess: () => onDone(true),
  });

  return (
    <Card className="mb-6 border-destructive/30 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[240px] flex-1">
          <Field label="Reason for closing" hint="Sent to the brand, and kept in the audit log.">
            <Input
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Brand asked us to take it down"
            />
          </Field>
        </div>
        <label className="flex h-10 items-center gap-2 text-sm">
          <input type="checkbox" checked={refund} onChange={(e) => setRefund(e.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
          Refund the brand&apos;s credit
        </label>
        <Button variant="danger" busy={m.isPending} disabled={!reason.trim()} onClick={() => m.mutate()}>
          <Ban className="h-3.5 w-3.5" />
          Close campaign
        </Button>
        <Button variant="ghost" onClick={() => onDone(false)}>
          Cancel
        </Button>
      </div>
      {m.isError && <ErrorNote error={m.error} />}
    </Card>
  );
};

export const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  // ?close=1 comes from the Campaigns list's close button
  const [params] = useSearchParams();
  const [panel, setPanel] = useState<null | "message" | "close">(params.get("close") ? "close" : null);
  const [notice, setNotice] = useState("");

  const campaign = useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => (await api.get<Campaign>(`/admin-panel/campaigns/${id}/`)).data,
  });
  const applicants = useQuery({
    queryKey: ["campaign-applicants", id],
    queryFn: async () =>
      (await api.get<{ applications: Applicant[] }>(`/admin-panel/campaigns/${id}/applications/`)).data.applications,
  });

  const finish = (text: string) => {
    setPanel(null);
    setNotice(text);
    for (const key of ["campaign", "campaigns", "dashboard-stats", "audit-logs"]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };

  if (campaign.isLoading) return <Spinner label="Loading campaign" />;
  if (campaign.error) return <ErrorNote error={campaign.error} />;
  const c = campaign.data;
  if (!c) return null;

  const counts = c.applications_count ?? { total: 0, pending: 0, accepted: 0, rejected: 0 };
  const closable = c.status === "active" || c.status === "paused" || c.status === "draft";
  const rows = applicants.data ?? [];

  return (
    <>
      <button
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/campaigns"))}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[1.75rem] leading-tight">{c.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <Link to={`/users/${c.brand}`} className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline">
              {c.company_name || c.brand_name}
            </Link>
            {c.category && <> · <span className="capitalize">{c.category}</span></>} · created {date(c.created_at)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={TONE[String(c.status)] ?? "neutral"}>{String(c.status)}</Badge>
            {c.admin_closed && <Badge tone="danger">closed by an admin</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={counts.total === 0} onClick={() => setPanel(panel === "message" ? null : "message")}>
            <Send className="h-3.5 w-3.5" />
            Message applicants
          </Button>
          {closable && (
            <Button size="sm" variant="outline" onClick={() => setPanel(panel === "close" ? null : "close")}>
              <Ban className="h-3.5 w-3.5" />
              Close
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <p role="status" className="mb-6 rounded-md border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-success">
          {notice}
        </p>
      )}
      {panel === "message" && <MessageApplicants campaign={c} onDone={finish} />}
      {panel === "close" && (
        <ClosePanel campaign={c} onDone={(closed) => finish(closed ? "Campaign closed. The brand has been told why." : "")} />
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {[
          ["Budget", c.budget != null && c.budget !== "" ? inr(Number(c.budget)) : c.budget_type || "—"],
          ["Unlocks", num(c.unlocks_count ?? 0)],
          ["Applications", num(counts.total)],
          ["Accepted", `${num(counts.accepted)} of ${num(counts.total)}`],
        ].map(([label, value]) => (
          <Card key={label} className="p-4 sm:p-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="nums mt-1.5 font-display text-2xl font-extrabold tracking-[-0.02em]">{value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHead
          title="Applicants"
          sub={`${num(counts.pending)} pending · ${num(counts.accepted)} accepted · ${num(counts.rejected)} declined`}
        />
        {applicants.isLoading ? (
          <Spinner />
        ) : applicants.error ? (
          <ErrorNote error={applicants.error} />
        ) : rows.length === 0 ? (
          <Empty
            title="No applications yet"
            sub={c.unlocks_count ? `${num(c.unlocks_count)} creators unlocked the brief but haven't applied.` : undefined}
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Creator</Th>
                <Th>Status</Th>
                <Th>Applied</Th>
                <Th>Message</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="hover:bg-muted/40">
                  <Td className="font-medium">
                    <Link to={`/users/${a.influencer}`} className="underline-offset-4 hover:text-primary hover:underline">
                      @{a.influencer_name}
                    </Link>
                  </Td>
                  <Td>
                    <Badge tone={TONE[a.status] ?? "neutral"}>{a.status === "rejected" ? "declined" : a.status}</Badge>
                  </Td>
                  <Td className="nums whitespace-nowrap text-muted-foreground" >
                    <span title={dateTime(a.applied_at)}>{date(a.applied_at)}</span>
                  </Td>
                  <Td className="max-w-[360px] truncate text-muted-foreground">{a.message || "—"}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
};
