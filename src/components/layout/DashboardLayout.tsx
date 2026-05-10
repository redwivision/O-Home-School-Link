import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { 
  Bus, 
  Users, 
  CalendarCheck, 
  MapPin, 
  LayoutDashboard, 
  LogOut, 
  User,
  Bell,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function DashboardLayout() {
  const { profile, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const menuItems = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
      { name: 'Students', icon: Users, path: '/admin/students' },
      { name: 'Attendance', icon: CalendarCheck, path: '/admin/attendance' },
      { name: 'Trips', icon: MapPin, path: '/admin/trips' },
    ],
    parent: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/parent' },
      { name: 'Notifications', icon: Bell, path: '/parent/alerts' },
    ],
    student: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/student' },
    ],
    driver: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/driver' },
    ],
  };

  const currentRoleItems = profile ? menuItems[profile.role] : [];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:block",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
              <div className="p-1.5 bg-blue-600 rounded-lg text-white">
                <Bus size={20} />
              </div>
              <span className="truncate">O-Home Link</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {currentRoleItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-zinc-200">
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar className="h-9 w-9 border border-zinc-200">
                <AvatarImage src={user?.photoURL || ''} />
                <AvatarFallback className="bg-zinc-100 text-zinc-600">
                  {profile?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{profile?.name}</p>
                <p className="text-xs text-zinc-500 capitalize">{profile?.role}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full justify-start gap-3 text-zinc-600 hover:text-red-600 hover:bg-red-50 px-3"
            >
              <LogOut size={18} />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} />
          </Button>

          <div className="flex-1 px-4">
             <h1 className="text-lg font-semibold text-zinc-900 capitalize">
                {location.pathname.split('/').pop() || 'Dashboard'}
             </h1>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="text-zinc-500 relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
             </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
