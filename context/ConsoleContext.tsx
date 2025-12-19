import React, { createContext, useContext, useState, useCallback } from 'react';
import { LogEntry } from '../types';

export interface ContextItem {
  id: string;
  label: string;
  data: any;
  fields: string[];
  status?: string;
  inputs?: {
      systemPrompt?: string;
      userPrompt?: string;
  };
}

interface ConsoleContextType {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  executionContext: ContextItem[];
  setExecutionContext: (items: ContextItem[]) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export const ConsoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [executionContext, setExecutionContext] = useState<ContextItem[]>([]);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      ...entry,
    };
    setLogs((prev) => [...prev, newLog]);
    setIsOpen(true); // Auto open console on new log
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return (
    <ConsoleContext.Provider value={{ logs, addLog, clearLogs, isOpen, setIsOpen, executionContext, setExecutionContext }}>
      {children}
    </ConsoleContext.Provider>
  );
};

export const useConsole = () => {
  const context = useContext(ConsoleContext);
  if (!context) {
    throw new Error('useConsole must be used within a ConsoleProvider');
  }
  return context;
};