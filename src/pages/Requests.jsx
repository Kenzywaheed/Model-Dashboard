import { useEffect, useMemo, useState } from 'react';
import {
  Drawer,
  EmptyState,
  ErrorState,
  LoadingState,
  PaginationBar,
  SectionIntro,
  StatusBadge,
} from '../components/AppPrimitives';
import { modelApi, normalizePaginatedResponse } from '../services/api';
import { formatDateTime, translateEnum } from '../utils/formatters';
import { useLanguage } from '../hooks/useLanguage';

const REQUEST_STATUSES = ['', 'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

const Requests = () => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await modelApi.getRequests({ page, size: 10, status: filter });
      setPageData(normalizePaginatedResponse(response, { fallbackPage: page, fallbackSize: 10 }));
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filter, page]);

  const openDetails = async (requestId) => {
    setSelectedRequestId(requestId);
    setRejectReason('');
    setDetailLoading(true);

    try {
      const response = await modelApi.getRequestById(requestId);
      setSelectedRequest(response);
    } catch (requestError) {
      setSelectedRequest({
        title: requestError?.message || 'Failed to load request details',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshAfterAction = async (requestId) => {
    await loadRequests();

    if (requestId) {
      await openDetails(requestId);
    }
  };

  const handleAccept = async () => {
    if (!selectedRequestId) {
      return;
    }

    setActionBusy('accept');

    try {
      await modelApi.acceptRequest(selectedRequestId);
      await refreshAfterAction(selectedRequestId);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to accept request');
    } finally {
      setActionBusy('');
    }
  };

  const handleReject = async () => {
    if (!selectedRequestId || !rejectReason.trim()) {
      setError(t.requests.rejectPlaceholder);
      return;
    }

    setActionBusy('reject');

    try {
      await modelApi.rejectRequest(selectedRequestId, rejectReason.trim());
      await refreshAfterAction(selectedRequestId);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to reject request');
    } finally {
      setActionBusy('');
    }
  };

  const items = useMemo(() => pageData?.items || [], [pageData?.items]);

  return (
    <div className="page-stack">
      <SectionIntro
        eyebrow={t.requests.eyebrow}
        title={t.requests.title}
        subtitle={t.requests.subtitle}
      />

      {error ? <div className="banner error">{error}</div> : null}

      <section className="filter-strip">
        {REQUEST_STATUSES.map((status) => (
          <button
            key={status || 'all'}
            type="button"
            className={`filter-chip ${filter === status ? 'active' : ''}`}
            onClick={() => {
              setFilter(status);
              setPage(0);
            }}
          >
            {status ? translateEnum(t, 'requestStatus', status) : t.common.all}
          </button>
        ))}
      </section>

      {loading ? <LoadingState label={t.common.loading} /> : null}

      {!loading && error ? (
        <ErrorState title={error} onRetry={loadRequests} actionLabel={t.common.reload} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState title={t.requests.noRequests} />
      ) : null}

      <section className="cards-grid">
        {items.map((request) => (
          <article key={request.requestId} className="panel-card request-card">
            <div className="list-card-row">
              <div>
                <h2>{request.title || request.requestNumber}</h2>
                <p>{request.brandName || request.requestNumber}</p>
              </div>
              <StatusBadge
                label={translateEnum(t, 'requestStatus', request.requestStatus)}
                tone={request.requestStatus === 'ACCEPTED' ? 'success' : request.requestStatus === 'REJECTED' ? 'danger' : 'warning'}
              />
            </div>

            <div className="summary-grid">
              <div className="simple-stat-row">
                <span>{t.common.type}</span>
                <strong>{translateEnum(t, 'availableFor', request.availableFor)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.proposedPrice}</span>
                <strong>{request.proposedPrice ?? '--'}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.deadline}</span>
                <strong>{formatDateTime(request.deadline, language)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.location}</span>
                <strong>{request.location || '--'}</strong>
              </div>
            </div>

            <button type="button" className="button secondary full" onClick={() => openDetails(request.requestId)}>
              {t.common.view}
            </button>
          </article>
        ))}
      </section>

      {items.length > 0 ? (
        <PaginationBar
          pageData={pageData}
          onPrevious={() => setPage((current) => Math.max(current - 1, 0))}
          onNext={() => setPage((current) => current + 1)}
          previousLabel={t.common.previous}
          nextLabel={t.common.next}
        />
      ) : null}

      <Drawer
        open={Boolean(selectedRequestId)}
        title={selectedRequest?.title || t.requests.detailTitle}
        onClose={() => {
          setSelectedRequestId('');
          setSelectedRequest(null);
          setRejectReason('');
        }}
      >
        {detailLoading ? <LoadingState label={t.requests.loadingDetail} /> : null}

        {!detailLoading && !selectedRequest ? <EmptyState title={t.common.noData} /> : null}

        {!detailLoading && selectedRequest ? (
          <div className="drawer-stack">
            <div className="summary-grid">
              <div className="simple-stat-row">
                <span>{t.common.brand}</span>
                <strong>{selectedRequest.brandName || '--'}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.requestNumber}</span>
                <strong>{selectedRequest.requestNumber || '--'}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.status}</span>
                <strong>{translateEnum(t, 'requestStatus', selectedRequest.requestStatus)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.type}</span>
                <strong>{translateEnum(t, 'availableFor', selectedRequest.availableFor)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.createdAt}</span>
                <strong>{formatDateTime(selectedRequest.createdAt, language)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.respondedAt}</span>
                <strong>{formatDateTime(selectedRequest.respondedAt, language)}</strong>
              </div>
            </div>

            <div className="panel-subsection">
              <h3>{t.common.description}</h3>
              <p>{selectedRequest.description || '--'}</p>
            </div>

            {selectedRequest.requestStatus === 'PENDING' ? (
              <div className="panel-subsection">
                <label className="field-group">
                  <span className="field-label">{t.requests.rejectReason}</span>
                  <textarea
                    className="field-textarea"
                    rows="4"
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder={t.requests.rejectPlaceholder}
                  />
                </label>

                <div className="inline-actions">
                  <button type="button" className="button primary" disabled={actionBusy === 'accept'} onClick={handleAccept}>
                    {t.requests.accept}
                  </button>
                  <button type="button" className="button danger" disabled={actionBusy === 'reject'} onClick={handleReject}>
                    {t.requests.reject}
                  </button>
                </div>
              </div>
            ) : null}

            {selectedRequest.rejectionReason ? (
              <div className="panel-subsection">
                <h3>{t.requests.rejectReason}</h3>
                <p>{selectedRequest.rejectionReason}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default Requests;
