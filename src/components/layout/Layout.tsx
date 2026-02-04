import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
    return (
        <div className="flex bg-background min-h-screen font-sans text-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 flex flex-col relative overflow-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
