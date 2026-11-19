import React from 'react';
import { User } from '../../types';

interface DemoSwitcherBarProps {
  currentUser: User | null;
  onSwitchRole: (role: 'investor' | 'franchiser' | 'admin' | 'guest') => void;
  onLogout: () => void;
  onOpenAuth: (role?: 'investor' | 'franchiser' | 'admin') => void;
}

export const DemoSwitcherBar: React.FC<DemoSwitcherBarProps> = () => {
  return null;
};
