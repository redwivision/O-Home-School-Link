import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, getDocs, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Calendar, Bell, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function ParentDashboard() {
  const { profile } = useAuth();
  const [children, setChildren] = useState<any[]>([]);
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;

    // 1. Get Children (Students where parentId == current user)
    const qChildren = query(collection(db, 'users'), where('parentId', '==', profile.id));
    const unsubscribeChildren = onSnapshot(qChildren, (snap) => {
      const childData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setChildren(childData);

      // 2. Get attendance for all children
      const childIds = childData.map(c => c.id);
      if (childIds.length > 0) {
        // Simple listener for attendance
        const qAttendance = query(collection(db, 'attendance'), where('studentId', 'in', childIds));
        onSnapshot(qAttendance, (attSnap) => {
          setAttendance(attSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        // 3. Get active trips for their buses
        const busNumbers = Array.from(new Set(childData.map(c => c.busNumber).filter(Boolean)));
        if (busNumbers.length > 0) {
          const qTrips = query(collection(db, 'trips'), where('busNumber', 'in', busNumbers), where('status', '==', 'in-progress'));
          onSnapshot(qTrips, (tripSnap) => {
            setActiveTrips(tripSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribeChildren();
  }, [profile?.id]);

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Welcome back, {profile?.name}</h1>
        <p className="text-zinc-500">Monitor your children's safe travel in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Status Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="text-zinc-400" size={20} />
            Today's Attendance
          </h2>
          
          {children.length > 0 ? children.map(child => {
            const childAttendance = attendance.find(a => a.studentId === child.id); // Simple logic
            return (
              <Card key={child.id} className="border-zinc-200 shadow-sm">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {child.name[0]}
                     </div>
                     <div>
                        <p className="font-bold text-zinc-900">{child.name}</p>
                        <p className="text-xs text-zinc-500">Bus: {child.busNumber || 'Not assigned'}</p>
                     </div>
                  </div>
                  <Badge className={cn(
                    "px-3 py-1 text-xs",
                    childAttendance?.status === 'present' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    childAttendance?.status === 'absent' ? "bg-red-50 text-red-700 border-red-100" :
                    "bg-zinc-50 text-zinc-400 border-zinc-100"
                  )} variant="outline">
                    {childAttendance?.status || 'No data'}
                  </Badge>
                </CardContent>
              </Card>
            );
          }) : (
            <div className="p-12 text-center bg-white border border-dashed border-zinc-200 rounded-2xl text-zinc-400 font-medium">
               No children linked to your account yet.
            </div>
          )}
        </div>

        {/* Live Trip Status */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bus className="text-zinc-400" size={20} />
            Live Trips
          </h2>
          
          {activeTrips.length > 0 ? activeTrips.map(trip => (
            <Card key={trip.id} className="border-blue-200 bg-blue-50/50 shadow-none overflow-hidden">
               <CardHeader className="pb-2">
                 <div className="flex items-center justify-between">
                    <Badge className="bg-blue-600 text-white border-0">BUS #{trip.busNumber}</Badge>
                    <div className="flex items-center text-[10px] text-blue-600 font-bold uppercase tracking-wider animate-pulse gap-1">
                       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> Live
                    </div>
                 </div>
                 <CardTitle className="text-base mt-2 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    {trip.currentLocation}
                 </CardTitle>
                 <CardDescription className="text-blue-700/70">{trip.lastUpdate}</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="pt-2 border-t border-blue-200/50 flex items-center justify-between">
                     <span className="text-xs text-blue-800/60">Started at {format(new Date(trip.startedAt), 'HH:mm')}</span>
                     <ArrowRight size={14} className="text-blue-600" />
                  </div>
               </CardContent>
            </Card>
          )) : (
            <Card className="border-zinc-200 shadow-none">
              <CardContent className="p-8 text-center text-zinc-400">
                <p className="text-sm">No buses currently on track.</p>
              </CardContent>
            </Card>
          )}

          <Card className="border-zinc-200 bg-zinc-900 text-white overflow-hidden">
             <CardContent className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-zinc-800 rounded-lg">
                      <Bell size={20} className="text-blue-400" />
                   </div>
                   <p className="font-semibold">Need Help?</p>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Contact school administrator for emergency or route changes.
                </p>
                <Button variant="secondary" className="w-full bg-zinc-800 text-white border-0 hover:bg-zinc-700">
                   Contact Support
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
