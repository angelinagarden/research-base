import React from 'react';

const Navigation = () => {
  return (
    <nav className="border-b border-border px-6 py-4 font-mono">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-nav-active">Are.na</span>
          <span className="text-nav-separator">/</span>
          <span className="text-nav-inactive">Feed</span>
          <span className="text-nav-separator">•</span>
          <span className="text-nav-active cursor-pointer hover:text-primary transition-colors">Explore</span>
          <span className="text-nav-separator">•</span>
          <span className="text-nav-inactive cursor-pointer hover:text-primary transition-colors">Profile</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;