import React, { useState } from 'react';
import { Search } from 'lucide-react';

const Navigation = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <nav className="border-b border-border px-6 py-4 font-mono">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-nav-active cursor-pointer hover:text-primary transition-colors">Research Hub</span>
          <span className="text-nav-separator">/</span>
          <span className="text-nav-active">Explore</span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search research..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-input border border-border rounded-none pl-10 pr-4 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        <div className="w-24"></div>
      </div>
    </nav>
  );
};

export default Navigation;