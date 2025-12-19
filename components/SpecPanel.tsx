import React, { useState } from 'react';
import { ShieldCheck, Download, Copy, RefreshCcw, AlertTriangle, Check, FileJson, GitCompare, TestTube } from 'lucide-react';

export const SpecPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'schema' | 'output' | 'diff' | 'tests'>('schema');

  return (
    <div className="flex flex-col h-full bg-[#111111] border-x border-border z-10">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-surface/80">
        <div className="flex items-center gap-3">
          <ShieldCheck size={16} className="text-purple-400" />
          <span className="font-semibold text-white">Instructions Spec</span>
          <div className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] text-purple-400 font-mono">
            v1.1
          </div>
        </div>
        <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">Edit Spec</button>
      </div>

      {/* Status Bar */}
      <div className="bg-green-500/5 border-b border-green-500/10 p-2 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-400 text-xs font-medium">
             <Check size={12} />
             <span>Contract Valid</span>
          </div>
          <span className="text-[10px] text-green-500/50 uppercase tracking-wider">Compatible with Crafter v7.0</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-surface/30">
        {[
            { id: 'schema', label: 'Schema', icon: FileJson },
            { id: 'output', label: 'Current Output', icon: Copy },
            { id: 'diff', label: 'Adapter Diff', icon: GitCompare },
            { id: 'tests', label: 'Contract Tests', icon: TestTube },
        ].map((tab) => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-medium uppercase tracking-wider transition-colors relative ${
                        activeTab === tab.id ? 'text-purple-400 bg-purple-500/5' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Icon size={12} />
                    {tab.label}
                    {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />}
                </button>
            )
        })}
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {activeTab === 'schema' && (
            <>
                {/* Section: Schema */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Output Definition</h3>
                        <div className="flex gap-2">
                            <button className="text-gray-500 hover:text-white" title="Copy"><Copy size={12}/></button>
                            <button className="text-gray-500 hover:text-white" title="Download"><Download size={12}/></button>
                        </div>
                    </div>
                    <div className="bg-background rounded border border-border p-3 font-mono text-[11px] text-gray-400 leading-relaxed overflow-x-auto relative group">
                        <div className="text-purple-400">{"{"}</div>
                        <div className="pl-4">
                            <span className="text-blue-400">"audience_segment"</span>: <span className="text-green-400">"string"</span>,
                        </div>
                        <div className="pl-4">
                            <span className="text-blue-400">"key_benefits"</span>: <span className="text-green-400">"string[]"</span>,
                        </div>
                        <div className="pl-4">
                            <span className="text-blue-400">"tone_voice"</span>: <span className="text-purple-400">{"{"}</span>
                        </div>
                        <div className="pl-8">
                            <span className="text-blue-400">"primary"</span>: <span className="text-yellow-600">"enum(Professional, Casual)"</span>,
                        </div>
                        <div className="pl-8">
                            <span className="text-blue-400">"secondary"</span>: <span className="text-yellow-600">"string"</span>
                        </div>
                        <div className="pl-4 text-purple-400">{"},"}</div>
                        <div className="pl-4">
                            <span className="text-blue-400">"compliance_flags"</span>: <span className="text-green-400">"boolean"</span>
                        </div>
                        <div className="text-purple-400">{"}"}</div>
                    </div>
                </div>

                {/* Section: Guardrails */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Guardrails</h3>
                    <div className="space-y-2">
                        <GuardrailItem text="No fictional pricing data allowed" status="active" />
                        <GuardrailItem text="Must include 'Unsubscribe' context" status="active" />
                        <GuardrailItem text="Max token output limit: 2000" status="warning" />
                    </div>
                </div>
            </>
        )}

        {activeTab === 'output' && (
            <div className="h-full flex flex-col">
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Generated from PreCrafter Run #8f2a</span>
                 </div>
                 <textarea 
                    readOnly
                    className="flex-1 bg-background border border-border rounded p-3 text-gray-300 text-[10px] font-mono resize-none focus:outline-none"
                    value={`{
  "audience_segment": "Enterprise CTO",
  "key_benefits": [
    "Reduce cloud spend by 30%",
    "Automated compliance reporting"
  ],
  "tone_voice": {
    "primary": "Professional",
    "secondary": "Urgent"
  },
  "compliance_flags": true
}`}
                 />
            </div>
        )}

        {activeTab === 'diff' && (
             <div className="space-y-4">
                <div className="p-3 bg-surfaceHighlight border border-white/5 rounded-lg flex items-start gap-3">
                     <RefreshCcw size={16} className="text-blue-400 mt-0.5" />
                     <div>
                         <div className="text-xs font-medium text-gray-200">Active Adapter: v1.1 → v1.0</div>
                         <p className="text-[10px] text-gray-500 mt-1">
                             Transforming 'key_benefits' array to comma-separated string for backward compatibility.
                         </p>
                     </div>
                </div>

                <div className="border border-border rounded bg-black/20 overflow-hidden">
                    <div className="flex border-b border-border">
                        <div className="flex-1 p-2 text-[10px] text-center border-r border-border text-gray-500">Original (v1.1)</div>
                        <div className="flex-1 p-2 text-[10px] text-center text-gray-500">Adapted (v1.0)</div>
                    </div>
                    <div className="flex font-mono text-[10px]">
                         <div className="flex-1 p-2 text-red-400 bg-red-900/10 border-r border-border">
                            "key_benefits": [<br/>&nbsp;&nbsp;"Save money",<br/>&nbsp;&nbsp;"Save time"<br/>]
                         </div>
                         <div className="flex-1 p-2 text-green-400 bg-green-900/10">
                            "key_benefits": "Save money, Save time"
                         </div>
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'tests' && (
            <div className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Golden Set Validation</h3>
                <TestItem name="Structure Check" status="pass" time="12ms" />
                <TestItem name="Type Safety" status="pass" time="4ms" />
                <TestItem name="Required Fields" status="pass" time="8ms" />
                <TestItem name="Content Policy" status="fail" time="145ms" message="Detected prohibited words in output" />
            </div>
        )}

      </div>
    </div>
  );
};

const GuardrailItem = ({ text, status }: { text: string, status: 'active' | 'warning' }) => (
    <div className="flex items-center gap-2 p-2 rounded bg-surface border border-white/5 text-xs text-gray-300">
        {status === 'active' ? (
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
        ) : (
            <AlertTriangle size={10} className="text-amber-500" />
        )}
        <span>{text}</span>
    </div>
)

const TestItem = ({ name, status, time, message }: { name: string, status: 'pass' | 'fail', time: string, message?: string }) => (
    <div className={`p-2 rounded border text-xs ${status === 'pass' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                {status === 'pass' ? <Check size={12} className="text-green-500"/> : <AlertTriangle size={12} className="text-red-500"/>}
                <span className="font-medium text-gray-200">{name}</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{time}</span>
        </div>
        {message && <div className="mt-1 pl-5 text-[10px] text-red-400">{message}</div>}
    </div>
)
