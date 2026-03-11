import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Edit3, Github, BookOpen, Link as LinkIcon, FileCode, FolderArchive, ExternalLink } from "lucide-react";
import { 
  useGetResources, 
  useCreateResource, 
  useUpdateResource, 
  useDeleteResource,
  getGetResourcesQueryKey,
  ResourceType,
  type Resource 
} from "@workspace/api-client-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  url: z.string().url("Must be a valid URL"),
  type: z.enum(["github", "colab", "docs", "other"]),
  courseName: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof resourceSchema>;

const ICONS = {
  github: Github,
  colab: FileCode,
  docs: BookOpen,
  other: LinkIcon
};

const COLORS = {
  github: "bg-slate-800 text-white",
  colab: "bg-orange-500 text-white",
  docs: "bg-blue-500 text-white",
  other: "bg-emerald-500 text-white"
};

export default function ResourcesPage() {
  const { data: resources = [], isLoading } = useGetResources();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Resource | null>(null);

  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();

  const form = useForm<FormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: "",
      url: "",
      type: "other",
      courseName: "",
      description: "",
    }
  });

  const openAddDialog = () => {
    setEditingItem(null);
    form.reset({ title: "", url: "", type: "other", courseName: "", description: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (item: Resource) => {
    setEditingItem(item);
    form.reset({
      title: item.title,
      url: item.url,
      type: item.type,
      courseName: item.courseName || "",
      description: item.description || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetResourcesQueryKey() });
          toast({ title: "Resource deleted" });
        }
      });
    }
  };

  const onSubmit = (data: FormValues) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetResourcesQueryKey() });
          setDialogOpen(false);
          toast({ title: "Resource updated" });
        }
      });
    } else {
      createMutation.mutate({ data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetResourcesQueryKey() });
          setDialogOpen(false);
          toast({ title: "Resource added" });
        }
      });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Resources</h1>
          <p className="text-muted-foreground mt-1">Quick access to important links and materials.</p>
        </div>
        <Button onClick={openAddDialog} className="shadow-md hover:-translate-y-0.5 transition-transform">
          <Plus className="w-4 h-4 mr-2" /> Add Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
        ) : resources.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {resources.map((res, i) => {
              const Icon = ICONS[res.type] || LinkIcon;
              const bgColor = COLORS[res.type] || COLORS.other;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  key={res.id}
                  className="group relative bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:text-primary border" onClick={(e) => { e.preventDefault(); openEditDialog(res); }}>
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:text-destructive border" onClick={(e) => { e.preventDefault(); handleDelete(res.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${bgColor}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">{res.title}</h3>
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{res.courseName || "General"}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground flex-1 mb-4 line-clamp-3">
                      {res.description || "No description provided."}
                    </p>

                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-medium text-muted-foreground">
                      <span className="truncate pr-4 flex items-center gap-1.5 opacity-70">
                        <LinkIcon className="w-3 h-3" /> {new URL(res.url).hostname}
                      </span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    </div>
                  </a>
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
              <FolderArchive className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-display font-semibold">No resources yet</h3>
            <p className="text-muted-foreground mt-2 max-w-sm">Store important links, repositories, and documentation here.</p>
            <Button onClick={openAddDialog} variant="outline" className="mt-6">Add a Resource</Button>
          </motion.div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Resource" : "Add Resource"}</DialogTitle>
            <DialogDescription>Save a useful link for your studies.</DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input {...form.register("title")} placeholder="e.g. React Documentation" />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input type="url" {...form.register("url")} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={form.watch("type")} onValueChange={(val) => form.setValue("type", val as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub Repo</SelectItem>
                    <SelectItem value="colab">Google Colab</SelectItem>
                    <SelectItem value="docs">Documentation</SelectItem>
                    <SelectItem value="other">Other Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Course Tag</Label>
                <Input {...form.register("courseName")} placeholder="e.g. CS101" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea {...form.register("description")} placeholder="Short note about this link..." className="resize-none" rows={3} />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingItem ? "Save Changes" : "Add Resource"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
