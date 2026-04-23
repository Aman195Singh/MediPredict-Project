import { useState, useEffect } from 'react';
import { Plus, Search, PanelLeftClose, PanelLeft, LogOut, Heart, X } from 'lucide-react';
import { useApp, type Submission } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNewPrediction: () => void;
  onSelectSubmission: (sub: Submission) => void;
  activeSubmissionId?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ collapsed, onToggle, onNewPrediction, onSelectSubmission, activeSubmissionId, mobileOpen, onMobileClose }: SidebarProps) => {
  const { user, submissions, logout } = useApp();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // Close mobile sidebar on resize if screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen, onMobileClose]);

  const filtered = submissions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const groupByDate = (subs: Submission[]) => {
    const today = new Date();
    const groups: Record<string, Submission[]> = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };
    subs.forEach(s => {
      const diff = Math.floor((today.getTime() - s.date.getTime()) / 86400000);
      if (diff === 0) groups.Today.push(s);
      else if (diff === 1) groups.Yesterday.push(s);
      else if (diff < 7) groups['Last 7 Days'].push(s);
      else groups.Older.push(s);
    });
    return groups;
  };

  const groups = groupByDate(filtered);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden" 
          onClick={onMobileClose}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-50 md:relative md:flex flex-col h-full border-r border-border bg-card transition-all duration-250
        ${collapsed ? 'md:w-16' : 'md:w-72'}
        ${mobileOpen ? 'w-72 translate-x-0' : 'w-72 -translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between p-3 border-b border-border">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" fill="currentColor" />
              <span className="font-bold text-sm text-foreground">MediPredict</span>
            </div>
          )}
          <div className="flex gap-1">
            <button onClick={onToggle} className="hidden md:block p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground" aria-label="Toggle sidebar">
              {collapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
            <button onClick={onMobileClose} className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

      <div className="p-3">
        <button onClick={onNewPrediction} className={`w-full flex items-center gap-2 rounded-lg bg-primary text-primary-foreground font-medium transition-colors hover:bg-primary/90 ${collapsed ? 'p-2 justify-center' : 'px-4 py-2.5'}`}>
          <Plus className="h-5 w-5" />
          {!collapsed && <span className="text-sm">New Prediction</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 mb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2">
        {!collapsed && Object.entries(groups).map(([label, subs]) => (
          subs.length > 0 && (
            <div key={label} className="mb-3">
              <p className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
              {subs.map(s => (
                <button
                  key={s.id}
                  onClick={() => onSelectSubmission(s)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 ${
                    activeSubmissionId === s.id
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-foreground hover:bg-accent'
                  }`}
                >
                  <p className="font-medium truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.date.toLocaleDateString()}</p>
                </button>
              ))}
            </div>
          )
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <button
          onClick={() => { logout(); navigate('/'); }}
          className={`w-full flex items-center gap-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground ${collapsed ? 'p-2 justify-center' : 'px-3 py-2'}`}
        >
          {!collapsed && user && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && <span className="flex-1 text-sm text-left truncate">{user?.name}</span>}
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
    </>
  );
};

export default Sidebar;
