import { useEffect, useState } from 'react';
import api from '../api/axios';

interface Props {
  children: React.ReactNode;
}

export default function ProtectedClientRoute({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/client/clientAuth'); 
        if (res.status === 200) {
          setIsAuthenticated(true);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Checking login status...</div>;
  }

  if (!isAuthenticated) {
    return <h1>Not Logged In</h1>;
  }

  return <>{children}</>;
}
