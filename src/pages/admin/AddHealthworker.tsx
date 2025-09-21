import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Trash2, Edit } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Healthworker {
  id: string;
  fullName: string;
  awcCenter: string;
  username: string;
  password: string;
  createdAt: string;
}

// Mock existing healthworkers
const initialHealthworkers: Healthworker[] = [
  {
    id: '1',
    fullName: 'Dr. Sarah Johnson',
    awcCenter: 'AWC Center 1',
    username: 'health001',
    password: 'health123',
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    fullName: 'Dr. Raj Patel',
    awcCenter: 'AWC Center 2',
    username: 'health002',
    password: 'health456',
    createdAt: '2024-01-08'
  }
];

export default function AddHealthworker() {
  const [fullName, setFullName] = useState('');
  const [awcCenter, setAwcCenter] = useState('');
  const [healthworkers, setHealthworkers] = useState<Healthworker[]>(initialHealthworkers);
  const [newCredentials, setNewCredentials] = useState<Healthworker | null>(null);
  const { toast } = useToast();

  const generateUsername = (name: string) => {
    const prefix = 'health';
    const number = String(healthworkers.length + 1).padStart(3, '0');
    return `${prefix}${number}`;
  };

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !awcCenter) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const username = generateUsername(fullName);
    const password = generatePassword();
    
    const newHealthworker: Healthworker = {
      id: Date.now().toString(),
      fullName,
      awcCenter,
      username,
      password,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setHealthworkers([...healthworkers, newHealthworker]);
    setNewCredentials(newHealthworker);
    
    // Reset form
    setFullName('');
    setAwcCenter('');

    toast({
      title: "Success",
      description: "Healthworker added successfully",
    });
  };

  const handleDelete = (id: string) => {
    setHealthworkers(healthworkers.filter(h => h.id !== id));
    toast({
      title: "Deleted",
      description: "Healthworker removed successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add Healthworker</h1>
        <p className="text-muted-foreground">Create new healthworker accounts for AWC centers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Healthworker Form */}
        <Card className="shadow-health-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Healthworker
            </CardTitle>
            <CardDescription>
              Create login credentials for a new healthworker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="awcCenter">AWC Center</Label>
                <Select value={awcCenter} onValueChange={setAwcCenter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select AWC Center" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AWC Center 1">AWC Center 1</SelectItem>
                    <SelectItem value="AWC Center 2">AWC Center 2</SelectItem>
                    <SelectItem value="AWC Center 3">AWC Center 3</SelectItem>
                    <SelectItem value="AWC Center 4">AWC Center 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-gradient-health">
                Create Healthworker Account
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Credentials Display */}
        {newCredentials && (
          <Card className="shadow-health-md border-l-4 border-l-health-primary">
            <CardHeader>
              <CardTitle className="text-health-primary">Login Credentials Created</CardTitle>
              <CardDescription>
                Share these credentials with the healthworker
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Full Name</Label>
                <p className="text-sm">{newCredentials.fullName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">AWC Center</Label>
                <p className="text-sm">{newCredentials.awcCenter}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Username</Label>
                <p className="text-sm font-mono bg-accent px-2 py-1 rounded">
                  {newCredentials.username}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <p className="text-sm font-mono bg-accent px-2 py-1 rounded">
                  {newCredentials.password}
                </p>
              </div>
              <Badge className="bg-health-success text-white">
                Account Created Successfully
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Existing Healthworkers */}
      <Card className="shadow-health-md">
        <CardHeader>
          <CardTitle>Existing Healthworkers</CardTitle>
          <CardDescription>Manage healthworker accounts and credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>AWC Center</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthworkers.map((healthworker) => (
                <TableRow key={healthworker.id}>
                  <TableCell className="font-medium">{healthworker.fullName}</TableCell>
                  <TableCell>{healthworker.awcCenter}</TableCell>
                  <TableCell>
                    <code className="bg-accent px-2 py-1 rounded text-sm">
                      {healthworker.username}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="bg-accent px-2 py-1 rounded text-sm">
                      {healthworker.password}
                    </code>
                  </TableCell>
                  <TableCell>{healthworker.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(healthworker.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
