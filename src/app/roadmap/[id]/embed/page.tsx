"use client"

import React from 'react';
import { statusConfig } from '@/types/status.type';

interface EmbedPageProps {
  params: Promise<{ id: string }>
}

import { Feature } from '@/types/feature.type';

interface RoadmapData {
  id: string;
  name: string;
  createdAt: string;
  features: Feature[];
  embedStyles?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    statusColors?: {
      BACKLOG?: string;
      NEXT_UP?: string;
      IN_PROGRESS?: string;
      DONE?: string;
    };
  };
}

export default function EmbedPage({ params }: EmbedPageProps) {
  const [id, setId] = React.useState<string>("")
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    params.then(({ id: roadmapId }) => setId(roadmapId)).catch(console.error)
  }, [params])

  React.useEffect(() => {
    if (!isClient || !id) return

    async function loadRoadmap() {
      try {
        const response = await fetch(`/api/roadmap/${id}/embed`);
        if (response.ok) {
          const data = await response.json();
          renderRoadmap(data);
        } else {
          showError('Failed to load roadmap');
        }
      } catch (err) {
        console.error('Error loading roadmap:', err);
        showError('Error loading roadmap');
      }
    }

        function renderRoadmap(roadmap: RoadmapData) {
      const root = document.getElementById('roadmap-embed-root');
      if (!root) return;

      // Apply custom styles from the roadmap
      const styles = roadmap.embedStyles || {};
      if (styles.backgroundColor) {
        root.style.setProperty('--embed-bg-color', styles.backgroundColor);
      }
      if (styles.textColor) {
        root.style.setProperty('--embed-text-color', styles.textColor);
      }
      if (styles.borderColor) {
        root.style.setProperty('--embed-border-color', styles.borderColor);
      }
      if (styles.primaryColor) {
        root.style.setProperty('--embed-primary-color', styles.primaryColor);
      }

      // Use statusConfig from status.type.ts and add custom colors
      const statusConfigWithColors = Object.fromEntries(
        Object.entries(statusConfig).map(([key, config]) => [
          key,
          {
            ...config,
            color: styles.statusColors?.[key as keyof typeof styles.statusColors] ||
                   (key === 'BACKLOG' ? '#6b7280' :
                    key === 'NEXT_UP' ? '#3b82f6' :
                    key === 'IN_PROGRESS' ? '#f59e0b' :
                    key === 'DONE' ? '#10b981' : '#ef4444')
          }
        ])
      );

      let html = '<div class="roadmap-embed-container">';

      // Header
      html += '<div class="roadmap-embed-header">';
      html += '<h2 class="roadmap-embed-title">' + roadmap.name + '</h2>';
      html += '<div class="roadmap-embed-stats">';
      html += '<span>' + roadmap.features.length + ' features</span>';
      html += '<span>•</span>';
      html += '<span>Created ' + new Date(roadmap.createdAt).toLocaleDateString() + '</span>';
      html += '</div>';
      html += '</div>';

      // Status Overview Cards
      html += '<div class="roadmap-embed-overview">';
      Object.entries(statusConfigWithColors).forEach(([status, config]) => {
        const count = roadmap.features.filter((f: Feature) => f.status === status).length;
        html += '<div class="roadmap-embed-status-card">';
        html += '<div class="roadmap-embed-status-icon">' + config.icon + '</div>';
        html += '<div class="roadmap-embed-status-info">';
        html += '<span class="roadmap-embed-status-label">' + config.label + '</span>';
        html += '<span class="roadmap-embed-status-count">' + count + '</span>';
        html += '</div>';
        html += '</div>';
      });
      html += '</div>';

      // Kanban Board
      html += '<div class="roadmap-embed-kanban">';
      Object.entries(statusConfigWithColors).forEach(([status, config]) => {
        const statusFeatures = roadmap.features.filter((f: Feature) => f.status === status);

        html += '<div class="roadmap-embed-column">';

        // Column Header
        html += '<div class="roadmap-embed-column-header">';
        html += '<div class="roadmap-embed-column-title">';
        html += '<span class="roadmap-embed-column-icon">' + config.icon + '</span>';
        html += '<span class="roadmap-embed-column-label">' + config.label + '</span>';
        html += '</div>';
        html += '<div class="roadmap-embed-column-count">' + statusFeatures.length + '</div>';
        html += '</div>';

        // Column Content
        html += '<div class="roadmap-embed-column-content">';
        if (statusFeatures.length > 0) {
          statusFeatures.forEach((feature: Feature) => {
            html += '<div class="roadmap-embed-feature-card">';
            html += '<div class="roadmap-embed-feature-header">';
            html += '<h3 class="roadmap-embed-feature-title">' + feature.title + '</h3>';
            if (feature.description) {
              html += '<p class="roadmap-embed-feature-description">' + feature.description + '</p>';
            }
            html += '</div>';
            html += '<div class="roadmap-embed-feature-footer">';
            html += '<span class="roadmap-embed-feature-date">' + new Date(feature.createdAt).toLocaleDateString() + '</span>';
            html += '<span class="roadmap-embed-vote-badge">' + (feature.votes && feature.votes.length > 0 ? feature.votes.length : 0) + ' vote' + ((feature.votes && feature.votes.length !== 1) ? 's' : '') + '</span>';
            html += '</div>';
            html += '</div>';
          });
        } else {
          html += '<div class="roadmap-embed-empty-column">';
          html += '<div class="roadmap-embed-empty-icon">' + config.icon + '</div>';
          html += '<p class="roadmap-embed-empty-text">No features</p>';
          html += '</div>';
        }
        html += '</div>';

        html += '</div>';
      });
      html += '</div>';

      if (roadmap.features.length === 0) {
        html += '<div class="roadmap-embed-empty">';
        html += '<div class="roadmap-embed-empty-icon">🚀</div>';
        html += '<h3 class="roadmap-embed-empty-title">No features yet</h3>';
        html += '<p class="roadmap-embed-empty-description">This roadmap is empty. Check back later for updates.</p>';
        html += '</div>';
      }

      html += '</div>';
      root.innerHTML = html;
    }

    function showError(message: string) {
      const root = document.getElementById('roadmap-embed-root');
      if (!root) return;
      root.innerHTML = '<div class="roadmap-embed-error"><p>' + message + '</p></div>';
    }

    void loadRoadmap();
  }, [isClient, id])

  return (
    <div className="roadmap-embed-container">
      <style>{`
        .roadmap-embed-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: var(--embed-text-color, #1f2937);
          background-color: var(--embed-bg-color, #ffffff);
          border: 1px solid var(--embed-border-color, #e5e7eb);
          border-radius: 8px;
          padding: 1.5rem;
          max-width: 100%;
          margin: 0;
        }

        .roadmap-embed-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .roadmap-embed-title {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--embed-text-color, #1f2937);
        }

        .roadmap-embed-stats {
          font-size: 0.875rem;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.7;
        }

        .roadmap-embed-stats span {
          margin: 0 0.25rem;
        }

        .roadmap-embed-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .roadmap-embed-status-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.02);
          border-radius: 6px;
          border: 1px solid var(--embed-border-color, #e5e7eb);
        }

        .roadmap-embed-status-icon {
          font-size: 1.5rem;
        }

        .roadmap-embed-status-info {
          display: flex;
          flex-direction: column;
        }

        .roadmap-embed-status-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.7;
        }

        .roadmap-embed-status-count {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--embed-text-color, #1f2937);
        }

        /* Kanban Board Styles */
        .roadmap-embed-kanban {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 2rem;
        }

        @media (max-width: 1024px) {
          .roadmap-embed-kanban {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .roadmap-embed-column {
          display: flex;
          flex-direction: column;
          background-color: var(--embed-bg-color, #ffffff);
          border: 1px solid var(--embed-border-color, #e5e7eb);
          border-radius: 8px;
          min-height: 400px;
        }

        .roadmap-embed-column-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background-color: rgba(0, 0, 0, 0.02);
          border-bottom: 1px solid var(--embed-border-color, #e5e7eb);
          border-radius: 8px 8px 0 0;
        }

        .roadmap-embed-column-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .roadmap-embed-column-icon {
          font-size: 1.25rem;
        }

        .roadmap-embed-column-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--embed-text-color, #1f2937);
        }

        .roadmap-embed-column-count {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--embed-text-color, #1f2937);
          background-color: rgba(0, 0, 0, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: 9999px;
        }

        .roadmap-embed-column-content {
          flex: 1;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .roadmap-embed-empty-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 2rem;
          text-align: center;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.5;
        }

        .roadmap-embed-empty-column .roadmap-embed-empty-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .roadmap-embed-empty-text {
          font-size: 0.875rem;
          margin: 0;
        }

        .roadmap-embed-feature-card {
          border: 1px solid var(--embed-border-color, #e5e7eb);
          border-radius: 6px;
          background-color: var(--embed-bg-color, #ffffff);
          transition: all 0.2s ease;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .roadmap-embed-feature-card:hover {
          box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .roadmap-embed-feature-header {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .roadmap-embed-feature-title {
          font-size: 0.875rem;
          font-weight: 600;
          margin: 0;
          color: var(--embed-text-color, #1f2937);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .roadmap-embed-feature-description {
          font-size: 0.75rem;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.7;
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .roadmap-embed-feature-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.6;
          margin-top: auto;
        }

        .roadmap-embed-feature-date {
          font-size: 0.75rem;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.6;
        }

        .roadmap-embed-vote-badge {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          background-color: transparent;
          border: 1px solid var(--embed-border-color, #e5e7eb);
          color: var(--embed-text-color, #1f2937);
          opacity: 0.6;
        }

        .roadmap-embed-empty {
          text-align: center;
          padding: 3rem 1rem;
        }

        .roadmap-embed-empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .roadmap-embed-empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: var(--embed-text-color, #1f2937);
        }

        .roadmap-embed-empty-description {
          font-size: 0.875rem;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.7;
          margin: 0;
        }

        .roadmap-embed-loading,
        .roadmap-embed-error {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 200px;
          color: var(--embed-text-color, #1f2937);
          opacity: 0.7;
        }

        @media (max-width: 768px) {
          .roadmap-embed-container {
            padding: 1rem;
          }

          .roadmap-embed-overview {
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 0.75rem;
          }

          .roadmap-embed-kanban {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .roadmap-embed-column {
            min-height: 300px;
          }

          .roadmap-embed-title {
            font-size: 1.5rem;
          }

          .roadmap-embed-column-header {
            padding: 0.75rem;
          }

          .roadmap-embed-column-content {
            padding: 0.75rem;
          }

          .roadmap-embed-feature-card {
            padding: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .roadmap-embed-container {
            padding: 0.75rem;
          }

          .roadmap-embed-overview {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }

          .roadmap-embed-status-card {
            padding: 0.75rem;
            gap: 0.5rem;
          }

          .roadmap-embed-status-icon {
            font-size: 1.25rem;
          }

          .roadmap-embed-status-count {
            font-size: 1.25rem;
          }

          .roadmap-embed-title {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div id="roadmap-embed-root">
        <div className="roadmap-embed-loading">
          <div style={{width: '2rem', height: '2rem', backgroundColor: 'currentColor', borderRadius: '9999px', opacity: 0.7}}></div>
        </div>
      </div>
    </div>
  )
}
