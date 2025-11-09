import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Revenue = () => {
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["revenue-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: manualSales, isLoading: salesLoading } = useQuery({
    queryKey: ["revenue-manual-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_sales")
        .select("*, products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalOrderRevenue = orders?.reduce((sum, order) => sum + order.total_cents, 0) || 0;
  const totalManualSalesRevenue = manualSales?.reduce((sum, sale) => sum + (sale.price_cents * sale.quantity), 0) || 0;
  const totalRevenue = totalOrderRevenue + totalManualSalesRevenue;

  const last30DaysOrders = orders?.filter((order) => {
    const orderDate = new Date(order.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return orderDate >= thirtyDaysAgo;
  }) || [];

  const last30DaysManualSales = manualSales?.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= thirtyDaysAgo;
  }) || [];

  const last30DaysOrderRevenue = last30DaysOrders.reduce((sum, order) => sum + order.total_cents, 0);
  const last30DaysManualRevenue = last30DaysManualSales.reduce((sum, sale) => sum + (sale.price_cents * sale.quantity), 0);
  const last30DaysTotal = last30DaysOrderRevenue + last30DaysManualRevenue;

  const formatCurrency = (cents: number) => {
    return `TTD $${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/admin/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <h1 className="text-4xl font-bold text-primary mb-8">Revenue Breakdown</h1>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Revenue (All Time)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Last 30 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(last30DaysTotal)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Revenue Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Online Orders:</span>
                    <span className="font-semibold">{formatCurrency(totalOrderRevenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manual Sales:</span>
                    <span className="font-semibold">{formatCurrency(totalManualSalesRevenue)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Online Orders Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <p className="text-center py-4">Loading orders...</p>
              ) : orders && orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_number}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>{order.customer_name || "N/A"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(order.total_cents)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">No orders yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manual Sales Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              {salesLoading ? (
                <p className="text-center py-4">Loading manual sales...</p>
              ) : manualSales && manualSales.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {manualSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.products?.name || "Unknown Product"}
                        </TableCell>
                        <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{sale.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.price_cents)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sale.price_cents * sale.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">No manual sales yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Revenue;
