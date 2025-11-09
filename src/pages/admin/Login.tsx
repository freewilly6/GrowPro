import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

type Status = "checking" | "denied";

const AdminLogin = () => {
  const [status, setStatus] = useState<Status>("checking");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      // 1️⃣ Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("sessionError:", sessionError);
      console.log("session:", session);

      if (sessionError || !session) {
        toast.error("Please sign in first.");
        navigate("/auth", { replace: true });
        return;
      }

      // 2️⃣ Check their roles
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", session.user.id); // just filter by user_id

      console.log("roleError:", roleError);
      console.log("roles for user:", roles);

      if (roleError) {
        toast.error("Error checking admin privileges.");
        navigate("/", { replace: true });
        return;
      }

      const isAdmin = !!roles?.some((r) => r.role === "admin");

      if (!isAdmin) {
        setStatus("denied");
        return;
      }

      // ✅ All good: user is admin
      toast.success("Admin access granted");
      navigate("/admin", { replace: true }); // or /admin/dashboard
    };

    verifyAdmin();
  }, [navigate]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md p-8 flex flex-col items-center gap-4 bg-card border-border">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">Checking admin access…</h1>
          <p className="text-muted-foreground text-center">
            Please wait while we verify your permissions.
          </p>
          <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </Card>
      </div>
    );
  }

  // status === "denied"
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 bg-card border-border text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-destructive mb-2">
          Access denied
        </h1>
        <p className="text-muted-foreground mb-6">
          You&apos;re signed in, but you don&apos;t have admin privileges.
        </p>
        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate("/")}>
            ← Back to home
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/auth")}
          >
            Switch account
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
