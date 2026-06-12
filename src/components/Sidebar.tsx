import React from 'react';
import { Bug, FileText, Layers, Settings as SettingsIcon, LogOut } from 'lucide-react';
import faesLogo from '../assets/faes-logo.png';
import './Sidebar.css';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuSections = [
    {
      title: 'Overview',
      items: [
        {
          id: 'bug-reports',
          label: 'Bug reports',
          icon: Bug
        }
      ]
    },
    {
      title: 'Instructions',
      items: [
        {
          id: 'all-instructions',
          label: 'All Instructions',
          icon: FileText
        },
        {
          id: 'versions',
          label: 'Versions',
          icon: Layers
        }
      ]
    },
    {
      title: 'Settings',
      items: [
        {
          id: 'settings',
          label: 'Settings',
          icon: SettingsIcon
        }
      ]
    }
  ];

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-brand">
          <img src={faesLogo} alt="FAES Logo" className="sidebar-logo" />
          <div className="brand-text-container">
            <span className="sidebar-brand-name">FAES</span>
            <span className="sidebar-user-name-sub">John Doe</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          {menuSections.map((section) => (
            <div key={section.title}>
              <div className="sidebar-section-header">{section.title}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <div
                    key={item.id}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <Icon className="sidebar-item-icon" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-item logout-btn" onClick={() => alert('Logged out successfully (Mock)')}>
          <LogOut className="sidebar-item-icon" />
          <span>Log out</span>
        </div>
      </div>
    </aside>
  );
};
