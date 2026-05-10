import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
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
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search, MoreVertical, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function ManageStudents() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'student',
    busNumber: '',
    parentId: '',
    driverId: '',
  });

  useEffect(() => {
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async () => {
    try {
      // For MVP, we use the email prefix as a temporary ID if we don't have a UID yet
      // In real apps, this would be an Admin SDK call to create the auth user too
      const tempId = newUserData.email.split('@')[0] + '_' + Date.now();
      await setDoc(doc(db, 'users', tempId), {
        ...newUserData,
        id: tempId,
      });
      setNewUserData({ name: '', email: '', role: 'student', busNumber: '', parentId: '', driverId: '' });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, 'users', id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <Input 
            placeholder="Search users..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <UserPlus size={18} />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value})} placeholder="john@school.com" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newUserData.role} onValueChange={v => setNewUserData({...newUserData, role: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newUserData.role === 'student' && (
                <div className="space-y-2">
                  <Label>Bus Number</Label>
                  <Input value={newUserData.busNumber} onChange={e => setNewUserData({...newUserData, busNumber: e.target.value})} placeholder="A-101" />
                </div>
              )}

              <Button onClick={handleCreateUser} className="w-full bg-blue-600 hover:bg-blue-700">Save Profile</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50 border-b border-zinc-200">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-900">{u.name}</span>
                      <span className="text-xs text-zinc-500">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "capitalize",
                      u.role === 'admin' ? "border-purple-200 text-purple-700 bg-purple-50" :
                      u.role === 'driver' ? "border-amber-200 text-amber-700 bg-amber-50" :
                      u.role === 'parent' ? "border-blue-200 text-blue-700 bg-blue-50" :
                      "border-emerald-200 text-emerald-700 bg-emerald-50"
                    )}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600 text-sm">
                    {u.role === 'student' && `Bus: ${u.busNumber || 'N/A'}`}
                    {u.role === 'driver' && `Bus: ${u.busNumber || 'N/A'}`}
                    {u.role === 'parent' && `${u.studentIds?.length || 0} students`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(u.id)} className="text-zinc-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                  {loading ? "Loading users..." : "No users found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
