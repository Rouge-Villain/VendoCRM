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
        <div className="fixed inset-y-0 flex w-64 flex-col bg-gradient-to-b from-background to-background/95 shadow-xl border-r border-border/50 backdrop-blur-sm transition-all duration-300">
          <div className="flex h-32 items-center justify-center px-6 pt-8 pb-4">
            <img 
              src="/AVS.png" 
              alt="AVS Companies" 
              className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ease-out hover:shadow-md ${
                    isActive
                      ? "bg-primary text-primary-foreground translate-x-1 shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground hover:translate-x-1"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-all duration-300 ${
                      isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="pl-64 flex-1 min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 transition-all duration-300">
          <main className="py-8 px-8 w-full overflow-x-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="container mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
