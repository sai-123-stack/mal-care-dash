import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Filter, Baby, Eye, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  gender: string;
  city: string;
  district: string;
  awc_center: string;
  guardian_name: string;
  current_status: string;
  created_at: string;
  updated_at: string;
}

export default function ViewChildren() {
  const [children, setChildren] = useState<Child[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [awcFilter, setAwcFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    filterChildren();
  }, [searchTerm, statusFilter, awcFilter, children]);

  const fetchChildren = async () => {
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildren(data || []);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast({
        title: "Error",
        description: "Failed to fetch children data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterChildren = () => {
    let filtered = children;

    if (searchTerm) {
      filtered = filtered.filter(child =>
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.guardian_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(child => child.current_status === statusFilter);
    }

    if (awcFilter !== 'all') {
      filtered = filtered.filter(child => child.awc_center === awcFilter);
    }

    setFilteredChildren(filtered);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'sam': return 'destructive';
      case 'mam': return 'secondary';
      case 'normal': return 'default';
      default: return 'outline';
    }
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const awcCenters = [...new Set(children.map(child => child.awc_center))];

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
        <h1 className="text-3xl font-bold">View Children</h1>
        <p className="text-muted-foreground">
          Manage and monitor all children in the system
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or guardian..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sam">SAM</SelectItem>
                <SelectItem value="mam">MAM</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <Select value={awcFilter} onValueChange={setAwcFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by AWC Center" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centers</SelectItem>
                {awcCenters.map(center => (
                  <SelectItem key={center} value={center}>{center}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Children Table */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Children Records ({filteredChildren.length})
          </CardTitle>
          <CardDescription>
            Complete list of children with their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>AWC Center</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChildren.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.name}</TableCell>
                    <TableCell>{getAge(child.date_of_birth)} years</TableCell>
                    <TableCell className="capitalize">{child.gender}</TableCell>
                    <TableCell>{child.guardian_name}</TableCell>
                    <TableCell>{child.awc_center}</TableCell>
                    <TableCell>{child.district}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(child.current_status)}>
                        {child.current_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(child.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}