const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ecommerce-app-e6303c36e118.herokuapp.com';
const OTP_BASE_PATH = '/api/v1/public/otp';
const AUTH_ME_PATH = '/api/v1/auth/me';
const MODEL_ME_PATH = '/api/v1/model/me';
const SESSION_STORAGE_KEY = 'model-dashboard-session';
const SESSION_UPDATED_EVENT = 'model-dashboard-session-updated';
const PROFILE_CACHE_KEY = 'model-dashboard-profile-cache';
const BRAND_DASHBOARD_URL = import.meta.env.VITE_BRAND_DASHBOARD_URL || '/brand-dashboard';

const findFirstArrayInObject = (value, seen = new Set()) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object' || seen.has(value)) {
    return null;
  }

  seen.add(value);

  for (const nestedValue of Object.values(value)) {
    const match = findFirstArrayInObject(nestedValue, seen);

    if (match) {
      return match;
    }
  }

  return null;
};

export const normalizeCollectionResponse = (data, preferredKeys = []) => (
  [
    ...preferredKeys.map((key) => data?.[key]),
    data?.content,
    data?.data,
    data?.items,
    data?.result,
    data?.data?.content,
    data?.data?.items,
    findFirstArrayInObject(data),
    Array.isArray(data) ? data : null,
  ].find(Array.isArray) || []
);

const toNumber = (value, fallbackValue) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallbackValue;
};

export const normalizePaginatedResponse = (data, { fallbackPage = 0, fallbackSize = 10, preferredKeys = [] } = {}) => {
  const items = normalizeCollectionResponse(data, preferredKeys);
  const page = toNumber(data?.page ?? data?.number ?? data?.data?.page ?? data?.data?.number, fallbackPage);
  const size = toNumber(data?.size ?? data?.data?.size, fallbackSize);
  const totalElements = toNumber(
    data?.totalElements ?? data?.total ?? data?.count ?? data?.data?.totalElements ?? data?.data?.total ?? data?.data?.count,
    items.length,
  );
  const totalPages = toNumber(
    data?.totalPages ?? data?.pages ?? data?.data?.totalPages ?? data?.data?.pages,
    totalElements > 0 ? Math.ceil(totalElements / Math.max(size, 1)) : 0,
  );

  return {
    items,
    page,
    size,
    totalElements,
    totalPages,
    hasNext: typeof data?.hasNext === 'boolean' ? data.hasNext : page + 1 < totalPages,
    hasPrevious: typeof data?.hasPrevious === 'boolean' ? data.hasPrevious : page > 0,
  };
};

const readJsonStorage = (key) => {
  const raw = localStorage.getItem(key);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(key);
    return null;
  }
};

const normalizeRole = (role) => String(role || '').trim().toUpperCase();

export const resolveUserDashboard = (value = {}) => {
  if (!value) {
    return null;
  }

  const defaultDashboard = String(value.defaultDashboard || '').trim().toUpperCase();

  if (['BRAND', 'MODEL', 'MODEL_ONBOARDING'].includes(defaultDashboard)) {
    return defaultDashboard;
  }

  const role = normalizeRole(value.role);
  const roles = extractTokenRoles(value);

  if (role === 'BRAND_OWNER' || value.hasBrandProfile || value.canAccessBrandDashboard) {
    return 'BRAND';
  }

  if (
    value.hasModelProfile
    || value.canAccessModelDashboard
    || roles.some((entry) => entry.includes('MODEL'))
  ) {
    return 'MODEL';
  }

  if (role === 'CUSTOMER') {
    return 'MODEL_ONBOARDING';
  }

  return null;
};

export const isModelOnboardingUser = (value = {}) => resolveUserDashboard(value) === 'MODEL_ONBOARDING';

export const getUserHomePath = (value = {}) => {
  const dashboard = resolveUserDashboard(value);

  if (dashboard === 'MODEL') {
    return '/dashboard';
  }

  if (dashboard === 'MODEL_ONBOARDING') {
    return '/onboarding/model-profile';
  }

  return null;
};

export const getBrandDashboardUrl = () => BRAND_DASHBOARD_URL;

export const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');

  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

