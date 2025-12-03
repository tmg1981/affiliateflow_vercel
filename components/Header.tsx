import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon, DocumentTextIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const HeaderAsSidebar: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-600 hover:text-white'
    }`;

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col shadow-lg z-10">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <span className="text-2xl font-bold text-teal-400">AffiliateFlow</span>
      </div>
      <nav className="flex-grow p-4 space-y-2">
        <NavLink to="/" className={navLinkClass}>
          <HomeIcon className="h-5 w-5 mr-3" />
          Home
        </NavLink>
        <NavLink to="/create" className={navLinkClass}>
          <PlusCircleIcon className="h-5 w-5 mr-3" />
          Create Post
        </NavLink>
        <NavLink to="/my-posts" className={navLinkClass}>
          <DocumentTextIcon className="h-5 w-5 mr-3" />
          My Posts
        </NavLink>
        <NavLink to="/settings" className={navLinkClass}>
          <Cog6ToothIcon className="h-5 w-5 mr-3" />
          Settings
        </NavLink>
         <NavLink to="/guide" className={navLinkClass}>
          <QuestionMarkCircleIcon className="h-5 w-5 mr-3" />
          Guide
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
        © 2024 AffiliateFlow
      </div>
    </aside>
  );
};

export default HeaderAsSidebar;
