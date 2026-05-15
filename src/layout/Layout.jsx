import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`dashboard-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="dashboard-main">
        <Topbar
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onToggleCollapse={() => setIsSidebarCollapsed((current) => !current)}
        />
        <main className="page-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
