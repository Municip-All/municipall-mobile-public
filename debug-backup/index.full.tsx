import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';

const IndexRedirect: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    // Start app on the home screen
    router.replace('/home');
  }, [router]);
  return null;
};

export default IndexRedirect;
