import React, { useCallback } from 'react';
import ReactFlow, { 
  Node, 
  Edge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  Background, 
  Controls, 
  MiniMap,
  ConnectionMode
} from 'reactflow';
import CustomNode from './CustomNode';
import 'reactflow/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
};

interface NodeGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
}

export const NodeGraph: React.FC<NodeGraphProps> = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect,
  onNodeClick
}) => {
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-[#0D0D0D]"
      >
        <Background color="#333" gap={20} size={1} />
        <Controls className="bg-surface border border-white/10 text-gray-400" />
        <MiniMap 
            nodeColor="#333" 
            maskColor="rgba(0, 0, 0, 0.6)" 
            className="bg-surface border border-white/10 rounded-lg overflow-hidden" 
        />
      </ReactFlow>
    </div>
  );
};