import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { CalendarIcon, Baby, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function AddChild() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    district: '',
    guardianName: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.awcCenter) {
      toast({
        title: "Error",
        description: "AWC Center not found for your account",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get healthworker record
      const { data: healthworker, error: hwError } = await supabase
        .from('healthworkers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (hwError) {
        throw new Error('Healthworker record not found');
      }

      const { error } = await supabase
        .from('children')
        .insert({
          name: formData.name,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          city: formData.city,
          district: formData.district,
          awc_center: user.awcCenter,
          guardian_name: formData.guardianName,
          healthworker_id: healthworker.id,
          current_status: 'normal'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Child registered successfully",
        variant: "default"
      });

      navigate('/healthworker/records');
    } catch (error) {
      console.error('Error adding child:', error);
      toast({
        title: "Error",
        description: "Failed to register child",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/healthworker')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Child</h1>
          <p className="text-muted-foreground">
            Register a new child in {user?.awcCenter}
          </p>
        </div>
      </div>

      <Card className="shadow-health-lg max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="h-5 w-5" />
            Child Registration Form
          </CardTitle>
          <CardDescription>
            Enter the child's details to register them in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Child's Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter child's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianName">Guardian's Name *</Label>
                <Input
                  id="guardianName"
                  placeholder="Enter guardian's full name"
                  value={formData.guardianName}
                  onChange={(e) => handleInputChange('guardianName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Input
                  id="district"
                  placeholder="Enter district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>AWC Center</Label>
              <Input
                value={user?.awcCenter || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                This child will be registered under your AWC center
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/healthworker')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex-1 bg-gradient-health hover:opacity-90"
              >
                {isLoading ? 'Registering...' : 'Register Child'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}