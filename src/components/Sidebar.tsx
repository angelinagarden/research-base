import React, { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
}

const Sidebar = () => {
  const [selectedView, setSelectedView] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Recently updated');

  const viewOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'channels', label: 'Channels' },
    { id: 'blocks', label: 'Blocks' }
  ];

  const sortOptions: FilterOption[] = [
    { id: 'recent', label: 'Recently updated' },
    { id: 'random', label: 'Random' }
  ];

  return (
    <aside className="w-64 border-r border-border p-6 font-mono">
      <div className="space-y-8">
        <div>
          <h3 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">View</h3>
          <div className="space-y-2">
            {viewOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="view"
                  value={option.id}
                  checked={selectedView === option.label}
                  onChange={() => setSelectedView(option.label)}
                  className="w-3 h-3 text-primary bg-background border border-border rounded-full focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-4 uppercase tracking-wide">Sort</h3>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="sort"
                  value={option.id}
                  checked={selectedSort === option.label}
                  onChange={() => setSelectedSort(option.label)}
                  className="w-3 h-3 text-primary bg-background border border-border rounded-full focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;