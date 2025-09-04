"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check, RefreshCw, Eye, EyeOff } from "lucide-react"
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
  const [showPreview, setShowPreview] = useState(false)

  const fetchCurrentStyles = async () => {
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
  }

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

  // Fetch current styles when component mounts
  useEffect(() => {
    void fetchCurrentStyles()
  }, [])

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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(styles.statusColors || {}).map(([status, color]) => (
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
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults} disabled={isLoading}>
            Reset to Defaults
          </Button>
          <Button variant="outline" onClick={fetchCurrentStyles} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? "Loading..." : "Refresh"}
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>
                Copy this code to embed your roadmap on any website
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Hide Preview</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Show Preview</span>
                </>
              )}
            </Button>
          </div>
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
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your embedded roadmap will look with the current styling
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
                    Your Roadmap
                  </h2>
                  <div
                    className="text-sm opacity-70"
                    style={{ color: styles.textColor || '#1f2937' }}
                  >
                    <span>5 features</span>
                    <span className="mx-2">•</span>
                    <span>Created 2 days ago</span>
                  </div>
                </div>

                {/* Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {Object.entries(styles.statusColors || {}).map(([status, color]) => (
                    <div
                      key={status}
                      className="flex items-center gap-3 p-4 rounded-lg border"
                      style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        borderColor: styles.borderColor || '#e5e7eb'
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: color || '#6b7280' }}
                      >
                        {Status[status as keyof typeof Status]?.emoji}
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium opacity-70 capitalize"
                          style={{ color: styles.textColor || '#1f2937' }}
                        >
                          {status.replace('_', ' ')}
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: styles.textColor || '#1f2937' }}
                        >
                          {Math.floor(Math.random() * 5) + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Features Section */}
                <div className="space-y-6">
                  {Object.entries(styles.statusColors || {}).slice(0, 2).map(([status, color]) => (
                    <div key={status} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-white font-medium px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: color || '#6b7280' }}
                        >
                          <span className="mr-1">
                            {Status[status as keyof typeof Status]?.emoji}
                          </span>
                          {status.replace('_', ' ')}
                        </span>
                        <span
                          className="text-sm opacity-70"
                          style={{ color: styles.textColor || '#1f2937' }}
                        >
                          {Math.floor(Math.random() * 3) + 1} feature{Math.floor(Math.random() * 3) + 1 !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map((i) => (
                          <div
                            key={i}
                            className="border rounded-lg p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                            style={{
                              backgroundColor: styles.backgroundColor || '#ffffff',
                              borderColor: styles.borderColor || '#e5e7eb'
                            }}
                          >
                            <div className="mb-3">
                              <h3
                                className="text-lg font-semibold mb-2"
                                style={{ color: styles.textColor || '#1f2937' }}
                              >
                                Sample Feature {i}
                              </h3>
                              <p
                                className="text-sm opacity-70 leading-relaxed"
                                style={{ color: styles.textColor || '#1f2937' }}
                              >
                                This is how your feature cards will look with the current styling applied.
                              </p>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span
                                className="opacity-60"
                                style={{ color: styles.textColor || '#1f2937' }}
                              >
                                Created 2 days ago
                              </span>
                              <span
                                className="px-2 py-1 rounded-full border"
                                style={{
                                  color: styles.textColor || '#1f2937',
                                  borderColor: styles.borderColor || '#e5e7eb'
                                }}
                              >
                                {Math.floor(Math.random() * 10) + 1} votes
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              💡 This preview updates in real-time as you change colors
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
