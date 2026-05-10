import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Bus, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ManageTrips() {
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('startedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setTrips(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-zinc-200 shadow-sm overflow-hidden text-sm">
          <CardHeader className="bg-zinc-50 border-b border-zinc-200">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Bus size={18} className="text-blue-600" />
              Recent Trip Logs
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bus #</TableHead>
                  <TableHead>Driver ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Location</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.length > 0 ? trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell className="font-bold text-zinc-900">{trip.busNumber}</TableCell>
                    <TableCell className="text-zinc-500 font-mono text-[10px]">{trip.driverId}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={cn(
                        "capitalize",
                        trip.status === 'in-progress' ? "bg-blue-50 text-blue-700 animate-pulse" :
                        trip.status === 'completed' ? "bg-zinc-100 text-zinc-700" :
                        "bg-zinc-50 text-zinc-400"
                      )}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-1.5 text-zinc-600">
                          <MapPin size={14} className="text-zinc-400" />
                          {trip.currentLocation || 'Unknown'}
                       </div>
                    </TableCell>
                    <TableCell className="text-zinc-500">
                       <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <Clock size={14} />
                          {trip.startedAt ? format(new Date(trip.startedAt), 'HH:mm dd/MM') : 'N/A'}
                       </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                      No trip activity recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
