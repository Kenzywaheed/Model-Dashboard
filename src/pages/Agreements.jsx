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

const AGREEMENT_STATUSES = ['', 'IN_PROGRESS', 'SUBMITTED', 'REVISION_REQUESTED', 'AWAITING_PAYMENT', 'COMPLETED', 'CANCELLED'];

const Agreements = () => {
  const { language, t } = useLanguage();
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAgreementId, setSelectedAgreementId] = useState('');
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [payment, setPayment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({ note: '', files: [] });
  const [successMessage, setSuccessMessage] = useState('');

  const loadAgreements = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await modelApi.getAgreements({ page, size: 10, status: filter });
      setPageData(normalizePaginatedResponse(response, { fallbackPage: page, fallbackSize: 10 }));
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgreements();
  }, [filter, page]);

  const openAgreement = async (agreementId) => {
    setSelectedAgreementId(agreementId);
    setSubmissionForm({ note: '', files: [] });
    setSuccessMessage('');
    setDetailLoading(true);

    try {
      const [agreementData, submissionData, paymentData] = await Promise.all([
        modelApi.getAgreementById(agreementId),
        modelApi.getSubmissions(agreementId),
        modelApi.getPayment(agreementId),
      ]);

      setSelectedAgreement(agreementData);
      setSubmissions(Array.isArray(submissionData) ? submissionData : []);
      setPayment(paymentData);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to load agreement details');
      setSelectedAgreement(null);
      setSubmissions([]);
      setPayment(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmissionUpload = async (event) => {
    event.preventDefault();

    if (!selectedAgreementId) {
      return;
    }

    setUploading(true);
    setError('');
    setSuccessMessage('');

    try {
      await modelApi.createSubmission(selectedAgreementId, {
        note: submissionForm.note,
        files: Array.from(submissionForm.files || []),
      });

      setSuccessMessage(t.agreements.submissionSaved);
      await openAgreement(selectedAgreementId);
    } catch (requestError) {
      setError(requestError?.message || 'Failed to upload submission');
    } finally {
      setUploading(false);
    }
  };

  const items = useMemo(() => pageData?.items || [], [pageData?.items]);

  return (
    <div className="page-stack">
      <SectionIntro
        eyebrow={t.agreements.eyebrow}
        title={t.agreements.title}
        subtitle={t.agreements.subtitle}
      />

      {error ? <div className="banner error">{error}</div> : null}
      {successMessage ? <div className="banner success">{successMessage}</div> : null}

      <section className="filter-strip">
        {AGREEMENT_STATUSES.map((status) => (
          <button
            key={status || 'all'}
            type="button"
            className={`filter-chip ${filter === status ? 'active' : ''}`}
            onClick={() => {
              setFilter(status);
              setPage(0);
            }}
          >
            {status ? translateEnum(t, 'agreementStatus', status) : t.common.all}
          </button>
        ))}
      </section>

      {loading ? <LoadingState label={t.common.loading} /> : null}

      {!loading && error ? (
        <ErrorState title={error} onRetry={loadAgreements} actionLabel={t.common.reload} />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState title={t.agreements.noAgreements} />
      ) : null}

      <section className="cards-grid">
        {items.map((agreement) => (
          <article key={agreement.agreementId} className="panel-card request-card">
            <div className="list-card-row">
              <div>
                <h2>{agreement.title || agreement.agreementNumber}</h2>
                <p>{agreement.brandName || agreement.modelName || agreement.agreementNumber}</p>
              </div>
              <StatusBadge
                label={translateEnum(t, 'agreementStatus', agreement.agreementStatus)}
                tone={agreement.agreementStatus === 'COMPLETED' ? 'success' : agreement.agreementStatus === 'CANCELLED' ? 'danger' : 'primary'}
              />
            </div>

            <div className="summary-grid">
              <div className="simple-stat-row">
                <span>{t.common.type}</span>
                <strong>{translateEnum(t, 'availableFor', agreement.availableFor)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.payment}</span>
                <strong>{translateEnum(t, 'paymentStatus', agreement.paymentStatus)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.agreedPrice}</span>
                <strong>{agreement.agreedPrice ?? '--'}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.deadline}</span>
                <strong>{formatDateTime(agreement.deadline, language)}</strong>
              </div>
            </div>

            <button type="button" className="button secondary full" onClick={() => openAgreement(agreement.agreementId)}>
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
        open={Boolean(selectedAgreementId)}
        wide
        title={selectedAgreement?.title || t.agreements.detailTitle}
        onClose={() => {
          setSelectedAgreementId('');
          setSelectedAgreement(null);
          setSubmissions([]);
          setPayment(null);
          setSubmissionForm({ note: '', files: [] });
        }}
      >
        {detailLoading ? <LoadingState label={t.agreements.loadingDetail} /> : null}

        {!detailLoading && !selectedAgreement ? <EmptyState title={t.common.noData} /> : null}

        {!detailLoading && selectedAgreement ? (
          <div className="drawer-stack">
            <div className="summary-grid">
              <div className="simple-stat-row">
                <span>{t.common.agreementNumber}</span>
                <strong>{selectedAgreement.agreementNumber || '--'}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.status}</span>
                <strong>{translateEnum(t, 'agreementStatus', selectedAgreement.agreementStatus)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.payment}</span>
                <strong>{translateEnum(t, 'paymentStatus', selectedAgreement.paymentStatus)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.brand}</span>
                <strong>{selectedAgreement.brandName || selectedAgreement.modelName || '--'}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.type}</span>
                <strong>{translateEnum(t, 'availableFor', selectedAgreement.availableFor)}</strong>
              </div>
              <div className="simple-stat-row">
                <span>{t.common.deadline}</span>
                <strong>{formatDateTime(selectedAgreement.deadline, language)}</strong>
              </div>
            </div>

            <div className="panel-subsection">
              <h3>{t.common.description}</h3>
              <p>{selectedAgreement.description || '--'}</p>
            </div>

            <div className="panel-subsection">
              <div className="panel-head">
                <h3>{t.agreements.submissions}</h3>
              </div>

              {submissions.length === 0 ? (
                <EmptyState title={t.agreements.noSubmissions} />
              ) : (
                <div className="stack-list">
                  {submissions.map((submission) => (
                    <article key={submission.submissionId} className="list-card">
                      <div className="list-card-row">
                        <div>
                          <strong>{submission.submissionId}</strong>
                          <p>{formatDateTime(submission.createdAt, language)}</p>
                        </div>
                        <StatusBadge
                          label={translateEnum(t, 'reviewStatus', submission.reviewStatus)}
                          tone={submission.reviewStatus === 'APPROVED' ? 'success' : submission.reviewStatus === 'REVISION_REQUESTED' ? 'warning' : 'neutral'}
                        />
                      </div>

                      <p>{submission.note || '--'}</p>
                      <p className="muted-copy">{submission.reviewFeedback || '--'}</p>

                      {(submission.assets || []).length > 0 ? (
                        <div className="asset-grid">
                          {submission.assets.map((asset) => (
                            <a key={asset.assetId} className="asset-card" href={asset.assetUrl} target="_blank" rel="noreferrer">
                              <strong>{asset.assetType}</strong>
                              <span>{asset.mimeType}</span>
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </div>

            <form className="panel-subsection" onSubmit={handleSubmissionUpload}>
              <div className="panel-head">
                <h3>{t.agreements.addSubmission}</h3>
              </div>

              <label className="field-group">
                <span className="field-label">{t.common.note}</span>
                <textarea
                  className="field-textarea"
                  rows="4"
                  value={submissionForm.note}
                  onChange={(event) => setSubmissionForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder={t.agreements.notePlaceholder}
                />
              </label>

              <label className="field-group">
                <span className="field-label">{t.common.files}</span>
                <input
                  className="field-input"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(event) => setSubmissionForm((current) => ({ ...current, files: event.target.files }))}
                />
              </label>

              <button type="submit" className="button primary" disabled={uploading}>
                {uploading ? t.common.saving : t.agreements.uploadAction}
              </button>
            </form>

            <div className="panel-subsection">
              <div className="panel-head">
                <h3>{t.agreements.paymentSummary}</h3>
              </div>

              {!payment ? (
                <EmptyState title={t.common.noData} />
              ) : (
                <div className="summary-grid">
                  <div className="simple-stat-row">
                    <span>{t.common.price}</span>
                    <strong>{payment.amount ?? '--'}</strong>
                  </div>
                  <div className="simple-stat-row">
                    <span>{t.common.status}</span>
                    <strong>{translateEnum(t, 'paymentStatus', payment.paymentStatus)}</strong>
                  </div>
                  <div className="simple-stat-row">
                    <span>Provider</span>
                    <strong>{payment.provider || '--'}</strong>
                  </div>
                  <div className="simple-stat-row">
                    <span>Paid at</span>
                    <strong>{formatDateTime(payment.paidAt, language)}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default Agreements;
