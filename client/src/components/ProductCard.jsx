import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ProductCard({ product, imageUrl }) {
  const specs = JSON.parse(product.specs);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-0">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-48 w-full object-cover"
        />
      </CardHeader>
      <CardContent className="p-6">
        <CardTitle className="text-xl mb-4">{product.name}</CardTitle>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{product.description}</p>
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Technical Specifications</h4>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-gray-500">{key}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="text-lg font-bold mt-4">
            ${parseFloat(product.price.toString()).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
