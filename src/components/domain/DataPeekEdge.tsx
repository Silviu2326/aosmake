import React, { useState } from 'react';
import { BaseEdge, EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

export const DataPeekEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const outputPreview = data?.output 
    ? (typeof data.output === 'string' ? data.output : JSON.stringify(data.output, null, 2)) 
    : null;

  // Truncate if too long
  const displayContent = outputPreview 
    ? (outputPreview.length > 300 ? outputPreview.substring(0, 300) + '...' : outputPreview)
    : 'No data flowed yet';

  return (
    <>
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ 
            ...style, 
            strokeWidth: isHovered ? 3 : 2, 
            stroke: isHovered ? '#a855f7' : (style.stroke || '#555'),
            transition: 'stroke 0.2s, stroke-width 0.2s' 
        }} 
      />
      
      {/* Invisible interaction path to make hovering easier */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      {isHovered && outputPreview && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl p-3 max-w-[300px] backdrop-blur-md">
                <div className="flex items-center gap-2 mb-1 border-b border-white/5 pb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Data Payload</span>
                </div>
                <pre className="text-[10px] text-gray-300 font-mono whitespace-pre-wrap break-all max-h-[200px] overflow-hidden">
                    {displayContent}
                </pre>
                {outputPreview.length > 300 && (
                     <div className="text-[9px] text-gray-500 mt-1 italic text-center">
                         (Content truncated)
                     </div>
                )}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
