import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mapOtpError = (t, errorMessage, remainingAttempts) => {
  const normalized = String(errorMessage || '').trim().toLowerCase();

  if (normalized === 'user not found') {
    return t.auth.userNotFound;
  }
  if (normalized === 'otp not found') {
    return t.auth.otpNotFound;
  }
  if (normalized === 'otp has expired') {
    return t.auth.otpExpired;
  }
  if (normalized === 'otp already used') {
    return t.auth.otpAlreadyUsed;
  }
  if (normalized === 'maximum verification attempts reached') {
    return t.auth.otpAttemptsExceeded;
  }
  if (normalized === 'invalid otp code') {
    return typeof remainingAttempts === 'number'
      ? t.auth.otpInvalidWithAttempts.replace('{count}', remainingAttempts)
      : t.auth.otpInvalid;
  }
  if (
    normalized === 'only model users can sign in to this dashboard'
    || normalized === 'this email is not allowed to access the model dashboard'
  ) {
    return t.auth.onlyModelUsers;
  }
  if (normalized === 'service unavailable') {
    return t.auth.backendUnavailable;
  }

  return errorMessage || t.auth.unexpectedOtpError;
};

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, requestOtp, verifyOtp, pendingOtpCode } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const helperOtp = useMemo(() => pendingOtpCode || '', [pendingOtpCode]);

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(t.auth.emailRequired);
      return;
    }

    if (!emailPattern.test(normalizedEmail)) {
      setError(t.auth.emailInvalid);
      return;
    }

    setIsBusy(true);
    const result = await requestOtp(normalizedEmail);
    setIsBusy(false);

    if (!result.success) {
      setError(mapOtpError(t, result.error));
      return;
    }

    setEmail(result.email);
    setStep('otp');
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');

    if (!otp.trim()) {
      setError(t.auth.otpRequired);
      return;
    }

    setIsBusy(true);
    const result = await verifyOtp({ email, otp });
    setIsBusy(false);

    if (!result.success) {
      setError(mapOtpError(t, result.error, result.remainingAttempts));
      return;
    }

    navigate('/setup/palette', { replace: true });
  };

  return (
    <div className="auth-layout">
      <section className="auth-visual">
        <div className="visual-badge">{t.auth.sessionReady}</div>
        <h1>{t.auth.title}</h1>
        <p>{t.auth.subtitle}</p>
      </section>

      <main className="auth-form-shell">
        <div className="auth-form-card">
          <div className="auth-header">
            <div>
              <p className="section-eyebrow">{t.common.appName}</p>
              <h2 className="auth-card-title">{t.auth.title}</h2>
            </div>
            <button
              type="button"
              className="topbar-chip"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>
          </div>

          {error ? <div className="banner error">{error}</div> : null}

          {step === 'email' ? (
            <form className="auth-form" onSubmit={handleRequestOtp}>
              <label className="field-label" htmlFor="email-input">{t.auth.emailLabel}</label>
              <input
                id="email-input"
                className="field-input"
                type="email"
                dir="ltr"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t.auth.emailPlaceholder}
                disabled={isBusy}
              />

              <button type="submit" className="button primary full" disabled={isBusy}>
                {isBusy ? t.auth.sendingOtp : t.auth.sendOtp}
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleVerifyOtp}>
              <div className="banner soft">
                <strong>{t.auth.otpTitle}</strong>
                <p>{t.auth.otpHelp} {email}</p>
              </div>

              {helperOtp ? (
                <div className="banner subtle">
                  <strong>{t.auth.testingOtp}</strong>
                  <span dir="ltr">{helperOtp}</span>
                </div>
              ) : null}

              <label className="field-label" htmlFor="otp-input">{t.auth.otpLabel}</label>
              <input
                id="otp-input"
                className="field-input otp-input"
                type="text"
                inputMode="numeric"
                dir="ltr"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t.auth.otpPlaceholder}
                disabled={isBusy}
              />

              <button type="submit" className="button primary full" disabled={isBusy}>
                {isBusy ? t.auth.verifyingOtp : t.auth.verifyOtp}
              </button>

              <button
                type="button"
                className="button ghost"
                onClick={() => {
                  setStep('email');
                  setOtp('');
                  setError('');
                }}
              >
                {t.auth.changeEmail}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default Login;
