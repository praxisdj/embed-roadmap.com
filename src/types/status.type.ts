export const Status = {
  BACKLOG: {
    emoji: "📋",
    label: "Backlog",
    description: "Features that are not yet started",
    color: "bg-muted text-muted-foreground",
  },
  NEXT_UP: {
    emoji: "⏭️",
    label: "Next Up",
    description: "Features that are scheduled for the next release",
    color: "bg-blue-500 text-white",
  },
  IN_PROGRESS: {
    emoji: "🚧",
    label: "In Progress",
    description: "Features that are currently being worked on",
    color: "bg-yellow-500 text-white",
  },
  DONE: {
    emoji: "✅",
    label: "Done",
    description: "Features that are completed",
    color: "bg-green-500 text-white",
  },
};

export const statusKeys = Object.keys(Status) as (keyof typeof Status)[];

export const statusConfig = Object.fromEntries(
  Object.entries(Status).map(([key, config]) => [
    key,
    { label: config.label, icon: config.emoji },
  ]),
);
