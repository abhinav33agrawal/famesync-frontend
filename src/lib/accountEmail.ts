const toTrimmedEmail = (value: string | null | undefined) => `${value || ''}`.trim();

export const isInstagramPlaceholderEmail = (value: string | null | undefined) => {
  const email = toTrimmedEmail(value).toLowerCase();
  if (!email) return false;
  return email.endsWith('@instagram.local');
};

export const hasUsableAccountEmail = (value: string | null | undefined) => {
  const email = toTrimmedEmail(value);
  if (!email) return false;
  return !isInstagramPlaceholderEmail(email);
};

export const getPreferredAccountEmail = (
  fameeEmail: string | null | undefined,
  instagramEmail: string | null | undefined
) => {
  const primary = toTrimmedEmail(fameeEmail);
  const secondary = toTrimmedEmail(instagramEmail);

  if (hasUsableAccountEmail(primary)) return primary;
  if (hasUsableAccountEmail(secondary)) return secondary;
  if (primary) return primary;
  if (secondary) return secondary;
  return '';
};
