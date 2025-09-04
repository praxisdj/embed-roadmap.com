"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { statusConfig } from "@/types/status.type"
import "./RoadmapEmbed.css"
import { Feature } from "@/types/feature.type"

interface RoadmapEmbedData {
  id: string
  name: string
  createdAt: string
  features: Feature[]
  embedStyles: {
    primaryColor: string
    backgroundColor: string
    textColor: string
    borderColor: string
    statusColors: Record<string, string>
  }
}

interface RoadmapEmbedProps {
  roadmapId: string
  className?: string
}

export default function RoadmapEmbed({ roadmapId, className }: RoadmapEmbedProps) {
  const [roadmap, setRoadmap] = useState<RoadmapEmbedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const response = await fetch(`/api/roadmap/${roadmapId}/embed`)
        if (response.ok) {
          const data = await response.json()
          setRoadmap(data)
          // Apply custom styles
          applyCustomStyles(data.embedStyles)
        } else {
          setError("Failed to load roadmap")
        }
      } catch (error) {
        console.error("Error loading roadmap:", error)
        setError("Error loading roadmap")
      } finally {
        setLoading(false)
      }
    }

    if (roadmapId) {
      void fetchRoadmap()
    }
  }, [roadmapId])

  const applyCustomStyles = (styles: RoadmapEmbedData['embedStyles']) => {
    const root = document.documentElement
    root.style.setProperty('--roadmap-primary-color', styles.primaryColor)
    root.style.setProperty('--roadmap-background-color', styles.backgroundColor)
    root.style.setProperty('--roadmap-text-color', styles.textColor)
    root.style.setProperty('--roadmap-border-color', styles.borderColor)

    // Set status colors
    Object.entries(styles.statusColors).forEach(([status, color]) => {
      root.style.setProperty(`--roadmap-status-${status.toLowerCase()}-color`, color)
    })
  }

  const getStatusCount = (status: string) => {
    return roadmap?.features.filter((feature: Feature) => feature.status === status).length || 0
  }

  const getFeaturesByStatus = (status: string) => {
    return roadmap?.features.filter((feature: Feature) => feature.status === status) || []
  }

  if (loading) {
    return (
      <div className="roadmap-embed-loading">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-current rounded-full"></div>
        </div>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="roadmap-embed-error">
        <p>Unable to load roadmap</p>
      </div>
    )
  }

  return (
    <div className={`roadmap-embed ${className || ''}`}>
      {/* Header */}
      <div className="roadmap-embed-header">
        <h2 className="roadmap-embed-title">{roadmap.name}</h2>
        <div className="roadmap-embed-stats">
          <span>{roadmap.features.length} features</span>
          <span>•</span>
          <span>Created {new Date(roadmap.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Status Overview */}
      <div className="roadmap-embed-overview">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = getStatusCount(status)
          if (count === 0) return null

          return (
            <div key={status} className="roadmap-embed-status-card">
              <div className="roadmap-embed-status-icon">{config.icon}</div>
              <div className="roadmap-embed-status-info">
                <span className="roadmap-embed-status-label">{config.label}</span>
                <span className="roadmap-embed-status-count">{count}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Features by Status */}
      <div className="roadmap-embed-features">
        {Object.entries(statusConfig).map(([status, config]) => {
          const statusFeatures = getFeaturesByStatus(status)
          if (statusFeatures.length === 0) return null

          return (
            <div key={status} className="roadmap-embed-status-section">
              <div className="roadmap-embed-status-header">
                <Badge
                  className="roadmap-embed-status-badge"
                  style={{ backgroundColor: `var(--roadmap-status-${status.toLowerCase()}-color)` }}
                >
                  <span className="mr-1">{config.icon}</span>
                  {config.label}
                </Badge>
                <span className="roadmap-embed-feature-count">
                  {statusFeatures.length} feature{statusFeatures.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="roadmap-embed-feature-grid">
                {statusFeatures.map((feature) => (
                  <Card key={feature.id} className="roadmap-embed-feature-card">
                    <CardHeader className="roadmap-embed-feature-header">
                      <CardTitle className="roadmap-embed-feature-title">
                        {feature.title}
                      </CardTitle>
                      {feature.description && (
                        <CardDescription className="roadmap-embed-feature-description">
                          {feature.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="roadmap-embed-feature-content">
                      <div className="roadmap-embed-feature-meta">
                        <span className="roadmap-embed-feature-date">
                          {new Date(feature.createdAt).toLocaleDateString()}
                        </span>
                        <Badge variant="outline" className="roadmap-embed-vote-badge">
                          {(feature.votes && feature.votes.length > 0 ? feature.votes.length : 0)} vote{(feature.votes && feature.votes.length !== 1 ? 's' : '')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {roadmap.features.length === 0 && (
        <div className="roadmap-embed-empty">
          <div className="roadmap-embed-empty-icon">🚀</div>
          <h3 className="roadmap-embed-empty-title">No features yet</h3>
          <p className="roadmap-embed-empty-description">
            This roadmap is empty. Check back later for updates.
          </p>
        </div>
      )}
    </div>
  )
}
