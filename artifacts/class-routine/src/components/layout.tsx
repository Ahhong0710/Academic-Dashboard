import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { CalendarDays, LayoutDashboard, Clock, FolderOpen, Bell } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/assignments", label: "Assignments", icon: Clock },
  { href: "/resources", label: "Resources", icon: FolderOpen },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-card border-r border-border shadow-sm z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <CalendarDays className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Routine
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block relative">
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative z-10",
                  isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "opacity-70")} />
                  {item.label}
                </div>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-secondary/50 border border-border text-center">
          <div className="w-10 h-10 rounded-full bg-background border shadow-sm flex items-center justify-center mx-auto mb-3">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">Stay on track!</p>
          <p className="text-xs text-muted-foreground mt-1">Keep checking deadlines.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 w-full pb-20 md:pb-0 min-h-screen relative">
        <div className="max-w-6xl mx-auto p-4 md:p-8 lg:p-10 w-full h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-card/80 backdrop-blur-lg border-t border-border z-50 pb-safe">
        <div className="flex items-center justify-around p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="relative flex-1 py-2 flex flex-col items-center justify-center gap-1">
                <div className={cn(
                  "relative z-10 flex flex-col items-center gap-1 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  <item.icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute top-0 w-12 h-1 bg-primary rounded-b-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
