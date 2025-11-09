import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AdminStatus = "loading" | "unauth" | "forbidden" | "ok";

export const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<AdminStatus>("loading");

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        // not logged in
        if (!session) {
          setStatus("unauth");
          return;
        }

        // check role
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast.error("Access denied. Admin privileges required.");
          setStatus("forbidden");
          return;
        }

        setStatus("ok");
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast.error("Error verifying admin status");
        setStatus("forbidden");
      }
    };

    checkAdminStatus();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (status === "unauth") {
    return <Navigate to="/auth" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/" replace />;
  }

  // status === "ok"
  return <>{children}</>;
};
