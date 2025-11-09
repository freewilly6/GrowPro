import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Initialize selected categories from URL
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategories(categoryParam.split(","));
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedCategories, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories);
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price_cents", { ascending: true });
          break;
        case "price-high":
          query = query.order("price_cents", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleCategoryToggle = (categorySlug: string) => {
    const newSelected = selectedCategories.includes(categorySlug)
      ? selectedCategories.filter(c => c !== categorySlug)
      : [...selectedCategories, categorySlug];
    
    setSelectedCategories(newSelected);
    
    if (newSelected.length > 0) {
      setSearchParams({ category: newSelected.join(",") });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              {selectedCategories.length === 0 
                ? "All Products" 
                : selectedCategories.length === 1
                ? categories?.find(c => c.slug === selectedCategories[0])?.name || "Products"
                : `${selectedCategories.length} Categories Selected`}
            </h1>
            <p className="text-muted-foreground">
              {products ? `${products.length} products found` : "Loading..."}
            </p>
          </div>

          <div className="mb-8 flex flex-col lg:flex-row gap-6">
            {/* Category Filter */}
            <div className="lg:w-64">
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-lg">Categories</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {categories?.map((cat) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cat-${cat.slug}`}
                        checked={selectedCategories.includes(cat.slug)}
                        onCheckedChange={() => handleCategoryToggle(cat.slug)}
                      />
                      <Label
                        htmlFor={`cat-${cat.slug}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {cat.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              <div className="mb-4 flex justify-end">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-card border-border w-64">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-96 bg-card animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                    No products found
                  </h2>
                  <p className="text-muted-foreground">
                    {selectedCategories.length > 0
                      ? `No products available in the selected categories.`
                      : "Check back soon for new products!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
