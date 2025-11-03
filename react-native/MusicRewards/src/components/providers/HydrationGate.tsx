import React from 'react';
import { selectUserRehydrated, useUserStore } from '../../stores/userStore';
import { selectMusicRehydrated, useMusicStore } from '../../stores/musicStore';

interface Props {
  children: React.ReactNode;
}

export const HydrationGate: React.FC<Props> = ({ children }) => {
  const userHydrated = useUserStore(selectUserRehydrated);
  const musicHydrated = useMusicStore(selectMusicRehydrated);
  if (!userHydrated || !musicHydrated) return null;
  return <>{children}</>;
};

export default HydrationGate;


