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
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className="fixed inset-y-0 z-30 flex w-64 flex-col bg-gradient-to-b from-background to-background/95 shadow-xl border-r border-border/50 backdrop-blur-sm">
          <div className="flex h-24 items-center justify-center px-6">
            <img 
              src="/AVS.png" 
              alt="AVS Companies" 
              className="h-12 w-auto object-contain transition-transform duration-300 hover:scale-105" 
            />
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
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
        <div className="pl-64 flex-1">
          <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-background/90">
            <main className="p-8">
              <div className="max-w-[1400px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
