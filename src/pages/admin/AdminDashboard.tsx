import { Users, Baby, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock data
const summaryData = {
  totalHealthworkers: 12,
  totalChildren: 145,
  samCount: 8,
  mamCount: 23,
  normalCount: 114
};

const childrenData = [
  {
    id: '1',
    name: 'Arjun Kumar',
    awcCenter: 'AWC Center 1',
    age: '2 years 3 months',
    status: 'SAM',
    lastRecord: '2024-01-15',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    awcCenter: 'AWC Center 2',
    age: '1 year 8 months',
    status: 'MAM',
    lastRecord: '2024-01-14',
  },
  {
    id: '3',
    name: 'Rohan Singh',
    awcCenter: 'AWC Center 1',
    age: '3 years 1 month',
    status: 'Normal',
    lastRecord: '2024-01-13',
  },
];

function getStatusBadge(status: string) {
  switch (status) {
    case 'SAM':
      return <Badge className="bg-status-sam text-white">SAM</Badge>;
    case 'MAM':
      return <Badge className="bg-status-mam text-white">MAM</Badge>;
    case 'Normal':
      return <Badge className="bg-status-normal text-white">Normal</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor malnutrition across all AWC centers</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by AWC Center" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Centers</SelectItem>
              <SelectItem value="awc1">AWC Center 1</SelectItem>
              <SelectItem value="awc2">AWC Center 2</SelectItem>
              <SelectItem value="awc3">AWC Center 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-health-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Health Workers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalHealthworkers}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-health-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Baby className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryData.totalChildren}</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-health-md border-l-4 border-l-status-sam">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SAM Cases</CardTitle>
            <AlertTriangle className="h-4 w-4 text-status-sam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-sam">{summaryData.samCount}</div>
            <p className="text-xs text-muted-foreground">Severe acute malnutrition</p>
          </CardContent>
        </Card>

        <Card className="shadow-health-md border-l-4 border-l-status-mam">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MAM Cases</CardTitle>
            <TrendingUp className="h-4 w-4 text-status-mam" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-mam">{summaryData.mamCount}</div>
            <p className="text-xs text-muted-foreground">Moderate acute malnutrition</p>
          </CardContent>
        </Card>

        <Card className="shadow-health-md border-l-4 border-l-status-normal">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Normal Cases</CardTitle>
            <Baby className="h-4 w-4 text-status-normal" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-status-normal">{summaryData.normalCount}</div>
            <p className="text-xs text-muted-foreground">Well-nourished children</p>
          </CardContent>
        </Card>
      </div>

      {/* Children Table */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle>All Children</CardTitle>
          <CardDescription>Complete list of children across all AWC centers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>AWC Center</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Record</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {childrenData.map((child) => (
                <TableRow key={child.id}>
                  <TableCell className="font-medium">{child.name}</TableCell>
                  <TableCell>{child.awcCenter}</TableCell>
                  <TableCell>{child.age}</TableCell>
                  <TableCell>{getStatusBadge(child.status)}</TableCell>
                  <TableCell>{child.lastRecord}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}