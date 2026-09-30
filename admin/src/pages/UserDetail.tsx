import { useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  ExternalLink,
  Heart,
  Instagram,
  MessageCircle,
  ShieldCheck,
  ShieldOff,
  UserCheck,
} from "lucide-react";
import api, {
  API_BASE_URL,
  type AdminUserDetail,
  type SocialUrl,
} from "@/lib/api";
import { cn } from "@/lib/cn";
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

/* ------------------------------------------------------------ helpers */

const MEDIA_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

/** Uploads come back absolute from S3, or server-relative from local disk. */
const media = (path?: string | null) =>
  !path ? undefined : /^(https?:|blob:|data:)/i.test(path) ? path : `${MEDIA_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;

/** social_urls is a JSONField with no shape guarantee -- older rows hold bare
 *  URL strings, which is exactly what blanked the user-side profile page. */
const normaliseSocial = (entry: SocialUrl | string): SocialUrl =>
  typeof entry === "string" ? { link: entry } : entry ?? {};

const initials = (u: AdminUserDetail) =>
  (`${u.first_name?.[0] ?? ""}${u.last_name?.[0] ?? ""}` || u.username.slice(0, 2)).toUpperCase();

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="grid grid-cols-[minmax(120px,160px)_1fr] gap-3 border-b border-border px-5 py-3 text-sm last:border-0">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className="min-w-0 break-words">{children ?? <span className="text-muted-foreground">—</span>}</dd>
  </div>
);

const orDash = (v: unknown) =>
  v === null || v === undefined || v === "" ? <span className="text-muted-foreground">—</span> : String(v);

/* ------------------------------------------------------------ credits */

const CreditPanel = ({ user, onDone }: { user: AdminUserDetail; onDone: () => void }) => {
  const [amount, setAmount] = useState(10);
  const [action, setAction] = useState<"add" | "deduct">("add");
  const [reason, setReason] = useState("Admin adjustment");
  const m = useMutation({
    mutationFn: () =>
      api.post(`/admin-panel/users/${user.id}/adjust-credits/`, { amount, action, reason }),
    onSuccess: onDone,
  });

  return (
    <Card className="mb-6 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Action">
          <Select value={action} onChange={(e) => setAction(e.target.value as "add" | "deduct")}>
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
        Current balance {num(user.credits)}. Recorded in the credit history below.
      </p>
    </Card>
  );
};

/* ------------------------------------------------------------ tabs */

const TABS = ["Profile", "Instagram", "Plan & credits", "Activity"] as const;
type Tab = (typeof TABS)[number];

const ProfileTab = ({ user }: { user: AdminUserDetail }) => {
  const p = user.profile;
  if (!p) {
    return (
      <Card>
        <Empty
          title="No profile yet"
          sub="This account has not finished setup, so there is nothing beyond the account details."
        />
      </Card>
    );
  }
  const socials = (p.social_urls ?? []).map(normaliseSocial);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHead title={user.role === "brand" ? "Brand" : "Creator"} />
        <dl>
          {user.role === "brand" ? (
            <>
              <Row label="Company">{orDash(p.company_name)}</Row>
              <Row label="Industry">{orDash(p.industry)}</Row>
              <Row label="Website">
                {p.website ? (
                  <a className="text-primary underline-offset-4 hover:underline" href={p.website} target="_blank" rel="noreferrer">
                    {p.website}
                  </a>
                ) : (
                  orDash(null)
                )}
              </Row>
              <Row label="Description">{orDash(p.description)}</Row>
              <Row label="Target audience">{orDash(p.target_audience)}</Row>
            </>
          ) : (
            <>
              <Row label="Bio">{orDash(p.bio)}</Row>
              <Row label="Category">{orDash(p.category)}</Row>
              <Row label="Niche">{orDash(p.niche)}</Row>
              <Row label="Location">{orDash(p.location)}</Row>
              <Row label="Instagram handle">
                {p.instagram_handle ? `@${p.instagram_handle}` : orDash(null)}
              </Row>
              <Row label="Engagement rate">
                {typeof p.engagement_rate === "number" ? `${p.engagement_rate.toFixed(2)}%` : orDash(null)}
              </Row>
              <Row label="Media kit">
                {p.media_kit ? (
                  <a className="text-primary underline-offset-4 hover:underline" href={media(p.media_kit)} target="_blank" rel="noreferrer">
                    Open
                  </a>
                ) : (
                  orDash(null)
                )}
              </Row>
            </>
          )}
          <Row label="Phone">{orDash(p.phone_number)}</Row>
          <Row label="Profile created">{date(p.created_at)}</Row>
          <Row label="Last updated">{date(p.updated_at)}</Row>
        </dl>
      </Card>

      <Card>
        <CardHead title="Social links" sub={socials.length ? `${socials.length} linked` : undefined} />
        {socials.length === 0 ? (
          <Empty title="No social links" />
        ) : (
          <ul className="divide-y divide-border">
            {socials.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-medium capitalize">
                    {s.platform || "Profile"}
                    {s.verified && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                  </p>
                  {s.link ? (
                    <a className="block truncate text-xs text-muted-foreground hover:text-primary" href={s.link} target="_blank" rel="noreferrer">
                      {s.link}
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">No link</p>
                  )}
                </div>
                <span className="nums shrink-0 text-xs text-muted-foreground">
                  {typeof s.followers === "number" ? `${num(s.followers)} followers` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

const INSIGHT_LABELS: Record<string, string> = {
  reach: "Reach",
  accounts_engaged: "Accounts engaged",
  total_interactions: "Interactions",
  profile_views: "Profile visits",
  views: "Views",
  impressions: "Impressions",
};

const InstagramTab = ({ user }: { user: AdminUserDetail }) => {
  const ig = user.instagram;
  if (!ig) {
    return (
      <Card>
        <Empty
          title="Instagram not connected"
          sub={
            user.profile?.instagram_handle
              ? `The profile lists @${user.profile.instagram_handle}, but it was typed in by hand rather than connected -- so nothing here is verified.`
              : "This account has not connected Instagram."
          }
        />
      </Card>
    );
  }

  const insights = Object.entries(ig.accountInsights ?? {});
  const posts = ig.recentPosts ?? [];

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {ig.picture ? (
              <img src={ig.picture} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                <Instagram className="h-5 w-5" />
              </div>
            )}
            <div>
              <p className="font-semibold">@{ig.username}</p>
              <p className="text-xs text-muted-foreground">
                {ig.accountType || "Professional account"} · synced {dateTime(ig.lastSyncedAt)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Token expires {date(ig.tokenExpiresAt)}</p>
        </div>
        {ig.bio && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{ig.bio}</p>}
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Followers", ig.followersCount],
          ["Following", ig.followingCount],
          ["Posts", ig.postsCount],
        ].map(([label, value]) => (
          <Card key={label as string} className="p-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1.5 text-2xl font-bold">{typeof value === "number" ? num(value) : "—"}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHead title="Insights" sub="Last 30 days, as reported by Instagram." />
        {insights.length === 0 ? (
          <Empty title="No insight data" sub="Instagram returns none for very new or inactive accounts." />
        ) : (
          <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {insights.map(([key, value]) => (
              <div key={key} className="bg-card p-5">
                <p className="text-xs font-medium text-muted-foreground">
                  {INSIGHT_LABELS[key] ?? key.replace(/_/g, " ")}
                </p>
                <p className="mt-1.5 text-xl font-bold">{num(value)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHead title="Recent posts" sub={posts.length ? `${posts.length} most recent` : undefined} />
        {posts.length === 0 ? (
          <Empty title="No posts synced" />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {posts.map((post) => (
              <article key={post.id} className="overflow-hidden rounded-lg border border-border">
                <div className="aspect-square bg-muted">
                  {post.thumbnailUrl || post.mediaUrl ? (
                    <img src={post.thumbnailUrl || post.mediaUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      {post.mediaType || "Post"}
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-xs leading-relaxed">{post.caption || "No caption"}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {typeof post.likeCount === "number" ? num(post.likeCount) : "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {typeof post.commentsCount === "number" ? num(post.commentsCount) : "—"}
                      </span>
                    </span>
                    {post.permalink && (
                      <a href={post.permalink} target="_blank" rel="noreferrer" className="hover:text-primary" aria-label="Open on Instagram">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

interface CreditTxn {
  id: number;
  action: string;
  credits_used: number;
  description?: string;
  timestamp: string;
}

const PlanTab = ({ user }: { user: AdminUserDetail }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-credits", user.id],
    queryFn: async () =>
      (
        await api.get<{ transactions: CreditTxn[]; stats: Record<string, number> }>(
          `/admin-panel/users/${user.id}/credits/history/`
        )
      ).data,
  });
  const sub = user.subscription;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHead title="Subscription" />
          {sub ? (
            <dl>
              <Row label="Plan">
                <Badge tone={sub.plan === "pro" ? "brand" : "neutral"}>{sub.plan}</Badge>
              </Row>
              <Row label="Status">{sub.status}</Row>
              <Row label="Price">{sub.monthly_price ? `${inr(sub.monthly_price)} / month` : "Free"}</Row>
              <Row label="Monthly credits">{num(sub.credit_limit)}</Row>
              <Row label="Subscribed">{date(sub.start_date)}</Row>
              <Row label="Renews">{date(sub.renewal_date)}</Row>
            </dl>
          ) : (
            <Empty title="No subscription record" sub="Created the first time the account opens its plan page." />
          )}
        </Card>

        <Card>
          <CardHead title="Credits" />
          <dl>
            <Row label="Balance now">{num(user.credits)}</Row>
            <Row label="Used, all time">{isLoading ? "…" : num(data?.stats?.lifetime_used ?? 0)}</Row>
            <Row label="Added, all time">{isLoading ? "…" : num(data?.stats?.lifetime_added ?? 0)}</Row>
          </dl>
        </Card>
      </div>

      <Card>
        <CardHead title="Credit history" />
        {isLoading ? (
          <Spinner />
        ) : error ? (
          <ErrorNote error={error} />
        ) : !data?.transactions.length ? (
          <Empty title="No credit movements yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>When</Th>
                <Th>Action</Th>
                <Th>Note</Th>
                <Th className="text-right">Credits</Th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((t) => (
                <tr key={t.id}>
                  <Td className="nums whitespace-nowrap text-muted-foreground">{dateTime(t.timestamp)}</Td>
                  <Td>{t.action.replace(/_/g, " ")}</Td>
                  <Td className="text-muted-foreground">{t.description || "—"}</Td>
                  {/* credits_used is positive for spend, negative for a top-up. */}
                  <Td className={cn("nums text-right font-medium", t.credits_used < 0 ? "text-success" : "")}>
                    {t.credits_used < 0 ? `+${num(-t.credits_used)}` : `−${num(t.credits_used)}`}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};

interface AppRow {
  id: number;
  campaign: number;
  campaign_title: string;
  brand_name: string;
  status: string;
  applied_at: string;
}

interface CampaignRow {
  id: number;
  title: string;
  status: string;
  budget: number | string | null;
  applications_count: number;
  created_at: string;
}

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "neutral" | "brand"> = {
  accepted: "success",
  active: "success",
  pending: "warning",
  draft: "neutral",
  rejected: "danger",
  cancelled: "danger",
  completed: "brand",
};

const ActivityTab = ({ user }: { user: AdminUserDetail }) => {
  const isBrand = user.role === "brand";
  const { data, isLoading, error } = useQuery({
    queryKey: ["user-activity-items", user.id, user.role],
    queryFn: async () =>
      isBrand
        ? (await api.get<{ campaigns: CampaignRow[] }>(`/admin-panel/users/${user.id}/campaigns/`)).data
        : (await api.get<{ applications: AppRow[] }>(`/admin-panel/users/${user.id}/applications/`)).data,
  });

  const rows = isBrand
    ? ((data as { campaigns?: CampaignRow[] })?.campaigns ?? [])
    : ((data as { applications?: AppRow[] })?.applications ?? []);

  return (
    <Card>
      <CardHead title={isBrand ? "Campaigns" : "Applications"} sub={rows.length ? `${num(rows.length)} total` : undefined} />
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <ErrorNote error={error} />
      ) : rows.length === 0 ? (
        <Empty title={isBrand ? "No campaigns yet" : "No applications yet"} />
      ) : isBrand ? (
        <Table>
          <thead>
            <tr>
              <Th>Campaign</Th>
              <Th>Status</Th>
              <Th className="text-right">Budget</Th>
              <Th className="text-right">Applications</Th>
              <Th>Created</Th>
            </tr>
          </thead>
          <tbody>
            {(rows as CampaignRow[]).map((c) => (
              <tr key={c.id}>
                <Td className="font-medium">{c.title}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[c.status] ?? "neutral"}>{c.status}</Badge>
                </Td>
                <Td className="nums text-right">{c.budget ? inr(Number(c.budget)) : "—"}</Td>
                <Td className="nums text-right">{num(c.applications_count)}</Td>
                <Td className="nums whitespace-nowrap text-muted-foreground">{date(c.created_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Campaign</Th>
              <Th>Brand</Th>
              <Th>Status</Th>
              <Th>Applied</Th>
            </tr>
          </thead>
          <tbody>
            {(rows as AppRow[]).map((a) => (
              <tr key={a.id}>
                <Td className="font-medium">{a.campaign_title}</Td>
                <Td className="text-muted-foreground">{a.brand_name}</Td>
                <Td>
                  <Badge tone={STATUS_TONE[a.status] ?? "neutral"}>{a.status}</Badge>
                </Td>
                <Td className="nums whitespace-nowrap text-muted-foreground">{date(a.applied_at)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
};

/* ------------------------------------------------------------ page */

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("Profile");
  const [creditsOpen, setCreditsOpen] = useState(false);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: async () => (await api.get<AdminUserDetail>(`/admin-panel/users/${id}/`)).data,
  });

  const refresh = () => {
    setCreditsOpen(false);
    for (const key of ["user-detail", "user-credits", "users", "approval-queue", "dashboard-stats"]) {
      void qc.invalidateQueries({ queryKey: [key] });
    }
  };

  const approve = useMutation({
    mutationFn: () => api.post(`/admin-panel/users/${id}/approve/`, {}),
    onSuccess: refresh,
  });
  const suspend = useMutation({
    mutationFn: () => api.post(`/admin-panel/users/${id}/suspend/`, { reason: "Suspended by admin" }),
    onSuccess: refresh,
  });
  const reactivate = useMutation({
    mutationFn: () => api.patch(`/admin-panel/users/${id}/`, { is_active: true }),
    onSuccess: refresh,
  });

  if (isLoading) return <Spinner label="Loading user" />;
  if (error) return <ErrorNote error={error} />;
  if (!user) return null;

  const name = `${user.first_name} ${user.last_name}`.trim() || user.username;
  const picture = media(
    (user.profile?.profile_picture as string | undefined) ??
      (user.profile?.logo as string | undefined) ??
      user.instagram?.picture
  );
  const activityCount = user.role === "brand" ? user.stats.campaigns : user.stats.applications;

  return (
    <>
      <button
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/users"))}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {picture ? (
            <img src={picture} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-secondary-foreground">
              {initials(user)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              @{user.username} · {user.email}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={user.role === "brand" ? "brand" : "neutral"}>{user.role}</Badge>
              {!user.is_active ? (
                <Badge tone="danger">suspended</Badge>
              ) : user.is_approved ? (
                <Badge tone="success">approved</Badge>
              ) : (
                <Badge tone="warning">pending approval</Badge>
              )}
              {user.subscription?.plan === "pro" && <Badge tone="brand">pro</Badge>}
              {user.is_staff && <Badge tone="brand">staff</Badge>}
              <Badge tone={user.email_verified ? "success" : "warning"}>
                {user.email_verified ? "email verified" : "email unverified"}
              </Badge>
              {user.instagram && <Badge tone="neutral">instagram connected</Badge>}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {!user.is_approved && (
            <Button size="sm" busy={approve.isPending} onClick={() => approve.mutate()}>
              <UserCheck className="h-3.5 w-3.5" />
              Approve
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setCreditsOpen((v) => !v)}>
            <Coins className="h-3.5 w-3.5" />
            Adjust credits
          </Button>
          {user.is_active ? (
            <Button size="sm" variant="outline" busy={suspend.isPending} onClick={() => suspend.mutate()}>
              <ShieldOff className="h-3.5 w-3.5" />
              Suspend
            </Button>
          ) : (
            <Button size="sm" variant="outline" busy={reactivate.isPending} onClick={() => reactivate.mutate()}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Reactivate
            </Button>
          )}
        </div>
      </div>

      {creditsOpen && <CreditPanel user={user} onDone={refresh} />}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Credits", num(user.credits)],
          ["Plan", user.subscription?.plan === "pro" ? "Pro" : "Free"],
          [user.role === "brand" ? "Campaigns" : "Applications", num(activityCount ?? 0)],
          ["Last sign-in", user.last_login ? date(user.last_login) : "Never"],
        ].map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            {/* Proportional figures: tabular-nums spaces a standalone number loosely. */}
            <p className="mt-1.5 text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Profile" && <ProfileTab user={user} />}
      {tab === "Instagram" && <InstagramTab user={user} />}
      {tab === "Plan & credits" && <PlanTab user={user} />}
      {tab === "Activity" && <ActivityTab user={user} />}

      <p className="mt-8 text-xs text-muted-foreground">
        Account created {dateTime(user.created_at)} ·{" "}
        {user.has_usable_password ? "signs in with a password" : "no password (Instagram or Google sign-in)"} ·{" "}
        <Link to="/users" className="underline-offset-4 hover:underline">
          All users
        </Link>
      </p>
    </>
  );
};
