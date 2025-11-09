import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleSuccess = () => {
    navigate("/admin/products");
  };

  const handleCancel = () => {
    navigate("/admin/products");
  };

  if (isLoading) {
    return (
      <ProtectedAdminRoute>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 py-12 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-card rounded w-1/4"></div>
                <div className="h-64 bg-card rounded"></div>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedAdminRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedAdminRoute>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 py-12 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
              <p className="text-center text-muted-foreground">Product not found</p>
              <div className="text-center mt-4">
                <Button asChild>
                  <Link to="/admin/products">Back to Products</Link>
                </Button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedAdminRoute>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-12 bg-background">
          <div className="container mx-auto px-4 max-w-3xl">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/admin/products">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Products
              </Link>
            </Button>

            <h1 className="text-4xl font-bold text-primary mb-8">Edit Product</h1>

            <ProductForm
              initialData={product}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedAdminRoute>
  );
};

export default ProductEdit;
