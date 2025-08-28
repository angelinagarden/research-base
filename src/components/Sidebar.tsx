import React, { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
}

const Sidebar = () => {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedFocus, setSelectedFocus] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [selectedDex, setSelectedDex] = useState('All');

  const domainOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'ai', label: 'AI & Machine Learning' },
    { id: 'biotech', label: 'Biotechnology' },
    { id: 'quantum', label: 'Quantum Computing' },
    { id: 'neuroscience', label: 'Neuroscience' }
  ];

  const focusOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'theoretical', label: 'Theoretical' },
    { id: 'applied', label: 'Applied' },
    { id: 'experimental', label: 'Experimental' }
  ];

  const levelOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'basic', label: 'Basic Research' },
    { id: 'advanced', label: 'Advanced Research' },
    { id: 'cutting-edge', label: 'Cutting-edge' }
  ];

  const dexOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'high', label: 'High Impact' },
    { id: 'medium', label: 'Medium Impact' },
    { id: 'emerging', label: 'Emerging' }
  ];

  return (
    <aside className="w-72 border-r border-border p-6 font-mono">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">DOMAIN</h3>
          <div className="space-y-1">
            {domainOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="domain"
                  value={option.id}
                  checked={selectedDomain === option.label}
                  onChange={() => setSelectedDomain(option.label)}
                  className="w-3 h-3 text-primary bg-background border border-border rounded-full focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">FOCUS</h3>
          <div className="space-y-1">
            {focusOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="focus"
                  value={option.id}
                  checked={selectedFocus === option.label}
                  onChange={() => setSelectedFocus(option.label)}
                  className="w-3 h-3 text-primary bg-background border border-border rounded-full focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">LEVEL</h3>
          <div className="space-y-1">
            {levelOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="level"
                  value={option.id}
                  checked={selectedLevel === option.label}
                  onChange={() => setSelectedLevel(option.label)}
                  className="w-3 h-3 text-primary bg-background border border-border rounded-full focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">DEX</h3>
          <div className="space-y-1">
            {dexOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="radio"
                  name="dex"
                  value={option.id}
                  checked={selectedDex === option.label}
                  onChange={() => setSelectedDex(option.label)}
                  className="w-3 h-3 text-primary bg-background border border-border rounded-full focus:ring-0 focus:ring-offset-0"
                />
                <span className="text-xs text-foreground group-hover:text-primary transition-colors">
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