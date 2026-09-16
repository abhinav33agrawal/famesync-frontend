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
      const status = err?.response?.status;
      setError(
        err?.message?.startsWith("That account is not")
          ? err.message
          : status === 401
            ? "Wrong username or password."
            : err?.response?.data?.detail ??
              "Could not sign in. Check your connection and try again."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold">FameSync Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff accounts only
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Username or email">
              <Input
                autoFocus
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ridam"
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
                className="rounded-md border border-destructive/30 bg-destructive/8 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </p>
            )}

            <Button type="submit" busy={busy} className="w-full">
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Access is granted per account. If you are locked out, a superuser can
          set <code className="rounded bg-muted px-1">is_staff</code> on your
          user.
        </p>
      </div>
    </div>
  );
};
