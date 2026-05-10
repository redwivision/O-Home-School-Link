import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ManageAttendance() {
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get all students
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribeStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0];
    const qAttendance = query(collection(db, 'attendance')); // Ideally filtered by date in a real app
    const unsubscribeAttendance = onSnapshot(qAttendance, (snap) => {
      setAttendance(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeStudents();
      unsubscribeAttendance();
    };
  }, []);

  const recordAttendance = async (studentId: string, status: string) => {
    const today = new Date().toISOString();
    await addDoc(collection(db, 'attendance'), {
      studentId,
      status,
      date: today,
      recordedBy: 'admin'
    });
  };

  const getStatusForStudent = (studentId: string) => {
    // Basic logic for MVP: just get the latest record
    const records = attendance.filter(a => a.studentId === studentId);
    if (records.length === 0) return null;
    return records[records.length - 1].status;
  };

  return (
    <div className="space-y-6">
      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Current Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const status = getStatusForStudent(student.id);
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>
                      {status ? (
                        <Badge variant="secondary" className={cn(
                          "capitalize",
                          status === 'present' ? "bg-emerald-50 text-emerald-700" :
                          status === 'absent' ? "bg-red-50 text-red-700" :
                          "bg-amber-50 text-amber-700"
                        )}>
                          {status}
                        </Badge>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">No record today</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Select onValueChange={(val: string) => recordAttendance(student.id, val)}>
                        <SelectTrigger className="w-[130px] ml-auto h-8 text-xs">
                          <SelectValue placeholder="Mark as..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
