import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button, Card, Field, Input } from "@/components/ui";

export const Login = () => {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(identifier.trim(), password);
      navigate("/", { replace: true });
    } catch (err: any) {
      // login() in lib/auth.tsx already turns every failure into a message
      // worth reading, including the HTTP status when the server is at fault.
      setError(err?.message || "Could not sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    /* the ink of the main site's hero, so staff land somewhere recognisable */
    <div className="flex min-h-screen items-center justify-center bg-ink p-4 text-ink-foreground">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <ShieldCheck className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black tracking-[-0.04em]">
            FameSync <span className="text-ink-muted">Admin</span>
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted">Staff accounts only</p>
        </div>

        <Card className="p-6 text-foreground shadow-e3">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Username or email">
              <Input
                autoFocus
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="you@famesync.com"
                required
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>

            {error && (
              <p
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </p>
            )}

            <Button type="submit" busy={busy} className="w-full">
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-5 text-center text-xs leading-relaxed text-ink-muted">
          Access is granted per account. If you are locked out, a superuser can
          set <code className="rounded bg-ink-foreground/10 px-1 text-ink-foreground">is_staff</code> on your
          user.
        </p>
      </div>
    </div>
  );
};
