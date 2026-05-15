export const createEnumLabel = (value) => String(value || '')
  .toLowerCase()
  .split('_')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

export const getLocale = (language) => (language === 'ar' ? 'ar-EG' : 'en-US');

export const formatDateTime = (value, language = 'en') => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return new Intl.DateTimeFormat(getLocale(language), {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatNumber = (value, language = 'en') => (
  new Intl.NumberFormat(getLocale(language), {
    maximumFractionDigits: 1,
  }).format(Number(value || 0))
);

export const translateEnum = (dictionary, group, value) => (
  dictionary?.enums?.[group]?.[value] || createEnumLabel(value)
);
