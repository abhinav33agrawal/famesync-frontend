import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api, { clearTokens, readTokens, writeTokens } from "./api";

export interface AdminIdentity {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthValue {
  user: AdminIdentity | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthValue | undefined>(undefined);

const USER_KEY = "famesync_admin_user";

/* The API has no "am I staff?" endpoint, and /auth/me/ deliberately omits
   is_staff (see core/serializers.py UserSerializer). So staff status is
   established the only way that actually matters: by calling an admin
   endpoint and seeing whether the server allows it. A 403 here means the
   credentials are valid but the account is not staff. */
const assertStaff = async () => {
  await api.get("/admin-panel/dashboard/stats/");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AdminIdentity | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw && readTokens() ? (JSON.parse(raw) as AdminIdentity) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  /* Re-validate on mount: a stored session says nothing about whether the
     token still works or whether staff access was revoked since. */
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!readTokens()) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        await assertStaff();
      } catch {
        clearTokens();
        localStorage.removeItem(USER_KEY);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    /* Everything below throws an Error carrying a message fit to show the
       user. The screen used to fall back to "check your connection" for any
       failure it did not recognise, which is actively misleading: a 500 from
       the admin API rendered as a network problem and cost a real debugging
       session an hour of chasing CORS. Name the status instead. */
    let res;
    try {
      /* The login serializer accepts a username or an email in the username
         field (core/serializers.py CustomTokenObtainPairSerializer). */
      res = await api.post("/auth/login/", { username: identifier, password });
    } catch (err: any) {
      const code = err?.response?.status;
      if (code === 401) throw new Error("Wrong username or password.");
      if (code)
        throw new Error(
          err?.response?.data?.detail || `Sign-in failed (HTTP ${code}).`
        );
      throw new Error(
        "No response from the server. Check your connection and try again."
      );
    }
    writeTokens({ access: res.data.access, refresh: res.data.refresh });

    try {
      await assertStaff();
    } catch (err: any) {
      clearTokens();
      const code = err?.response?.status;
      if (code === 403 || code === 401) {
        throw new Error(
          "That account is not an administrator. Ask a superuser to grant staff access."
        );
      }
      if (code) {
        throw new Error(
          `Your password was accepted, but the admin API returned HTTP ${code}. ` +
            "That is a server fault, not your account."
        );
      }
      throw new Error(
        "Signed in, but the admin API did not respond. Check your connection."
      );
    }

    const identity: AdminIdentity = res.data.user ?? {
      id: 0,
      username: identifier,
      email: "",
      first_name: "",
      last_name: "",
    };
    localStorage.setItem(USER_KEY, JSON.stringify(identity));
    setUser(identity);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside <AuthProvider>");
  return v;
};
