import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';

export function Header() {
    const { toggleSidebar, sidebarOpen } = useAppStore();

    return (
        <header className="h-16 bg-surface/50 backdrop-blur-md border-b border-border sticky top-0 z-10 px-4 flex items-center justify-between">
            <div className="flex items-center">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <Menu size={20} />
                </button>
            </div>

            {/* Search Bar Placeholder */}
            <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search leads, flows..."
                        className="bg-surfaceHighlight border border-white/5 rounded-full h-9 pl-9 pr-4 text-sm text-gray-200 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/40 w-64 transition-all"
                    />
                </div>

                {/* Action Icons */}
                <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
                </button>

                {/* User Profile */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-medium text-white ring-2 ring-surface">
                    JD
                </div>
            </div>
        </header>
    );
}
