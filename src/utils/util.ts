export const getUniqueID = (): string => {
  return Date.now() + Math.random().toString(36).substring(2, 9);
}

export const numberOrNull = ( a: number | string ): number | null => {
  // return typeof a === 'number' ? a : null;
  return typeof a === 'string' ? null : a;
}