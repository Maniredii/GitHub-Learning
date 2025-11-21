import React, { useState } from 'react';
import type { Chapter } from '../../../shared/src/types';
import './ProgressMap.css';

export interface ProgressMapProps {
  chapters: Chapter[];
  completedChapters: string[];
  currentChapter: string | null;
  onChapterClick?: (chapterId: string) => void;
}

interface RegionPath {
  id: string;
  path: string;
  x: number;
  y: number;
  theme: 'caves' | 'forest' | 'mountains' | 'library' | 'council' | 'audition' | 'epilogue';
}

// SVG path definitions for each chapter region
const REGION_PATHS: RegionPath[] = [
  {
    id: 'chapter-1',
    path: 'M 50 350 Q 80 320 120 330 L 150 360 Q 130 380 100 370 Z',
    x: 100,
    y: 350,
    theme: 'caves',
  },
  {
    id: 'chapter-2',
    path: 'M 180 320 Q 220 300 250 320 L 270 350 Q 240 370 210 350 Z',
    x: 225,
    y: 330,
    theme: 'caves',
  },
  {
    id: 'chapter-3',
    path: 'M 300 280 Q 340 260 380 280 L 400 320 Q 360 340 320 320 Z',
    x: 350,
    y: 300,
    theme: 'caves',
  },
  {
    id: 'chapter-4',
    path: 'M 430 250 Q 470 230 510 250 L 530 290 Q 490 310 450 290 Z',
    x: 480,
    y: 270,
    theme: 'forest',
  },
  {
    id: 'chapter-5',
    path: 'M 560 200 Q 600 180 640 200 L 660 240 Q 620 260 580 240 Z',
    x: 610,
    y: 220,
    theme: 'forest',
  },
  {
    id: 'chapter-6',
    path: 'M 690 150 Q 730 130 770 150 L 790 190 Q 750 210 710 190 Z',
    x: 740,
    y: 170,
    theme: 'mountains',
  },
  {
    id: 'chapter-7',
    path: 'M 820 100 Q 860 80 900 100 L 920 140 Q 880 160 840 140 Z',
    x: 870,
    y: 120,
    theme: 'library',
  },
  {
    id: 'chapter-8',
    path: 'M 950 50 Q 990 30 1030 50 L 1050 90 Q 1010 110 970 90 Z',
    x: 1000,
    y: 70,
    theme: 'council',
  },
  {
    id: 'chapter-9',
    path: 'M 1080 20 Q 1120 10 1150 30 L 1160 70 Q 1130 85 1100 65 Z',
    x: 1120,
    y: 45,
    theme: 'audition',
  },
];

const THEME_COLORS = {
  caves: {
    locked: '#4a5568',
    unlocked: '#805ad5',
    current: '#9f7aea',
    completed: '#6b46c1',
  },
  forest: {
    locked: '#4a5568',
    unlocked: '#38a169',
    current: '#48bb78',
    completed: '#2f855a',
  },
  mountains: {
    locked: '#4a5568',
    unlocked: '#3182ce',
    current: '#4299e1',
    completed: '#2c5282',
  },
  library: {
    locked: '#4a5568',
    unlocked: '#d69e2e',
    current: '#ecc94b',
    completed: '#b7791f',
  },
  council: {
    locked: '#4a5568',
    unlocked: '#e53e3e',
    current: '#fc8181',
    completed: '#c53030',
  },
  audition: {
    locked: '#4a5568',
    unlocked: '#dd6b20',
    current: '#ed8936',
    completed: '#c05621',
  },
  epilogue: {
    locked: '#4a5568',
    unlocked: '#805ad5',
    current: '#9f7aea',
    completed: '#6b46c1',
  },
};

