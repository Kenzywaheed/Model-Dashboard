import { useEffect, useMemo, useState } from 'react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PaginationBar,
  SectionIntro,
  StatusBadge,
} from '../components/AppPrimitives';
import { modelApi, normalizePaginatedResponse } from '../services/api';
import { formatDateTime, formatNumber, translateEnum } from '../utils/formatters';
import { useLanguage } from '../hooks/useLanguage';

const STATUS_FILTERS = ['ALL', 'UNREAD', 'READ'];

const Notifications = () => {
  const { language, t } = useLanguage();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('');
  const [pageData, setPageData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadNotifications = async () => {
    setLoading(true);
    setError('');

    try {
      const [notificationsResponse, statsResponse] = await Promise.all([
        modelApi.getNotifications({ page, size: 10, status, type }),
        modelApi.getNotificationStats(),
      ]);

      setPageData(normalizePaginatedResponse(notificationsResponse, { fallbackPage: page, fallbackSize: 10 }));
      setStats(statsResponse);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page, status, type]);

  const typeOptions = useMemo(() => (stats?.countsByType || []).map((entry) => entry.type).filter(Boolean), [stats?.countsByType]);

  const handleMarkRead = async (notificationId) => {
    setError('');
    setMessage('');

    try {
      await modelApi.markNotificationRead(notificationId);
      await loadNotifications();
    } catch (requestError) {
      setError(requestError?.message || 'Failed to update notification');
    }
  };

  const handleMarkAllRead = async () => {
    setError('');
    setMessage('');

    try {
      await modelApi.markAllNotificationsRead();
      setMessage(t.notificationsPage.markedAllRead);
      await loadNotifications();
    } catch (requestError) {
      setError(requestError?.message || 'Failed to mark all notifications as read');
    }
  };

  return (
    <div className="page-stack">
      <SectionIntro
        eyebrow={t.notificationsPage.eyebrow}
        title={t.notificationsPage.title}
        subtitle={t.notificationsPage.subtitle}
        actions={(
          <button type="button" className="button primary" onClick={handleMarkAllRead}>
            {t.notificationsPage.markAllRead}
          </button>
        )}
      />

      {error ? <div className="banner error">{error}</div> : null}
      {message ? <div className="banner success">{message}</div> : null}

      {loading ? <LoadingState label={t.common.loading} /> : null}

      {!loading && !error ? (
        <>
          <section className="metric-grid">
            <MetricCard label={t.common.total} value={formatNumber(stats?.totalNotifications || pageData?.totalElements || 0, language)} />
            <MetricCard label={t.common.unread} value={formatNumber(stats?.unread || 0, language)} />
            <MetricCard label={t.common.read} value={formatNumber(stats?.read || 0, language)} />
          </section>

          <section className="filter-strip space-between">
            <div className="filter-group">
              {STATUS_FILTERS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`filter-chip ${status === value ? 'active' : ''}`}
                  onClick={() => {
                    setStatus(value);
                    setPage(0);
                  }}
                >
                  {value === 'ALL' ? t.common.all : value === 'UNREAD' ? t.common.unread : t.common.read}
                </button>
              ))}
            </div>

            <select
              className="field-input filter-select"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(0);
              }}
            >
              <option value="">{t.common.all}</option>
              {typeOptions.map((entry) => (
                <option key={entry} value={entry}>{translateEnum(t, 'notificationType', entry)}</option>
              ))}
            </select>
          </section>

          <section className="content-grid two-column align-start">
            <article className="panel-card">
              <div className="panel-head">
                <h2>{t.common.notifications}</h2>
              </div>

              {(pageData?.items || []).length === 0 ? (
                <EmptyState title={t.notificationsPage.noNotifications} />
              ) : (
                <div className="stack-list">
                  {pageData.items.map((notification) => (
                    <article key={notification.id} className={`list-card ${notification.isRead ? '' : 'unread-card'}`}>
                      <div className="list-card-row">
                        <div>
                          <strong>{notification.title || '--'}</strong>
                          <p>{notification.message || '--'}</p>
                        </div>
                        <StatusBadge
                          label={translateEnum(t, 'notificationType', notification.type)}
                          tone={notification.isRead ? 'neutral' : 'primary'}
                        />
                      </div>

                      <div className="meta-row">
                        <span>{formatDateTime(notification.createdAt, language)}</span>
                        {!notification.isRead ? (
                          <button type="button" className="text-link" onClick={() => handleMarkRead(notification.id)}>
                            {t.notificationsPage.markRead}
                          </button>
                        ) : (
                          <span>{t.common.read}</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="panel-card">
              <div className="panel-head">
                <h2>{t.notificationsPage.countsByType}</h2>
              </div>

              {(stats?.countsByType || []).length === 0 ? (
                <EmptyState title={t.common.noData} />
              ) : (
                <div className="stack-list">
                  {stats.countsByType.map((entry) => (
                    <div key={entry.type} className="simple-stat-row">
                      <span>{translateEnum(t, 'notificationType', entry.type)}</span>
                      <strong>{formatNumber(entry.count || 0, language)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>

          {(pageData?.items || []).length > 0 ? (
            <PaginationBar
              pageData={pageData}
              onPrevious={() => setPage((current) => Math.max(current - 1, 0))}
              onNext={() => setPage((current) => current + 1)}
              previousLabel={t.common.previous}
              nextLabel={t.common.next}
            />
          ) : null}
        </>
      ) : null}

      {!loading && error ? (
        <ErrorState title={error} onRetry={loadNotifications} actionLabel={t.common.reload} />
      ) : null}
    </div>
  );
};

export default Notifications;
