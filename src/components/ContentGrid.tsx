import React from 'react';

interface ContentItem {
  id: string;
  title: string;
  author: string;
  count: string;
  timeAgo: string;
  image?: string;
}

const ContentGrid = () => {
  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: 'Mockups',
      author: 'by Makena Hammond',
      count: '50 blocks',
      timeAgo: 'less than a minute ago'
    },
    {
      id: '2', 
      title: 'American Landscapes',
      author: 'by Jordan Sutherland',
      count: '33 blocks',
      timeAgo: 'less than a minute ago'
    },
    {
      id: '3',
      title: 'Digital Garden',
      author: 'by Anonymous',
      count: '42 blocks',
      timeAgo: '2 minutes ago'
    },
    {
      id: '4',
      title: 'Typography Studies',
      author: 'by Design Collective',
      count: '28 blocks', 
      timeAgo: '5 minutes ago'
    },
    {
      id: '5',
      title: 'Interface Archives',
      author: 'by UI Research',
      count: '67 blocks',
      timeAgo: '12 minutes ago'
    },
    {
      id: '6',
      title: 'Minimal Compositions',
      author: 'by Studio Mono',
      count: '19 blocks',
      timeAgo: '25 minutes ago'
    }
  ];

  return (
    <main className="flex-1 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentItems.map((item, index) => (
          <div 
            key={item.id} 
            className="border border-grid-border bg-card hover:bg-hover-subtle transition-colors cursor-pointer group"
          >
            <div className="aspect-square bg-accent flex items-center justify-center relative overflow-hidden">
              {index === 1 ? (
                <div className="w-full h-full bg-gradient-to-br from-muted to-accent flex items-center justify-center">
                  <div className="text-6xl text-foreground">+</div>
                </div>
              ) : (
                <div className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                  {item.title}
                </div>
              )}
            </div>
            <div className="p-4 font-mono">
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-2">{item.author}</p>
              <p className="text-xs text-muted-foreground">{item.count}</p>
              <p className="text-xs text-muted-foreground">{item.timeAgo}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ContentGrid;