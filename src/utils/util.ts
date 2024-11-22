export const getUniqueID = (): string => {
  return Date.now() + Math.random().toString(36).substring(2, 9);
}

export const numberOrNull = ( a: number | string ): number | null => {
  // return typeof a === 'number' ? a : null;
  return typeof a === 'string' ? null : a;
}

export const cleanCurrencyString = ( s: string ): number => {
  const cleanedString = s.replace(/[^0-9.]/g, '');

  // Convert the cleaned string to a number
  const number = parseFloat( cleanedString );

  // Check if the conversion was successful
  if ( isNaN( number )) {
    throw new Error('Invalid currency string');
  }

  return number;
}