import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState, SectionIntro } from '../components/AppPrimitives';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { modelApi, readCachedModelProfile, writeCachedModelProfile } from '../services/api';
import { translateEnum } from '../utils/formatters';

const BODY_TYPES = ['SLIM', 'ATHLETIC', 'AVERAGE', 'CURVY', 'PLUS_SIZE'];
const SKIN_TONES = ['FAIR', 'LIGHT', 'MEDIUM', 'OLIVE', 'TAN', 'DARK'];
const AVAILABLE_FOR = ['PHOTO_SHOOT', 'FASHION_SHOW', 'PRODUCT_MODELING', 'SOCIAL_MEDIA_CONTENT', 'BRAND_CAMPAIGN', 'VIDEO_SHOOT'];

const createAvailabilityRow = () => ({
  key: `${Date.now()}-${Math.random()}`,
  availableFor: 'PHOTO_SHOOT',
  pricePerSession: '',
});

const createInitialProfileForm = (cachedProfile = {}) => ({
  city: cachedProfile.city || '',
  age: cachedProfile.age || '',
  heightCm: cachedProfile.heightCm || '',
  weightKg: cachedProfile.weightKg || '',
  hairColor: cachedProfile.hairColor || '',
  bodyType: cachedProfile.bodyType || 'ATHLETIC',
  skinTone: cachedProfile.skinTone || 'MEDIUM',
  bio: cachedProfile.bio || '',
  files: [],
});

const getAvailabilityEntries = (availabilityRows = []) => availabilityRows
  .filter((row) => row.availableFor && row.pricePerSession !== '')
  .map((row) => ({
    availableFor: row.availableFor,
    pricePerSession: Number(row.pricePerSession),
  }));

const ModelSetup = ({ variant = 'workspace' }) => {
  const navigate = useNavigate();
  const { user, logout, refreshSessionUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const cachedProfile = readCachedModelProfile();
  const isOnboarding = variant === 'onboarding';
  const [profileMessage, setProfileMessage] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [completingSetup, setCompletingSetup] = useState(false);
  const [profileForm, setProfileForm] = useState(() => createInitialProfileForm(cachedProfile));
  const [availabilityRows, setAvailabilityRows] = useState([createAvailabilityRow()]);

  const resetBanners = () => {
    setProfileMessage('');
    setAvailabilityMessage('');
    setError('');
  };

  const saveProfile = async () => {
    const response = await modelApi.createProfile({
      ...profileForm,
      files: Array.from(profileForm.files || []),
    });

    writeCachedModelProfile(response);
    return response;
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
            onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.common.age}</span>
          <input
            className="field-input"
            type="number"
            value={profileForm.age}
            onChange={(event) => setProfileForm((current) => ({ ...current, age: event.target.value }))}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.common.height}</span>
          <input
            className="field-input"
            type="number"
            value={profileForm.heightCm}
            onChange={(event) => setProfileForm((current) => ({ ...current, heightCm: event.target.value }))}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.common.weight}</span>
          <input
            className="field-input"
            type="number"
            value={profileForm.weightKg}
            onChange={(event) => setProfileForm((current) => ({ ...current, weightKg: event.target.value }))}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.modelSetup.hairColor}</span>
          <input
            className="field-input"
            value={profileForm.hairColor}
            onChange={(event) => setProfileForm((current) => ({ ...current, hairColor: event.target.value }))}
          />
        </label>

        <label className="field-group">
          <span className="field-label">{t.modelSetup.bodyType}</span>
          <select
            className="field-input"
            value={profileForm.bodyType}
            onChange={(event) => setProfileForm((current) => ({ ...current, bodyType: event.target.value }))}
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
            onChange={(event) => setProfileForm((current) => ({ ...current, skinTone: event.target.value }))}
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
          onChange={(event) => setProfileForm((current) => ({ ...current, bio: event.target.value }))}
          placeholder={t.modelSetup.bioPlaceholder}
        />
      </label>

      <label className="field-group">
        <span className="field-label">{t.modelSetup.filesLabel}</span>
        <input
          className="field-input"
          type="file"
          multiple
          onChange={(event) => setProfileForm((current) => ({ ...current, files: event.target.files }))}
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
          onClick={() => setAvailabilityRows((current) => [...current, createAvailabilityRow()])}
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
                setAvailabilityRows((current) => current.map((item) => (
                  item.key === row.key ? { ...item, pricePerSession: nextValue } : item
                )));
              }}
            />

            <button
              type="button"
              className="button ghost compact"
              onClick={() => setAvailabilityRows((current) => current.filter((item) => item.key !== row.key))}
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

      {!cachedProfile ? (
        <EmptyState title={t.common.noData} />
      ) : (
        <div className="summary-grid">
          <div className="simple-stat-row">
            <span>{t.common.email}</span>
            <strong>{cachedProfile.modelEmail || user?.email || '--'}</strong>
          </div>
          <div className="simple-stat-row">
            <span>ID</span>
            <strong>{cachedProfile.modelId || '--'}</strong>
          </div>
          <div className="simple-stat-row">
            <span>{t.modelSetup.bodyType}</span>
            <strong>{translateEnum(t, 'bodyType', cachedProfile.bodyType)}</strong>
          </div>
          <div className="simple-stat-row">
            <span>{t.modelSetup.skinTone}</span>
            <strong>{translateEnum(t, 'skinTone', cachedProfile.skinTone)}</strong>
          </div>
        </div>
      )}
    </article>
  );

  if (isOnboarding) {
    return (
      <div className="standalone-page onboarding-page">
        <div className="standalone-head">
          <div>
            <p className="section-eyebrow">{t.common.appName}</p>
            <strong className="standalone-user">{user?.email || ''}</strong>
          </div>
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
