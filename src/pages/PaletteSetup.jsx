import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckIcon } from '../components/Icons';
import { BrandLockup, SectionIntro } from '../components/AppPrimitives';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { usePalette } from '../hooks/usePalette';

const PaletteSetup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    homePath,
    logout,
    refreshSessionUser,
    canAccessModelDashboard,
  } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { palette, palettes, setPalette } = usePalette();
  const [syncingSession, setSyncingSession] = useState(Boolean(location.state?.fromOnboarding));
  const destinationPath = location.state?.nextPath || homePath || '/dashboard';
  const actionLabel = syncingSession
    ? t.common.loading
    : destinationPath === '/dashboard'
      ? t.palettePage.action
      : t.common.continue;

  useEffect(() => {
    if (canAccessModelDashboard && !location.state?.fromOnboarding && !location.state?.fromLogin) {
      navigate('/dashboard', { replace: true });
    }
  }, [canAccessModelDashboard, location.state, navigate]);

  useEffect(() => {
    let active = true;

    const syncOnboardingSession = async () => {
      if (!location.state?.fromOnboarding || canAccessModelDashboard) {
        if (active) {
          setSyncingSession(false);
        }
        return;
      }

      try {
        await refreshSessionUser();
      } finally {
        if (active) {
          setSyncingSession(false);
        }
      }
    };

    syncOnboardingSession();

    return () => {
      active = false;
    };
  }, [canAccessModelDashboard, location.state, refreshSessionUser]);

  return (
    <div className="standalone-page">
      <div className="standalone-head">
        <BrandLockup title={t.common.appName} subtitle={user?.email || ''} compact />
        <div className="standalone-actions">
          <button type="button" className="topbar-chip" onClick={toggleTheme}>
            {isDark ? t.common.lightMode : t.common.darkMode}
          </button>
          <button
            type="button"
            className="topbar-chip"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          >
            {language === 'en' ? 'AR' : 'EN'}
          </button>
          <button
            type="button"
            className="topbar-chip"
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
          >
            {t.common.logout}
          </button>
        </div>
      </div>

      <SectionIntro
        eyebrow={t.palettePage.eyebrow}
        title={t.palettePage.title}
        subtitle={t.palettePage.subtitle}
      />

      <div className="palette-grid">
        {palettes.map((option) => {
          const active = option.id === palette.id;
          const translatedCopy = t.palettePage.palettes?.[option.id];
          const copy = translatedCopy || {
            name: option.label?.[language] || option.label?.en || option.id,
            description: option.description?.[language] || option.description?.en || '',
          };

          return (
            <button
              key={option.id}
              type="button"
              className={`palette-card ${active ? 'active' : ''}`}
              onClick={() => setPalette(option.id)}
            >
              <div className="palette-card-head">
                <div>
                  <strong>{copy.name}</strong>
                  <p>{copy.description}</p>
                </div>
                {active ? <CheckIcon className="icon-sm" /> : null}
              </div>

              <div className="palette-swatches">
                <span style={{ backgroundColor: option.primary }} />
                <span style={{ backgroundColor: option.primaryDark }} />
                <span style={{ backgroundColor: option.primarySoft }} />
                <span style={{ backgroundColor: option.accent }} />
              </div>
            </button>
          );
        })}
      </div>

      <div className="page-actions">
        <p className="helper-text">{t.palettePage.hint}</p>
        <button
          type="button"
          className="button primary"
          disabled={syncingSession}
          onClick={() => navigate(destinationPath, { replace: true })}
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
};

export default PaletteSetup;
