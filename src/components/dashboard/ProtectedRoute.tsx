import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { authClient } from "@/lib/auth/auth-client";
import Spinner from "@/components/Spinner";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"loading" | "ok" | "no">("loading");

  useEffect(() => {
    authClient.getSession()
      .then((r) => setStatus(r.data?.session ? "ok" : "no"))
      .catch(() => setStatus("no"));
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (status === "no") return <Navigate to="/dashboard/login" replace />;

  return <>{children}</>;
}
