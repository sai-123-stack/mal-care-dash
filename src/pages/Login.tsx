import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Baby, Loader2 } from 'lucide-react';
import heroImage from '@/assets/children-health-hero.jpg';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { user, login, isLoading } = useAuth();
  const { toast } = useToast();

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/healthworker'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const success = await login(username, password);
    
    if (!success) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Hero image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={heroImage} 
          alt="Children health monitoring" 
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-health-primary/20 to-health-secondary/20" />
        <div className="absolute bottom-8 left-8 text-white">
          <h1 className="text-3xl font-bold mb-2">HealthTrack</h1>
          <p className="text-xl opacity-90">Monitoring child nutrition for a healthier future</p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-background to-accent/20">
        <Card className="w-full max-w-md shadow-health-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-health rounded-xl flex items-center justify-center">
                <Baby className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your HealthTrack account
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-health hover:opacity-90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-accent/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="text-xs space-y-1">
                <p><strong>Admin:</strong> username: admin, password: admin123</p>
                <p><strong>Health Worker:</strong> username: health001, password: health123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}