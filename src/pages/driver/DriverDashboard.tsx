import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { collection, query, where, onSnapshot, updateDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bus, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function DriverDashboard() {
  const { profile } = useAuth();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [locationInput, setLocationInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!profile?.id) return;
    
    // Listen for current active trip
    const q = query(
      collection(db, 'trips'), 
      where('driverId', '==', profile.id), 
      where('status', '==', 'in-progress')
    );
    
    const unsubscribe = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        setActiveTrip({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setActiveTrip(null);
      }
    });

    return () => unsubscribe();
  }, [profile?.id]);

  const startTrip = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const tripId = `trip_${profile.id}_${Date.now()}`;
      await setDoc(doc(db, 'trips', tripId), {
        driverId: profile.id,
        busNumber: profile.busNumber || 'N/A',
        status: 'in-progress',
        currentLocation: 'School Depot',
        startedAt: new Date().toISOString(),
        lastUpdate: 'Trip started at Depot'
      });
      toast.success('Trip started successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  const endTrip = async () => {
    if (!activeTrip) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'trips', activeTrip.id), {
        status: 'completed',
        endedAt: new Date().toISOString(),
        lastUpdate: 'Trip completed safely'
      });
      toast.success('Trip completed safely');
    } catch (err) {
      console.error(err);
      toast.error('Failed to end trip');
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async () => {
    if (!activeTrip || !locationInput) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'trips', activeTrip.id), {
        currentLocation: locationInput,
        lastUpdate: `Vehicle reached ${locationInput}`
      });
      toast.info(`Location updated to ${locationInput}`);
      setLocationInput('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AnimatePresence mode="wait">
        {!activeTrip ? (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="text-center p-8 border-zinc-200">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-zinc-100 rounded-full text-zinc-400">
                  <Bus size={48} />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-2xl">Ready for duty?</CardTitle>
                  <CardDescription>Start your trip to begin sharing your location and status.</CardDescription>
                </div>
                <Button 
                  onClick={startTrip} 
                  disabled={loading}
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full max-w-sm mt-4 px-12 py-6 rounded-2xl text-lg font-bold shadow-lg shadow-blue-200"
                >
                  <Navigation className="mr-2" /> Start Trip
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="active"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
          >
            <Card className="border-blue-200 bg-blue-50/30 overflow-hidden">
               <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    <span className="font-bold tracking-tight">LIVE TRIP IN PROGRESS</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-400/20 text-white border-white/20">
                    Bus #{activeTrip.busNumber}
                  </Badge>
               </div>
               <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4">
                     <div className="mt-1">
                        <MapPin className="text-blue-600" />
                     </div>
                     <div>
                        <p className="text-sm font-medium text-zinc-500">Current Location</p>
                        <p className="text-2xl font-bold text-zinc-900">{activeTrip.currentLocation}</p>
                     </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-zinc-600">Update Location Manually</p>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. Near Central Park station" 
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        className="bg-white"
                      />
                      <Button onClick={updateLocation} disabled={loading || !locationInput}>Update</Button>
                    </div>
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-zinc-200 p-6 flex flex-col items-center text-center space-y-3 cursor-pointer hover:bg-zinc-50 transition-colors">
                 <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                    <AlertCircle size={24} />
                 </div>
                 <p className="font-semibold text-zinc-900">Traffic Delay</p>
                 <Button variant="outline" size="sm" onClick={() => {/* Update status logic */}}>Report Delay</Button>
              </Card>

              <Card className="border-zinc-200 p-6 flex flex-col items-center text-center space-y-3 cursor-pointer hover:bg-zinc-50 transition-colors">
                 <div className="p-3 bg-emerald-50 rounded-full text-emerald-600">
                    <CheckCircle2 size={24} />
                 </div>
                 <p className="font-semibold text-zinc-900">Finish Trip</p>
                 <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={endTrip} disabled={loading}>Complete Mission</Button>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
