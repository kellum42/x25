import { svgs } from "./svg";

export const getUniqueID = (): string => {
  return Date.now() + Math.random().toString(36).substring(2, 9);
}

export const numberOrNull = ( a: number | string ): number | null => {
  // return typeof a === 'number' ? a : null;
  return typeof a === 'string' ? null : a;
}


export const slugify = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with dashes
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

export const generateAvatar = (): { color: string, bg: string, svg: number } => {
  const colors: { color: string, bg: string }[] = [
    { color: "success", bg: "light-success" },
    { color: "info", bg: "light-info" },
    { color: "warning", bg: "light-warning" },
    { color: "danger", bg: "light-danger" },
    { color: "primary", bg: "light-primary" },
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];
  return { ...color, svg: Math.floor(Math.random() * svgs.length) }
};


export const addDateSuffix = (date: string): string => {
  const suffix = ["1", "21", "31"].includes(date) ?
  "st" :
  ["2", "22"].includes(date) ?
    "nd" :
    ["3", "23"].includes(date) ?
      "rd" :
      "th"
  ;
  return date + suffix;
}