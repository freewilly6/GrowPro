import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { data: products, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      if (!query) return [];

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Search Results
            </h1>
            <p className="text-muted-foreground text-lg">
              {query ? (
                <>
                  Showing results for <span className="font-semibold text-foreground">"{query}"</span>
                  {products && ` (${products.length} found)`}
                </>
              ) : (
                "Enter a search term to find products"
              )}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-card animate-pulse rounded-lg" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : query ? (
            <div className="text-center py-20">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                No products found
              </h2>
              <p className="text-muted-foreground">
                Try searching with different keywords
              </p>
            </div>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
