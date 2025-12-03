import React, { useState, useRef } from 'react';
import { usePosts } from '../context/PostsContext';
import { useSettings } from '../components/GenerateProvider';
import { generateAffiliatePost } from '../services/geminiService';
import { TEMPLATE_STYLES, DEFAULT_HOPLINK } from '../constants';
import { GenerationResult } from '../types';

const LoadingOverlay: React.FC<{ progress: number; message: string }> = ({ progress, message }) => {
  const progressPercentage = (progress / 4) * 100;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
      <div className="w-1/2 max-w-lg bg-gray-700 rounded-full h-4 mb-4">
        <div 
          className="bg-teal-500 h-4 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-white text-lg">{message}</p>
    </div>
  );
};

const CreatePage: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [affiliateHoplink, setAffiliateHoplink] = useState(DEFAULT_HOPLINK);
  const [templateStyle, setTemplateStyle] = useState(TEMPLATE_STYLES[0]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GenerationResult | null>(null);
  
  const { addPost } = usePosts();
  const { apiKey, isKeySet } = useSettings();
  const templateSelectRef = useRef<HTMLSelectElement>(null);

  function atob_utf8(b64: string) {
    return decodeURIComponent(escape(atob(b64)));
  }

  const handleProgress = (step: number, message: string) => {
    setGenerationProgress(step);
    setProgressMessage(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !productDescription) {
      setError('Product Name and Description are required.');
      return;
    }
    
    if (!isKeySet || !apiKey) {
      setError('API Key is not set. Please go to the Settings page to add your API key.');
      return;
    }

    setError(null);
    setGeneratedData(null);

    try {
      const result = await generateAffiliatePost(productName, productDescription, affiliateHoplink, templateStyle, handleProgress, apiKey);
      const newPost = {
        id: new Date().toISOString(),
        templateName: result.templateName,
        productName: productName,
        htmlContent: atob_utf8(result.previewHtmlBase64),
        images: result.images,
        createdAt: new Date().toLocaleDateString(),
      };
      addPost(newPost);
      setGeneratedData(result);
      setGenerationProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setGenerationProgress(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {generationProgress > 0 && <LoadingOverlay progress={generationProgress} message={progressMessage} />}
      <h1 className="text-3xl font-bold text-white mb-6">Create New Affiliate Post</h1>
      
      {generatedData && (
        <div className="bg-green-800 border border-green-600 text-white p-4 rounded-lg mb-6">
          <p className="font-semibold text-center">Success! Your post has been generated and saved to "My Posts".</p>
        </div>
      )}

      <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300">Product Name</label>
            <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white p-3" required />
          </div>
          <div>
            <label htmlFor="productDescription" className="block text-sm font-medium text-gray-300">Product Description</label>
            <textarea id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} rows={4} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white p-3" required></textarea>
          </div>
          <div>
            <label htmlFor="affiliateHoplink" className="block text-sm font-medium text-gray-300">Affiliate Link</label>
            <input type="url" id="affiliateHoplink" value={affiliateHoplink} onChange={(e) => setAffiliateHoplink(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white p-3" required />
          </div>
          <div>
            <label htmlFor="templateStyle" className="block text-sm font-medium text-gray-300">Choose Template Style</label>
            <select id="templateStyle" value={templateStyle} onChange={(e) => setTemplateStyle(e.target.value)} ref={templateSelectRef} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md text-white p-3">
              {TEMPLATE_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
            </select>
          </div>
          {error && <div className="text-red-400 text-sm p-3 bg-red-900/50 rounded-md">{error}</div>}
          <div>
            <button type="submit" disabled={generationProgress > 0} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:bg-gray-500 disabled:cursor-not-allowed">
              Generate with AI
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
