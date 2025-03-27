import { Dayjs } from "dayjs";
import { svgs } from "./svg";
import { MonthlySchemaItem, OnceSchemaItem, Schema, WeeklySchemaItem } from "./types";
import { x25log } from "./log";

// export const getUniqueID = (): string => {
//   return Date.now() + Math.random().toString(36).substring(2, 9);
// }

export const numberOrNull = ( a: number | string ): number | null => {
  // return typeof a === 'number' ? a : null;
  return typeof a === 'string' ? null : a;
}


// export const slugify = (name: string): string => {
//   return name
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, '') // Remove special characters
//     .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with dashes
//     .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
// }

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

export const getFriday = (from: Dayjs): Dayjs => {
  const daysFromFriday = (from.day() + 2) % 7;
  return from.subtract(daysFromFriday, 'day');
}

export const isActive = (on: Dayjs, budgetStart: Dayjs, item: Schema<"item">): boolean => {
  // if (item.frequency === "Once"){
  //   if ( item.date !== undefined && typeof item.date !== "string" ) {
  //     return !on.isBefore(budgetStart) && item.date.isAfter(on, 'day');
  //   } else {
  //     x25log.w("[isActive][utils.ts]: Item %s is not valid", item.documentId);  
  //   }

  // } else {
  //   if ( item.starts !== undefined && typeof item.starts !== "string" && item.ends !== undefined ){
  //     return (
  //       item.starts.isSameOrBefore(on, 'day')
  //       && (item.ends === "-1" || (item.ends as Dayjs).isSameOrAfter(on, 'day'))
  //       && !budgetStart.isBefore(item.starts)
  //     );
  //   } else {
  //     x25log.w("[isActive][utils.ts]: Item %s is not valid", item.documentId); 
  //   }
  // }
  return false
}

export const isMonthlyItem = (item: Schema<"item">): item is MonthlySchemaItem => {
  if ( 
    typeof item.amount === "number" && 
    item.name && 
    item.type && 
    item.frequency === "Monthly" &&
    item.dates && 
    item.starts && 
    item.ends
  ){
    return true
  }
  return false
}

export const isWeeklyItem = (item: Schema<"item">): item is WeeklySchemaItem => {
  if ( 
    typeof item.amount === "number" && 
    item.name && 
    item.type && 
    (item.frequency === "Bi-weekly" || item.frequency === "Weekly") &&
    item.day && 
    item.starts && 
    item.ends
  ){
    return true
  }
  return false
}

export const isOneTimeItem = (item: Schema<"item">): item is OnceSchemaItem => {
  if ( 
    typeof item.amount === "number" && 
    item.name && 
    item.type && 
    item.frequency === "Once" &&
    item.date
  ){
    return true
  }
  return false
}