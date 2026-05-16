import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLockup, EmptyState, LoadingState, SectionIntro } from '../components/AppPrimitives';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { modelApi, normalizeModelProfile, readCachedModelProfile, writeCachedModelProfile } from '../services/api';
import { translateEnum } from '../utils/formatters';

const BODY_TYPES = ['SLIM', 'ATHLETIC', 'AVERAGE', 'CURVY', 'PLUS_SIZE'];
const SKIN_TONES = ['FAIR', 'LIGHT', 'MEDIUM', 'OLIVE', 'TAN', 'DARK'];
const AVAILABLE_FOR = ['PHOTO_SHOOT', 'FASHION_SHOW', 'PRODUCT_MODELING', 'SOCIAL_MEDIA_CONTENT', 'BRAND_CAMPAIGN', 'VIDEO_SHOOT'];

const createAvailabilityRow = (entry = {}) => ({
  key: `${Date.now()}-${Math.random()}`,
  availableFor: entry.availableFor || 'PHOTO_SHOOT',
  pricePerSession: entry.pricePerSession ?? '',
});

const createInitialProfileForm = (cachedProfile) => {
  const profile = cachedProfile && typeof cachedProfile === 'object' ? cachedProfile : {};

  return {
    city: profile.city || '',
    age: profile.age || '',
    heightCm: profile.heightCm || '',
    weightKg: profile.weightKg || '',
    hairColor: profile.hairColor || '',
    bodyType: profile.bodyType || 'ATHLETIC',
    skinTone: profile.skinTone || 'MEDIUM',
    bio: profile.bio || '',
    files: [],
  };
};

const getAvailabilityEntries = (availabilityRows = []) => availabilityRows
  .filter((row) => row.availableFor && row.pricePerSession !== '')
  .map((row) => ({
    availableFor: row.availableFor,
    pricePerSession: Number(row.pricePerSession),
  }));

const createAvailabilityRows = (profile) => (
  Array.isArray(profile?.availableFor) && profile.availableFor.length > 0
    ? profile.availableFor.map((entry) => createAvailabilityRow(entry))
    : [createAvailabilityRow()]
);

