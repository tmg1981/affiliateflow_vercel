import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useSettings } from '../components/GenerateProvider';

const SettingsPage: React.FC = () => {
  const { apiKey: contextApiKey, saveApiKey, isKeySet } = useSettings();
  const [localApiKey, setLocalApiKey] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (contextApiKey) {
      setLocalApiKey(contextApiKey);
    }
  }, [contextApiKey]);
  
  const handleSaveKey = () => {
    saveApiKey(localApiKey);
    setSaveMessage("API Key saved successfully!");
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleCheckApiKey = async () => {
    setIsChecking(true);
    setStatusMessage(null);
    setIsSuccess(null);

    if (!isKeySet || !contextApiKey) {
      setStatusMessage("API Key is not saved. Please enter your key and click 'Save API Key' before checking the status.");
      setIsSuccess(false);
      setIsChecking(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: contextApiKey });
      await ai.models.countTokens({ model: 'gemini-2.5-flash', contents: 'test' });
      setStatusMessage("API Key is valid and the service is reachable. You are ready to generate posts.");
      setIsSuccess(true);
    } catch (error) {
      console.error("API Key check failed:", error);
      setStatusMessage("API Key validation failed. Please double-check your key. Ensure it is correct and that billing is enabled for your Google Cloud project.");
      setIsSuccess(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl space-y-8">
        
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Manage API Key</h2>
          <p className="text-gray-300 mb-4">
            Enter your Google Gemini API key below. The key will be saved securely in your browser's local storage. This method avoids Vercel's shared IP rate limits.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300">Your Gemini API Key</label>
              <input
                type="password"
                id="apiKey"
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white p-3"
                placeholder="Enter your API key here"
              />
            </div>
            <button
              onClick={handleSaveKey}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
            >
              Save API Key
            </button>
            {saveMessage && (
                <div className="text-sm p-3 text-center rounded-md bg-green-900/50 text-green-300">
                    {saveMessage}
                </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-4">API Status Check</h2>
          <p className="text-gray-300 mb-4">
            After saving your key, verify that it's correctly configured and that the Gemini service is accessible.
          </p>
          <button
            onClick={handleCheckApiKey}
            disabled={isChecking || !isKeySet}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isChecking ? 'Checking...' : 'Check API Key Status'}
          </button>
          {statusMessage && (
            <div className={`mt-4 text-sm p-3 rounded-md ${isSuccess ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
