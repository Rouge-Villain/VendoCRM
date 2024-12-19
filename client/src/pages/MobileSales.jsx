import { MobileSalesDashboard } from "../components/mobile/MobileSalesDashboard";

export default function MobileSales() {
  return (
    <div className="max-w-md mx-auto px-4 pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Sales Rep</p>
      </div>
      
      <MobileSalesDashboard />
    </div>
  );
}
