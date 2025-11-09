import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, DollarSign, TrendingUp, LogOut, FolderTree, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [productsRes, ordersRes, manualSalesRes, revenueRes, manualRevenueRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("manual_sales").select("id", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("total_cents")
          .eq("payment_status", "paid")
          .gte("created_at", thirtyDaysAgo.toISOString()),
        supabase
          .from("manual_sales")
          .select("price_cents, quantity")
          .gte("created_at", thirtyDaysAgo.toISOString()),
      ]);

      const ordersRevenue = revenueRes.data?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
      const manualRevenue = manualRevenueRes.data?.reduce((sum, sale) => sum + (sale.price_cents * sale.quantity), 0) || 0;
      const totalRevenue = ordersRevenue + manualRevenue;

      return {
        totalProducts: productsRes.count || 0,
        totalOrders: (ordersRes.count || 0) + (manualSalesRes.count || 0),
        revenueLastMonth: totalRevenue / 100,
      };
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Revenue (30 days)",
      value: `$${stats?.revenueLastMonth.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/admin/revenue",
    },
  ];

  const quickActions = [
    { to: "/admin/products", label: "Manage Products", icon: Package },
    { to: "/admin/orders", label: "View Orders", icon: ShoppingCart },
    { to: "/admin/categories", label: "Manage Categories", icon: FolderTree },
    { to: "/admin/manual-sales", label: "Manual Sales", icon: Receipt },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage your store and view analytics</p>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="border-border">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {statCards.map((stat) => {
              if (stat.link) {
                return (
                  <Link key={stat.title} to={stat.link}>
                    <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                        </div>
                        <div className={`w-14 h-14 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                          <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              }
              
              return (
                <Card key={stat.title} className="p-6 bg-card border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action) => (
                <Button
                  key={action.to}
                  asChild
                  variant="outline"
                  className="h-24 border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Link to={action.to}>
                    <div className="flex flex-col items-center gap-3">
                      <action.icon className="w-8 h-8 text-primary" />
                      <span className="text-lg font-semibold">{action.label}</span>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card className="p-6 bg-card border-border">
            <h2 className="text-2xl font-bold text-primary mb-4">Getting Started</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>Welcome to your admin dashboard! Here's what you can do:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Add and manage products in your catalog</li>
                <li>View and track customer orders</li>
                <li>Create manual sales for in-person transactions</li>
                <li>Monitor your store's performance and revenue</li>
              </ul>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
