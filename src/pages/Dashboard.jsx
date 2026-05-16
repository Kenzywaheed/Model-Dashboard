import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  SectionIntro,
  StatusBadge,
} from '../components/AppPrimitives';
import { modelApi, normalizePaginatedResponse, readCachedModelProfile, writeCachedModelProfile } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime, formatNumber, translateEnum } from '../utils/formatters';
import { useLanguage } from '../hooks/useLanguage';

const Dashboard = () => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    error: '',
    requests: [],
    agreements: [],
    reviews: [],
    reviewStats: null,
    notificationStats: null,
    modelProfile: readCachedModelProfile(),
  });

  const loadDashboard = async () => {
    setState((current) => ({ ...current, loading: true, error: '' }));

    try {
      const [requestsRaw, agreementsRaw, reviewsRaw, reviewStats, notificationStats, modelProfile] = await Promise.all([
        modelApi.getRequests({ page: 0, size: 4, status: '' }),
        modelApi.getAgreements({ page: 0, size: 4, status: '' }),
        modelApi.getReviews({ page: 0, size: 4 }),
        modelApi.getReviewStats(),
        modelApi.getNotificationStats(),
        modelApi.getMeProfile().catch((profileError) => {
          if (profileError?.status === 404) {
            return null;
          }

          throw profileError;
        }),
      ]);

      if (modelProfile) {
        writeCachedModelProfile(modelProfile);
      }

      setState({
        loading: false,
        error: '',
        requests: normalizePaginatedResponse(requestsRaw, { fallbackPage: 0, fallbackSize: 4 }).items,
        agreements: normalizePaginatedResponse(agreementsRaw, { fallbackPage: 0, fallbackSize: 4 }).items,
        reviews: normalizePaginatedResponse(reviewsRaw, { fallbackPage: 0, fallbackSize: 4 }).items,
        reviewStats,
        notificationStats,
        modelProfile,
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        error: error?.message || 'Failed to load dashboard',
      }));
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const pendingRequests = state.requests.filter((item) => item.requestStatus === 'PENDING').length;
    const activeAgreements = state.agreements.filter((item) => !['COMPLETED', 'CANCELLED'].includes(item.agreementStatus)).length;
    const ratingAvg = state.reviewStats?.ratingAvg ?? state.modelProfile?.ratingAvg ?? 0;

    return [
      { label: t.dashboard.pendingRequests, value: pendingRequests },
      { label: t.dashboard.activeAgreements, value: activeAgreements },
      { label: t.dashboard.averageRating, value: formatNumber(ratingAvg, language) },
      { label: t.dashboard.unreadNotifications, value: formatNumber(state.notificationStats?.unread || 0, language) },
    ];
  }, [language, state.agreements, state.modelProfile?.ratingAvg, state.notificationStats?.unread, state.requests, state.reviewStats?.ratingAvg, t.dashboard]);

  const reviewBreakdown = [
    { stars: 5, count: state.reviewStats?.fiveStarCount || 0 },
    { stars: 4, count: state.reviewStats?.fourStarCount || 0 },
    { stars: 3, count: state.reviewStats?.threeStarCount || 0 },
    { stars: 2, count: state.reviewStats?.twoStarCount || 0 },
    { stars: 1, count: state.reviewStats?.oneStarCount || 0 },
  ];

  const typeBreakdown = state.notificationStats?.countsByType || [];
  const ratingAvg = state.reviewStats?.ratingAvg ?? state.modelProfile?.ratingAvg ?? 0;
  const ratingCount = state.reviewStats?.ratingCount ?? state.modelProfile?.ratingCount ?? 0;

  return (
    <div className="page-stack">
      <SectionIntro
        eyebrow={t.dashboard.eyebrow}
        title={t.dashboard.title}
        subtitle={t.dashboard.subtitle}
        actions={(
          <button type="button" className="button secondary" onClick={loadDashboard}>
            {t.common.reload}
          </button>
        )}
      />

      {state.error ? (
        <ErrorState
          title={state.error}
          description={t.common.retry}
          onRetry={loadDashboard}
          actionLabel={t.common.reload}
        />
      ) : null}

      <section className="metric-grid">
        {metrics.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="content-grid two-column">
        <article className="panel-card">
          <div className="panel-head">
            <div>
              <h2>{t.dashboard.latestRequests}</h2>
            </div>
            <Link className="text-link" to="/requests">{t.common.view}</Link>
          </div>

          {state.loading ? <LoadingState label={t.common.loading} /> : null}

          {!state.loading && state.requests.length === 0 ? (
            <EmptyState title={t.dashboard.noRequests} />
          ) : null}

          <div className="stack-list">
            {state.requests.map((request) => (
              <article key={request.requestId} className="list-card">
                <div className="list-card-row">
                  <div>
                    <strong>{request.title || request.requestNumber}</strong>
                    <p>{request.brandName || request.requestNumber}</p>
                  </div>
                  <StatusBadge
                    label={translateEnum(t, 'requestStatus', request.requestStatus)}
                    tone={request.requestStatus === 'ACCEPTED' ? 'success' : request.requestStatus === 'REJECTED' ? 'danger' : 'warning'}
                  />
                </div>
                <div className="meta-row">
                  <span>{translateEnum(t, 'availableFor', request.availableFor)}</span>
                  <span>{formatDateTime(request.deadline, language)}</span>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <h2>{t.dashboard.latestAgreements}</h2>
            <Link className="text-link" to="/agreements">{t.common.view}</Link>
          </div>

          {state.loading ? <LoadingState label={t.common.loading} /> : null}

          {!state.loading && state.agreements.length === 0 ? (
            <EmptyState title={t.dashboard.noAgreements} />
          ) : null}

          <div className="stack-list">
            {state.agreements.map((agreement) => (
              <article key={agreement.agreementId} className="list-card">
                <div className="list-card-row">
                  <div>
                    <strong>{agreement.title || agreement.agreementNumber}</strong>
                    <p>{agreement.brandName || agreement.modelName || agreement.agreementNumber}</p>
                  </div>
                  <StatusBadge
                    label={translateEnum(t, 'agreementStatus', agreement.agreementStatus)}
                    tone={agreement.agreementStatus === 'COMPLETED' ? 'success' : agreement.agreementStatus === 'CANCELLED' ? 'danger' : 'primary'}
                  />
                </div>
                <div className="meta-row">
                  <span>{translateEnum(t, 'paymentStatus', agreement.paymentStatus)}</span>
                  <span>{formatDateTime(agreement.deadline, language)}</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="content-grid two-column">
        <article className="panel-card">
          <div className="panel-head">
            <h2>{t.dashboard.reviewSnapshot}</h2>
          </div>

          {state.loading ? <LoadingState label={t.common.loading} /> : null}

          {!state.loading && !ratingCount ? (
            <EmptyState title={t.dashboard.noReviews} />
          ) : null}

          <div className="rating-summary">
            <div className="rating-pill">
              <strong>{formatNumber(ratingAvg, language)}</strong>
              <span>{t.common.average}</span>
            </div>
            <div className="rating-pill soft">
              <strong>{formatNumber(ratingCount, language)}</strong>
              <span>{t.common.total}</span>
            </div>
          </div>

          <div className="rating-breakdown">
            {reviewBreakdown.map((item) => (
              <div key={item.stars} className="rating-row">
                <span>{item.stars}★</span>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${state.reviewStats?.ratingCount ? (item.count / state.reviewStats.ratingCount) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card">
          <div className="panel-head">
            <h2>{t.dashboard.notificationsSnapshot}</h2>
            <Link className="text-link" to="/notifications">{t.common.view}</Link>
          </div>

          {state.loading ? <LoadingState label={t.common.loading} /> : null}

          {!state.loading && typeBreakdown.length === 0 ? (
            <EmptyState title={t.dashboard.noNotifications} />
          ) : null}

          <div className="stack-list">
            {typeBreakdown.map((entry) => (
              <article key={entry.type} className="simple-stat-row">
                <span>{translateEnum(t, 'notificationType', entry.type)}</span>
                <strong>{formatNumber(entry.count || 0, language)}</strong>
              </article>
            ))}
          </div>
        </article>
      </section>

      {!user?.hasModelProfile && !state.modelProfile ? (
        <article className="cta-card">
          <div>
            <p className="section-eyebrow">{t.modelSetup.eyebrow}</p>
            <h2>{t.dashboard.completeProfileTitle}</h2>
            <p>{t.dashboard.completeProfileText}</p>
          </div>
          <Link className="button primary" to="/model-setup">
            {t.dashboard.completeProfileAction}
          </Link>
        </article>
      ) : null}
    </div>
  );
};

export default Dashboard;
