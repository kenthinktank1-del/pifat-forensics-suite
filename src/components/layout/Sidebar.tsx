import { Home, FolderOpen, FileText, Users, Shield, Activity, Database } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAdmin } from '@/hooks/useAdmin';
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

export function Sidebar() {
  const { state } = useSidebar();
  const { isAdmin } = useAdmin();
  const collapsed = state === 'collapsed';

  const mainItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Home },
    { title: 'Cases', url: '/cases', icon: FolderOpen },
    { title: 'Evidence', url: '/evidence', icon: Shield },
    { title: 'Notes', url: '/notes', icon: FileText },
  ];

  const advancedItems = [
    { title: 'AI Analyzer', url: '/ai/analyzer', icon: Activity },
    { title: 'Device Acquisition', url: '/devices/acquisition', icon: Database },
  ];

  const adminItems = [
    { title: 'Users', url: '/users', icon: Users },
  ];

  return (
    <SidebarUI className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarContent>
        <div className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            {!collapsed && (
              <div>
                <h1 className="text-xl font-bold text-primary">PIFAT</h1>
                <p className="text-xs text-muted-foreground">Forensics Toolkit</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Advanced</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {advancedItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-primary font-semibold"
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors hover:bg-sidebar-accent"
                        activeClassName="bg-sidebar-accent text-primary font-semibold"
                      >
                        <item.icon className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </SidebarUI>
  );
}
