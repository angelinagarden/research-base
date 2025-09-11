import React, { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
}

const Sidebar = () => {
  const [selectedDomain, setSelectedDomain] = useState<string[]>(['all']);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(['all']);
  const [selectedLevel, setSelectedLevel] = useState<string[]>(['all']);
  const [selectedDex, setSelectedDex] = useState<string[]>(['all']);

  const domainOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'Health', label: 'Health' },
    { id: 'AI', label: 'AI' },
    { id: 'Economy', label: 'Economy' },
    { id: 'Policy', label: 'Policy' },
    { id: 'Media', label: 'Media' },
    { id: 'Sound Studies', label: 'Sound Studies' },
    { id: 'Culture', label: 'Culture' },
    { id: 'Education', label: 'Education' }
  ];

  const focusOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'Theoretical', label: 'Theoretical' },
    { id: 'Applied', label: 'Applied' },
    { id: 'Experimental', label: 'Experimental' },
    { id: 'Meta-analysis', label: 'Meta-analysis' }
  ];

  const levelOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'benchmark', label: 'Benchmark' },
    { id: 'report', label: 'Report' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'study', label: 'Study' },
    { id: 'special-issue', label: 'Special Issue' }
  ];

  const dexOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'high-evidence', label: 'High Evidence (4-5)' },
    { id: 'medium-evidence', label: 'Medium Evidence (3)' },
    { id: 'low-evidence', label: 'Low Evidence (1-2)' },
    { id: 'high-actionability', label: 'High Actionability (4-5)' },
    { id: 'medium-actionability', label: 'Medium Actionability (3)' },
    { id: 'low-actionability', label: 'Low Actionability (1-2)' }
  ];

  const handleFilterChange = (filterType: string, optionId: string, isChecked: boolean) => {
    if (optionId === 'all') {
      if (isChecked) {
        // Если выбрали "All", убираем все остальные
        switch (filterType) {
          case 'domain':
            setSelectedDomain(['all']);
            break;
          case 'focus':
            setSelectedFocus(['all']);
            break;
          case 'level':
            setSelectedLevel(['all']);
            break;
          case 'dex':
            setSelectedDex(['all']);
            break;
        }
      }
    } else {
      // Если выбрали конкретный фильтр
      switch (filterType) {
        case 'domain':
          if (isChecked) {
            setSelectedDomain(prev => [...prev.filter(id => id !== 'all'), optionId]);
          } else {
            const newSelection = selectedDomain.filter(id => id !== optionId);
            setSelectedDomain(newSelection.length > 0 ? newSelection : ['all']);
          }
          break;
        case 'focus':
          if (isChecked) {
            setSelectedFocus(prev => [...prev.filter(id => id !== 'all'), optionId]);
          } else {
            const newSelection = selectedFocus.filter(id => id !== optionId);
            setSelectedFocus(newSelection.length > 0 ? newSelection : ['all']);
          }
          break;
        case 'level':
          if (isChecked) {
            setSelectedLevel(prev => [...prev.filter(id => id !== 'all'), optionId]);
          } else {
            const newSelection = selectedLevel.filter(id => id !== optionId);
            setSelectedLevel(newSelection.length > 0 ? newSelection : ['all']);
          }
          break;
        case 'dex':
          if (isChecked) {
            setSelectedDex(prev => [...prev.filter(id => id !== 'all'), optionId]);
          } else {
            const newSelection = selectedDex.filter(id => id !== optionId);
            setSelectedDex(newSelection.length > 0 ? newSelection : ['all']);
          }
          break;
      }
    }
  };

  return (
    <aside className="w-72 border-r border-border p-6 font-mono">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">ДОМЕН</h3>
          <div className="space-y-1">
            {domainOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="domain"
                  value={option.id}
                  checked={selectedDomain.includes(option.id)}
                  onChange={(e) => handleFilterChange('domain', option.id, e.target.checked)}
                  className={`w-2 h-2 text-primary bg-background border border-border focus:ring-0 focus:ring-offset-0 ${
                    option.id === 'all' ? 'rounded-full' : 'rounded'
                  }`}
                />
                <span className={`text-xs transition-colors ${
                  option.id === 'all' 
                    ? 'font-semibold text-primary' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">ФОКУС</h3>
          <div className="space-y-1">
            {focusOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="focus"
                  value={option.id}
                  checked={selectedFocus.includes(option.id)}
                  onChange={(e) => handleFilterChange('focus', option.id, e.target.checked)}
                  className={`w-2 h-2 text-primary bg-background border border-border focus:ring-0 focus:ring-offset-0 ${
                    option.id === 'all' ? 'rounded-full' : 'rounded'
                  }`}
                />
                <span className={`text-xs transition-colors ${
                  option.id === 'all' 
                    ? 'font-semibold text-primary' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">ТИП</h3>
          <div className="space-y-1">
            {levelOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="level"
                  value={option.id}
                  checked={selectedLevel.includes(option.id)}
                  onChange={(e) => handleFilterChange('level', option.id, e.target.checked)}
                  className={`w-2 h-2 text-primary bg-background border border-border focus:ring-0 focus:ring-offset-0 ${
                    option.id === 'all' ? 'rounded-full' : 'rounded'
                  }`}
                />
                <span className={`text-xs transition-colors ${
                  option.id === 'all' 
                    ? 'font-semibold text-primary' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">РЕЙТИНГ</h3>
          <div className="space-y-1">
            {dexOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  name="dex"
                  value={option.id}
                  checked={selectedDex.includes(option.id)}
                  onChange={(e) => handleFilterChange('dex', option.id, e.target.checked)}
                  className={`w-2 h-2 text-primary bg-background border border-border focus:ring-0 focus:ring-offset-0 ${
                    option.id === 'all' ? 'rounded-full' : 'rounded'
                  }`}
                />
                <span className={`text-xs transition-colors ${
                  option.id === 'all' 
                    ? 'font-semibold text-primary' 
                    : 'text-foreground group-hover:text-primary'
                }`}>
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