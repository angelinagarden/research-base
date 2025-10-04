import React from 'react';
import Navigation from './Navigation';
import Sidebar from './Sidebar';
import ContentGrid from './ContentGrid';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <ContentGrid />
      </div>
    </div>
  );
};

export default Layout;