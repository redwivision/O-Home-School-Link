import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, APP_CONFIG } from '../lib/firebase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'parent' | 'student' | 'driver';
  busNumber?: string;
  parentId?: string;
  driverId?: string;
  studentIds?: string[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
      } else {
        // FALLBACK: If profile isn't created in Firestore yet, derive it from email
        const fallbackRole = APP_CONFIG.adminEmails.includes(user.email || '') ? 'admin' : APP_CONFIG.defaultRole;
        setProfile({
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          role: fallbackRole,
        });
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore error (likely permissions). Using fallback profile:", error.message);
      // Ensure we don't get stuck on a blank screen even if permissions fail
      const fallbackRole = APP_CONFIG.adminEmails.includes(user.email || '') ? 'admin' : APP_CONFIG.defaultRole;
      setProfile({
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: fallbackRole,
      });
      setLoading(false);
    });

    return () => unsubscribeProfile();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
