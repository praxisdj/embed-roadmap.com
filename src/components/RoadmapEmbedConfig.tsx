"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"
import { EmbedStyles } from "@/types/roadmap.type"
import { Status } from "@/types/status.type"

interface RoadmapEmbedConfigProps {
  roadmapId: string
  currentStyles?: EmbedStyles
  onSave: (config: {
    embedStyles: EmbedStyles
  }) => Promise<void>
  onFetchCurrentStyles?: () => Promise<EmbedStyles | null>
}

const defaultStyles: EmbedStyles = {
  primaryColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  borderColor: "#e5e7eb",
  statusColors: Object.fromEntries(
    Object.entries(Status).map(([key]) => [
      key,
      key === 'BACKLOG' ? "#6b7280" :
      key === 'NEXT_UP' ? "#3b82f6" :
      key === 'IN_PROGRESS' ? "#f59e0b" :
      key === 'DONE' ? "#10b981" : "#ef4444"
    ])
  )
}

export default function RoadmapEmbedConfig({
  roadmapId,
  currentStyles = defaultStyles,
  onSave,
  onFetchCurrentStyles
}: RoadmapEmbedConfigProps) {
  const [styles, setStyles] = useState<EmbedStyles>(currentStyles)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchCurrentStyles = useCallback(async () => {
    if (!onFetchCurrentStyles) return

    setIsLoading(true)
    try {
      const currentStyles = await onFetchCurrentStyles()
      if (currentStyles) {
        setStyles(currentStyles)
      }
    } catch (error) {
      console.error('Failed to fetch current embed styles:', error)
    } finally {
      setIsLoading(false)
    }
  }, [onFetchCurrentStyles])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave({
        embedStyles: styles
      })
    } finally {
      setIsSaving(false)
    }
  }

  const copyEmbedCode = () => {
    const embedCode = `<iframe
  src="${window.location.origin}/roadmap/${roadmapId}/embed"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</iframe>`

    void navigator.clipboard.writeText(embedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const updateStatusColor = (status: keyof EmbedStyles['statusColors'], color: string) => {
    setStyles(prev => ({
      ...prev,
      statusColors: {
        ...prev.statusColors,
        [status]: color
      }
    }))
  }

  const resetToDefaults = () => {
    setStyles(defaultStyles)
  }

  // Helper function to get status colors with fallback
  const getStatusColors = (): Record<string, string> => {
    return styles.statusColors || defaultStyles.statusColors || {}
  }

  // Fetch current styles when component mounts
  useEffect(() => {
    void fetchCurrentStyles()
  }, [fetchCurrentStyles])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Customize Embed Colors</h2>
        <p className="text-muted-foreground">
          Configure the colors of your embedded roadmap
        </p>
      </div>

      {/* Color Configuration */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
            <CardDescription>
              Customize the main colors of your embedded roadmap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={styles.primaryColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={styles.primaryColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={styles.backgroundColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={styles.backgroundColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, backgroundColor: e.target.value }))}
                    placeholder="#ffffff"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={styles.textColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, textColor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={styles.textColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, textColor: e.target.value }))}
                    placeholder="#1f2937"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="borderColor">Border Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="borderColor"
                    type="color"
                    value={styles.borderColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, borderColor: e.target.value }))}
                    className="w-16 h-10"
                  />
                  <Input
                    value={styles.borderColor}
                    onChange={(e) => setStyles(prev => ({ ...prev, borderColor: e.target.value }))}
                    placeholder="#e5e7eb"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Colors</CardTitle>
            <CardDescription>
              Customize colors for each feature status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(getStatusColors()).map(([status, color]) => (
                <div key={status} className="space-y-2">
                  <Label htmlFor={`status-${status}`} className="capitalize">
                    {status.replace('_', ' ')}
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id={`status-${status}`}
                      type="color"
                      value={color}
                      onChange={(e) => updateStatusColor(status as keyof EmbedStyles['statusColors'], e.target.value)}
                      className="w-12 h-8"
                    />
                    <Input
                      value={color}
                      onChange={(e) => updateStatusColor(status as keyof EmbedStyles['statusColors'], e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={resetToDefaults} disabled={isLoading}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <Button onClick={copyEmbedCode} variant="secondary" className="flex items-center space-x-2">
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Embed Code</span>
            </>
          )}
        </Button>
      </div>

      {/* Embed Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Embed Code</CardTitle>
          <CardDescription>
            Copy this code to embed your roadmap on any website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-3 rounded-md font-mono text-sm">
            {`<iframe
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/roadmap/${roadmapId}/embed"
  width="100%"
  height="600"
  frameborder="0">
</iframe>`}
          </div>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
          <CardHeader>
            <CardTitle>Kanban Board Preview</CardTitle>
            <CardDescription>
              See how your embedded roadmap will look with the current styling in Kanban board format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-border rounded-lg overflow-hidden bg-muted/20">
              <div className="bg-muted px-3 py-2 text-xs text-muted-foreground border-b border-border">
                Preview - Your embedded roadmap
              </div>
              <div
                className="roadmap-embed-preview"
                style={{
                  backgroundColor: styles.backgroundColor || '#ffffff',
                  color: styles.textColor || '#1f2937',
                  borderColor: styles.borderColor || '#e5e7eb',
                  padding: '1.5rem',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  minHeight: '500px'
                }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <h2
                    className="text-3xl font-bold mb-2"
                    style={{ color: styles.textColor || '#1f2937' }}
                  >
                    Product Roadmap
                  </h2>
                  <div
                    className="text-sm opacity-70"
                    style={{ color: styles.textColor || '#1f2937' }}
                  >
                    <span>12 features</span>
                    <span className="mx-2">•</span>
                    <span>Updated 1 day ago</span>
                    <span className="mx-2">•</span>
                    <span>3 team members</span>
                  </div>
                </div>

                {/* Kanban Board Preview */}
                <div className="grid grid-cols-4 gap-4 min-h-[400px]">
                  {Object.entries(getStatusColors()).map(([status, color]) => {
                    const mockFeatures = {
                      BACKLOG: [
                        { title: "User Authentication", description: "Implement secure login and registration system", votes: 12 },
                        { title: "Dark Mode Toggle", description: "Add theme switching capability", votes: 8 },
                        { title: "Mobile Responsive Design", description: "Optimize layout for mobile devices", votes: 15 }
                      ],
                      NEXT_UP: [
                        { title: "API Integration", description: "Connect frontend with backend services", votes: 6 },
                        { title: "Data Validation", description: "Add form validation and error handling", votes: 9 }
                      ],
                      IN_PROGRESS: [
                        { title: "Dashboard Analytics", description: "Create comprehensive analytics dashboard", votes: 4 },
                        { title: "Real-time Notifications", description: "Implement push notification system", votes: 7 }
                      ],
                      DONE: [
                        { title: "Project Setup", description: "Initialize project structure and dependencies", votes: 3 },
                        { title: "Basic UI Components", description: "Create reusable UI component library", votes: 5 }
                      ]
                    }

                    const features = mockFeatures[status as keyof typeof mockFeatures] || []

                    return (
                      <div key={status} className="space-y-4 p-4 rounded-lg border" style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderColor: styles.borderColor || '#e5e7eb'
                      }}>
                        {/* Column Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                              style={{ backgroundColor: color || '#6b7280' }}
                            >
                              {Status[status as keyof typeof Status]?.emoji}
                            </div>
                            <div>
                              <h3
                                className="font-semibold text-sm capitalize"
                                style={{ color: styles.textColor || '#1f2937' }}
                              >
                                {status.replace('_', ' ')}
                              </h3>
                              <p
                                className="text-xs opacity-60"
                                style={{ color: styles.textColor || '#1f2937' }}
                              >
                                {features.length} feature{features.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Feature Cards */}
                        <div className="space-y-3">
                          {features.map((feature, index) => (
                            <div
                              key={index}
                              className="border rounded-lg p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                              style={{
                                backgroundColor: styles.backgroundColor || '#ffffff',
                                borderColor: styles.borderColor || '#e5e7eb'
                              }}
                            >
                              <div className="mb-3">
                                <h4
                                  className="font-medium text-sm mb-2 line-clamp-2"
                                  style={{ color: styles.textColor || '#1f2937' }}
                                >
                                  {feature.title}
                                </h4>
                                <p
                                  className="text-xs opacity-70 leading-relaxed line-clamp-2"
                                  style={{ color: styles.textColor || '#1f2937' }}
                                >
                                  {feature.description}
                                </p>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span
                                  className="opacity-60"
                                  style={{ color: styles.textColor || '#1f2937' }}
                                >
                                  {Math.floor(Math.random() * 7) + 1} days ago
                                </span>
                                <div className="flex items-center gap-1">
                                  <span
                                    className="px-2 py-1 rounded-full border"
                                    style={{
                                      color: styles.textColor || '#1f2937',
                                      borderColor: styles.borderColor || '#e5e7eb',
                                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                    }}
                                  >
                                    {feature.votes} votes
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              💡 This Kanban board preview updates in real-time as you change colors
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
