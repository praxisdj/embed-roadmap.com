"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Plus,
  Users,
  Calendar,
  Eye,
  EyeOff,
  Share2,
  Trash2,
} from "lucide-react";
import RoadmapEmbedConfig from "@/components/RoadmapEmbedConfig";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Status, statusConfig } from "@/types/status.type";
import { Feature } from "@/types/feature.type";
import { Roadmap } from "@/types/roadmap.type";

// Droppable Column Component
function DroppableColumn({
  status,
  config,
  features,
  onEdit,
  onDelete,
  deletingFeatureId,
  isDragging,
  activeFeature,
  onAddFeature,
  animatingCounter,
}: {
  status: string;
  config: { label: string; icon: string };
  features: Feature[];
  onEdit: (feature: Feature) => void;
  onDelete: (id: string) => void;
  deletingFeatureId: string | null;
  isDragging: boolean;
  activeFeature: Feature | null;
  onAddFeature: (status: string) => void;
  animatingCounter: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  // Determine if this column should be highlighted
  const isCurrentColumn = activeFeature?.status === status;
  const shouldHighlight = isDragging && !isCurrentColumn;
  const isDropTarget = isOver;

  return (
    <div className="flex flex-col space-y-4">
      {/* Column Header */}
      <div
        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ease-in-out ${
          shouldHighlight
            ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50"
            : isDropTarget
              ? "bg-green-50/50 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50"
              : "bg-muted/50"
        }`}
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{config.icon}</span>
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge
            variant="secondary"
            className={`text-xs transition-all duration-500 ease-out ${
              animatingCounter === status
                ? "counter-bounce bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                : ""
            }`}
          >
            {features.length}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-primary/10"
            onClick={() => onAddFeature(status)}
            title={`Add feature to ${config.label}`}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Droppable Column Content */}
      <SortableContext
        id={status}
        items={features.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-3 min-h-[400px] p-2 transition-all duration-300 ease-in-out rounded-lg border-2 border-dashed ${
            isDropTarget
              ? "bg-green-50/30 dark:bg-green-950/10 border-green-300/60 dark:border-green-700/60"
              : shouldHighlight
                ? "bg-blue-50/30 dark:bg-blue-950/10 border-blue-200/60 dark:border-blue-700/60"
                : "border-transparent"
          }`}
        >
          {features.map((feature) => (
            <DraggableFeatureCard
              key={feature.id}
              feature={feature}
              onEdit={onEdit}
              onDelete={onDelete}
              isDeleting={deletingFeatureId === feature.id}
            />
          ))}

          {/* Empty State for Column */}
          {features.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-muted-foreground">
                <div className="text-2xl mb-2 opacity-50">{config.icon}</div>
                <p className="text-sm">No features</p>
                <p
                  className={`text-xs mt-1 transition-colors duration-300 ease-in-out ${
                    shouldHighlight
                      ? "text-blue-500/70 dark:text-blue-400/70"
                      : "opacity-60"
                  }`}
                >
                  {shouldHighlight
                    ? "Drop here to move feature"
                    : "Drop features here"}
                </p>
              </div>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Feature Button */}
      <button
        className="w-full border-2 border-dashed rounded-lg p-3 text-center transition-all duration-200 hover:border-solid hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        onClick={() => onAddFeature(status)}
      >
        <span className="text-sm">+ Add feature</span>
      </button>
    </div>
  );
}

