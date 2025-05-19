import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import useNearbyStores from '../hooks/useNearbyStores';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

import AnimatedBackground from '../components/common/AnimatedBackground';
import SimpleStore from '../components/dashboard/StoreCard'; // Using SimpleStore instead of StoreCard
import SavingsCard from '../components/dashboard/SavingsCard';
import DashboardWelcome from '../components/dashboard/DashboardWelcome';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [zip, setZip] = useState(null);
  const [userName, setUserName] = useState('');
  const [loadingZip, setLoadingZip] = useState(true);

  const { stores } = useNearbyStores(zip);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchUserData = async () => {
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const snapshot = await getDoc(docRef);
        const data = snapshot.data();
        if (data?.zip) setZip(data.zip);
        if (data?.name) setUserName(data.name);
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoadingZip(false);
      }
    };

    fetchUserData();
  }, [currentUser, navigate]);

  useEffect(() => {
    const saveStoreData = async () => {
      if (!currentUser || !stores || !stores.length || !zip) return;
      await setDoc(doc(db, 'users', currentUser.uid), {
        nearbyStores: stores,
      }, { merge: true });
    };
    saveStoreData();
  }, [stores, zip, currentUser]);

  if (loadingZip || !zip) {
    return (
      <div className="relative">
        <AnimatedBackground />
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            📍 Loading your location from profile...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-b from-green-50 to-white min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <DashboardWelcome name={userName} />

        <section className="mt-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🏪 <span>{stores?.length || 0} grocery stores found near</span> <span className="font-bold">{zip}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Display SimpleStore components instead of StoreCard */}
            {[1, 2, 3, 4].map((i) => (
              <SimpleStore key={i} />
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">💰 Your Potential Savings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SavingsCard label="Cheapest Total" value="$24.85" bgColor="bg-green-100" textColor="text-green-800" />
            <SavingsCard label="Most Expensive" value="$31.20" bgColor="bg-yellow-100" textColor="text-yellow-800" />
            <SavingsCard label="Your Savings" value="$6.35" bgColor="bg-blue-100" textColor="text-blue-800" />
          </div>
        </section>
      </div>
    </div>
  );
}