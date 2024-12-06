import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Package, TrendingUp, BarChart, History, Wrench } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: "/sales", icon: TrendingUp },
    { name: "Analytics", href: "/analytics", icon: BarChart },
    { name: "Timeline", href: "/timeline", icon: History },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="fixed inset-y-0 flex w-64 flex-col bg-white shadow-xl border-r border-gray-200/80">
          <div className="flex h-32 items-center justify-center px-6 pt-8 pb-4">
            <img src="/AVS.png" alt="AVS Companies" className="h-16 w-auto object-contain" />
          </div>
          <nav className="flex-1 space-y-1.5 px-4 py-6">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-50/80 hover:text-primary"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-primary"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="pl-64 flex-1 min-h-screen bg-gray-50/50">
          <main className="py-8 px-8 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
