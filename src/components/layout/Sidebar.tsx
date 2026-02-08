import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Users,
    Upload,
    GitBranch,
    Play,
    FlaskConical,
    Settings,
    Menu,
    BarChart3,
    TrendingUp
} from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { clsx } from 'clsx';

export function Sidebar() {
    const { sidebarOpen } = useAppStore();

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: BarChart3 },
        { label: 'Estadísticas', path: '/statistics', icon: TrendingUp },
        { label: 'Leads', path: '/leads', icon: Users },
        { label: 'Import', path: '/import', icon: Upload },
        { label: 'Runs', path: '/runs', icon: Play },
        { label: 'Builder', path: '/precrafter', icon: GitBranch },
    ];

    return (
        <aside
            className={clsx(
                "bg-surface border-r border-border h-screen sticky top-0 transition-all duration-300 flex flex-col z-20",
                sidebarOpen ? "w-64" : "w-16"
            )}
        >
            {/* Logos Area */}
            <div className="h-16 flex items-center px-4 border-b border-border">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-blue-600 flex-shrink-0" />
                {sidebarOpen && (
                    <span className="ml-3 font-bold text-lg text-white tracking-tight">
                        AOS Studio
                    </span>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-2 space-y-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center px-3 py-2.5 rounded-lg transition-colors group",
                            isActive
                                ? "bg-accent/10 text-accent font-medium shadow-glow"
                                : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                        )}
                        title={!sidebarOpen ? item.label : undefined}
                    >
                        <item.icon size={20} className="flex-shrink-0" />
                        {sidebarOpen && (
                            <span className="ml-3 truncate">{item.label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Settings */}
            <div className="p-2 border-t border-border">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => clsx(
                        "flex items-center w-full px-3 py-2.5 rounded-lg transition-colors",
                        isActive
                            ? "bg-accent/10 text-accent font-medium"
                            : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    )}
                    title={!sidebarOpen ? "Settings" : undefined}
                >
                    <Settings size={20} className="flex-shrink-0" />
                    {sidebarOpen && <span className="ml-3">Settings</span>}
                </NavLink>
            </div>
        </aside>
    );
}
