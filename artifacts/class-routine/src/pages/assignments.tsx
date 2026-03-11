import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, CheckCircle2, Clock, Check, ListTodo } from "lucide-react";
import { 
  useGetAssignments, 
  useCreateAssignment, 
  useUpdateAssignment, 
  useDeleteAssignment,
  getGetAssignmentsQueryKey,
  AssignmentStatus,
  AssignmentPriority,
  type Assignment 
} from "@workspace/api-client-react";

import { cn, PRIORITY_COLORS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LiveCountdown } from "@/components/countdown";

const assignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  courseName: z.string().min(1, "Course is required"),
  dueDate: z.string().min(1, "Due date is required"),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
});

type FormValues = z.infer<typeof assignmentSchema>;

export default function AssignmentsPage() {
  const { data: assignments = [], isLoading } = useGetAssignments();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState<"pending" | "completed">("pending");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Assignment | null>(null);

  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignment();

  const form = useForm<FormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      title: "",
      courseName: "",
      dueDate: new Date().toISOString().slice(0, 16),
      description: "",
      status: "pending",
      priority: "medium",
    }
  });

  const filteredAssignments = assignments
    .filter(a => filter === "pending" ? a.status !== "completed" : a.status === "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const openAddDialog = () => {
    setEditingItem(null);
    form.reset({
      title: "",
      courseName: "",
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      description: "",
      status: "pending",
      priority: "medium",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Assignment) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      courseName: item.courseName,
      dueDate: new Date(item.dueDate).toISOString().slice(0, 16),
      description: item.description || "",
      status: item.status,
      priority: item.priority,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAssignmentsQueryKey() });
          toast({ title: "Assignment deleted" });
        }
      });
    }
  };

  const handleToggleComplete = (item: Assignment) => {
    const newStatus = item.status === "completed" ? "pending" : "completed";
    updateMutation.mutate({ id: item.id, data: { ...item, status: newStatus } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAssignmentsQueryKey() });
        toast({ title: newStatus === "completed" ? "Marked as completed! 🎉" : "Moved back to pending" });
      }
    });
  };

  const onSubmit = (data: FormValues) => {
    // Format to full ISO string for backend
    const formattedData = {
      ...data,
      dueDate: new Date(data.dueDate).toISOString(),
    };
    
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formattedData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAssignmentsQueryKey() });
          setDialogOpen(false);
          toast({ title: "Assignment updated" });
        }
      });
    } else {
      createMutation.mutate({ data: formattedData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAssignmentsQueryKey() });
          setDialogOpen(false);
          toast({ title: "Assignment added" });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Assignments</h1>
          <p className="text-muted-foreground mt-1">Keep track of your deadlines.</p>
        </div>
        <Button onClick={openAddDialog} className="shadow-md hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4 mr-2" /> Add Assignment
        </Button>
      </div>

      <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl border w-fit">
        <button
          onClick={() => setFilter("pending")}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all relative", filter === "pending" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {filter === "pending" && <motion.div layoutId="tab" className="absolute inset-0 bg-background border shadow-sm rounded-lg" />}
          <span className="relative z-10 flex items-center gap-2"><Clock className="w-4 h-4" /> Pending</span>
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all relative", filter === "completed" ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {filter === "completed" && <motion.div layoutId="tab" className="absolute inset-0 bg-background border shadow-sm rounded-lg" />}
          <span className="relative z-10 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Completed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
        ) : filteredAssignments.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredAssignments.map((assignment, i) => {
              const isCompleted = assignment.status === "completed";
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  key={assignment.id}
                  className={cn(
                    "group relative flex flex-col bg-card border rounded-2xl p-5 shadow-sm transition-all duration-300",
                    isCompleted ? "border-border/50 opacity-70" : "hover:shadow-md border-border hover:border-primary/30"
                  )}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border",
                      isCompleted ? "bg-secondary text-muted-foreground border-transparent" : PRIORITY_COLORS[assignment.priority]
                    )}>
                      {assignment.priority} Priority
                    </span>
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => openEditDialog(assignment)}>
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(assignment.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 mb-6">
                    <h3 className={cn("text-xl font-semibold leading-tight", isCompleted && "line-through text-muted-foreground")}>
                      {assignment.title}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground mt-1">{assignment.courseName}</p>
                    {assignment.description && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-3 bg-secondary/30 p-3 rounded-lg border border-border/50">
                        {assignment.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60">
                    <LiveCountdown targetDate={assignment.dueDate} isCompleted={isCompleted} />
                    
                    <button
                      onClick={() => handleToggleComplete(assignment)}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center transition-all border-2",
                        isCompleted 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "bg-transparent border-muted-foreground/30 hover:border-emerald-500 hover:text-emerald-500 text-transparent"
                      )}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="col-span-full flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/20"
          >
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center shadow-sm border mb-4">
              <ListTodo className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-display font-semibold">No {filter} assignments</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">
              {filter === "pending" ? "You're all caught up! Enjoy your free time." : "You haven't completed any assignments yet."}
            </p>
            {filter === "pending" && <Button onClick={openAddDialog} variant="outline" className="mt-6">Add Assignment</Button>}
          </motion.div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Assignment" : "Add Assignment"}</DialogTitle>
            <DialogDescription>Track an upcoming project, paper, or homework.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Title *</Label>
                <Input {...form.register("title")} placeholder="e.g. Final Essay" />
              </div>
              <div className="space-y-2">
                <Label>Course *</Label>
                <Input {...form.register("courseName")} placeholder="e.g. ENG 101" />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input type="datetime-local" {...form.register("dueDate")} />
              </div>
              <div className="space-y-2">
                <Label>Priority *</Label>
                <Select value={form.watch("priority")} onValueChange={(val) => form.setValue("priority", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={form.watch("status")} onValueChange={(val) => form.setValue("status", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea {...form.register("description")} placeholder="Details, links, or notes..." className="resize-none" rows={3} />
              </div>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Save Changes" : "Add Assignment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
