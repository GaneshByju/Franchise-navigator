import { User } from '../types';

/**
 * Tab-isolated authentication storage utility.
 * Uses sessionStorage so that opening or pasting a link in another tab
 * does not inadvertently share or leak the logged-in user profile.
 */
export const authStorage = {
  getUser: (): User | null => {
    try {
      // Prioritize sessionStorage to ensure strict per-tab isolation
      const sessionRaw = sessionStorage.getItem('user') || sessionStorage.getItem('fdss_user');
      if (sessionRaw) {
        const u = JSON.parse(sessionRaw);
        if (u && typeof u === 'object' && u.id && u.role) {
          return u as User;
        }
      }
    } catch (e) {
      console.warn('Failed to parse tab session user', e);
    }
    return null;
  },

  setUser: (user: User | null) => {
    try {
      if (user && user.id && user.role) {
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('fdss_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('fdss_user');
      }
      // Clean up legacy localStorage to prevent session bleed to other tabs
      localStorage.removeItem('user');
      localStorage.removeItem('fdss_user');
    } catch (e) {
      console.warn('Failed to update tab session user', e);
    }
  },

  clearUser: () => {
    try {
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('fdss_user');
      localStorage.removeItem('user');
      localStorage.removeItem('fdss_user');
    } catch (e) {
      console.warn('Failed to clear tab session user', e);
    }
  },

  isValidUser: (user: any): user is User => {
    return Boolean(
      user &&
      typeof user === 'object' &&
      user.id &&
      typeof user.email === 'string' &&
      typeof user.role === 'string' &&
      ['investor', 'franchiser', 'admin'].includes(user.role)
    );
  }
};
