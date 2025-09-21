import { 
  LayoutDashboard, 
  UserPlus, 
  Users, 
  BarChart3,
  Baby,
  FileText,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Add Healthworker", url: "/admin/add-healthworker", icon: UserPlus },
  { title: "View Children", url: "/admin/children", icon: Users },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
];

const healthworkerMenuItems = [
  { title: "Dashboard", url: "/healthworker", icon: LayoutDashboard },
  { title: "Add Child", url: "/healthworker/add-child", icon: Baby },
  { title: "Child Records", url: "/healthworker/records", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = user?.role === 'admin' ? adminMenuItems : healthworkerMenuItems;
  const isCollapsed = state === 'collapsed';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-health-primary text-white font-medium hover:bg-health-primary" 
      : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="p-4 border-b">
          {!isCollapsed ? (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-health rounded-lg flex items-center justify-center">
                <Baby className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">HealthTrack</h2>
                <p className="text-xs text-muted-foreground">Malnutrition Monitor</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-health rounded-lg flex items-center justify-center mx-auto">
              <Baby className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>
            {!isCollapsed && (user?.role === 'admin' ? 'Administration' : 'Health Worker')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClassName}>
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!isCollapsed && (
          <div className="p-4 border-t">
            <div className="text-sm">
              <p className="font-medium">{user?.fullName}</p>
              <p className="text-muted-foreground capitalize">{user?.role}</p>
              {user?.awcCenter && (
                <p className="text-xs text-muted-foreground">{user.awcCenter}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full mt-2 justify-start"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
        {isCollapsed && (
          <div className="p-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}