export const extractTokenRoles = (value = {}) => {
  const candidates = [
    value?.role,
    ...(Array.isArray(value?.roles) ? value.roles : []),
    ...(Array.isArray(value?.authorities) ? value.authorities : []),
    ...(Array.isArray(value?.permissions) ? value.permissions : []),
  ];

  return Array.from(new Set(
    candidates
      .flatMap((entry) => {
        if (Array.isArray(entry)) {
          return entry;
        }

        if (typeof entry === 'string' && entry.includes(',')) {
          return entry.split(',');
        }

        return [entry];
      })
      .filter(Boolean)
      .map(normalizeRole),
  ));
};

export const normalizeAuthUser = (user = {}, fallbackUser = {}) => {
  const mergedUser = {
    ...fallbackUser,
    ...user,
  };
  const role = normalizeRole(mergedUser.role);
  const roles = Array.from(new Set([
    ...extractTokenRoles(fallbackUser),
    ...extractTokenRoles(mergedUser),
    role,
  ].filter(Boolean)));
  const email = String(mergedUser.email || fallbackUser.email || '').trim().toLowerCase();
  const defaultDashboard = String(mergedUser.defaultDashboard || fallbackUser.defaultDashboard || '').trim().toUpperCase();

  return {
    ...mergedUser,
    id: mergedUser.userId || mergedUser.id || fallbackUser.userId || fallbackUser.id || email || '',
    userId: mergedUser.userId || fallbackUser.userId || mergedUser.id || fallbackUser.id || '',
    externalId: mergedUser.externalId || fallbackUser.externalId || '',
    email,
    role: role || roles[0] || '',
    roles,
    name: mergedUser.name || mergedUser.fullName || mergedUser.displayName || fallbackUser.name || (email ? email.split('@')[0] : 'Model User'),
    isProfileCompleted: Boolean(mergedUser.isProfileCompleted ?? fallbackUser.isProfileCompleted),
    hasBrandProfile: Boolean(mergedUser.hasBrandProfile ?? fallbackUser.hasBrandProfile),
    hasCustomerProfile: Boolean(mergedUser.hasCustomerProfile ?? fallbackUser.hasCustomerProfile),
    hasModelProfile: Boolean(mergedUser.hasModelProfile ?? fallbackUser.hasModelProfile),
    canAccessBrandDashboard: Boolean(mergedUser.canAccessBrandDashboard ?? fallbackUser.canAccessBrandDashboard),
    canAccessModelDashboard: Boolean(mergedUser.canAccessModelDashboard ?? fallbackUser.canAccessModelDashboard),
    defaultDashboard: defaultDashboard || null,
  };
};

export const canAccessModelDashboard = (value = {}) => {
  if (!value) {
    return false;
  }

  if (typeof value.canAccessModelDashboard === 'boolean') {
    return value.canAccessModelDashboard;
  }

  return resolveUserDashboard(value) === 'MODEL';
};

const createNormalizedSession = (session = {}, fallbackUser = {}) => {
  const accessToken = session?.accessToken || session?.token || '';
  const refreshToken = session?.refreshToken || '';
  const user = normalizeAuthUser(session?.user, fallbackUser);

  if (!accessToken) {
    return null;
  }

  return {
    ...session,
    accessToken,
    refreshToken,
    user,
  };
};

export const readStoredSession = () => {
  const rawSession = readJsonStorage(SESSION_STORAGE_KEY);
  return rawSession ? createNormalizedSession(rawSession, rawSession?.user) : null;
};

export const writeStoredSession = (session) => {
  const normalizedSession = createNormalizedSession(session, session?.user);

  if (!normalizedSession) {
    clearStoredSession();
    return null;
  }

  const previousSession = readJsonStorage(SESSION_STORAGE_KEY);
  const previousEmail = String(previousSession?.user?.email || '').trim().toLowerCase();
  const nextEmail = String(normalizedSession.user?.email || '').trim().toLowerCase();

  if ((previousEmail && nextEmail && previousEmail !== nextEmail) || !normalizedSession.user?.hasModelProfile) {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  }

  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(normalizedSession));
  localStorage.setItem('token', normalizedSession.accessToken || '');
  localStorage.setItem('refreshToken', normalizedSession.refreshToken || '');
  window.dispatchEvent(new CustomEvent(SESSION_UPDATED_EVENT, { detail: normalizedSession }));
  return normalizedSession;
};

