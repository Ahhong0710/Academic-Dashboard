import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Clock, MapPin, User, Trash2, Edit3, AlertCircle } from "lucide-react";
import { 
  useGetTimetable, 
  useCreateTimetableEntry, 
  useUpdateTimetableEntry, 
  useDeleteTimetableEntry,
  getGetTimetableQueryKey,
  TimetableEntryDayOfWeek,
  type TimetableEntry 
} from "@workspace/api-client-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const DAYS = Object.values(TimetableEntryDayOfWeek);

const timetableSchema = z.object({
  courseName: z.string().min(1, "Course name is required"),
  courseCode: z.string().optional(),
  instructor: z.string().optional(),
  dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
  startTime: z.string().min(1, "Start time required"),
  endTime: z.string().min(1, "End time required"),
  room: z.string().optional(),
  color: z.string().optional().default("#4f46e5"),
});

type FormValues = z.infer<typeof timetableSchema>;

export default function TimetablePage() {
  const { data: timetable = [], isLoading } = useGetTimetable();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const todayIdx = new Date().getDay();
  // Adjust so Monday is 0, Sunday is 6 instead of JS default Sunday=0
  const initialDayIdx = todayIdx === 0 ? 6 : todayIdx - 1;
  const [activeDay, setActiveDay] = useState<TimetableEntryDayOfWeek>(DAYS[initialDayIdx]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableEntry | null>(null);

  const createMutation = useCreateTimetableEntry();
  const updateMutation = useUpdateTimetableEntry();
  const deleteMutation = useDeleteTimetableEntry();

  const form = useForm<FormValues>({
    resolver: zodResolver(timetableSchema),
    defaultValues: {
      courseName: "",
      courseCode: "",
      instructor: "",
      dayOfWeek: activeDay,
      startTime: "09:00",
      endTime: "10:00",
      room: "",
      color: "#4f46e5",
    }
  });

  const activeClasses = timetable
    .filter(t => t.dayOfWeek === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const openAddDialog = () => {
    setEditingItem(null);
    form.reset({ dayOfWeek: activeDay, courseName: "", courseCode: "", instructor: "", startTime: "09:00", endTime: "10:00", room: "", color: "#4f46e5" });
    setDialogOpen(true);
  };

  const openEditDialog = (item: TimetableEntry) => {
    setEditingItem(item);
    form.reset({
      courseName: item.courseName,
      courseCode: item.courseCode || "",
      instructor: item.instructor || "",
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room || "",
      color: item.color || "#4f46e5",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this class?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTimetableQueryKey() });
          toast({ title: "Class removed" });
        }
      });
    }
  };

  const onSubmit = (data: FormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTimetableQueryKey() });
          setDialogOpen(false);
          toast({ title: "Timetable updated" });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetTimetableQueryKey() });
          setDialogOpen(false);
          toast({ title: "Class added to timetable" });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Timetable</h1>
          <p className="text-muted-foreground mt-1">Manage your weekly class schedule.</p>
        </div>
        <Button onClick={openAddDialog} className="shadow-md hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>
      </div>

      {/* Day Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar bg-secondary/50 p-1 rounded-xl border">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors flex-1 min-w-fit",
              activeDay === day ? "text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            )}
          >
            {activeDay === day && (
              <motion.div
                layoutId="active-day-tab"
                className="absolute inset-0 bg-background shadow-sm rounded-lg border"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{day.substring(0, 3)}</span>
          </button>
        ))}
      </div>

      {/* Class List */}
      <div className="space-y-4 relative min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
        ) : activeClasses.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {activeClasses.map((cls, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                key={cls.id}
                className="group bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row gap-5"
              >
                <div className="hidden sm:flex flex-col items-center justify-center min-w-24 text-center border-r border-border/50 pr-5">
                  <span className="text-lg font-bold text-foreground">{cls.startTime}</span>
                  <span className="text-xs font-medium text-muted-foreground mt-1">{cls.endTime}</span>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-12 rounded-full" style={{ backgroundColor: cls.color || '#4f46e5' }} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground">{cls.courseCode || "CLASS"}</span>
                          <span className="sm:hidden text-xs font-bold text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
                            {cls.startTime} - {cls.endTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold leading-tight">{cls.courseName}</h3>
                      </div>
                    </div>
                    
                    <div className="flex opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openEditDialog(cls)}>
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(cls.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground pl-6">
                    {cls.room && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 opacity-70" /> {cls.room}
                      </div>
                    )}
                    {cls.instructor && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4 opacity-70" /> {cls.instructor}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/20"
          >
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm border mb-4">
              <AlertCircle className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-display font-semibold">No classes on {activeDay}</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">You have a free day! Relax or get ahead on your assignments.</p>
            <Button onClick={openAddDialog} variant="outline" className="mt-6">Add a Class</Button>
          </motion.div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Class" : "Add New Class"}</DialogTitle>
            <DialogDescription>Fill in the details for this timetable entry.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Course Name *</Label>
                <Input {...form.register("courseName")} placeholder="e.g. Data Structures" />
              </div>
              <div className="space-y-2">
                <Label>Course Code</Label>
                <Input {...form.register("courseCode")} placeholder="e.g. CS201" />
              </div>
              <div className="space-y-2">
                <Label>Day of Week *</Label>
                <Select value={form.watch("dayOfWeek")} onValueChange={(val) => form.setValue("dayOfWeek", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input type="time" {...form.register("startTime")} />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input type="time" {...form.register("endTime")} />
              </div>
              <div className="space-y-2">
                <Label>Room / Location</Label>
                <Input {...form.register("room")} placeholder="e.g. Room 402" />
              </div>
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Input {...form.register("instructor")} placeholder="e.g. Dr. Smith" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Color Code</Label>
                <div className="flex items-center gap-3">
                  <Input type="color" {...form.register("color")} className="w-16 h-10 p-1 cursor-pointer" />
                  <span className="text-sm text-muted-foreground">Used for visual organization</span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Save Changes" : "Add Class"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
