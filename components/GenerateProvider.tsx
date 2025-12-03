import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface SettingsContextType {
  apiKey: string | null;
  saveApiKey: (key: string) => void;
  isKeySet: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const GenerateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Load API key from localStorage on initial render
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const value: SettingsContextType = {
    apiKey,
    saveApiKey,
    isKeySet: !!apiKey,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a GenerateProvider');
  }
  return context;
};
