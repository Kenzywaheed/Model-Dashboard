import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  SESSION_UPDATED_EVENT,
  authApi,
  canAccessModelDashboard,
  clearStoredSession,
  normalizeAuthUser,
  readStoredSession,
  refreshStoredSession,
  writeStoredSession,
} from '../services/api';

const AuthContext = createContext(null);

const MODEL_DASHBOARD_ONLY_ERROR = 'This email is not allowed to access the model dashboard';

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
    console.log(normalizeAuthUser);
    
    if (!nextSession?.accessToken || !canAccessModelDashboard(normalizedUser)) {
      throw new Error(MODEL_DASHBOARD_ONLY_ERROR);
    }

    const normalizedSession = writeStoredSession({
      ...nextSession,
      user: normalizedUser,
      accessToken: nextSession.accessToken || '',
      refreshToken: nextSession.refreshToken || '',
    });

    if (!normalizedSession) {
      throw new Error(MODEL_DASHBOARD_ONLY_ERROR);
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
          throw new Error(MODEL_DASHBOARD_ONLY_ERROR);
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

      if (!canAccessModelDashboard(nextUser)) {
        return {
          success: false,
          error: MODEL_DASHBOARD_ONLY_ERROR,
          remainingAttempts: data?.remainingAttempts,
        };
      }

      const nextSession = saveSession({
        accessToken: data?.accessToken || '',
        refreshToken: data?.refreshToken || '',
        authenticatedAt: new Date().toISOString(),
        user: nextUser,
      });

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
  }, [saveSession]);

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
    isAuthenticated: Boolean(session?.accessToken),
    canAccessModelDashboard: canAccessModelDashboard(session?.user),
    defaultDashboard: session?.user?.defaultDashboard || null,
  }), [loading, logout, pendingEmail, pendingOtpCode, requestOtp, session, verifyOtp]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
