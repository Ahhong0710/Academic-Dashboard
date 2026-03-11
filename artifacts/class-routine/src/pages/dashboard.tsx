import { motion } from "framer-motion";
import { useGetAssignments, useGetTimetable, useGetResources } from "@workspace/api-client-react";
import { Clock, CheckCircle2, AlertCircle, BookOpen, ExternalLink, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { LiveCountdown } from "@/components/countdown";
import { PRIORITY_COLORS, cn } from "@/lib/utils";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: timetable = [], isLoading: loadingTimetable } = useGetTimetable();
  const { data: assignments = [], isLoading: loadingAssignments } = useGetAssignments();
  const { data: resources = [], isLoading: loadingResources } = useGetResources();

  // Find today's classes
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable
    .filter(t => t.dayOfWeek === todayName)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Find upcoming deadlines
  const upcomingAssignments = assignments
    .filter(a => a.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const pinnedResources = resources.slice(0, 4);

  const isLoading = loadingTimetable || loadingAssignments || loadingResources;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-bold">Good morning.</h1>
        <p className="text-muted-foreground mt-2 text-lg">Here is your academic overview for today.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Classes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> 
              Today's Schedule
            </h2>
            <Link href="/timetable" className="text-sm font-medium text-primary flex items-center hover:underline">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {todayClasses.length > 0 ? (
              todayClasses.map((cls, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  key={cls.id}
                  className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: cls.color || '#4f46e5' }} />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{cls.courseCode}</span>
                      <h3 className="font-semibold text-lg leading-tight mt-1">{cls.courseName}</h3>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5 font-medium text-foreground bg-secondary px-2.5 py-1 rounded-md">
                      <Clock className="w-4 h-4" />
                      {cls.startTime} - {cls.endTime}
                    </div>
                    {cls.room && <span className="flex-1 truncate truncate block">📍 {cls.room}</span>}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-secondary/30 border border-dashed border-border rounded-2xl p-8 text-center">
                <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto shadow-sm mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="font-medium text-foreground">No classes today!</h3>
                <p className="text-sm text-muted-foreground mt-1">Enjoy your free time or catch up on reading.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" /> 
              Upcoming Deadlines
            </h2>
            <Link href="/assignments" className="text-sm font-medium text-primary flex items-center hover:underline">
              See all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col h-[calc(100%-2rem)]">
            {upcomingAssignments.length > 0 ? (
              <div className="divide-y divide-border">
                {upcomingAssignments.map((task, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={task.id} 
                    className="p-4 hover:bg-secondary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-medium leading-tight">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{task.courseName}</p>
                      </div>
                      <span className={cn("text-[10px] uppercase font-bold px-2 py-1 rounded-full border", PRIORITY_COLORS[task.priority])}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="mt-3">
                      <LiveCountdown targetDate={task.dueDate} isCompleted={false} />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center m-auto">
                <CheckCircle2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">All caught up!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Resources */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-display font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-500" /> 
          Quick Resources
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {pinnedResources.length > 0 ? (
            pinnedResources.map(res => (
              <a 
                key={res.id} 
                href={res.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-card border border-border p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col h-full"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <h4 className="font-medium truncate block">{res.title}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{res.description || res.courseName}</p>
              </a>
            ))
          ) : (
            <div className="col-span-full bg-secondary/50 rounded-xl p-6 text-center border border-dashed">
              <p className="text-muted-foreground">Add resources to see them here.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
