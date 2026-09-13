import React, { useState } from 'react';

export function PSVelocityChart({ timeline, currentCount = 0, firstSeenAt }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // If no timeline records or empty
  if (!timeline || timeline.length === 0) {
    return (
      <div 
        className="brutalist-container" 
        style={{ 
          padding: '2.5rem 1.5rem', 
          textAlign: 'center', 
          background: 'var(--hover-bg)',
          border: '2px dashed var(--border-color)' 
        }}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          NO TIMELINE RECORDED YET
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', opacity: 0.8, maxWidth: '420px', margin: '0 auto' }}>
          This problem statement currently has {currentCount} submissions. The velocity tracker records each new submission increment detected during every 15-minute background cycle.
        </p>
      </div>
    );
  }

  // Prepare data points for SVG rendering
  // Ensure we include start point, all history records, and current count
  const points = [...timeline];
  
  // Sort chronologically
  points.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const minCount = 0;
  const maxCount = Math.max(currentCount, ...points.map((p) => p.newCount ?? 0), 5);
  
  const startTime = new Date(points[0].timestamp).getTime();
  const endTime = Math.max(Date.now(), new Date(points[points.length - 1].timestamp).getTime() + 3600000);
  const timeSpan = Math.max(86400000, endTime - startTime);

  const svgWidth = 680;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 25;
  const padBottom = 35;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  const getX = (timestamp) => {
    const t = new Date(timestamp).getTime();
    const progress = Math.min(1, Math.max(0, (t - startTime) / timeSpan));
    return padLeft + progress * chartWidth;
  };

  const getY = (count) => {
    const progress = (count - minCount) / (maxCount - minCount);
    return padTop + chartHeight - progress * chartHeight;
  };

  // Build SVG path string
  const coords = points.map((p) => ({
    x: getX(p.timestamp),
    y: getY(p.newCount),
    ...p,
  }));

  // Create area fill and line
  let linePath = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    // Stepped or line curve
    linePath += ` L ${coords[i].x} ${coords[i].y}`;
  }

  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${padTop + chartHeight} L ${coords[0].x} ${padTop + chartHeight} Z`;

  // Format date helper
  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="brutalist-container" style={{ padding: '1.25rem', background: 'var(--bg-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            SUBMISSION GROWTH CURVE
          </span>
          <span style={{ marginLeft: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.7 }}>
            ({points.length} recorded events)
          </span>
        </div>
        {hoveredPoint ? (
          <div style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.8rem', 
            fontWeight: 700,
            background: 'var(--text-color)', 
            color: 'var(--bg-color)', 
            padding: '0.2rem 0.6rem',
            border: '1px solid var(--border-color)'
          }}>
            {formatDateTime(hoveredPoint.timestamp)}: {hoveredPoint.newCount} ideas (+{hoveredPoint.increment || 1})
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', opacity: 0.6 }}>
            Hover data points for timestamp details
          </div>
        )}
      </div>

      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '460px' }}
        >
          {/* Background grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + chartHeight * pct;
            const countVal = Math.round(maxCount - pct * (maxCount - minCount));
            return (
              <g key={idx}>
                <line 
                  x1={padLeft} 
                  y1={y} 
                  x2={padLeft + chartWidth} 
                  y2={y} 
                  stroke="var(--border-color)" 
                  strokeOpacity="0.18" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={padLeft - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  fill="var(--text-color)" 
                  opacity="0.65" 
                  fontSize="10" 
                  fontFamily="var(--font-mono)"
                >
                  {countVal}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path 
            d={areaPath} 
            fill="var(--text-color)" 
            fillOpacity="0.08" 
          />

          {/* Line stroke */}
          <path 
            d={linePath} 
            fill="none" 
            stroke="var(--text-color)" 
            strokeWidth="3" 
            strokeLinecap="square"
          />

          {/* Interactive Data Points */}
          {coords.map((pt, i) => (
            <g 
              key={pt.id || i}
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={hoveredPoint?.id === pt.id ? 7 : 4.5} 
                fill="var(--bg-color)" 
                stroke="var(--text-color)" 
                strokeWidth={hoveredPoint?.id === pt.id ? 3 : 2.5} 
              />
              {/* Invisible larger hit target */}
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r={14} 
                fill="transparent" 
              />
            </g>
          ))}

          {/* X Axis labels */}
          {coords.length > 0 && (
            <>
              <text 
                x={coords[0].x} 
                y={svgHeight - 10} 
                textAnchor="start" 
                fill="var(--text-color)" 
                opacity="0.75" 
                fontSize="10" 
                fontFamily="var(--font-mono)" 
                fontWeight="600"
              >
                {formatDate(coords[0].timestamp)}
              </text>
              <text 
                x={coords[coords.length - 1].x} 
                y={svgHeight - 10} 
                textAnchor="end" 
                fill="var(--text-color)" 
                opacity="0.75" 
                fontSize="10" 
                fontFamily="var(--font-mono)" 
                fontWeight="600"
              >
                Today ({coords[coords.length - 1].newCount})
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}
