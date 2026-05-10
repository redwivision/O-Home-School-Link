import React, { useMemo, useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Bus, CalendarCheck, AlertTriangle, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalDrivers: 0,
    activeTrips: 0,
    attendanceToday: 0
  });

  useEffect(() => {
    // In a real app, these would be separate listeners or a combined function
    const qStudents = query(collection(db, 'users'), where('role', '==', 'student'));
    const unsubscribeStudents = onSnapshot(qStudents, (snap) => {
      setStats(prev => ({ ...prev, totalStudents: snap.size }));
    });

    const qDrivers = query(collection(db, 'users'), where('role', '==', 'driver'));
    const unsubscribeDrivers = onSnapshot(qDrivers, (snap) => {
      setStats(prev => ({ ...prev, totalDrivers: snap.size }));
    });

    const qTrips = query(collection(db, 'trips'), where('status', '==', 'in-progress'));
    const unsubscribeTrips = onSnapshot(qTrips, (snap) => {
      setStats(prev => ({ ...prev, activeTrips: snap.size }));
    });

    return () => {
      unsubscribeStudents();
      unsubscribeDrivers();
      unsubscribeTrips();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} color="blue" />
        <StatCard title="Total Drivers" value={stats.totalDrivers} icon={Bus} color="green" />
        <StatCard title="Active Trips" value={stats.activeTrips} icon={MapPin} color="amber" />
        <StatCard title="System Health" value="Active" icon={AlertTriangle} color="emerald" isStatus />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-zinc-200">
           <CardHeader>
             <CardTitle className="text-base font-semibold">Active Trips</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="text-sm text-zinc-500 italic">
               Live trip feed will appear here...
             </div>
           </CardContent>
        </Card>

        <Card className="border-zinc-200">
           <CardHeader>
             <CardTitle className="text-base font-semibold">Today's Attendance Summary</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm text-zinc-600">Present</span>
                 <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">75%</Badge>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-zinc-600">Absent</span>
                 <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-50">12%</Badge>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm text-zinc-600">Late</span>
                 <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50">13%</Badge>
               </div>
             </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };

  return (
    <Card className="border-zinc-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1 text-zinc-900">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-xl", colors[color])}>
            <Icon size={24} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
