import { useNavigate } from 'react-router-dom';
import { CheckIcon } from '../components/Icons';
import { SectionIntro } from '../components/AppPrimitives';
import { useLanguage } from '../hooks/useLanguage';
import { usePalette } from '../hooks/usePalette';

const PaletteSetup = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { palette, palettes, setPalette } = usePalette();

  return (
    <div className="standalone-page">
      <SectionIntro
        eyebrow={t.palettePage.eyebrow}
        title={t.palettePage.title}
        subtitle={t.palettePage.subtitle}
      />

      <div className="palette-grid">
        {palettes.map((option) => {
          const active = option.id === palette.id;
          const copy = t.palettePage.palettes[option.id];

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
        <button type="button" className="button primary" onClick={() => navigate('/dashboard', { replace: true })}>
          {t.palettePage.action}
        </button>
      </div>
    </div>
  );
};

export default PaletteSetup;
