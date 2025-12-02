import React, { useState } from 'react';
import { usePosts } from '../context/PostsContext';
import { GeneratedPost } from '../types';
import { EyeIcon, DocumentDuplicateIcon, TrashIcon, ArrowDownTrayIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const PreviewModal: React.FC<{ htmlContent: string; onClose: () => void }> = ({ htmlContent, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Post Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>
        <div className="flex-grow overflow-auto">
          <iframe srcDoc={htmlContent} title="Post Preview" className="w-full h-full border-0" />
        </div>
      </div>
    </div>
  );
};

const PostCard: React.FC<{ 
  post: GeneratedPost; 
  onDelete: (id: string) => void; 
  onPreview: (html: string) => void;
  onPublish: (post: GeneratedPost) => void;
}> = ({ post, onDelete, onPreview, onPublish }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    zip.file("index.html", post.htmlContent);
    const imgFolder = zip.folder("images");
    if (imgFolder) {
      post.images.forEach((imgData, index) => {
        const base64Data = imgData.split(',')[1];
        const filename = index === 0 ? 'hero.png' : index === 1 ? 'features.png' : 'cta_banner.png';
        imgFolder.file(filename, base64Data, { base64: true });
      });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${post.productName.replace(/ /g, '_')}_${post.templateName.replace(/ /g, '_')}.zip`);
  };

  const handlePreview = () => {
    let previewHtml = post.htmlContent;
    previewHtml = previewHtml.replace(/src="images\/hero.png"/g, `src="${post.images[0]}"`);
    previewHtml = previewHtml.replace(/src="images\/features.png"/g, `src="${post.images[1]}"`);
    previewHtml = previewHtml.replace(/src="images\/cta_banner.png"/g, `src="${post.images[2]}"`);
    onPreview(previewHtml);
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
      <img src={post.images[0]} alt={post.productName} className="w-full h-56 object-cover" />
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-white">{post.productName}</h3>
        <p className="text-sm text-gray-400 mb-2">{post.templateName}</p>
        <p className="text-xs text-gray-500 flex-grow">Created: {post.createdAt}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={handlePreview} className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md flex items-center justify-center gap-2">
            <EyeIcon className="h-4 w-4" /> Preview
          </button>
          <button onClick={handleCopy} className="text-sm bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded-md flex items-center justify-center gap-2">
            <DocumentDuplicateIcon className="h-4 w-4" /> {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={handleDownloadZip} className="text-sm bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md flex items-center justify-center gap-2">
            <ArrowDownTrayIcon className="h-4 w-4" /> Download ZIP
          </button>
          <button 
            onClick={() => onPublish(post)}
            className="text-sm bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md flex items-center justify-center gap-2 font-semibold"
          >
            <GlobeAltIcon className="h-5 w-5" /> Publish Live
          </button>
        </div>
        <button onClick={() => onDelete(post.id)} className="mt-3 w-full text-sm bg-red-900/50 hover:bg-red-900/80 text-red-300 py-2 px-3 rounded-md flex items-center justify-center gap-2">
          <TrashIcon className="h-4 w-4" /> Delete
        </button>
      </div>
    </div>
  );
};

const MyPostsPage: React.FC = () => {
  const { posts, deletePost } = usePosts();
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const handlePublish = (post: GeneratedPost) => {
    const slug = (post.productName || 'post')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);

    const liveUrl = `https://${slug}.affiliateflow.site`;

    alert(`Post Published (Simulation)!\n\nYour live URL would be:\n${liveUrl}\n\nA ZIP file will now be downloaded for manual deployment.`);
    
    // Trigger download
    const zip = new JSZip();
    zip.file("index.html", post.htmlContent);
    const imgFolder = zip.folder("images");
    if (imgFolder) {
      post.images.forEach((imgData, index) => {
        const base64Data = imgData.split(',')[1];
        const filename = index === 0 ? 'hero.png' : index === 1 ? 'features.png' : 'cta_banner.png';
        imgFolder.file(filename, base64Data, { base64: true });
      });
    }
    zip.generateAsync({ type: "blob" }).then(blob => {
        saveAs(blob, `${slug}.zip`);
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">My Generated Posts</h1>
      {posts.length === 0 ? (
        <p className="text-gray-400 text-center text-lg">You haven't generated any posts yet. Go to the "Create Post" page to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              onDelete={deletePost} 
              onPreview={setPreviewHtml}
              onPublish={handlePublish}
            />
          ))}
        </div>
      )}
      {previewHtml && <PreviewModal htmlContent={previewHtml} onClose={() => setPreviewHtml(null)} />}
    </div>
  );
};

export default MyPostsPage;
