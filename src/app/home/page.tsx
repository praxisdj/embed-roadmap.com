"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface RoadmapWithRelations {
  id: string
  name: string
  isPublic: boolean
  createdAt: string
  deletedAt: string | null
  features?: Array<{ id: string; name: string }>
  users?: Array<{ id: string; name: string }>
}

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [roadmaps, setRoadmaps] = useState<RoadmapWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRoadmap, setNewRoadmap] = useState({
    name: "",
    isPublic: false
  })
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      void fetchRoadmaps()
    }
  }, [status, session])

  const fetchRoadmaps = async () => {
    try {
      const response = await fetch("/api/roadmap")
      if (response.ok) {
        const data = await response.json()
        setRoadmaps(data)
      }
    } catch (error) {
      console.error("Failed to fetch roadmaps:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoadmap = async () => {
    if (!newRoadmap.name.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRoadmap.name.trim(),
          isPublic: newRoadmap.isPublic,
          users: [session?.user?.id]
        }),
      })

      if (response.ok) {
        const createdRoadmap = await response.json()
        setRoadmaps(prev => [createdRoadmap, ...prev])
        setIsDialogOpen(false)
        setNewRoadmap({ name: "", isPublic: false })
      } else {
        console.error("Failed to create roadmap")
      }
    } catch (error) {
      console.error("Error creating roadmap:", error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setNewRoadmap({ name: "", isPublic: false })
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-primary rounded-full"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-primary-foreground rounded"></div>
              </div>
              <h1 className="text-xl font-bold text-foreground">ShareRoadmap</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={session.user.image || "/placeholder.svg"} alt={session.user.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {session.user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground hidden sm:block">{session.user.name}</span>
              </div>
              <Button onClick={() => signOut()} variant="outline" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground text-balance">
              Welcome back, {session.user.name?.split(" ")[0]}!
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready to explore what&apos;s new? Here&apos;s your personalized dashboard with everything you need.
            </p>
          </div>

          {/* Roadmaps Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-foreground">Your Roadmaps</h3>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    Create New Roadmap
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Roadmap</DialogTitle>
                    <DialogDescription>
                      Start planning your next project with a beautiful roadmap. You can always edit these details later.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Roadmap Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter roadmap name..."
                        value={newRoadmap.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoadmap(prev => ({ ...prev, name: e.target.value }))}
                        className="border-border focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Public Roadmap</Label>
                        <p className="text-xs text-muted-foreground">
                          Make this roadmap visible to other users
                        </p>
                      </div>
                      <Switch
                        checked={newRoadmap.isPublic}
                        onCheckedChange={(checked: boolean) => setNewRoadmap(prev => ({ ...prev, isPublic: checked }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={handleDialogClose} disabled={isCreating}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRoadmap}
                      disabled={!newRoadmap.name.trim() || isCreating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isCreating ? "Creating..." : "Create Roadmap"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-3">
                      <div className="w-12 h-12 bg-muted rounded-xl mb-2"></div>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-10 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : roadmaps.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-muted-foreground rounded"></div>
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">No roadmaps yet</h4>
                  <p className="text-muted-foreground mb-4">
                    Create your first roadmap to get started with project planning
                  </p>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90">
                        Create Your First Roadmap
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Create Your First Roadmap</DialogTitle>
                        <DialogDescription>
                          Start planning your next project with a beautiful roadmap. You can always edit these details later.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Roadmap Name
                          </Label>
                          <Input
                            id="name"
                            placeholder="Enter roadmap name..."
                            value={newRoadmap.name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoadmap(prev => ({ ...prev, name: e.target.value }))}
                            className="border-border focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Public Roadmap</Label>
                            <p className="text-xs text-muted-foreground">
                              Make this roadmap visible to other users
                            </p>
                          </div>
                          <Switch
                            checked={newRoadmap.isPublic}
                            onCheckedChange={(checked: boolean) => setNewRoadmap(prev => ({ ...prev, isPublic: checked }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={handleDialogClose} disabled={isCreating}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateRoadmap}
                          disabled={!newRoadmap.name.trim() || isCreating}
                          className="bg-primary hover:bg-primary/90"
                        >
                          {isCreating ? "Creating..." : "Create Roadmap"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roadmaps.map((roadmap) => (
                  <Card key={roadmap.id} className="hover:shadow-lg transition-all duration-200 border-0 bg-card">
                    <CardHeader className="pb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <div className="w-6 h-6 bg-primary rounded-md"></div>
                      </div>
                      <CardTitle className="text-xl">{roadmap.name}</CardTitle>
                      <CardDescription>
                        {roadmap.isPublic ? "Public roadmap" : "Private roadmap"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{roadmap.features?.length || 0} features</span>
                        <span>{roadmap.users?.length || 0} members</span>
                      </div>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => router.push(`/roadmap/${roadmap.id}`)}
                      >
                        View Roadmap
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
