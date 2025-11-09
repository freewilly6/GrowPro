import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ManualSales = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("1");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const { data: products } = useQuery({
    queryKey: ["products-for-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: manualSales, isLoading } = useQuery({
    queryKey: ["manual-sales"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("manual_sales")
        .select(`
          *,
          products (name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !user) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const priceCents = Math.round(parseFloat(price) * 100);
    const qty = parseInt(quantity);

    const { error } = await supabase.from("manual_sales").insert({
      product_id: selectedProduct.id,
      quantity: qty,
      price_cents: priceCents,
      notes: notes || null,
      created_by: user.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Manual sale recorded successfully",
      });
      setSelectedProduct(null);
      setQuantity("1");
      setPrice("");
      setNotes("");
      queryClient.invalidateQueries({ queryKey: ["manual-sales"] });
      queryClient.invalidateQueries({ queryKey: ["products-for-sales"] });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>

          <h1 className="text-4xl font-bold text-primary mb-8">Manual Sales</h1>

          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Record In-Person Sale</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Product</Label>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {selectedProduct ? selectedProduct.name : "Select product..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search products..." />
                          <CommandList>
                            <CommandEmpty>No product found.</CommandEmpty>
                            <CommandGroup>
                              {products?.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={product.name}
                                  onSelect={() => {
                                    setSelectedProduct(product);
                                    setPrice((product.price_cents / 100).toFixed(2));
                                    setOpen(false);
                                  }}
                                >
                                  {product.name} - Stock: {product.stock_qty}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (TTD)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Plus className="w-4 h-4 mr-2" />
                    Record Sale
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold mb-4">Recent Manual Sales</h2>
              {isLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : manualSales && manualSales.length > 0 ? (
                <div className="space-y-2">
                  {manualSales.map((sale: any) => (
                    <Card key={sale.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{sale.products?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Qty: {sale.quantity} × TTD {(sale.price_cents / 100).toFixed(2)}
                            </p>
                            {sale.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{sale.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              TTD {((sale.price_cents * sale.quantity) / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(sale.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No manual sales recorded yet
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManualSales;
