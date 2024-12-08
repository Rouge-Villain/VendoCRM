import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "../components/ProductCard";

const PRODUCT_IMAGES = {
  machine: "https://images.unsplash.com/photo-1572612361555-50ea11ec50b7",
  parts: "https://images.unsplash.com/photo-1581092446327-9b52bd1570c2",
  supplies: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a",
};

export default function Products() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error(`Error fetching products: ${response.statusText}`);
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-[360px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            image={PRODUCT_IMAGES[product.category] || PRODUCT_IMAGES.machine}
          />
        ))}
      </div>
    </div>
  );
}
