import { Baby, Plus, FileText, RefreshCw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Mock data for healthworker's AWC center
const awcData = {
  samCount: 3,
  mamCount: 7,
  normalCount: 25,
  totalChildren: 35
};

const quickActions = [
  {
    title: 'Add Child',
    description: 'Register a new child in the system',
    icon: Plus,
    action: '/healthworker/add-child',
    color: 'bg-health-primary'
  },
  {
    title: 'View Records',
    description: 'Browse child health records',
    icon: FileText,
    action: '/healthworker/records',
    color: 'bg-health-secondary'
  },
  {
    title: 'Repredict Status',
    description: 'Update malnutrition predictions',
    icon: RefreshCw,
    action: '/healthworker/records',
    color: 'bg-health-warning'
  },
  {
    title: 'Manage Records',
    description: 'Edit or delete existing records',
    icon: Trash2,
    action: '/healthworker/records',
    color: 'bg-health-danger'
  }
];

export default function HealthworkerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Health Worker Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.fullName} • {user?.awcCenter}
        </p>
      </div>

      {/* AWC Center Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-health-md border-l-4 border-l-status-sam">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SAM Cases</CardTitle>
            <Baby className="h-4 w-4 text-status-sam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-sam">{awcData.samCount}</div>
            <p className="text-xs text-muted-foreground">Severe acute malnutrition</p>
          </CardContent>
        </Card>

        <Card className="shadow-health-md border-l-4 border-l-status-mam">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MAM Cases</CardTitle>
            <Baby className="h-4 w-4 text-status-mam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-mam">{awcData.mamCount}</div>
            <p className="text-xs text-muted-foreground">Moderate acute malnutrition</p>
          </CardContent>
        </Card>

        <Card className="shadow-health-md border-l-4 border-l-status-normal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal Cases</CardTitle>
            <Baby className="h-4 w-4 text-status-normal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-normal">{awcData.normalCount}</div>
            <p className="text-xs text-muted-foreground">Well-nourished children</p>
          </CardContent>
        </Card>

        <Card className="shadow-health-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{awcData.totalChildren}</div>
            <p className="text-xs text-muted-foreground">In your AWC center</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for managing child health records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-health-md transition-shadow"
                onClick={() => navigate(action.action)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest updates from your AWC center</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div>
                <p className="font-medium">New child registered: Arjun Kumar</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
              <Badge className="bg-health-success text-white">New</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div>
                <p className="font-medium">Health record updated: Priya Sharma</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
              <Badge className="bg-health-primary text-white">Updated</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div>
                <p className="font-medium">Malnutrition status changed: Rohan Singh</p>
                <p className="text-sm text-muted-foreground">2 days ago</p>
              </div>
              <Badge className="bg-health-warning text-white">Alert</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}