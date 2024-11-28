import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "../components/ProductCard";
import { type Product } from "@db/schema";

const PRODUCT_IMAGES = {
  machine: "https://images.unsplash.com/photo-1572612361555-50ea11ec50b7",
  cooler: "https://images.unsplash.com/photo-1594776187177-118eb3e41ecb",
  parts: "https://images.unsplash.com/photo-1609250841156-95b44ffe0749",
};

export default function Products() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      return response.json() as Promise<Product[]>;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            imageUrl={PRODUCT_IMAGES[product.category as keyof typeof PRODUCT_IMAGES]}
          />
        ))}
      </div>
    </div>
  );
}
