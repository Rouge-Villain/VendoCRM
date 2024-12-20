import { type ReactNode } from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Package, TrendingUp, BarChart, History, Wrench, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { RealTimeInteractions } from "@/components/RealTimeInteractions";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: isMobile ? "/mobile-sales" : "/sales", icon: TrendingUp },
    { name: "Analytics", href: "/analytics", icon: BarChart },
    { name: "Timeline", href: "/timeline", icon: History },
    { name: "Maintenance", href: "/maintenance", icon: Wrench },
  ];

  const NavigationLinks = () => (
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
  );

  if (isMobile) {
    return (
      <div className="relative min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b">
          <div className="flex items-center justify-between p-4">
            <img src="/AVS.png" alt="AVS Companies" className="h-8 w-auto" />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="left" 
                className="w-64 fixed inset-y-0 left-0 z-[70] bg-white shadow-xl border-r touch-none select-none"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <div className="flex h-16 items-center px-4 border-b">
                  <img src="/AVS.png" alt="AVS Companies" className="h-8 w-auto" />
                </div>
                <div className="overflow-y-auto flex-1 touch-pan-y">
                  <NavigationLinks />
                </div>
              </SheetContent>
              <div 
                className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 touch-none select-none"
                data-state="open"
                style={{ 
                  pointerEvents: 'auto',
                  touchAction: 'none'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('[data-state="open"]')?.setAttribute('data-state', 'closed');
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
            </Sheet>
          </div>
        </div>
        <main className="relative min-h-screen bg-gray-50 overflow-x-hidden">
          <div 
            className="h-full w-full transition-all duration-200 overflow-x-auto"
            style={{
              pointerEvents: 'auto',
              touchAction: document.querySelector('[data-state="open"]') ? 'none' : 'auto',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gray-100 overflow-hidden">
      <div className="flex min-h-screen">
        <div className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white shadow-xl border-r border-gray-200/80">
          <div className="flex h-32 items-center justify-center px-6 pt-8 pb-4">
            <img src="/AVS.png" alt="AVS Companies" className="h-16 w-auto object-contain" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavigationLinks />
          </div>
        </div>
        <div className="pl-64 flex-1 min-h-screen bg-gray-50/50 overflow-hidden">
          <main className="relative py-8 px-8 w-full overflow-x-auto">
            <div className="grid grid-cols-1 gap-6 min-w-0">
              {children}
              <RealTimeInteractions />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}