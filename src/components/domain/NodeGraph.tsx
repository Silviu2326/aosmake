import React from 'react';
import ReactFlow, {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  EdgeTypes
} from 'reactflow';
import CustomNode from './CustomNode';
import GroupNode from './GroupNode';
import FilterNode from './FilterNode';
import { DataPeekEdge } from './DataPeekEdge';
import 'reactflow/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
  filter: FilterNode,
};

const edgeTypes: EdgeTypes = {
  dataPeek: DataPeekEdge,
};

const defaultEdgeOptions = {
  type: 'dataPeek',
  style: { stroke: '#555', strokeWidth: 2 },
  animated: true
};

interface NodeGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onNodeContextMenu?: (event: React.MouseEvent, node: Node) => void;
  children?: React.ReactNode;
}

export const NodeGraph: React.FC<NodeGraphProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeContextMenu,
  children
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
        onNodeContextMenu={onNodeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
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
        {children}
      </ReactFlow>
    </div>
  );
};