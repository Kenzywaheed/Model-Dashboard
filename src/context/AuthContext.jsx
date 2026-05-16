import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  SESSION_UPDATED_EVENT,
  authApi,
  canAccessModelDashboard,
  clearStoredSession,
  getUserHomePath,
  isModelOnboardingUser,
  normalizeAuthUser,
  readStoredSession,
  refreshStoredSession,
  resolveUserDashboard,
  writeStoredSession,
} from '../services/api';

const AuthContext = createContext(null);

const extractMessage = (error, fallbackMessage) => error?.data?.message || error?.message || fallbackMessage;

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession);
  const [loading, setLoading] = useState(true);
  const [pendingEmail, setPendingEmail] = useState('');
  const [pendingOtpCode, setPendingOtpCode] = useState('');

  useEffect(() => {
    const syncSession = () => {
      setSession(readStoredSession());
    };

    window.addEventListener('storage', syncSession);
    window.addEventListener(SESSION_UPDATED_EVENT, syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener(SESSION_UPDATED_EVENT, syncSession);
    };
  }, []);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setPendingEmail('');
    setPendingOtpCode('');
  }, []);

  const saveSession = useCallback((nextSession) => {
    const normalizedUser = normalizeAuthUser(nextSession?.user, nextSession?.user);

    if (!nextSession?.accessToken) {
      throw new Error('No access token returned from authentication');
    }

    const normalizedSession = writeStoredSession({
      ...nextSession,
      user: normalizedUser,
      accessToken: nextSession.accessToken || '',
      refreshToken: nextSession.refreshToken || '',
    });

    if (!normalizedSession) {
      throw new Error('Failed to create a valid authenticated session');
    }

    setSession(normalizedSession);
    return normalizedSession;
  }, []);

  const hydrateSessionUser = useCallback(async (nextSession) => {
    const user = await authApi.getMe();
    return saveSession({
      ...nextSession,
      user,
    });
  }, [saveSession]);

  const refreshSessionUser = useCallback(async () => {
    const storedSession = readStoredSession();

    if (!storedSession?.accessToken) {
      clearStoredSession();
      setSession(null);
      return null;
    }

    const refreshedSession = await refreshStoredSession(storedSession);

    if (!refreshedSession) {
      clearStoredSession();
      setSession(null);
      return null;
    }

    const nextSession = await hydrateSessionUser(refreshedSession);
    setSession(nextSession);
    return nextSession;
  }, [hydrateSessionUser]);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const storedSession = readStoredSession();

      if (!storedSession?.accessToken) {
        if (active) {
          setSession(null);
          setLoading(false);
        }
        return;
      }

      try {
        const refreshedSession = await refreshStoredSession(storedSession);

        if (!refreshedSession) {
          throw new Error('No active session');
        }

        const nextSession = await hydrateSessionUser(refreshedSession);

        if (active) {
          setSession(nextSession);
        }
      } catch {
        clearStoredSession();

        if (active) {
          setSession(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      active = false;
    };
  }, [hydrateSessionUser]);

  const requestOtp = useCallback(async (email) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const data = await authApi.generateOtp({
        email: normalizedEmail,
        recipient: normalizedEmail,
        purpose: 'EMAIL',
        channel: 'EMAIL_VERIFICATION',
      });

      setPendingEmail(normalizedEmail);
      setPendingOtpCode(data?.otpCodeForTesting || '');

      return {
        success: true,
        email: normalizedEmail,
        otpCodeForTesting: data?.otpCodeForTesting || '',
      };
    } catch (error) {
      return {
        success: false,
        error: extractMessage(error, 'Failed to send OTP'),
      };
    }
  }, []);

  const verifyOtp = useCallback(async ({ email, otp }) => {
    const normalizedEmail = email.trim().toLowerCase();

    try {
      const data = await authApi.verifyOtp({
        recipient: normalizedEmail,
        purpose: 'EMAIL',
        otpCode: otp.trim(),
      });

      if (!data?.verified) {
        return {
          success: false,
          error: data?.message || 'Invalid OTP',
          remainingAttempts: data?.remainingAttempts,
        };
      }

      const nextUser = normalizeAuthUser(data?.user, { email: normalizedEmail });

      const baseSession = saveSession({
        accessToken: data?.accessToken || '',
        refreshToken: data?.refreshToken || '',
        authenticatedAt: new Date().toISOString(),
        user: nextUser,
      });

      let nextSession = baseSession;

      try {
        nextSession = await hydrateSessionUser(baseSession);
      } catch {
        nextSession = baseSession;
      }

      setPendingEmail('');
      setPendingOtpCode('');

      return {
        success: true,
        session: nextSession,
      };
    } catch (error) {
      return {
        success: false,
        error: extractMessage(error, 'Failed to verify OTP'),
        remainingAttempts: error?.data?.remainingAttempts,
      };
    }
  }, [hydrateSessionUser, saveSession]);

  const value = useMemo(() => ({
    accessToken: session?.accessToken || '',
    refreshToken: session?.refreshToken || '',
    user: session?.user || null,
    session,
    loading,
    pendingEmail,
    pendingOtpCode,
    requestOtp,
    verifyOtp,
    logout,
    refreshSessionUser,
    isAuthenticated: Boolean(session?.accessToken),
    canAccessModelDashboard: canAccessModelDashboard(session?.user),
    isModelOnboarding: isModelOnboardingUser(session?.user),
    userDashboard: resolveUserDashboard(session?.user),
    homePath: getUserHomePath(session?.user),
    defaultDashboard: session?.user?.defaultDashboard || null,
  }), [loading, logout, pendingEmail, pendingOtpCode, refreshSessionUser, requestOtp, session, verifyOtp]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
