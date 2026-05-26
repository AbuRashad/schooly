// Simple localStorage-based auth for Schooly
// (No backend auth server needed — session stored in browser)

const SESSION_KEY = "schooly_session";

export interface SchoolyUser {
  id: string;
  name: string;
  email: string;
}

function getSession(): SchoolyUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SchoolyUser) : null;
  } catch {
    return null;
  }
}

export const authClient = {
  getSession: async () => {
    const user = getSession();
    return { data: user ? { session: { user } } : null };
  },

  signIn: {
    email: async ({ email, password }: { email: string; password: string }) => {
      // Accept any credentials for demo
      if (!email || !password) return { error: { message: "بيانات غير صحيحة" } };
      const user: SchoolyUser = { id: "1", name: "مدير سكولي", email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { data: { user } };
    },
    social: async ({ callbackURL }: { provider?: string; callbackURL?: string }) => {
      window.location.href = callbackURL || '/';
      return { data: null };
    },
  },

  signUp: {
    email: async ({ email, password, name }: { email: string; password: string; name?: string }) => {
      if (!email || !password) return { error: { message: "بيانات غير صحيحة" } };
      const user: SchoolyUser = { id: "1", name: name || "مستخدم سكولي", email };
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return { data: { user } };
    },
  },

  signOut: async () => {
    localStorage.removeItem(SESSION_KEY);
    return { data: null };
  },

  useSession: () => {
    const user = getSession();
    return { data: user ? { session: { user } } : null, isPending: false, isAuthenticated: !!user };
  },
};

export const { signIn, signUp, signOut, useSession } = authClient;