export const clearStoredSession = () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem(PROFILE_CACHE_KEY);
  window.dispatchEvent(new CustomEvent(SESSION_UPDATED_EVENT, { detail: null }));
};

export const readCachedModelProfile = () => readJsonStorage(PROFILE_CACHE_KEY);

export const writeCachedModelProfile = (profile) => {
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
};

const normalizeAvailableForEntry = (entry = {}) => {
  const availableFor = String(entry?.availableFor || '').trim().toUpperCase();
  const pricePerSession = Number(entry?.pricePerSession);

  return {
    availableFor,
    pricePerSession: Number.isFinite(pricePerSession) ? pricePerSession : 0,
  };
};

export const normalizeModelProfile = (profile = {}) => {
  const normalizedProfile = profile && typeof profile === 'object' ? profile : {};

  return {
    ...normalizedProfile,
    modelId: normalizedProfile.modelId || normalizedProfile.id || '',
    modelName: normalizedProfile.modelName || normalizedProfile.username || '',
    modelEmail: String(normalizedProfile.modelEmail || normalizedProfile.email || '').trim().toLowerCase(),
    bio: normalizedProfile.bio || '',
    city: normalizedProfile.city || '',
    age: normalizedProfile.age ?? '',
    heightCm: normalizedProfile.heightCm ?? '',
    weightKg: normalizedProfile.weightKg ?? '',
    hairColor: normalizedProfile.hairColor || '',
    bodyType: String(normalizedProfile.bodyType || '').trim().toUpperCase() || '',
    skinTone: String(normalizedProfile.skinTone || '').trim().toUpperCase() || '',
    gender: String(normalizedProfile.gender || '').trim().toUpperCase() || '',
    ratingAvg: Number.isFinite(Number(normalizedProfile.ratingAvg)) ? Number(normalizedProfile.ratingAvg) : 0,
    ratingCount: Number.isFinite(Number(normalizedProfile.ratingCount)) ? Number(normalizedProfile.ratingCount) : 0,
    isAvailable: typeof normalizedProfile.isAvailable === 'boolean' ? normalizedProfile.isAvailable : true,
    modelImages: Array.isArray(normalizedProfile.modelImages) ? normalizedProfile.modelImages.filter(Boolean) : [],
    availableFor: Array.isArray(normalizedProfile.availableFor)
      ? normalizedProfile.availableFor
        .filter((entry) => entry && typeof entry === 'object')
        .map(normalizeAvailableForEntry)
        .filter((entry) => entry.availableFor)
      : [],
    customer: normalizedProfile.customer && typeof normalizedProfile.customer === 'object'
      ? normalizedProfile.customer
      : null,
  };
};

const isTokenExpired = (token, bufferMs = 15000) => {
  const payload = parseJwtPayload(token);
  const expiresAt = Number(payload?.exp);

  if (!expiresAt) {
    return false;
  }

  return Date.now() >= (expiresAt * 1000) - bufferMs;
};

const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    query.append(key, value);
  });

  const serialized = query.toString();
  return serialized ? `?${serialized}` : '';
};

const toFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null && item !== undefined) {
          formData.append(key, item);
        }
      });
      return;
    }

    formData.append(key, value);
  });

  return formData;
};

