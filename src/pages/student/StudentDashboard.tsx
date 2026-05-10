import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bus, MapPin, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.id) return;

    // 1. Get attendance history
    const qAttendance = query(
      collection(db, 'attendance'), 
      where('studentId', '==', profile.id),
      orderBy('date', 'desc'),
      limit(10)
    );
    const unsubscribeAtt = onSnapshot(qAttendance, (snap) => {
      setAttendance(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Get active trip status if assigned to a bus
    if (profile.busNumber) {
      const qTrip = query(
        collection(db, 'trips'),
        where('busNumber', '==', profile.busNumber),
        where('status', '==', 'in-progress'),
        limit(1)
      );
      onSnapshot(qTrip, (snap) => {
        if (!snap.empty) {
          setActiveTrip({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setActiveTrip(null);
        }
      });
    }

    return () => unsubscribeAtt();
  }, [profile?.id, profile?.busNumber]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-100">
           {profile?.name?.[0]}
        </div>
        <div>
           <h1 className="text-3xl font-bold text-zinc-900">{profile?.name}</h1>
           <div className="flex gap-4 mt-2">
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-zinc-200">
                 Student ID: {profile?.id.slice(0, 8)}
              </Badge>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-blue-100">
                 Bus: {profile?.busNumber || 'N/A'}
              </Badge>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Attendance History */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <Calendar className="text-zinc-400" size={20} />
              Recent Attendance
           </div>
           <div className="space-y-2">
              {attendance.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-xl">
                   <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        record.status === 'present' ? "bg-emerald-50 text-emerald-600" :
                        record.status === 'absent' ? "bg-red-50 text-red-600" :
                        "bg-amber-50 text-amber-600"
                      )}>
                        <Clock size={16} />
                      </div>
                      <span className="text-sm font-medium text-zinc-700">
                         {format(new Date(record.date), 'MMM dd, yyyy')}
                      </span>
                   </div>
                   <Badge className="capitalize" variant="outline">{record.status}</Badge>
                </div>
              ))}
              {attendance.length === 0 && (
                <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-200 rounded-xl italic text-sm">
                   No attendance records found yet.
                </div>
              )}
           </div>
        </section>

        {/* Real-time Trip Section */}
        <section className="space-y-4">
           <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <Bus className="text-zinc-400" size={20} />
              My Bus Status
           </div>
           
           {activeTrip ? (
             <Card className="border-blue-200 bg-blue-50/50 shadow-none overflow-hidden ring-4 ring-blue-50">
                <CardHeader>
                   <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                      </span>
                      Live Tracking
                   </div>
                   <CardTitle className="mt-2 text-2xl font-bold flex items-center gap-2">
                      <MapPin className="text-blue-600" size={24} />
                      {activeTrip.currentLocation}
                   </CardTitle>
                   <CardDescription className="text-blue-700 mt-1 font-medium italic">
                      “{activeTrip.lastUpdate}”
                   </CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-blue-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                      <span>Started: {format(new Date(activeTrip.startedAt), 'HH:mm')}</span>
                      <span>Bus No: {activeTrip.busNumber}</span>
                   </div>
                </CardContent>
             </Card>
           ) : (
             <Card className="border-zinc-200 shadow-none">
                <CardContent className="p-12 flex flex-col items-center text-center space-y-4">
                   <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300">
                      <Bus size={32} />
                   </div>
                   <div className="space-y-1">
                      <p className="font-bold text-zinc-900">Bus is Offline</p>
                      <p className="text-zinc-500 text-sm">Your bus isn't currently tracking. It might not have started yet.</p>
                   </div>
                </CardContent>
             </Card>
           )}
        </section>
      </div>
    </div>
  );
}
