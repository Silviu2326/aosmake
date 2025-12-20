import React, { memo } from 'react';
import { NodeProps, Handle, Position, NodeResizer } from 'reactflow';

const GroupNode = ({ data, selected }: NodeProps) => {
  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={100} 
        isVisible={selected} 
        lineStyle={{ border: '1px solid #7c3aed' }} 
        handleStyle={{ width: 8, height: 8, borderRadius: '50%' }}
      />
      <div 
        className={`relative w-full h-full rounded-lg transition-colors duration-200 ${
          selected ? 'bg-purple-500/10 border-purple-500/50' : 'bg-white/5 border-white/10'
        }`}
        style={{ 
            borderWidth: 2, 
            borderStyle: 'dashed',
            zIndex: -1 
        }}
      >
        <div className="absolute -top-6 left-0 px-2 py-1 bg-purple-500/20 rounded text-[10px] font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-2 backdrop-blur-md border border-purple-500/20">
            {data.label || 'Group'}
        </div>
      </div>
    </>
  );
};

export default memo(GroupNode);