const toJsonBody = (payload = {}) => JSON.stringify(
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null && value !== undefined && value !== ''),
  ),
);

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const raw = await response.text();
  let data = raw;

  if (contentType.includes('application/json') && raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }

  if (!response.ok) {
    const error = new Error(
      (typeof data === 'string' && data) || data?.message || response.statusText || 'Request failed',
    );

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

let refreshPromise = null;

const refreshAccessToken = async (session) => {
  const refreshToken = session?.refreshToken;

  if (!refreshToken) {
    clearStoredSession();
    throw new Error('No refresh token available');
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}${OTP_BASE_PATH}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(parseResponse)
      .then((data) => {
        const nextSession = createNormalizedSession({
          ...session,
          accessToken: data?.accessToken || '',
          refreshToken: data?.refreshToken || refreshToken,
          user: data?.user,
        }, session?.user);

        if (!nextSession) {
          clearStoredSession();
          throw new Error('This account cannot access the model dashboard');
        }

        writeStoredSession(nextSession);
        return nextSession;
      })
      .catch((error) => {
        clearStoredSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

export const refreshStoredSession = async (session) => {
  if (!session?.accessToken || !isTokenExpired(session.accessToken)) {
    return createNormalizedSession(session, session?.user);
  }

  return refreshAccessToken(session);
};

const authorizedRequest = async (path, options = {}, { retry = true } = {}) => {
  let session = readStoredSession();

  if (session?.accessToken && isTokenExpired(session.accessToken) && session?.refreshToken) {
    session = await refreshAccessToken(session);
  }

  const headers = new Headers(options.headers || {});

  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && retry && session?.refreshToken) {
    const nextSession = await refreshAccessToken(session);
    const retryHeaders = new Headers(options.headers || {});
    retryHeaders.set('Authorization', `Bearer ${nextSession.accessToken}`);

    const retriedResponse = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: retryHeaders,
    });

    return parseResponse(retriedResponse);
  }

  return parseResponse(response);
};

const publicRequest = (path, options = {}) => fetch(`${API_BASE_URL}${path}`, options).then(parseResponse);

export const authApi = {
  generateOtp: (payload) => publicRequest(`${OTP_BASE_PATH}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: toJsonBody(payload),
  }),
  verifyOtp: (payload) => publicRequest(`${OTP_BASE_PATH}/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: toJsonBody(payload),
  }),
  getMe: () => authorizedRequest(AUTH_ME_PATH),
};

export const modelApi = {
  getMeProfile: () => authorizedRequest(MODEL_ME_PATH).then(normalizeModelProfile),
  createProfile: (payload) => authorizedRequest('/api/v1/model', {
    method: 'POST',
    body: toFormData(payload),
  }),
  saveAvailableFor: (entries) => authorizedRequest('/api/v1/model/available-for', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ availableFor: entries }),
  }),
  getRequests: ({ page = 0, size = 10, status = '' } = {}) => authorizedRequest(
    `/api/v1/model/requests${buildQueryString({ page, size, status })}`,
  ),
  getRequestById: (requestId) => authorizedRequest(`/api/v1/model/requests/${requestId}`),
  acceptRequest: (requestId) => authorizedRequest(`/api/v1/model/requests/${requestId}/accept`, {
    method: 'POST',
  }),
  rejectRequest: (requestId, rejectionReason) => authorizedRequest(`/api/v1/model/requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rejectionReason }),
  }),
  getAgreements: ({ page = 0, size = 10, status = '' } = {}) => authorizedRequest(
    `/api/v1/model/agreements${buildQueryString({ page, size, status })}`,
  ),
  getAgreementById: (agreementId) => authorizedRequest(`/api/v1/model/agreements/${agreementId}`),
  getSubmissions: (agreementId) => authorizedRequest(`/api/v1/model/agreements/${agreementId}/submissions`),
  createSubmission: (agreementId, payload) => authorizedRequest(`/api/v1/model/agreements/${agreementId}/submissions`, {
    method: 'POST',
    body: toFormData(payload),
  }),
  getPayment: (agreementId) => authorizedRequest(`/api/v1/model/agreements/${agreementId}/payment`),
  getReviews: ({ page = 0, size = 10 } = {}) => authorizedRequest(
    `/api/v1/model/reviews${buildQueryString({ page, size })}`,
  ),
  getReviewStats: () => authorizedRequest('/api/v1/model/reviews/stats'),
  getNotifications: ({ page = 0, size = 10, status = 'ALL', type = '' } = {}) => authorizedRequest(
    `/api/v1/dashboard/notifications${buildQueryString({ page, size, status, type })}`,
  ),
  getNotificationStats: () => authorizedRequest('/api/v1/dashboard/notifications/stats'),
  markNotificationRead: (notificationId) => authorizedRequest(`/api/v1/dashboard/notifications/${notificationId}/read`, {
    method: 'POST',
  }),
  markAllNotificationsRead: () => authorizedRequest('/api/v1/dashboard/notifications/read-all', {
    method: 'POST',
  }),
};

export { API_BASE_URL, SESSION_UPDATED_EVENT };
