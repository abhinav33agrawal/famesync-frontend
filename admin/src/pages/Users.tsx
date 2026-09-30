import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Search, ShieldCheck, ShieldOff, UserCheck } from "lucide-react";
import api, {
  asCount,
  asList,
  type AdminUser,
  type Paginated,
} from "@/lib/api";
import { date, num } from "@/lib/format";
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

/* Keeps the list from firing a request per keystroke. */
function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const CreditPanel = ({
  user,
  onDone,
}: {
  user: AdminUser;
  onDone: () => void;
}) => {
  const [amount, setAmount] = useState(10);
  const [action, setAction] = useState<"add" | "deduct">("add");
  const [reason, setReason] = useState("Admin adjustment");

  const m = useMutation({
    mutationFn: () =>
      api.post(`/admin-panel/users/${user.id}/adjust-credits/`, {
        amount,
        action,
        reason,
      }),
    onSuccess: onDone,
  });

  return (
    <div className="border-t border-border bg-muted/40 px-4 py-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Action">
          <Select
            value={action}
            onChange={(e) => setAction(e.target.value as "add" | "deduct")}
          >
            <option value="add">Add</option>
            <option value="deduct">Deduct</option>
          </Select>
        </Field>
        <Field label="Amount">
          <Input
            type="number"
            min={1}
            className="w-28"
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
          />
        </Field>
        <div className="min-w-[200px] flex-1">
          <Field label="Reason">
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
        </div>
        <Button busy={m.isPending} onClick={() => m.mutate()}>
          Apply
        </Button>
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {m.isError && <ErrorNote error={m.error} />}
      <p className="mt-2 text-xs text-muted-foreground">
        Current balance {num(user.credits)}. The change is recorded in the usage
        log.
      </p>
    </div>
  );
};

export const Users = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  // "state" rather than the old approval "status": this page is already
  // scoped to approved accounts, so the only thing left to narrow by is
  // whether an approved account is currently active or suspended.
  const [state, setState] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [creditsFor, setCreditsFor] = useState<number | null>(null);

  const q = useDebounced(search);

  /* Any filter change invalidates the current page number. */
  useEffect(() => setPage(1), [q, role, state]);

  const params = useMemo(
    () => ({
      ...(q ? { search: q } : {}),
      // Every account that has ever been approved -- suspended ones
      // included. Pending and rejected accounts live on Approvals.
      scope: "approved",
      ...(role ? { role } : {}),
      ...(state ? { state } : {}),
      page,
    }),
    [q, role, state, page]
  );

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["users", params],
    queryFn: async () =>
      (
        await api.get<Paginated<AdminUser> | AdminUser[]>(
          "/admin-panel/users/",
          { params }
        )
      ).data,
    placeholderData: (prev) => prev,
  });

  const rows = asList(data);
  const total = asCount(data);

  const refresh = () => {
    setCreditsFor(null);
    void qc.invalidateQueries({ queryKey: ["users"] });
    void qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
    void qc.invalidateQueries({ queryKey: ["approval-queue"] });
  };

  const approve = useMutation({
    mutationFn: (id: number) => api.post(`/admin-panel/users/${id}/approve/`, {}),
    onSuccess: refresh,
  });

  const suspend = useMutation({
    mutationFn: (id: number) =>
      api.post(`/admin-panel/users/${id}/suspend/`, {
        reason: "Suspended by admin",
      }),
    onSuccess: refresh,
  });

  /* There is no un-suspend endpoint. The detail view is a
     RetrieveUpdateDestroyAPIView and is_active is writable on
     UserDetailAdminSerializer, so a PATCH is the supported reversal. */
  const reactivate = useMutation({
    mutationFn: (id: number) =>
      api.patch(`/admin-panel/users/${id}/`, { is_active: true }),
    onSuccess: refresh,
  });

  return (
    <>
      <PageHead
        title="Users"
        sub={
          total
            ? `${num(total)} approved accounts, including any suspended since`
            : "Every account that has been approved. Pending sign-ups are under Approvals."
        }
      />

      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <Field label="Search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Username, email or name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Field>
          </div>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">All</option>
              <option value="influencer">Influencer</option>
              <option value="brand">Brand</option>
            </Select>
          </Field>
          <Field label="State">
            <Select value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Spinner label="Loading users" />
        ) : error ? (
          <ErrorNote error={error} />
        ) : rows.length === 0 ? (
          <Empty
            title="No users match"
            sub="Try clearing the filters or searching for something else."
          />
        ) : (
          <>
            <div className={isFetching ? "opacity-60 transition-opacity" : ""}>
              <Table>
                <thead>
                  <tr>
                    <Th>User</Th>
                    <Th>Role</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Credits</Th>
                    <Th className="text-right">Campaigns</Th>
                    <Th>Joined</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u) => (
                    <Fragment key={u.id}>
                      <tr
                        className="cursor-pointer hover:bg-muted/40"
                        onClick={() => navigate(`/users/${u.id}`)}
                      >
                        <Td>
                          <p className="font-medium">
                            {u.username}
                            {u.is_staff && (
                              <span className="ml-2">
                                <Badge tone="brand">staff</Badge>
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {u.email}
                          </p>
                        </Td>
                        <Td>
                          <Badge tone={u.role === "brand" ? "brand" : "neutral"}>
                            {u.role}
                          </Badge>
                        </Td>
                        <Td>
                          <div className="flex flex-wrap gap-1">
                            {!u.is_active && (
                              <Badge tone="danger">suspended</Badge>
                            )}
                            {u.is_active && u.is_approved && (
                              <Badge tone="success">approved</Badge>
                            )}
                            {u.is_active && !u.is_approved && (
                              <Badge tone="warning">pending</Badge>
                            )}
                            {u.plan === "pro" && <Badge tone="brand">pro</Badge>}
                          </div>
                        </Td>
                        <Td className="nums text-right">{num(u.credits)}</Td>
                        <Td className="nums text-right text-muted-foreground">
                          {num(u.total_campaigns)}
                        </Td>
                        <Td className="nums whitespace-nowrap text-muted-foreground">
                          {date(u.created_at)}
                        </Td>
                        <Td>
                          <div
                            className="flex justify-end gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {!u.is_approved && (
                              <Button
                                size="sm"
                                variant="outline"
                                busy={approve.isPending}
                                onClick={() => approve.mutate(u.id)}
                                title="Approve this account"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setCreditsFor(creditsFor === u.id ? null : u.id)
                              }
                              title="Adjust credits"
                            >
                              <Coins className="h-3.5 w-3.5" />
                            </Button>
                            {u.is_active ? (
                              <Button
                                size="sm"
                                variant="outline"
                                busy={suspend.isPending}
                                onClick={() => suspend.mutate(u.id)}
                                title="Suspend this account"
                              >
                                <ShieldOff className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                busy={reactivate.isPending}
                                onClick={() => reactivate.mutate(u.id)}
                                title="Reactivate this account"
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </Td>
                      </tr>
                      {creditsFor === u.id && (
                        <tr onClick={(e) => e.stopPropagation()}>
                          <td colSpan={7} className="p-0">
                            <CreditPanel user={u} onDone={refresh} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </Table>
            </div>
            <Pager page={page} count={total} onPage={setPage} />
          </>
        )}
      </Card>
    </>
  );
};
