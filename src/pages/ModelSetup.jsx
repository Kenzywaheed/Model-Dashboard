import { useState } from 'react';
import { EmptyState, SectionIntro } from '../components/AppPrimitives';
import { modelApi, readCachedModelProfile, writeCachedModelProfile } from '../services/api';
import { useLanguage } from '../hooks/useLanguage';
import { translateEnum } from '../utils/formatters';

const BODY_TYPES = ['SLIM', 'ATHLETIC', 'AVERAGE', 'CURVY', 'PLUS_SIZE'];
const SKIN_TONES = ['FAIR', 'LIGHT', 'MEDIUM', 'OLIVE', 'TAN', 'DARK'];
const AVAILABLE_FOR = ['PHOTO_SHOOT', 'FASHION_SHOW', 'PRODUCT_MODELING', 'SOCIAL_MEDIA_CONTENT', 'BRAND_CAMPAIGN', 'VIDEO_SHOOT'];

const createAvailabilityRow = () => ({
  key: `${Date.now()}-${Math.random()}`,
  availableFor: 'PHOTO_SHOOT',
  pricePerSession: '',
});

const ModelSetup = () => {
  const { t } = useLanguage();
  const cachedProfile = readCachedModelProfile();
  const [profileMessage, setProfileMessage] = useState('');
  const [availabilityMessage, setAvailabilityMessage] = useState('');
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [profileForm, setProfileForm] = useState({
    city: '',
    age: '',
    heightCm: '',
    weightKg: '',
    hairColor: '',
    bodyType: 'ATHLETIC',
    skinTone: 'MEDIUM',
    bio: '',
    files: [],
  });
  const [availabilityRows, setAvailabilityRows] = useState([createAvailabilityRow()]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    setAvailabilityMessage('');
    setError('');
    setSavingProfile(true);

    try {
      const response = await modelApi.createProfile({
        ...profileForm,
        files: Array.from(profileForm.files || []),
      });

      writeCachedModelProfile(response);
      setProfileMessage(t.modelSetup.profileSaved);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvailabilitySubmit = async (event) => {
    event.preventDefault();
    setProfileMessage('');
    setAvailabilityMessage('');
    setError('');

    const entries = availabilityRows
      .filter((row) => row.availableFor && row.pricePerSession !== '')
      .map((row) => ({
        availableFor: row.availableFor,
        pricePerSession: Number(row.pricePerSession),
      }));

    if (entries.length === 0) {
      setError(t.modelSetup.noAvailabilityRows);
      return;
    }

    setSavingAvailability(true);

    try {
      await modelApi.saveAvailableFor(entries);
      setAvailabilityMessage(t.modelSetup.availabilitySaved);
    } catch (submitError) {
      setError(submitError?.message || 'Failed to save availability');
    } finally {
      setSavingAvailability(false);
    }
  };

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

          <button type="submit" className="button primary" disabled={savingProfile}>
            {savingProfile ? t.common.saving : t.modelSetup.createProfile}
          </button>
        </form>

        <div className="stack-column">
          <form className="panel-card form-card" onSubmit={handleAvailabilitySubmit}>
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

            <button type="submit" className="button primary" disabled={savingAvailability}>
              {savingAvailability ? t.common.saving : t.common.save}
            </button>
          </form>

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
                  <strong>{cachedProfile.modelEmail || '--'}</strong>
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
        </div>
      </section>
    </div>
  );
};

export default ModelSetup;
