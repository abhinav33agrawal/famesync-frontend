import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import api, { type DashboardStats } from "@/lib/api";
import { num } from "@/lib/format";
import { PageHead } from "@/components/Layout";
import {
  Button,
  Card,
  CardHead,
  ErrorNote,
  Field,
  Select,
} from "@/components/ui";

type Target = "all" | "influencers" | "brands";

export const Notifications = () => {
  const [target, setTarget] = useState<Target>("influencers");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () =>
      (await api.get<DashboardStats>("/admin-panel/dashboard/stats/")).data,
  });

  /* Broadcast writes one Notification row per user and cannot be undone from
     this panel, so the count is shown before sending rather than after. */
  const recipients =
    target === "all"
      ? (stats?.users.total ?? 0)
      : target === "influencers"
        ? (stats?.users.influencers ?? 0)
        : (stats?.users.brands ?? 0);

  const send = useMutation({
    mutationFn: () =>
      api.post("/admin-panel/notifications/broadcast/", { target, message }),
    onSuccess: () => {
      setSent(`Sent to ${num(recipients)} ${target === "all" ? "users" : target}.`);
      setMessage("");
      setConfirming(false);
    },
  });

  const tooLong = message.length > 500;
  const ready = message.trim().length > 0 && !tooLong;

  return (
    <>
      <PageHead
        title="Notifications"
        sub="Send an in-app notification to a group of users."
      />

      <Card className="max-w-2xl">
        <CardHead
          title="Broadcast"
          sub="Appears in the recipient's notification list. No email is sent."
        />

        <div className="space-y-4 p-5">
          <Field label="Audience">
            <Select
              value={target}
              onChange={(e) => {
                setTarget(e.target.value as Target);
                setConfirming(false);
              }}
            >
              <option value="influencers">Influencers</option>
              <option value="brands">Brands</option>
              <option value="all">Everyone</option>
            </Select>
          </Field>

          <Field label="Message">
            <textarea
              rows={5}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setConfirming(false);
                setSent(null);
              }}
              placeholder="Keep it short — this appears inline in the notification list."
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          <div className="flex items-center justify-between text-xs">
            <span
              className={
                tooLong ? "font-medium text-destructive" : "text-muted-foreground"
              }
            >
              {message.length} / 500
            </span>
            <span className="text-muted-foreground">
              {num(recipients)} recipient{recipients === 1 ? "" : "s"}
            </span>
          </div>

          {sent && (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
              {sent}
            </p>
          )}

          {send.isError && <ErrorNote error={send.error} />}

          {!confirming ? (
            <Button disabled={!ready} onClick={() => setConfirming(true)}>
              <Send className="h-3.5 w-3.5" />
              Continue
            </Button>
          ) : (
            <div className="rounded-md border border-warning/40 bg-warning/10 p-4">
              <p className="text-sm font-medium">
                Send to {num(recipients)}{" "}
                {target === "all" ? "users" : target}?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This writes a notification for every one of them and cannot be
                undone from here.
              </p>
              <div className="mt-3 flex gap-2">
                <Button busy={send.isPending} onClick={() => send.mutate()}>
                  Send now
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </>
  );
};
