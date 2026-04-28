import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

type AuthUser = {
  _id: string;
  role: "RIDER" | "DRIVER" | "ADMIN";
  name: string;
  email?: string;
  phone?: string;
};

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  isReady: boolean;
  login: (params: {
    emailOrPhone: string;
    password: string;
  }) => Promise<void>;
  register: (params: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthState | null>(null);

const LS_TOKEN = "coverfly_access_token";
const LS_USER = "coverfly_user";

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // DEMO MODE AUTH LOAD
  useEffect(() => {
    const token = localStorage.getItem(LS_TOKEN);
    const storedUser = localStorage.getItem(LS_USER);

    if (token) {
      setAccessToken(token);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setIsReady(true);
  }, []);

  async function login(params: {
    emailOrPhone: string;
    password: string;
  }) {
    const demoUser: AuthUser = {
      _id: "demo123",
      role: "RIDER",
      name: "Demo User",
      email: params.emailOrPhone
    };

    localStorage.setItem(LS_TOKEN, "demo-token");
    localStorage.setItem(LS_USER, JSON.stringify(demoUser));

    setAccessToken("demo-token");
    setUser(demoUser);
  }

  async function register(params: {
    name: string;
    email?: string;
    phone?: string;
    password: string;
  }) {
    const demoUser: AuthUser = {
      _id: "demo123",
      role: "RIDER",
      name: params.name || "Demo User",
      email: params.email,
      phone: params.phone
    };

    localStorage.setItem(LS_TOKEN, "demo-token");
    localStorage.setItem(LS_USER, JSON.stringify(demoUser));

    setAccessToken("demo-token");
    setUser(demoUser);
  }

  function logout() {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);

    setAccessToken(null);
    setUser(null);
  }

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      isReady,
      login,
      register,
      logout
    }),
    [user, accessToken, isReady]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);

  if (!ctx) {
    throw new Error("AuthProvider missing");
  }

  return ctx;
}