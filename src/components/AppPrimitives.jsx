import { CloseIcon } from './Icons';
import styleHubLogo from '../assets/stylehub-logo.png';

export const BrandLockup = ({
  title,
  subtitle,
  alt = 'StyleHub logo',
  compact = false,
}) => (
  <div className={`brand-lockup ${compact ? 'compact' : ''}`}>
    <img className="brand-logo" src={styleHubLogo} alt={alt} />
    <div className="brand-lockup-copy">
      <strong className="brand-lockup-title">{title}</strong>
      {subtitle ? <span className="brand-lockup-subtitle">{subtitle}</span> : null}
    </div>
  </div>
);

export const SectionIntro = ({ eyebrow, title, subtitle, actions }) => (
  <section className="section-intro">
    <div>
      {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
      <h1 className="section-title">{title}</h1>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
    </div>
    {actions ? <div className="section-actions">{actions}</div> : null}
  </section>
);

export const MetricCard = ({ label, value, helper }) => (
  <article className="metric-card">
    <p className="metric-label">{label}</p>
    <p className="metric-value">{value}</p>
    {helper ? <p className="metric-helper">{helper}</p> : null}
  </article>
);

export const StatusBadge = ({ label, tone = 'neutral' }) => (
  <span className={`status-badge status-${tone}`}>{label}</span>
);

export const EmptyState = ({ title, description }) => (
  <div className="empty-state">
    <p className="empty-title">{title}</p>
    {description ? <p className="empty-description">{description}</p> : null}
  </div>
);

export const LoadingState = ({ label }) => (
  <div className="loading-state">
    <div className="loader-spinner small" />
    <span>{label}</span>
  </div>
);

export const ErrorState = ({ title, description, onRetry, actionLabel }) => (
  <div className="error-state">
    <p className="empty-title">{title}</p>
    {description ? <p className="empty-description">{description}</p> : null}
    {onRetry ? (
      <button type="button" className="button secondary" onClick={onRetry}>
        {actionLabel}
      </button>
    ) : null}
  </div>
);

export const PaginationBar = ({ pageData, onPrevious, onNext, previousLabel, nextLabel }) => (
  <div className="pagination-bar">
    <span className="pagination-meta">
      {Math.max((pageData?.page || 0) + 1, 1)} / {Math.max(pageData?.totalPages || 1, 1)}
    </span>
    <div className="pagination-actions">
      <button type="button" className="button secondary compact" disabled={!pageData?.hasPrevious} onClick={onPrevious}>
        {previousLabel}
      </button>
      <button type="button" className="button secondary compact" disabled={!pageData?.hasNext} onClick={onNext}>
        {nextLabel}
      </button>
    </div>
  </div>
);

export const Drawer = ({ open, title, onClose, children, wide = false }) => (
  <div className={`drawer-shell ${open ? 'open' : ''}`}>
    <button type="button" className="drawer-backdrop" onClick={onClose} aria-label="Close panel" />
    <aside className={`drawer-panel ${wide ? 'wide' : ''}`}>
      <header className="drawer-header">
        <div>
          <h2>{title}</h2>
        </div>
        <button type="button" className="icon-button" onClick={onClose}>
          <CloseIcon className="icon-sm" />
        </button>
      </header>
      <div className="drawer-body">{children}</div>
    </aside>
  </div>
);