export const ProgressMap: React.FC<ProgressMapProps> = ({
  chapters,
  completedChapters,
  currentChapter,
  onChapterClick,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const isChapterUnlocked = (chapter: Chapter): boolean => {
    // First chapter is always unlocked
    if (chapter.order === 1) return true;

    // Check if previous chapter is completed
    const previousChapter = chapters.find((c) => c.order === chapter.order - 1);
    if (previousChapter && !completedChapters.includes(previousChapter.id)) {
      return false;
    }

    return true;
  };

  const getRegionStatus = (chapterId: string): 'locked' | 'unlocked' | 'current' | 'completed' => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return 'locked';

    if (!isChapterUnlocked(chapter)) return 'locked';
    if (completedChapters.includes(chapterId)) return 'completed';
    if (currentChapter === chapterId) return 'current';
    return 'unlocked';
  };

  const getRegionColor = (regionPath: RegionPath, status: string): string => {
    const colors = THEME_COLORS[regionPath.theme];
    return colors[status as keyof typeof colors] || colors.locked;
  };

  const handleRegionClick = (chapterId: string) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter && isChapterUnlocked(chapter) && onChapterClick) {
      onChapterClick(chapterId);
    }
  };

  const handleRegionMouseEnter = (chapterId: string, event: React.MouseEvent<SVGPathElement>) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (chapter) {
      setHoveredRegion(chapterId);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }
  };

  const handleRegionMouseLeave = () => {
    setHoveredRegion(null);
  };

  const hoveredChapter = hoveredRegion ? chapters.find((c) => c.id === hoveredRegion) : null;

  return (
    <div className="progress-map" role="region" aria-label="Quest progress map">
      <svg 
        viewBox="0 0 1200 400" 
        className="progress-map__svg" 
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Visual representation of quest chapters and progress"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="mapBackground" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#2d3748" />
          </linearGradient>

          {/* Glow filters for different states */}
          <filter id="glowCurrent" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glowUnlocked" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background */}
        <rect width="1200" height="400" fill="url(#mapBackground)" />

        {/* Path connecting regions */}
        <path
          d="M 100 350 Q 225 330 350 300 Q 480 270 610 220 Q 740 170 870 120 Q 1000 70 1120 45"
          stroke="#4a5568"
          strokeWidth="3"
          fill="none"
          strokeDasharray="5,5"
          opacity="0.5"
        />

        {/* Chapter regions */}
        {REGION_PATHS.map((regionPath) => {
          const status = getRegionStatus(regionPath.id);
          const color = getRegionColor(regionPath, status);
          const isUnlocked = status !== 'locked';
          const isCurrent = status === 'current';

          return (
            <g key={regionPath.id}>
              <path
                d={regionPath.path}
                fill={color}
                stroke={isCurrent ? '#fff' : color}
                strokeWidth={isCurrent ? 3 : 2}
                className={`progress-map__region ${isUnlocked ? 'progress-map__region--unlocked' : 'progress-map__region--locked'}`}
                filter={
                  isCurrent ? 'url(#glowCurrent)' : isUnlocked ? 'url(#glowUnlocked)' : 'none'
                }
                onClick={() => handleRegionClick(regionPath.id)}
                onMouseEnter={(e) => handleRegionMouseEnter(regionPath.id, e)}
                onMouseLeave={handleRegionMouseLeave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRegionClick(regionPath.id);
                  }
                }}
                style={{
                  cursor: isUnlocked ? 'pointer' : 'not-allowed',
                  opacity: status === 'locked' ? 0.4 : 1,
                }}
                role="button"
                tabIndex={isUnlocked ? 0 : -1}
                aria-label={`${chapters.find(c => c.id === regionPath.id)?.title || 'Chapter'} - ${status === 'completed' ? 'Completed' : status === 'current' ? 'Current chapter' : status === 'unlocked' ? 'Available' : 'Locked'}`}
                aria-disabled={!isUnlocked}
              />

              {/* Region icon/marker */}
              <circle
                cx={regionPath.x}
                cy={regionPath.y}
                r={8}
                fill={isCurrent ? '#fff' : '#1a202c'}
                stroke={color}
                strokeWidth={2}
                pointerEvents="none"
              />

              {/* Checkmark for completed chapters */}
              {status === 'completed' && (
                <text
                  x={regionPath.x}
                  y={regionPath.y + 5}
                  textAnchor="middle"
                  fill="#fff"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  ✓
                </text>
              )}

              {/* Lock icon for locked chapters */}
              {status === 'locked' && (
                <text
                  x={regionPath.x}
                  y={regionPath.y + 5}
                  textAnchor="middle"
                  fill="#718096"
                  fontSize="12"
                  pointerEvents="none"
                >
                  🔒
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredChapter && (
        <div
          className="progress-map__tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
          }}
        >
          <div className="progress-map__tooltip-title">{hoveredChapter.title}</div>
          <div className="progress-map__tooltip-description">{hoveredChapter.description}</div>
          {hoveredChapter.isPremium && (
            <div className="progress-map__tooltip-premium">Premium Content</div>
          )}
        </div>
      )}
    </div>
  );
};
