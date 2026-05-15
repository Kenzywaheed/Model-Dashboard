import { useEffect, useState } from 'react';
import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PaginationBar,
  SectionIntro,
} from '../components/AppPrimitives';
import { modelApi, normalizePaginatedResponse } from '../services/api';
import { formatDateTime, formatNumber } from '../utils/formatters';
import { useLanguage } from '../hooks/useLanguage';

const Reviews = () => {
  const { language, t } = useLanguage();
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReviews = async () => {
    setLoading(true);
    setError('');

    try {
      const [reviewsResponse, statsResponse] = await Promise.all([
        modelApi.getReviews({ page, size: 10 }),
        modelApi.getReviewStats(),
      ]);

      setPageData(normalizePaginatedResponse(reviewsResponse, { fallbackPage: page, fallbackSize: 10 }));
      setStats(statsResponse);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page]);

  const breakdown = [
    { stars: 5, count: stats?.fiveStarCount || 0 },
    { stars: 4, count: stats?.fourStarCount || 0 },
    { stars: 3, count: stats?.threeStarCount || 0 },
    { stars: 2, count: stats?.twoStarCount || 0 },
    { stars: 1, count: stats?.oneStarCount || 0 },
  ];

  return (
    <div className="page-stack">
      <SectionIntro
        eyebrow={t.reviews.eyebrow}
        title={t.reviews.title}
        subtitle={t.reviews.subtitle}
      />

      {loading ? <LoadingState label={t.common.loading} /> : null}

      {!loading && error ? (
        <ErrorState title={error} onRetry={loadReviews} actionLabel={t.common.reload} />
      ) : null}

      {!loading && !error ? (
        <>
          <section className="metric-grid">
            <MetricCard label={t.reviews.averageRating} value={formatNumber(stats?.ratingAvg || 0, language)} />
            <MetricCard label={t.reviews.totalReviews} value={formatNumber(stats?.ratingCount || 0, language)} />
          </section>

          <section className="content-grid two-column align-start">
            <article className="panel-card">
              <div className="panel-head">
                <h2>{t.reviews.breakdown}</h2>
              </div>

              <div className="rating-breakdown">
                {breakdown.map((item) => (
                  <div key={item.stars} className="rating-row">
                    <span>{item.stars}★</span>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${stats?.ratingCount ? (item.count / stats.ratingCount) * 100 : 0}%`,
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
                <h2>{t.nav.reviews}</h2>
              </div>

              {!pageData?.items?.length ? (
                <EmptyState title={t.reviews.noReviews} />
              ) : (
                <div className="stack-list">
                  {pageData.items.map((review) => (
                    <article key={review.reviewId} className="list-card">
                      <div className="list-card-row">
                        <div>
                          <strong>{review.brandName || review.agreementNumber}</strong>
                          <p>{formatDateTime(review.createdAt, language)}</p>
                        </div>
                        <div className="rating-chip">{review.stars}★</div>
                      </div>
                      <p>{review.comment || '--'}</p>
                    </article>
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
    </div>
  );
};

export default Reviews;
