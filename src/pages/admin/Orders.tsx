import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            unit_price_cents
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ delivery_status: status })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete order");
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    setSelectedOrder(orderId);
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: string) => {
    deleteOrderMutation.mutate(orderId);
  };

  const pendingOrders = orders?.filter((order) => order.delivery_status === "pending") || [];
  const completedOrders = orders?.filter((order) => order.delivery_status === "completed") || [];

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

          <h1 className="text-4xl font-bold text-primary mb-8">Order Management</h1>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">{isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-48" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pendingOrders.length > 0 ? (
                <div className="space-y-6">
                  {pendingOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order #{order.order_number}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              {order.delivery_status}
                            </Badge>
                            <Badge
                              variant={
                                order.payment_status === "paid" ? "default" : "destructive"
                              }
                            >
                              {order.payment_status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Customer Information</h3>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">Name:</span>{" "}
                                {order.customer_name}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Email:</span>{" "}
                                {order.customer_email}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Phone:</span>{" "}
                                {order.customer_phone}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Delivery Address</h3>
                            <div className="space-y-1 text-sm">
                              <p>{order.address_line1}</p>
                              {order.address_line2 && <p>{order.address_line2}</p>}
                              <p>{order.country}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6">
                          <h3 className="font-semibold mb-2">Order Items</h3>
                          <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm border-b pb-2"
                              >
                                <span>
                                  {item.product_name} × {item.quantity}
                                </span>
                                <span>
                                  TTD ${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between font-semibold pt-2">
                              <span>Total:</span>
                              <span>TTD ${(order.total_cents / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={updateStatusMutation.isPending && selectedOrder === order.id}
                              >
                                Mark as Completed
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark this order as completed?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleStatusChange(order.id, "completed")}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteOrderMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this order? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground">
                      No pending orders
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Pending orders will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-48" />
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : completedOrders.length > 0 ? (
                <div className="space-y-6">
                  {completedOrders.map((order) => (
                    <Card key={order.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order #{order.order_number}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="default">
                              {order.delivery_status}
                            </Badge>
                            <Badge
                              variant={
                                order.payment_status === "paid" ? "default" : "destructive"
                              }
                            >
                              {order.payment_status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="font-semibold mb-2">Customer Information</h3>
                            <div className="space-y-1 text-sm">
                              <p>
                                <span className="text-muted-foreground">Name:</span>{" "}
                                {order.customer_name}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Email:</span>{" "}
                                {order.customer_email}
                              </p>
                              <p>
                                <span className="text-muted-foreground">Phone:</span>{" "}
                                {order.customer_phone}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Delivery Address</h3>
                            <div className="space-y-1 text-sm">
                              <p>{order.address_line1}</p>
                              {order.address_line2 && <p>{order.address_line2}</p>}
                              <p>{order.country}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h3 className="font-semibold mb-2">Order Items</h3>
                          <div className="space-y-2">
                            {order.order_items?.map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm border-b pb-2"
                              >
                                <span>
                                  {item.product_name} × {item.quantity}
                                </span>
                                <span>
                                  TTD ${((item.unit_price_cents * item.quantity) / 100).toFixed(2)}
                                </span>
                              </div>
                            ))}
                            <div className="flex justify-between font-semibold pt-2">
                              <span>Total:</span>
                              <span>TTD ${(order.total_cents / 100).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={updateStatusMutation.isPending && selectedOrder === order.id}
                              >
                                Mark as Pending
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to mark this order as pending again?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleStatusChange(order.id, "pending")}
                                >
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={deleteOrderMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this order? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mb-4" />
                    <p className="text-xl font-semibold text-muted-foreground">
                      No completed orders
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Completed orders will appear here
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminOrders;
