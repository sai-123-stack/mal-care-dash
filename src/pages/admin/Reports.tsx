import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarIcon, BarChart3, PieChart, Download } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  awc_center: string;
  sam_count: number;
  mam_count: number;
  normal_count: number;
  total_count: number;
}

interface StatusSummary {
  status: string;
  count: number;
  percentage: number;
}

const COLORS = {
  sam: 'hsl(var(--status-sam))',
  mam: 'hsl(var(--status-mam))',
  normal: 'hsl(var(--status-normal))'
};

export default function Reports() {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [statusSummary, setStatusSummary] = useState<StatusSummary[]>([]);
  const [selectedAWC, setSelectedAWC] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, [selectedAWC, dateRange]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('children')
        .select('awc_center, current_status');

      if (selectedAWC !== 'all') {
        query = query.eq('awc_center', selectedAWC);
      }

      if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        query = query.gte('created_at', cutoffDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data for charts
      const awcData: { [key: string]: ReportData } = {};
      const statusCounts = { sam: 0, mam: 0, normal: 0 };

      data?.forEach((child) => {
        const awc = child.awc_center;
        const status = child.current_status;

        if (!awcData[awc]) {
          awcData[awc] = {
            awc_center: awc,
            sam_count: 0,
            mam_count: 0,
            normal_count: 0,
            total_count: 0
          };
        }

        if (status === 'sam') awcData[awc].sam_count += 1;
        else if (status === 'mam') awcData[awc].mam_count += 1;
        else if (status === 'normal') awcData[awc].normal_count += 1;
        awcData[awc].total_count += 1;
        statusCounts[status as keyof typeof statusCounts] += 1;
      });

      setReportData(Object.values(awcData));

      // Calculate status summary
      const totalChildren = Object.values(statusCounts).reduce((a, b) => a + b, 0);
      const summary = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.toUpperCase(),
        count,
        percentage: totalChildren > 0 ? Math.round((count / totalChildren) * 100) : 0
      }));

      setStatusSummary(summary);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const awcCenters = [...new Set(reportData.map(item => item.awc_center))];

  const pieChartData = statusSummary.map(item => ({
    name: item.status,
    value: item.count,
    color: COLORS[item.status.toLowerCase() as keyof typeof COLORS]
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive malnutrition data analysis and insights
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedAWC} onValueChange={setSelectedAWC}>
              <SelectTrigger>
                <SelectValue placeholder="Select AWC Center" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centers</SelectItem>
                {awcCenters.map(center => (
                  <SelectItem key={center} value={center}>{center}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 3 Months</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusSummary.map((item) => (
          <Card key={item.status} className="shadow-health-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.status} Cases</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.count}</div>
              <p className="text-xs text-muted-foreground">
                {item.percentage}% of total children
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="shadow-health-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Status by AWC Center
            </CardTitle>
            <CardDescription>
              Malnutrition cases distribution across AWC centers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="awc_center" 
                  fontSize={12}
                  tick={{ fill: 'hsl(var(--foreground))' }}
                />
                <YAxis fontSize={12} tick={{ fill: 'hsl(var(--foreground))' }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="sam_count" stackId="a" fill={COLORS.sam} name="SAM" />
                <Bar dataKey="mam_count" stackId="a" fill={COLORS.mam} name="MAM" />
                <Bar dataKey="normal_count" stackId="a" fill={COLORS.normal} name="Normal" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="shadow-health-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Overall Status Distribution
            </CardTitle>
            <CardDescription>
              Total malnutrition status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}