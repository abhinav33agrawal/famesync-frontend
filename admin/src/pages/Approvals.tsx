import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import api, { type PendingApproval } from "@/lib/api";
import { date, num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import {
  Badge,
  Button,
  Card,
  Empty,
  ErrorNote,
  Input,
  Select,
  Spinner,
  Table,
  Td,
  Th,
} from "@/components/ui";

export const Approvals = () => {
  const qc = useQueryClient();
  const [role, setRole] = useState("");
  const [picked, setPicked] = useState<number[]>([]);
  const [reason, setReason] = useState("Profile incomplete");
  const [confirmReject, setConfirmReject] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["approval-queue", role],
    queryFn: async () =>
      (
        await api.get<{ users: PendingApproval[]; total: number }>(
          "/admin-panel/approvals/pending/",
          { params: role ? { role } : {} }
        )
      ).data,
  });

  const rows = data?.users ?? [];

  const done = () => {
    setPicked([]);
    setConfirmReject(false);
    void qc.invalidateQueries({ queryKey: ["approval-queue"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    void qc.invalidateQueries({ queryKey: ["users"] });
  };

  const approve = useMutation({
    mutationFn: (ids: number[]) =>
      api.post("/admin-panel/approvals/bulk-approve/", { user_ids: ids }),
    onSuccess: done,
  });

  const reject = useMutation({
    mutationFn: (ids: number[]) =>
      api.post("/admin-panel/approvals/bulk-reject/", {
        user_ids: ids,
        reason,
      }),
    onSuccess: done,
  });

  const toggle = (id: number) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const allPicked = rows.length > 0 && picked.length === rows.length;

  return (
    <>
      <PageHead
        title="Approvals"
        sub="Accounts waiting to be approved. Until approved, a user cannot create campaigns or apply to them."
        action={
          <Select value={role} onChange={(e) => { setRole(e.target.value); setPicked([]); }}>
            <option value="">All roles</option>
            <option value="influencer">Influencers</option>
            <option value="brand">Brands</option>
          </Select>
        }
      />

      {picked.length > 0 && (
        <Card className="mb-4 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {num(picked.length)} selected
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                busy={approve.isPending}
                onClick={() => approve.mutate(picked)}
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setConfirmReject(true)}
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          </div>

          {confirmReject && (
            <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/8 p-4">
              <p className="text-sm font-medium text-destructive">
                Rejecting also deactivates these accounts.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                They will be signed out and unable to log in, and each user gets
                a notification quoting the reason below. Reversible from the
                Users page.
              </p>
              <div className="mt-3 flex flex-wrap items-end gap-2">
                <div className="min-w-[220px] flex-1">
                  <Input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason shown to the user"
                  />
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  busy={reject.isPending}
                  onClick={() => reject.mutate(picked)}
                >
                  Reject {picked.length}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmReject(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card>
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <ErrorNote error={error} />
        ) : rows.length === 0 ? (
          <Empty
            title="Nothing waiting"
            sub="Every account has been reviewed."
          />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all"
                    checked={allPicked}
                    onChange={() =>
                      setPicked(allPicked ? [] : rows.map((r) => r.id))
                    }
                  />
                </Th>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Followers</Th>
                <Th>Joined</Th>
                <Th className="text-right">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="hover:bg-muted/40">
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${u.username}`}
                      checked={picked.includes(u.id)}
                      onChange={() => toggle(u.id)}
                    />
                  </Td>
                  <Td>
                    <p className="font-medium">{u.username}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </Td>
                  <Td>
                    <Badge tone={u.role === "brand" ? "brand" : "neutral"}>
                      {u.role}
                    </Badge>
                  </Td>
                  <Td className="nums">
                    {u.total_followers != null ? num(u.total_followers) : "—"}
                  </Td>
                  <Td className="nums text-muted-foreground">
                    {date(u.created_at)}
                  </Td>
                  <Td className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      busy={approve.isPending}
                      onClick={() => approve.mutate([u.id])}
                    >
                      Approve
                    </Button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
};
