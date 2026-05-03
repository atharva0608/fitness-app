import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Settings } from 'lucide-react';

export default function Navigation() {
  const linkStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    color: isActive ? 'var(--text-primary)' : 'var(--text-tertiary)',
    textDecoration: 'none',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    transition: 'color 0.2s',
    padding: '4px 20px',
  });

  const iconWrap = (isActive) => ({
    width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: isActive ? 'var(--bg-tertiary)' : 'transparent',
    transition: 'background 0.2s',
  });

  return (
    <nav className="bottom-nav">
      {[
        { to: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/workouts',  Icon: Dumbbell,         label: 'Workouts'  },
        { to: '/settings',  Icon: Settings,          label: 'Settings'  },
      ].map(({ to, Icon, label }) => (
        <NavLink key={to} to={to} style={linkStyle}>
          {({ isActive }) => (
            <>
              <div style={iconWrap(isActive)}>
                <Icon size={22} />
              </div>
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
