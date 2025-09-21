import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Baby, Plus, Eye, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
}

interface HealthRecord {
  id: string;
  height: number;
  weight: number;
  edema: boolean;
  poverty_index: number;
  sanitation_index: number;
  meals_per_day: number;
  predicted_status: string;
  sam_probability: number;
  mam_probability: number;
  normal_probability: number;
  recorded_at: string;
}

export default function ChildRecords() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [children, setChildren] = useState<Child[]>([]);
  const [filteredChildren, setFilteredChildren] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecordDialogOpen, setIsRecordDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    height: '',
    weight: '',
    edema: false,
    poverty_index: '',
    sanitation_index: '',
    meals_per_day: ''
  });

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    filterChildren();
  }, [searchTerm, children]);

  const fetchChildren = async () => {
    if (!user?.awcCenter) return;
    
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('awc_center', user.awcCenter)
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

  const fetchHealthRecords = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('child_id', childId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      setHealthRecords(data || []);
    } catch (error) {
      console.error('Error fetching health records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch health records",
        variant: "destructive"
      });
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

    setFilteredChildren(filtered);
  };

  const predictMalnutrition = (height: number, weight: number, edema: boolean, poverty: number, sanitation: number, meals: number) => {
    // Simple prediction algorithm for demo purposes
    let samProb = 0;
    let mamProb = 0;
    let normalProb = 0;

    // BMI calculation for age (simplified)
    const bmi = weight / ((height / 100) ** 2);
    
    if (edema || bmi < 16 || poverty > 7 || sanitation > 7 || meals < 2) {
      samProb = 0.7 + Math.random() * 0.25;
      mamProb = 0.2 + Math.random() * 0.15;
      normalProb = 0.1 + Math.random() * 0.1;
    } else if (bmi < 18.5 || poverty > 5 || sanitation > 5 || meals < 3) {
      samProb = 0.1 + Math.random() * 0.15;
      mamProb = 0.6 + Math.random() * 0.25;
      normalProb = 0.3 + Math.random() * 0.2;
    } else {
      samProb = 0.05 + Math.random() * 0.1;
      mamProb = 0.15 + Math.random() * 0.15;
      normalProb = 0.8 + Math.random() * 0.15;
    }

    // Normalize probabilities
    const total = samProb + mamProb + normalProb;
    samProb /= total;
    mamProb /= total;
    normalProb /= total;

    const predicted = samProb > mamProb && samProb > normalProb ? 'sam' :
                     mamProb > normalProb ? 'mam' : 'normal';

    return {
      predicted_status: predicted,
      sam_probability: parseFloat(samProb.toFixed(4)),
      mam_probability: parseFloat(mamProb.toFixed(4)),
      normal_probability: parseFloat(normalProb.toFixed(4))
    };
  };

  const handleAddRecord = async () => {
    if (!selectedChild) return;

    try {
      const height = parseFloat(newRecord.height);
      const weight = parseFloat(newRecord.weight);
      const poverty = parseInt(newRecord.poverty_index);
      const sanitation = parseInt(newRecord.sanitation_index);
      const meals = parseInt(newRecord.meals_per_day);

      const prediction = predictMalnutrition(height, weight, newRecord.edema, poverty, sanitation, meals);

      // Get healthworker record
      const { data: healthworker, error: hwError } = await supabase
        .from('healthworkers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (hwError) throw new Error('Healthworker record not found');

      const { error } = await supabase
        .from('health_records')
        .insert({
          child_id: selectedChild.id,
          height,
          weight,
          edema: newRecord.edema,
          poverty_index: poverty,
          sanitation_index: sanitation,
          meals_per_day: meals,
          predicted_status: prediction.predicted_status,
          sam_probability: prediction.sam_probability,
          mam_probability: prediction.mam_probability,
          normal_probability: prediction.normal_probability,
          recorded_by: healthworker.id
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Health record added successfully",
        variant: "default"
      });

      setIsRecordDialogOpen(false);
      setNewRecord({
        height: '',
        weight: '',
        edema: false,
        poverty_index: '',
        sanitation_index: '',
        meals_per_day: ''
      });
      
      fetchHealthRecords(selectedChild.id);
      fetchChildren(); // Refresh to get updated status
    } catch (error) {
      console.error('Error adding health record:', error);
      toast({
        title: "Error",
        description: "Failed to add health record",
        variant: "destructive"
      });
    }
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
        <h1 className="text-3xl font-bold">Child Records</h1>
        <p className="text-muted-foreground">
          Manage health records for children in {user?.awcCenter}
        </p>
      </div>

      {/* Search */}
      <Card className="shadow-health-md">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by child name or guardian..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Children Table */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Children in Your AWC ({filteredChildren.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Guardian</TableHead>
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
                    <TableCell>{child.guardian_name}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(child.current_status)}>
                        {child.current_status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(child.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedChild(child);
                                fetchHealthRecords(child.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Health Records - {child.name}</DialogTitle>
                              <DialogDescription>
                                View and manage health records for this child
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Health Records</h3>
                                <Button
                                  onClick={() => setIsRecordDialogOpen(true)}
                                  className="bg-gradient-health hover:opacity-90"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Record
                                </Button>
                              </div>

                              {healthRecords.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                  No health records found for this child
                                </p>
                              ) : (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Height (cm)</TableHead>
                                      <TableHead>Weight (kg)</TableHead>
                                      <TableHead>Status</TableHead>
                                      <TableHead>Probabilities</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {healthRecords.map((record) => (
                                      <TableRow key={record.id}>
                                        <TableCell>
                                          {new Date(record.recorded_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{record.height}</TableCell>
                                        <TableCell>{record.weight}</TableCell>
                                        <TableCell>
                                          <Badge variant={getStatusBadgeVariant(record.predicted_status)}>
                                            {record.predicted_status.toUpperCase()}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                          <div>SAM: {(record.sam_probability * 100).toFixed(1)}%</div>
                                          <div>MAM: {(record.mam_probability * 100).toFixed(1)}%</div>
                                          <div>Normal: {(record.normal_probability * 100).toFixed(1)}%</div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Health Record Dialog */}
      <Dialog open={isRecordDialogOpen} onOpenChange={setIsRecordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Health Record</DialogTitle>
            <DialogDescription>
              Enter measurements and details for {selectedChild?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Height (cm)</Label>
                <Input
                  type="number"
                  placeholder="Enter height"
                  value={newRecord.height}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Weight (kg)</Label>
                <Input
                  type="number"
                  placeholder="Enter weight"
                  value={newRecord.weight}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, weight: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Poverty Index (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={newRecord.poverty_index}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, poverty_index: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Sanitation Index (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={newRecord.sanitation_index}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, sanitation_index: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Meals per Day</Label>
                <Input
                  type="number"
                  min="1"
                  value={newRecord.meals_per_day}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, meals_per_day: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edema"
                checked={newRecord.edema}
                onChange={(e) => setNewRecord(prev => ({ ...prev, edema: e.target.checked }))}
              />
              <Label htmlFor="edema">Has Edema</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsRecordDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddRecord}
                className="flex-1 bg-gradient-health hover:opacity-90"
                disabled={!newRecord.height || !newRecord.weight || !newRecord.poverty_index || !newRecord.sanitation_index || !newRecord.meals_per_day}
              >
                Add Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}