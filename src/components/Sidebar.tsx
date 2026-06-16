import React from 'react';
import { NavLink } from 'react-router-dom';
import { Bug, FileText, Layers, Settings as SettingsIcon, LogOut } from 'lucide-react';
import faesLogo from '../assets/faes-logo.png';
import { useVersionsContext } from '../versions/VersionsContext';
import { appRoutes } from '../versions/routes';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { pendingReviewCount } = useVersionsContext();

  const menuSections = [
    {
      title: 'Overview',
      items: [
        {
          id: appRoutes.bugReports,
          label: 'Bug reports',
          icon: Bug,
          badge: 0,
        },
      ],
    },
    {
      title: 'Instructions',
      items: [
        {
          id: appRoutes.builder,
          label: 'All Instructions',
          icon: FileText,
          badge: 0,
        },
        {
          id: appRoutes.versions,
          label: 'Versions',
          icon: Layers,
          badge: pendingReviewCount,
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          id: appRoutes.settings,
          label: 'Settings',
          icon: SettingsIcon,
          badge: 0,
        },
      ],
    },
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
                return (
                  <NavLink
                    key={item.id}
                    to={item.id}
                    className={({ isActive }) =>
                      `sidebar-item${isActive ? ' active' : ''}`
                    }
                    end={item.id === appRoutes.versions ? false : undefined}
                  >
                    <Icon className="sidebar-item-icon" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="sidebar-badge" aria-label={`${item.badge} pending reviews`}>
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div
          className="sidebar-item logout-btn"
          onClick={() => alert('Logged out successfully (Mock)')}
        >
          <LogOut className="sidebar-item-icon" />
          <span>Log out</span>
        </div>
      </div>
    </aside>
  );
};
