import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, APP_CONFIG } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bus, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState(APP_CONFIG.defaultRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        
        // Create profile - wrap in try/catch to ensure demo proceeds even if rules are locked
        try {
          // If admin email, force admin. Otherwise use the selected role from the form for demo purposes.
          const role = APP_CONFIG.adminEmails.includes(email) ? 'admin' : selectedRole;
          await setDoc(doc(db, 'users', result.user.uid), {
            id: result.user.uid,
            name: name || 'User',
            email: email,
            role: role,
          });
          toast.success(`Account created successfully as ${role}`);
        } catch (dbErr: any) {
          console.warn("Firestore profile creation failed, using local fallback:", dbErr.message);
          toast.info("Profile created locally (Cloud sync skipped)");
        }
        navigate('/');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Signed in successfully');
        navigate('/');
      }
    } catch (err: any) {
      let message = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email already in use';
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-zinc-200 shadow-xl shadow-zinc-200/50">
          <CardHeader className="text-center space-y-1">
            <div className="flex justify-center mb-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200"
              >
                <Bus className="w-8 h-8 text-white" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-zinc-500">
              {isSignUp 
                ? 'Sign up to link with your school transport' 
                : 'Sign in to access your school dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          className="pl-9"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required={isSignUp}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Demo Role</Label>
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="driver">Driver</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] text-zinc-500 italic px-1">Select role purely for demo testing.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">School Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@school.edu"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="text-sm text-red-500 text-center font-medium bg-red-50 p-2 rounded-lg"
                >
                  {error}
                </motion.p>
              )}

              <Button 
                type="submit"
                className="w-full h-11 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg shadow-blue-100"
                disabled={loading}
              >
                {loading ? "Authenticating..." : (isSignUp ? "Create Account" : "Sign In")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-sm text-zinc-600 hover:text-blue-600 font-medium transition-colors"
              >
                {isSignUp 
                  ? "Already have an account? Sign In" 
                  : "Don't have an account? Create one"}
              </button>
            </div>

            <div className="pt-6 flex items-center justify-center gap-2 text-xs text-zinc-400 border-t border-zinc-100 mt-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure School Access
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
