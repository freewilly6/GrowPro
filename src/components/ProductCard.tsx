import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useCart } from "@/contexts/CartContext";
import { toast as sonnerToast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  currency: string;
  image_url?: string;
  stock_qty: number;
  category?: string;
}

export const ProductCard = ({
  id,
  name,
  slug,
  price_cents,
  currency,
  image_url,
  stock_qty,
  category,
}: ProductCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToCart } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  const price = (price_cents / 100).toFixed(2);
  const isOutOfStock = stock_qty <= 0;

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

  useEffect(() => {
    if (user) {
      checkWishlist();
    }
  }, [user, id]);

  const checkWishlist = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", id)
      .single();
    
    setIsInWishlist(!!data);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsAddingToWishlist(true);

    if (isInWishlist) {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsInWishlist(false);
        toast({
          title: "Removed from wishlist",
        });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      }
    } else {
      const { error } = await supabase
        .from("wishlist")
        .insert({ user_id: user.id, product_id: id });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setIsInWishlist(true);
        toast({
          title: "Added to wishlist",
        });
        queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      }
    }

    setIsAddingToWishlist(false);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const product = {
      id,
      name,
      slug,
      price_cents,
      image_url,
    };
    
    addToCart(product, 1);
    sonnerToast.success(`Added ${name} to cart`);
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 bg-card border-border">
      <Link to={`/product/${slug}`}>
        <div className="aspect-square overflow-hidden bg-muted relative">
          {image_url ? (
            <img
              src={image_url}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
              No Image
            </div>
          )}
          {isOutOfStock && (
            <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
              Out of Stock
            </Badge>
          )}
          {category && !isOutOfStock && (
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
              {category}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 hover:bg-background"
            onClick={handleWishlistToggle}
            disabled={isAddingToWishlist}
          >
            <Heart
              className={`h-5 w-5 ${isInWishlist ? "fill-red-500 text-red-500" : ""}`}
            />
          </Button>
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-primary">
              ${price}
            </span>
            <span className="text-sm text-muted-foreground ml-1">{currency}</span>
          </div>
          <Button
            size="icon"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
        {!isOutOfStock && stock_qty < 10 && (
          <p className="text-xs text-amber-500 mt-2">Only {stock_qty} left in stock!</p>
        )}
      </div>
    </Card>
  );
};