// Delete Drop Zone Component
function DeleteDropZone({
  isDragging,
  isOverDeleteZone,
}: {
  isDragging: boolean;
  isOverDeleteZone: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "delete-zone",
  });

  if (!isDragging) return null;

  return (
    <div
      ref={setNodeRef}
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-lg border-2 border-dashed transition-all duration-300 ease-in-out ${
        isOver || isOverDeleteZone
          ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700 scale-110"
          : "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-800"
      }`}
    >
      <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
        <Trash2 className="w-5 h-5" />
        <span className="font-medium text-sm">Drop here to delete</span>
      </div>
    </div>
  );
}

// Draggable Feature Card Component
function DraggableFeatureCard({
  feature,
  onEdit,
  onDelete,
  isDeleting,
}: {
  feature: Feature;
  onEdit: (feature: Feature) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: feature.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`hover:shadow-md transition-all duration-300 ease-in-out border-border/50 bg-card cursor-grab active:cursor-grabbing group ${
        isDragging ? "shadow-lg scale-105 opacity-80" : ""
      }`}
      {...attributes}
      {...listeners}
      onClick={() => {
        // Only open edit dialog if not dragging
        if (!isDragging) {
          onEdit(feature);
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {feature.title}
            </CardTitle>
            {feature.description && (
              <CardDescription className="text-xs leading-relaxed line-clamp-3 mt-1">
                {feature.description}
              </CardDescription>
            )}
          </div>
          <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
            {feature.votes?.length || 0}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">
            {new Date(feature.createdAt).toLocaleDateString()}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(feature);
              }}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-5 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(feature.id);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "..." : "×"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const roadmapId = params.id as string;

  // All hooks must be called before any return
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    title: "",
    description: "",
    status: "BACKLOG" as keyof typeof Status,
  });
  const [isCreating, setIsCreating] = useState(false);

  // Edit/delete feature state (must be before any return)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editFeatureData, setEditFeatureData] = useState({
    title: "",
    description: "",
    status: "BACKLOG" as keyof typeof Status,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [deletingFeatureId, setDeletingFeatureId] = useState<string | null>(
    null,
  );
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);

  // Drag and drop state
  const [activeFeature, setActiveFeature] = useState<Feature | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
  const [animatingCounter, setAnimatingCounter] = useState<string | null>(null);
  const [isDeletedFeaturesOpen, setIsDeletedFeaturesOpen] = useState(false);
  const [deletedFeatures, setDeletedFeatures] = useState<Feature[]>([]);
  const [deletedSearchTerm, setDeletedSearchTerm] = useState("");

  // Playful sound effect function
  const playDropSound = () => {
    try {
      // Create a cheerful musical sound using Web Audio API
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();

      // Create a pleasant chord progression (C major chord)
      const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
      const duration = 0.3;

      frequencies.forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
        oscillator.type = "sine";

        // Stagger the notes slightly for a more musical effect
        const startTime = audioContext.currentTime + index * 0.05;

        // Gentle volume envelope
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      });
    } catch {
      console.log("Audio not supported or blocked");
    }
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && roadmapId) {
      void fetchRoadmap();
    }
  }, [status, roadmapId]);

  const fetchRoadmap = async () => {
    try {
      const response = await fetch(`/api/roadmap/${roadmapId}`);
      if (response.ok) {
        const data = await response.json();
        setRoadmap(data);
        setFeatures(data.features || []);
      } else {
        console.error("Failed to fetch roadmap");
        router.push("/home");
      }
    } catch (error) {
      console.error("Error fetching roadmap:", error);
      router.push("/home");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedFeatures = async () => {
    try {
      const response = await fetch(
        `/api/roadmap/${roadmapId}?featureStatus=deleted`,
      );
      if (response.ok) {
        const data = await response.json();
        setDeletedFeatures(data);
      } else {
        console.error("Failed to fetch deleted features");
      }
    } catch (error) {
      console.error("Error fetching deleted features:", error);
    }
  };

  const handleUndeleteFeature = async (featureId: string) => {
    try {
      const response = await fetch(`/api/feature/${featureId}/undelete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        // Remove from deleted features list
        setDeletedFeatures((prev) => prev.filter((f) => f.id !== featureId));
        // Refresh main roadmap to show the restored feature
        void fetchRoadmap();
      } else {
        console.error("Failed to undelete feature");
      }
    } catch (error) {
      console.error("Error undeleting feature:", error);
    }
  };

  const handleCreateFeature = async () => {
    if (!newFeature.title.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/feature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newFeature.title.trim(),
          description: newFeature.description.trim() || undefined,
          roadmapId: roadmapId,
          status: newFeature.status,
        }),
      });

      if (response.ok) {
        const createdFeature = await response.json();
        setFeatures((prev) => [createdFeature, ...prev]);
        setIsDialogOpen(false);
        setNewFeature({ title: "", description: "", status: "BACKLOG" });
        // Refresh roadmap data to update counts
        void fetchRoadmap();
      } else {
        console.error("Failed to create feature");
      }
    } catch (error) {
      console.error("Error creating feature:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setNewFeature({ title: "", description: "", status: "BACKLOG" });
  };

  const handleAddFeatureToStatus = (status: string) => {
    setNewFeature({
      title: "",
      description: "",
      status: status as keyof typeof Status,
    });
    setIsDialogOpen(true);
  };

  const getFeaturesByStatus = (status: string) => {
    return features.filter((feature) => feature.status === status);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!session || !roadmap) {
    return null;
  }

  // PATCH endpoint for editing a feature
  const handleEditFeature = async () => {
    if (!editingFeature) return;
    setIsEditing(true);
    try {
      const response = await fetch(`/api/feature/${editingFeature.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingFeature.id,
          title: editFeatureData.title.trim(),
          description: editFeatureData.description.trim() || undefined,
          status: editFeatureData.status,
        }),
      });
      if (response.ok) {
        setEditingFeature(null);
        setEditFeatureData({ title: "", description: "", status: "BACKLOG" });
        void fetchRoadmap();
      } else {
        console.error("Failed to update feature");
      }
    } catch (error) {
      console.error("Error updating feature:", error);
    } finally {
      setIsEditing(false);
    }
  };

  // DELETE endpoint for deleting a feature
  const handleDeleteFeature = async (id: string) => {
    setDeletingFeatureId(id);
    try {
      const response = await fetch(`/api/feature/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFeatures((prev) => prev.filter((f) => f.id !== id));
        void fetchRoadmap();
      } else {
        console.error("Failed to delete feature");
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
    } finally {
      setDeletingFeatureId(null);
    }
  };

  // Open edit dialog
  const openEditDialog = (feature: Feature) => {
    setEditingFeature(feature);
    setEditFeatureData({
      title: feature.title,
      description: feature.description || "",
      status: feature.status as keyof typeof Status,
    });
  };

  // Close edit dialog
  const closeEditDialog = () => {
    setEditingFeature(null);
    setEditFeatureData({ title: "", description: "", status: "BACKLOG" });
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const feature = features.find((f) => f.id === active.id);
    setActiveFeature(feature || null);
    setIsDragging(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveFeature(null);
    setIsDragging(false);
    setIsOverDeleteZone(false);

    // Add a small delay to ensure proper drop zone detection
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!over) {
      console.log("No drop zone detected");
      return;
    }

    const featureId = active.id as string;
    const dropZoneId = over.id as string;

    console.log(
      "Drag end - Feature ID:",
      featureId,
      "Drop zone ID:",
      dropZoneId,
    );

    // Handle delete zone drop
    if (dropZoneId === "delete-zone") {
      console.log("Feature dropped on delete zone");
      void handleDeleteFeature(featureId);
      return;
    }

    // Find the feature and check if status actually changed
    const feature = features.find((f) => f.id === featureId);
    if (!feature) {
      console.error("Feature not found:", featureId);
      return;
    }

    // Map the drop zone ID to the actual status
    // The drop zone ID should be the status (BACKLOG, NEXT_UP, etc.)
    let newStatus = dropZoneId;

    // Fallback: if dropZoneId is not a valid status, try to find it in the over object
    if (!Object.keys(Status).includes(newStatus)) {
      // Check if over has a data.current property that might contain the status
      if (
        over.data.current &&
        over.data.current.sortable &&
        over.data.current.sortable.containerId
      ) {
        newStatus = over.data.current.sortable.containerId;
        console.log("Using fallback status from containerId:", newStatus);
      } else {
        console.error(
          "Invalid drop zone:",
          dropZoneId,
          "Valid zones:",
          Object.keys(Status),
        );
        return;
      }
    }

    // Final validation
    if (!Object.keys(Status).includes(newStatus)) {
      console.error("Invalid status after fallback:", newStatus);
      return;
    }

    if (feature.status === newStatus) {
      console.log("Status unchanged, skipping update");
      return;
    }

    console.log(
      "Updating feature status from",
      feature.status,
      "to",
      newStatus,
    );

    // Update the feature status
    setIsUpdatingStatus(true);
    try {
      const updateData = {
        id: featureId,
        title: feature.title,
        description: feature.description || undefined, // Convert null to undefined
        status: newStatus,
      };

      console.log("Sending update request:", updateData);

      const response = await fetch(`/api/feature/${featureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        console.log("Status update successful");
        // Update local state immediately for better UX
        setFeatures(
          (prev) =>
            prev.map((f) =>
              f.id === featureId
                ? { ...f, status: newStatus as Feature["status"] }
                : f,
            ) as Feature[],
        );

        // Play success sound
        playDropSound();

        // Animate the destination column counter
        setAnimatingCounter(newStatus);
        setTimeout(() => setAnimatingCounter(null), 600);

        // Refresh roadmap data to ensure consistency
        void fetchRoadmap();
      } else {
        const errorData = await response.json();
        console.error("Failed to update feature status:", errorData);
      }
    } catch (error) {
      console.error("Error updating feature status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/home")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded"></div>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                {roadmap.name}
              </h1>
              <Badge
                variant={roadmap.isPublic ? "default" : "secondary"}
                className="ml-2"
              >
                {roadmap.isPublic ? (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Public
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    Private
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage
                    src={session.user.image || "/placeholder.svg"}
                    alt={session.user.name}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {session.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground hidden sm:block">
                  {session.user.name}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Roadmap Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{roadmap.users?.length || 1} members</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Created {new Date(roadmap.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-border hover:bg-muted"
                onClick={() => {
                  setIsDeletedFeaturesOpen(true);
                  void fetchDeletedFeatures();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deleted Features
              </Button>
              <Dialog
                open={isEmbedDialogOpen}
                onOpenChange={setIsEmbedDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-border hover:bg-muted"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Embed Roadmap
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
                  <RoadmapEmbedConfig
                    roadmapId={roadmapId}
                    onSave={async (config) => {
                      try {
                        const response = await fetch(
                          `/api/roadmap/${roadmapId}`,
                          {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(config),
                          },
                        );
                        if (response.ok) {
                          setIsEmbedDialogOpen(false);
                        }
                      } catch (error) {
                        console.error("Failed to save embed config:", error);
                      }
                    }}
                    onFetchCurrentStyles={async () => {
                      try {
                        const response = await fetch(
                          `/api/roadmap/${roadmapId}`,
                        );
                        if (response.ok) {
                          const roadmapData = await response.json();
                          return roadmapData.embedStyles || null;
                        }
                        return null;
                      } catch (error) {
                        console.error(
                          "Failed to fetch current embed styles:",
                          error,
                        );
                        return null;
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>

              {/* Deleted Features Dialog */}
              <Dialog
                open={isDeletedFeaturesOpen}
                onOpenChange={setIsDeletedFeaturesOpen}
              >
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      Deleted Features
                    </DialogTitle>
                    <DialogDescription>
                      View, search, and restore deleted features. You can edit
                      and undelete features from this list.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="flex items-center space-x-2">
                      <Input
                        placeholder="Search deleted features..."
                        value={deletedSearchTerm}
                        onChange={(e) => setDeletedSearchTerm(e.target.value)}
                        className="flex-1"
                      />
                    </div>

                    {/* Deleted Features List */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                      {deletedFeatures
                        .filter(
                          (feature) =>
                            feature.title
                              .toLowerCase()
                              .includes(deletedSearchTerm.toLowerCase()) ||
                            (feature.description &&
                              feature.description
                                .toLowerCase()
                                .includes(deletedSearchTerm.toLowerCase())),
                        )
                        .map((feature) => (
                          <Card key={feature.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-sm leading-tight line-clamp-2">
                                  {feature.title}
                                </CardTitle>
                                {feature.description && (
                                  <CardDescription className="text-xs leading-relaxed line-clamp-3 mt-1">
                                    {feature.description}
                                  </CardDescription>
                                )}
                                <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                  <span>
                                    Deleted:{" "}
                                    {new Date(
                                      feature.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span>
                                    Votes: {feature.votes?.length || 0}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingFeature(feature);
                                    setEditFeatureData({
                                      title: feature.title,
                                      description: feature.description || "",
                                      status: feature.status as
                                        | "BACKLOG"
                                        | "NEXT_UP"
                                        | "IN_PROGRESS"
                                        | "DONE",
                                    });
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    handleUndeleteFeature(feature.id)
                                  }
                                >
                                  Restore
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}

                      {deletedFeatures.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Trash2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No deleted features found</p>
                        </div>
                      )}

                      {deletedFeatures.length > 0 &&
                        deletedFeatures.filter(
                          (feature) =>
                            feature.title
                              .toLowerCase()
                              .includes(deletedSearchTerm.toLowerCase()) ||
                            (feature.description &&
                              feature.description
                                .toLowerCase()
                                .includes(deletedSearchTerm.toLowerCase())),
                        ).length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No features match your search</p>
                          </div>
                        )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      Add New Feature
                    </DialogTitle>
                    <DialogDescription>
                      Create a new feature for your roadmap. You can always edit
                      the status and details later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Feature Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter feature title..."
                        value={newFeature.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewFeature((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="border-border focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this feature does..."
                        value={newFeature.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNewFeature((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="border-border focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Initial Status
                      </Label>
                      <Select
                        value={newFeature.status}
                        onValueChange={(value: keyof typeof Status) =>
                          setNewFeature((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="border-border focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(
                            ([status, config]) => (
                              <SelectItem key={status} value={status}>
                                <span className="mr-2">{config.icon}</span>
                                {config.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleDialogClose}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateFeature}
                      disabled={!newFeature.title.trim() || isCreating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isCreating ? "Creating..." : "Create Feature"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Features</h2>
            <div className="text-sm text-muted-foreground">
              {features.length} total features
              {isUpdatingStatus && (
                <span className="ml-2 text-blue-500">• Updating...</span>
              )}
            </div>
          </div>

          {/* Drag and Drop Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => {
              // Ensure we have a valid over target during drag
              if (event.over) {
                console.log("Drag over:", event.over.id);
                setIsOverDeleteZone(event.over.id === "delete-zone");
              }
            }}
            onDragCancel={() => {
              setActiveFeature(null);
              setIsDragging(false);
              setIsOverDeleteZone(false);
            }}
          >
            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[600px]">
              {Object.entries(statusConfig).map(([status, config]) => {
                const statusFeatures = getFeaturesByStatus(status);

                return (
                  <DroppableColumn
                    key={status}
                    status={status as keyof typeof Status}
                    config={config}
                    features={statusFeatures}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteFeature}
                    deletingFeatureId={deletingFeatureId}
                    isDragging={isDragging}
                    activeFeature={activeFeature}
                    onAddFeature={handleAddFeatureToStatus}
                    animatingCounter={animatingCounter}
                  />
                );
              })}
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeFeature ? (
                <div className="rotate-3 opacity-90 transform scale-105 shadow-2xl">
                  <DraggableFeatureCard
                    feature={activeFeature}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isDeleting={false}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Delete Drop Zone */}
          <DeleteDropZone
            isDragging={isDragging}
            isOverDeleteZone={isOverDeleteZone}
          />
          {/* Edit Feature Dialog */}
          {editingFeature && (
            <Dialog open={!!editingFeature} onOpenChange={closeEditDialog}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">
                    Edit Feature
                  </DialogTitle>
                  <DialogDescription>
                    Update the details of your feature. Changes will be saved
                    immediately.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-title" className="text-sm font-medium">
                      Feature Title *
                    </Label>
                    <Input
                      id="edit-title"
                      placeholder="Enter feature title..."
                      value={editFeatureData.title}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEditFeatureData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="border-border focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="edit-description"
                      className="text-sm font-medium"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="edit-description"
                      placeholder="Describe what this feature does..."
                      value={editFeatureData.description}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setEditFeatureData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="border-border focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="edit-status"
                      className="text-sm font-medium"
                    >
                      Status
                    </Label>
                    <Select
                      value={editFeatureData.status}
                      onValueChange={(value: keyof typeof Status) =>
                        setEditFeatureData((prev) => ({
                          ...prev,
                          status: value,
                        }))
                      }
                    >
                      <SelectTrigger className="border-border focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(
                          ([status, config]) => (
                            <SelectItem key={status} value={status}>
                              <span className="mr-2">{config.icon}</span>
                              {config.label}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={closeEditDialog}
                    disabled={isEditing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleEditFeature}
                    disabled={!editFeatureData.title.trim() || isEditing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isEditing ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Empty State */}
        {features.length === 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No features yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building your roadmap by adding the first feature. Break
                down your project into manageable pieces.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Feature
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                      Add Your First Feature
                    </DialogTitle>
                    <DialogDescription>
                      Create your first feature to start building your roadmap.
                      You can always edit the status and details later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Feature Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Enter feature title..."
                        value={newFeature.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewFeature((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="border-border focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="description"
                        className="text-sm font-medium"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this feature does..."
                        value={newFeature.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNewFeature((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="border-border focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="status" className="text-sm font-medium">
                        Initial Status
                      </Label>
                      <Select
                        value={newFeature.status}
                        onValueChange={(value: keyof typeof Status) =>
                          setNewFeature((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="border-border focus:ring-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusConfig).map(
                            ([status, config]) => (
                              <SelectItem key={status} value={status}>
                                <span className="text-lg mr-2">
                                  {config.icon}
                                </span>
                                {config.label}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={handleDialogClose}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateFeature}
                      disabled={!newFeature.title.trim() || isCreating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isCreating ? "Creating..." : "Create Feature"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