const ModelSetup = ({ variant = 'workspace' }) => {
  const navigate = useNavigate();
  const { user, logout, refreshSessionUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const profileTouchedRef = useRef(false);
  const availabilityTouchedRef = useRef(false);
  const isOnboarding = variant === 'onboarding';
  const [profileSnapshot, setProfileSnapshot] = useState(() => readCachedModelProfile());
  const [profileMessage, setProfileMessage] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [error, setError] = useState('');
  const [syncingProfile, setSyncingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [completingSetup, setCompletingSetup] = useState(false);
  const [profileForm, setProfileForm] = useState(() => createInitialProfileForm(profileSnapshot));
  const [availabilityRows, setAvailabilityRows] = useState(() => createAvailabilityRows(profileSnapshot));

  const resetBanners = () => {
    setProfileMessage('');
    setAvailabilityMessage('');
    setError('');
  };

  const applyProfileSnapshot = (profile, { overwriteForm = true, overwriteAvailability = true } = {}) => {
    if (!profile) {
      setProfileSnapshot(null);
      return null;
    }

    const normalizedProfile = normalizeModelProfile(profile);

    writeCachedModelProfile(normalizedProfile);
    setProfileSnapshot(normalizedProfile);

    if (overwriteForm) {
      setProfileForm(createInitialProfileForm(normalizedProfile));
    }

    if (overwriteAvailability) {
      setAvailabilityRows(createAvailabilityRows(normalizedProfile));
    }

    return normalizedProfile;
  };

  const syncProfileSnapshot = async ({ overwriteForm = true, overwriteAvailability = true } = {}) => {
    const profile = await modelApi.getMeProfile();
    return applyProfileSnapshot(profile, { overwriteForm, overwriteAvailability });
  };

  useEffect(() => {
    let active = true;

    const loadProfileSnapshot = async () => {
      setSyncingProfile(true);

      try {
        const profile = await modelApi.getMeProfile();

        if (!active) {
          return;
        }

        applyProfileSnapshot(profile, {
          overwriteForm: !profileTouchedRef.current,
          overwriteAvailability: !availabilityTouchedRef.current,
        });
      } catch (loadError) {
        if (active && loadError?.status === 404) {
          setProfileSnapshot(null);
        }
      } finally {
        if (active) {
          setSyncingProfile(false);
        }
      }
    };

    loadProfileSnapshot();

    return () => {
      active = false;
    };
  }, []);

  const saveProfile = async () => {
    const response = await modelApi.createProfile({
      ...profileForm,
      files: Array.from(profileForm.files || []),
    });

    return applyProfileSnapshot(response, {
      overwriteForm: false,
      overwriteAvailability: false,
    });
  };

  const saveAvailability = async (entries) => {
    await modelApi.saveAvailableFor(entries);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    resetBanners();
    setSavingProfile(true);

    try {
      await saveProfile();
      profileTouchedRef.current = false;
      await syncProfileSnapshot({ overwriteForm: true, overwriteAvailability: false });
      await refreshSessionUser();
      setProfileMessage(t.modelSetup.profileSaved);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvailabilitySubmit = async (event) => {
    event.preventDefault();
    resetBanners();

    const entries = getAvailabilityEntries(availabilityRows);

    if (entries.length === 0) {
      setError(t.modelSetup.noAvailabilityRows);
      return;
    }

    setSavingAvailability(true);

    try {
      await saveAvailability(entries);
      availabilityTouchedRef.current = false;
      await syncProfileSnapshot({ overwriteForm: false, overwriteAvailability: true });
      setAvailabilityMessage(t.modelSetup.availabilitySaved);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

  const handleCompleteSetup = async (event) => {
    event.preventDefault();
    resetBanners();

    const entries = getAvailabilityEntries(availabilityRows);

    if (entries.length === 0) {
      setError(t.modelSetup.noAvailabilityRows);
      return;
    }

    setCompletingSetup(true);

    try {
      await saveProfile();
      await saveAvailability(entries);
      profileTouchedRef.current = false;
      availabilityTouchedRef.current = false;
      await syncProfileSnapshot();
      navigate('/setup/palette', { replace: true, state: { fromOnboarding: true } });
    } catch (submitError) {
      setError(submitError?.message || 'Failed to finish setup');
    } finally {
      setCompletingSetup(false);
    }
  };

  const profileFields = (
    <>
      <div className="panel-head">
        <h2>{t.modelSetup.profileSection}</h2>
      </div>

      <div className="form-grid">
        <label className="field-group">
          <span className="field-label">{t.common.city}</span>
          <input
            className="field-input"
            value={profileForm.city}
            onChange={(event) => {
              profileTouchedRef.current = true;
              setProfileForm((current) => ({ ...current, city: event.target.value }));
            }}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.common.age}</span>
          <input
            className="field-input"
            type="number"
            value={profileForm.age}
            onChange={(event) => {
              profileTouchedRef.current = true;
              setProfileForm((current) => ({ ...current, age: event.target.value }));
            }}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.common.height}</span>
          <input
            className="field-input"
            type="number"
            value={profileForm.heightCm}
            onChange={(event) => {
              profileTouchedRef.current = true;
              setProfileForm((current) => ({ ...current, heightCm: event.target.value }));
            }}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.common.weight}</span>
          <input
            className="field-input"
            type="number"
            value={profileForm.weightKg}
            onChange={(event) => {
              profileTouchedRef.current = true;
              setProfileForm((current) => ({ ...current, weightKg: event.target.value }));
            }}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.modelSetup.hairColor}</span>
          <input
            className="field-input"
            value={profileForm.hairColor}
            onChange={(event) => {
              profileTouchedRef.current = true;
              setProfileForm((current) => ({ ...current, hairColor: event.target.value }));
            }}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.modelSetup.bodyType}</span>
          <select
            className="field-input"
            value={profileForm.bodyType}
            onChange={(event) => {
              profileTouchedRef.current = true;
              setProfileForm((current) => ({ ...current, bodyType: event.target.value }));
            }}
          >
            {BODY_TYPES.map((type) => (
              <option key={type} value={type}>{translateEnum(t, 'bodyType', type)}</option>
            ))}
          </select>
        </label>

        <label className="field-group">
          <span className="field-label">{t.modelSetup.skinTone}</span>
          <select
            className="field-input"
            value={profileForm.skinTone}
            onChange={(event) => {
              profileTouchedRef.current = true;
              setProfileForm((current) => ({ ...current, skinTone: event.target.value }));
            }}
          >
            {SKIN_TONES.map((tone) => (
              <option key={tone} value={tone}>{translateEnum(t, 'skinTone', tone)}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="field-group">
        <span className="field-label">{t.common.bio}</span>
        <textarea
          className="field-textarea"
          rows="5"
          value={profileForm.bio}
          onChange={(event) => {
            profileTouchedRef.current = true;
            setProfileForm((current) => ({ ...current, bio: event.target.value }));
          }}
          placeholder={t.modelSetup.bioPlaceholder}
        />
      </label>

      <label className="field-group">
        <span className="field-label">{t.modelSetup.filesLabel}</span>
        <input
          className="field-input"
          type="file"
          multiple
          onChange={(event) => {
            profileTouchedRef.current = true;
            setProfileForm((current) => ({ ...current, files: event.target.files }));
          }}
        />
      </label>
    </>
  );

  const availabilityFields = (
    <>
      <div className="panel-head">
        <h2>{t.modelSetup.availabilitySection}</h2>
        <button
          type="button"
          className="button secondary compact"
          onClick={() => {
            availabilityTouchedRef.current = true;
            setAvailabilityRows((current) => [...current, createAvailabilityRow()]);
          }}
        >
          {t.modelSetup.addAvailability}
        </button>
      </div>

      <div className="stack-list">
        {availabilityRows.map((row) => (
          <div key={row.key} className="availability-row">
            <select
              className="field-input"
              value={row.availableFor}
              onChange={(event) => {
                const nextValue = event.target.value;
                availabilityTouchedRef.current = true;
                setAvailabilityRows((current) => current.map((item) => (
                  item.key === row.key ? { ...item, availableFor: nextValue } : item
                )));
              }}
            >
              {AVAILABLE_FOR.map((option) => (
                <option key={option} value={option}>{translateEnum(t, 'availableFor', option)}</option>
              ))}
            </select>

            <input
              className="field-input"
              type="number"
              placeholder={t.common.pricePerSession}
              value={row.pricePerSession}
              onChange={(event) => {
                const nextValue = event.target.value;
                availabilityTouchedRef.current = true;
                setAvailabilityRows((current) => current.map((item) => (
                  item.key === row.key ? { ...item, pricePerSession: nextValue } : item
                )));
              }}
            />

            <button
              type="button"
              className="button ghost compact"
              onClick={() => {
                availabilityTouchedRef.current = true;
                setAvailabilityRows((current) => current.filter((item) => item.key !== row.key));
              }}
              disabled={availabilityRows.length === 1}
            >
              {t.modelSetup.removeAvailability}
            </button>
          </div>
        ))}
      </div>
    </>
  );

  const cachedProfileCard = (
    <article className="panel-card">
      <div className="panel-head">
        <h2>{t.modelSetup.cachedProfile}</h2>
      </div>

      {syncingProfile && !profileSnapshot ? (
        <LoadingState label={t.common.loading} />
      ) : !profileSnapshot ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="summary-grid">
          <div className="simple-stat-row">
            <span>{t.common.email}</span>
            <strong>{profileSnapshot.modelEmail || user?.email || '--'}</strong>
          </div>
          <div className="simple-stat-row">
            <span>ID</span>
            <strong>{profileSnapshot.modelId || '--'}</strong>
          </div>
          <div className="simple-stat-row">
            <span>{t.modelSetup.bodyType}</span>
            <strong>{translateEnum(t, 'bodyType', profileSnapshot.bodyType)}</strong>
          </div>
          <div className="simple-stat-row">
            <span>{t.modelSetup.skinTone}</span>
            <strong>{translateEnum(t, 'skinTone', profileSnapshot.skinTone)}</strong>
          </div>
        </div>
      )}
    </article>
  );

  if (isOnboarding) {
    return (
      <div className="standalone-page onboarding-page">
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
          eyebrow={t.modelSetup.onboardingEyebrow}
          title={t.modelSetup.onboardingTitle}
          subtitle={t.modelSetup.onboardingSubtitle}
        />

        <div className="step-strip">
          <div className="step-chip active">1. {t.modelSetup.stepProfile}</div>
          <div className="step-chip active">2. {t.modelSetup.stepAvailability}</div>
          <div className="step-chip">3. {t.modelSetup.stepPalette}</div>
        </div>

        {error ? <div className="banner error">{error}</div> : null}

        <form className="page-stack" onSubmit={handleCompleteSetup}>
          <section className="content-grid two-column align-start">
            <article className="panel-card form-card">
              {profileFields}
            </article>

            <div className="stack-column">
              <article className="panel-card form-card">
                {availabilityFields}
              </article>

              {cachedProfileCard}
            </div>
          </section>

          <div className="page-actions onboarding-actions">
            <p className="helper-text">{t.modelSetup.onboardingHint}</p>
            <button type="submit" className="button primary" disabled={completingSetup}>
              {completingSetup ? t.common.saving : t.modelSetup.saveAndContinue}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <SectionIntro
        eyebrow={t.modelSetup.eyebrow}
        title={t.modelSetup.title}
        subtitle={t.modelSetup.subtitle}
      />

      {error ? <div className="banner error">{error}</div> : null}
      {profileMessage ? <div className="banner success">{profileMessage}</div> : null}
      {availabilityMessage ? <div className="banner success">{availabilityMessage}</div> : null}

      <section className="content-grid two-column align-start">
        <form className="panel-card form-card" onSubmit={handleProfileSubmit}>
          {profileFields}

          <button type="submit" className="button primary" disabled={savingProfile}>
            {savingProfile ? t.common.saving : t.modelSetup.createProfile}
          </button>
        </form>

        <div className="stack-column">
          <form className="panel-card form-card" onSubmit={handleAvailabilitySubmit}>
            {availabilityFields}

            <button type="submit" className="button primary" disabled={savingAvailability}>
              {savingAvailability ? t.common.saving : t.common.save}
            </button>
          </form>

          {cachedProfileCard}
        </div>
      </section>
    </div>
  );
};

export default ModelSetup;
