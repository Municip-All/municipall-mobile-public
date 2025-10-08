import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const IndexRedirect: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    // Start app on the map (dashboard) for everyone
    router.replace('/dashboard');
  }, [router]);
  return null;
};

export default IndexRedirect;
