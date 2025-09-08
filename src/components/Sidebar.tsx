import React, { useState } from 'react';

interface FilterOption {
  id: string;
  label: string;
}

const Sidebar = () => {
  const [themes, setThemes] = useState<string[]>(['all']);
  const [types, setTypes] = useState<string[]>(['all']);
  const [sources, setSources] = useState<string[]>(['all']);
  // removed: access, insights
  const [tags, setTags] = useState<string[]>([]);

  const themeOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'ai_data', label: 'AI & Data' },
    { id: 'climate', label: 'Climate & Sustainability' },
    { id: 'health', label: 'Health & Medicine' },
    { id: 'economics', label: 'Economics & Policy' },
    { id: 'society', label: 'Society & Inequality' },
    { id: 'education', label: 'Education & Knowledge Systems' }
  ];

  const typeOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'academic', label: 'Академические статьи' },
    { id: 'industry_reports', label: 'Отчёты (WEF, McKinsey, EY, Deloitte…)' },
    { id: 'gov_ngo', label: 'Гос./NGO публикации (WHO, UN, OECD…)}' },
    { id: 'preprints', label: 'Препринты (arXiv, bioRxiv…)' },
    { id: 'reviews', label: 'Обзоры / Метастадии' }
  ];

  const sourceOptions: FilterOption[] = [
    { id: 'all', label: 'All' },
    { id: 'scientific', label: 'Научные базы (PubMed, arXiv…)' },
    { id: 'industry', label: 'Консалтинг / Индустрия' },
    { id: 'intl_orgs', label: 'Международные организации' },
    { id: 'think_tanks', label: 'Think Tanks / RAND / Policy Labs' }
  ];

  const tagOptions: string[] = ['future','science','society','ai','health','technology'];

  const handleChange = (
    kind: 'themes' | 'types' | 'sources',
    optionId: string,
    isChecked: boolean
  ) => {
    const setMap = {
      themes: setThemes,
      types: setTypes,
      sources: setSources,
      // access removed
      // insights removed
    } as const;
    const getSelection = {
      themes,
      types,
      sources,
      // access removed
      // insights removed
    } as const;

    if (optionId === 'all') {
      if (isChecked) setMap[kind](['all']);
      return;
    }
    const current = getSelection[kind];
    if (isChecked) setMap[kind]([...(current.filter(id => id !== 'all')), optionId]);
    else {
      const next = current.filter(id => id !== optionId);
      setMap[kind](next.length ? next : ['all']);
    }
  };

  const toggleTag = (tag: string) => {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  return (
    <aside className="w-72 border-r border-border p-6 font-mono">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">ТЕМЫ</h3>
          <div className="space-y-1">
            {themeOptions.map((o) => (
              <label key={o.id} className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={themes.includes(o.id)}
                  onChange={(e) => handleChange('themes', o.id, e.target.checked)}
                  className={`w-2 h-2 text-primary bg-background border border-border focus:ring-0 focus:ring-offset-0 ${o.id === 'all' ? 'rounded-full' : 'rounded'}`}
                />
                <span className={`text-xs ${o.id === 'all' ? 'font-semibold text-primary' : 'text-foreground group-hover:text-primary'}`}>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">ТИПЫ ИССЛЕДОВАНИЙ</h3>
          <div className="space-y-1">
            {typeOptions.map((o) => (
              <label key={o.id} className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={types.includes(o.id)}
                  onChange={(e) => handleChange('types', o.id, e.target.checked)}
                  className={`w-2 h-2 text-primary bg-background border border-border focus:ring-0 focus:ring-offset-0 ${o.id === 'all' ? 'rounded-full' : 'rounded'}`}
                />
                <span className={`text-xs ${o.id === 'all' ? 'font-semibold text-primary' : 'text-foreground group-hover:text-primary'}`}>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">ИСТОЧНИК ДАННЫХ</h3>
          <div className="space-y-1">
            {sourceOptions.map((o) => (
              <label key={o.id} className="flex items-center space-x-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={sources.includes(o.id)}
                  onChange={(e) => handleChange('sources', o.id, e.target.checked)}
                  className={`w-2 h-2 text-primary bg-background border border-border focus:ring-0 focus:ring-offset-0 ${o.id === 'all' ? 'rounded-full' : 'rounded'}`}
                />
                <span className={`text-xs ${o.id === 'all' ? 'font-semibold text-primary' : 'text-foreground group-hover:text-primary'}`}>{o.label}</span>
              </label>
            ))}
          </div>
        </div>

        

        <div>
          <h3 className="text-sm text-muted-foreground mb-3 uppercase tracking-wide">ТЕГИ</h3>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`px-2 py-1 border text-xs rounded-full ${tags.includes(t) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'}`}
              >
                #{t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;