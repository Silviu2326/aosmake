import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChristmasContextType {
  isChristmasMode: boolean;
  toggleChristmasMode: () => void;
}

const ChristmasContext = createContext<ChristmasContextType | undefined>(undefined);

export const ChristmasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isChristmasMode, setIsChristmasMode] = useState(false);

  const toggleChristmasMode = () => {
    setIsChristmasMode((prev) => !prev);
  };

  return (
    <ChristmasContext.Provider value={{ isChristmasMode, toggleChristmasMode }}>
      {children}
    </ChristmasContext.Provider>
  );
};

export const useChristmas = () => {
  const context = useContext(ChristmasContext);
  if (!context) {
    throw new Error('useChristmas must be used within a ChristmasProvider');
  }
  return context;
};
