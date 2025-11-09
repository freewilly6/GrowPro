import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";

const ProductNew = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/admin/products");
  };

  const handleCancel = () => {
    navigate("/admin/products");
  };

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

            <h1 className="text-4xl font-bold text-primary mb-8">Add New Product</h1>

            <ProductForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedAdminRoute>
  );
};

export default ProductNew;
