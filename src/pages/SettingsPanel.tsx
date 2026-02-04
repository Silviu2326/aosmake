import React, { useState } from 'react';
import { User, Key, Lock, Bell, CreditCard, Monitor, Save } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="flex flex-col h-full bg-[#0D0D0D] text-gray-300">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-surface">
        <h2 className="text-lg font-semibold text-white">Settings</h2>
        <button className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-accent hover:bg-accent/90 text-white text-xs font-medium transition-colors">
            <Save size={14} />
            Save Changes
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-64 border-r border-white/5 bg-surface/50 pt-6">
            <div className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</div>
            <TabButton id="general" label="General" icon={User} active={activeTab === 'general'} onClick={setActiveTab} />
            <TabButton id="billing" label="Billing & Plans" icon={CreditCard} active={activeTab === 'billing'} onClick={setActiveTab} />
            
            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspace</div>
            <TabButton id="keys" label="API Keys" icon={Key} active={activeTab === 'keys'} onClick={setActiveTab} />
            <TabButton id="security" label="Security" icon={Lock} active={activeTab === 'security'} onClick={setActiveTab} />
            <TabButton id="notifications" label="Notifications" icon={Bell} active={activeTab === 'notifications'} onClick={setActiveTab} />
            
            <div className="px-4 mt-6 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">App</div>
            <TabButton id="appearance" label="Appearance" icon={Monitor} active={activeTab === 'appearance'} onClick={setActiveTab} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
            {activeTab === 'general' && (
                <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                    <Section title="Profile Information">
                        <div className="grid grid-cols-2 gap-6">
                            <InputGroup label="Full Name" defaultValue="Dev User" />
                            <InputGroup label="Email Address" defaultValue="dev@aos.studio" />
                            <InputGroup label="Role" defaultValue="Administrator" disabled />
                            <InputGroup label="Company" defaultValue="AOS Studio Inc." />
                        </div>
                    </Section>
                     <Section title="Preferences">
                        <div className="space-y-4">
                             <ToggleItem label="Newsletter Subscription" description="Receive product updates and news." defaultChecked />
                             <ToggleItem label="Beta Features" description="Get early access to new experimental features." defaultChecked />
                        </div>
                    </Section>
                </div>
            )}

            {activeTab === 'keys' && (
                <div className="space-y-8 animate-[fadeIn_0.2s_ease-out]">
                    <Section title="API Keys">
                        <p className="text-sm text-gray-500 mb-4">Manage your API keys for accessing the AOS Platform programmatically.</p>
                        <div className="space-y-3">
                            <ApiKeyItem name="Production Key" prefix="aos_prod_" created="2 months ago" lastUsed="1 hour ago" />
                            <ApiKeyItem name="Staging Key" prefix="aos_stg_" created="1 week ago" lastUsed="5 mins ago" />
                        </div>
                        <button className="mt-4 flex items-center gap-2 px-3 py-2 rounded border border-white/10 hover:bg-white/5 text-xs text-gray-300 transition-colors">
                            <Key size={14} /> Generate New Key
                        </button>
                    </Section>
                </div>
            )}

             {/* Placeholder for other tabs */}
             {activeTab !== 'general' && activeTab !== 'keys' && (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                     <div className="p-4 rounded-full bg-white/5 mb-4">
                        {activeTab === 'billing' && <CreditCard size={32} />}
                        {activeTab === 'security' && <Lock size={32} />}
                        {activeTab === 'notifications' && <Bell size={32} />}
                        {activeTab === 'appearance' && <Monitor size={32} />}
                     </div>
                     <p className="text-sm">This section is under development.</p>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ id, label, icon: Icon, active, onClick }: { id: string, label: string, icon: any, active: boolean, onClick: (id: string) => void }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center px-4 py-2 border-l-2 transition-colors ${
            active 
            ? 'border-accent bg-accent/5 text-white' 
            : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-white/5'
        }`}
    >
        <Icon size={16} className={`mr-3 ${active ? 'text-accent' : 'text-gray-500'}`} />
        <span className="text-sm">{label}</span>
    </button>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="border border-white/5 rounded-lg bg-surface p-6">
        <h3 className="text-sm font-medium text-white mb-6 pb-2 border-b border-white/5">{title}</h3>
        {children}
    </div>
);

const InputGroup = ({ label, defaultValue, disabled = false }: { label: string, defaultValue: string, disabled?: boolean }) => (
    <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500">{label}</label>
        <input 
            type="text" 
            defaultValue={defaultValue} 
            disabled={disabled}
            className={`w-full bg-[#111] border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-accent/50 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
    </div>
);

const ToggleItem = ({ label, description, defaultChecked }: { label: string, description: string, defaultChecked?: boolean }) => (
    <div className="flex items-center justify-between">
        <div>
            <div className="text-sm font-medium text-gray-300">{label}</div>
            <div className="text-xs text-gray-500">{description}</div>
        </div>
        <div className={`w-10 h-5 rounded-full relative cursor-pointer ${defaultChecked ? 'bg-accent' : 'bg-white/10'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${defaultChecked ? 'left-[22px]' : 'left-0.5'}`} />
        </div>
    </div>
);

const ApiKeyItem = ({ name, prefix, created, lastUsed }: { name: string, prefix: string, created: string, lastUsed: string }) => (
    <div className="flex items-center justify-between p-3 bg-[#111] border border-white/5 rounded">
        <div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">{name}</span>
                <span className="text-[10px] bg-green-500/10 text-green-400 px-1.5 rounded border border-green-500/20">Active</span>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-1">{prefix}********************</div>
        </div>
        <div className="text-right">
            <div className="text-[10px] text-gray-500">Last used {lastUsed}</div>
            <div className="text-[10px] text-gray-600">Created {created}</div>
        </div>
    </div>
);