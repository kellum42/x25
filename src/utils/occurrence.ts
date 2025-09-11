
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

// import { Requires, x25Item } from './types';
// import { BudgetItem, BudgetItemFrequency } from './schemas';
import { x25log } from './log';
import { Schema, x25Result } from './types';
import { isMonthlyItem, isOneTimeItem, isWeeklyItem } from './util';
import { OccurrenceMap, Occurrence } from '../hooks/useOccurrences';

// needed to use day.js plugins
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

// TODO:
//  - Test if this accounts for monthly events that occur after the month ends.
//    ex. if something occurs on the 31st and the month only has 30 days.
//    Maybe default these charges to occur on the first of the next month. Ask user their preferene?
//  - Incorporate returning x25 error on errors instead of strings.

// const first = <T>(arr?: T[]): T | undefined => {
//   if (arr !== undefined && arr.length > 0) {
//     return arr[0];
//   }
//   return undefined;
// }

// Start and end dates must have budget start/end and item start/end factored in.
export function calculateOccurrences(items: Schema<"item">[], start: Dayjs, end: Dayjs): Occurrence[];
export function calculateOccurrences(item: Schema<"item">, start: Dayjs, end: Dayjs): Occurrence[];
export function calculateOccurrences(_item: Schema<"item"> | Schema<"item">[], start: Dayjs, end: Dayjs): Occurrence[] {
  // export function calculateOccurrences(items: x25Item[], start: Dayjs, end: Dayjs): Occurrence[];
  // export function calculateOccurrences(item: x25Item, start: Dayjs, end: Dayjs): Occurrence[];
  // export function calculateOccurrences(_item: x25Item|x25Item[], start: Dayjs, end: Dayjs): Occurrence[] { 
  const items: Schema<"item">[] = Array.isArray(_item) ? _item : [_item];

  if (start.isAfter(end)) {
    x25log.w("[calculateOccurences][occurrence.ts]: End date is before start date. This is illegal.")
    return [];
  }

  // If item is starts after the end date, return nothing.
  // If item ends before the start date, return nothing.
  // Lower bound will be the greater between the start date and item start.
  // Upper bound will be the least between the end date and item end.
  // Find all occurrences in that range.

  const output: Occurrence[] = [];

  items.forEach(item => {
    const multiplier: number = item.type === "income" ? 1 : -1;

    if (isOneTimeItem(item)) {
      const date = dayjs(item.date);
      if (date.isBetween(start, end, 'day', '[)')) {
        output.push({
          date,
          item: { documentId: item.documentId, amount: item.amount * multiplier },
        })
      }

    } else if (isMonthlyItem(item)) {
      const itemStart = dayjs(item.starts);
      const itemEnds = item.ends === "-1" ? "-1" : dayjs(item.ends);

      if (itemStart.isAfter(end)) {
        x25log.d("[calculateOccurences][occurrence.ts]: Item %s starts after end parameter %s. Skipping.", item.name, end.format("YYYY-MM-DD"));
        return;
      }

      if (itemEnds !== "-1") {
        if (itemEnds.isBefore(start)) {
          x25log.d("[calculateOccurences][occurrence.ts]: Item %s ends before start parameter %s. Skipping.", item.name, start.format("YYYY-MM-DD"));
          return;
        }
        if (itemEnds.isBefore(itemStart)) {
          x25log.w("[calculateOccurences][occurrence.ts]: Item %s ends date %s is before its start date %s. Skipping.", item.name, end.format("YYYY-MM-DD"), start.format("YYYY-MM-DD"));
          return;
        }
      }

      const _start = itemStart.isAfter(start) ? itemStart : start;
      const _end = itemEnds === "-1" || itemEnds.isAfter(end) ? end : itemEnds;

      item.dates.split(",").forEach((dayOfMonth, i) => {
        // calculate the first occurrence of line item.
        // this will be our frame of reference for calculating future occurrences.
        //  i is needed to tell daysTillNextOccurrence which MonthlyBudgetItem.dates[] we're using.
        const daysUntilFirstOccurrence = daysTillNextOccurrence(item, _start, i);
        if (typeof daysUntilFirstOccurrence === 'string') {
          return;
        }

        const firstOccurrence = _start.add(daysUntilFirstOccurrence, 'day');

        if (firstOccurrence.isAfter(_end, 'date')) {
          x25log.d("[calculateOccurrences][occurrence.ts]: %s does not occur between %s and %s.", item.name ?? "--", _start.format("YYYY-MM-DD"), _end.format("YYYY-MM-DD"));
          return;
        }

        const fullMonthsRemaining: number = _end.diff(firstOccurrence, 'month');

        //  Based on the date of the first occurrence, calculate the remaining occurrences in the time range.
        //  Occurrences will be equal to the number of remaining full months in time range.
        //  1 is added to fullMonthsRemaining to account for the first occurrence.
        const numOccurrences = fullMonthsRemaining + 1;
        x25log.d("[calculateOccurrences][occurrence.ts]: %s (%s: %d of month) has %d occurrences between the %s and %s.", item.name ?? "--", item.frequency ?? "", dayOfMonth, numOccurrences, _start.format("YYYY-MM-DD"), _end.format("YYYY-MM-DD"));

        Array(numOccurrences).fill(0).map((_, i) => {
          const d = firstOccurrence.add(i, 'months');
          output.push({
            date: d,
            item: { documentId: item.documentId, amount: item.amount * multiplier },
          })
        })
      })

    } else if (isWeeklyItem(item)) {
      // calculate the first occurrence of line item.
      const daysUntilFirstOccurrence = daysTillNextOccurrence(item, start);
      if (typeof daysUntilFirstOccurrence === 'string') {
        return;
      }

      // the days remaining in the time range after the first occurrence.
      const spanInDays = end.diff(start, "day");
      const trueSpan: number = spanInDays - daysUntilFirstOccurrence;

      //  If trueSpan < 0, the first occurrence is outside of the given time range.
      //  We can skip it.
      if (trueSpan < 0) {
        x25log.d("[calculateOccurrences][occurrence.ts]: %s (%s) does not occur between %s - %s", item.name ?? "--", item.frequency ?? "", start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"))
        return;
      }

      //  Divide the trueSpan by 7 (for weekly) or 14 (for biweekly) to see how many occurrences are left in the time range.
      //  Math.floor is used to get rid of any remainder, so we just get the occurrences.
      const rate = item.frequency === "Weekly" ? 7 : 14;
      const numOccurrences: number = Math.floor(trueSpan / rate) + 1;

      x25log.d("[calculateOccurrences][occurrence.ts]: %s (%s) has %d occurrences between the %s and %s.", item.name ?? "--", item.frequency ?? "", numOccurrences, start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"))

      const firstOccurrence = start.add(daysUntilFirstOccurrence, 'day');
      Array(numOccurrences).fill(0).map((_, i) => {
        const d = firstOccurrence.add(rate * (i), 'days');
        output.push({
          date: d,
          item: { documentId: item.documentId, amount: item.amount * multiplier },
        })
      })
    } else {
      x25log.w("[calculateOccurrences][occurrence.ts]: Invalid item will not be processed. Id: %s, name: %s.", item.documentId, item.name ?? "");
    }
  })
  x25log.d("[calculateOccurrences][occurrence.ts]: %d occurrences have been calculated between %s and %s.", output.length, start.format("YYYY-MM-DD"), end.format("YYYY-MM-DD"));
  return output;
}


export const daysTillNextOccurrence = (item: Schema<"item">, _from: Dayjs, i?: number): number | string => {
  const from = _from.set('hour', 0).set('minutes', 0).set('seconds', 0);

  if (item.frequency == "Weekly" || item.frequency == "Bi-weekly") {

    const getDayAsInt = (day: string): number => {
      if (day === "Sunday") { return 0; }
      if (day === "Monday") { return 1; }
      if (day === "Tuesday") { return 2; }
      if (day === "Wednesday") { return 3; }
      if (day === "Thursday") { return 4; }
      if (day === "Friday") { return 5; }
      else { return 6; }
    }

    // Take into account item start and end dates.
    if (item.ends !== "-1" && dayjs(item.ends).isBefore(from)) { return -1; }

    const starts = dayjs(item.starts).set('hour', 0).set('minutes', 0).set('seconds', 0);
    let delta = 0;

    if (from.isBefore(starts, 'day')) {
      delta = (starts.unix() - from.unix()) / (3600 * 24);
      delta = Math.round(delta);
    }

    // start of calculation time range.
    const startDay = (delta > 0 ? starts : from).day();

    if (item.day === undefined) {
      x25log.w("[daysTillNextOccurrence][budget.ts]: Day is undefined for %s", item.name ?? "--");
      return "Day is undefined";
    }

    const firstOccurrence = getDayAsInt(item.day);

    const isBiWeekly = item.frequency === "Bi-weekly";
    const occursThisWeek = (from.isoWeek() - starts.isoWeek()) % 2 === 0 // for biweekly line items

    // is upcoming this week
    if (firstOccurrence >= startDay) {
      const days = firstOccurrence - startDay + delta + ((isBiWeekly && !occursThisWeek) ? 7 : 0);
      return days;
    } else {
      // occurrence has already passed this week.
      // Add the remaining days of the current week to the day of the week of the first occurrence.
      // If biweekly, it has already occurred this week. It won't occur again next week, so a 7 day offset is needed.
      const days = (7 - startDay) + firstOccurrence + delta + (isBiWeekly && occursThisWeek ? 7 : 0);
      return days;
    }

  } else if (item.frequency == "Monthly") {
    const _i = i ?? -1;
    const dates: string[] = (item.dates ?? "").split(",");

    if (_i >= 0 && _i <= dates.length) {
      const fromDate = from.date();
      const occurrenceDate = parseInt(dates[_i]);

      // Take into account item start and end dates.
      if (item.ends !== "-1" && dayjs(item.ends).isBefore(from)) { return -1; }

      // Sum days between from date and when the item starts.
      const _start = dayjs(item.starts);
      if (from.isBefore(item.starts, 'day')) {
        let firstOccurrence = _start
          .set('date', occurrenceDate)
          .set('hour', 0)
          .set('minutes', 0)
          .set('seconds', 0)
          .add(occurrenceDate < _start.date() ? 1 : 0, 'month');

        const diff = Math.round((firstOccurrence.unix() - from.unix()) / (3600 * 24));
        return diff;

      } else {
        if (occurrenceDate >= fromDate) {
          return occurrenceDate - fromDate;

        } else {
          // Get the rest of the days to finish out the month.
          // Add those days to the date of the occurrence.
          return _from.daysInMonth() - fromDate + occurrenceDate;
        }
      }

    } else {
      return "A valid iterator is required for MonthlyBudgetItems.";
    }

  } else if (item.frequency === "Once") {
    // return "Offset can only be calculated for reoccurring BudgetItems.";
    return Math.round((dayjs(item.date).unix() - from.unix()) / (3600 * 24));
  }
  // Should never get here.
  return "";
}

// map: OccurrenceMap = {dates:{}
// export const populateDatesTo = (date: Dayjs, map: OccurrenceMap): boolean => {  
//   // const lower = map.bounds === undefined || bounds[0].isBefore(dayjs(map.bounds[0]), 'date') ? bounds[0] : dayjs(map.bounds[0]);
//   const startBound = dayjs(map.bounds[0]);
//   const formerEndBound = dayjs(map.bounds[1]);

//   // Gets the latter of the old and new end bounds.
//   const endBound = !formerEndBound || date.isAfter(formerEndBound, 'date') ? date : formerEndBound;

//   map.bounds = [map.bounds[0], endBound.format("YYYY-MM-DD")];

//   if (!formerEndBound.isSame(endBound, 'date')){
//     x25log.d("[populateDatesTo][occurrences.ts]: End bound for map updated from %s to %s.", formerEndBound.format("YYYY-MM-DD"), endBound.format("YYYY-MM-DD"));
//   }

//   let d = startBound;
//   let datesAdded: number = 0;

//   // Goes thru every date between the new start and end bounds.
//   // If its not in the map, it is added.
//   while (!d.isAfter(endBound, 'date')) {
//     const datestring = d.format("YYYY-MM-DD");
//     if (!(datestring in map.dates)) {
//       map.dates[datestring] = {items:{}}
//       datesAdded++;
//     }
//     d = d.add(1, 'days');
//   }
//   if (datesAdded > 0) {
//     x25log.d("[populateDatesTo][occurrences.ts]: Added %d dates to occurrence map between %s and %s.", datesAdded, map.bounds[0], endBound.format("YYYY-MM-DD"));
//   } else {
//     x25log.d("[populateBounds][occurrences.ts]: No dates were added to occurrence map between %s and %s.", map.bounds[0], endBound.format("YYYY-MM-DD"));
//   }

//   return datesAdded > 0;
// }

export const populateDates = (start: Dayjs, end: Dayjs, map: OccurrenceMap): boolean => {  
  // const lower = map.bounds === undefined || bounds[0].isBefore(dayjs(map.bounds[0]), 'date') ? bounds[0] : dayjs(map.bounds[0]);
  const formerStartBound = dayjs(map.bounds[0]);
  const formerEndBound = dayjs(map.bounds[1]);

  // Gets the former of the old and new start bounds.
  const startBound = !formerStartBound || start.isBefore(formerStartBound) ? start : formerStartBound;
  // Gets the latter of the old and new end bounds.
  const endBound = !formerEndBound || end.isAfter(formerEndBound, 'date') ? end : formerEndBound;

  map.bounds = [startBound.format("YYYY-MM-DD"), endBound.format("YYYY-MM-DD")];

  if (!formerStartBound.isSame(startBound, 'date')){
    x25log.d("[populateDates][occurrences.ts]: Start bound for map updated from %s to %s.", formerStartBound.format("YYYY-MM-DD"), startBound.format("YYYY-MM-DD"));
  }

  if (!formerEndBound.isSame(endBound, 'date')){
    x25log.d("[populateDates][occurrences.ts]: End bound for map updated from %s to %s.", formerEndBound.format("YYYY-MM-DD"), endBound.format("YYYY-MM-DD"));
  }

  let d = startBound;
  let datesAdded: number = 0;

  // Goes thru every date between the new start and end bounds.
  // If its not in the map, it is added.
  while (!d.isAfter(endBound, 'date')) {
    const datestring = d.format("YYYY-MM-DD");
    if (!(datestring in map.dates)) {
      map.dates[datestring] = {items:{}}
      datesAdded++;
    }
    d = d.add(1, 'days');
  }
  if (datesAdded > 0) {
    x25log.d("[populateDatesTo][occurrences.ts]: Added %d dates to occurrence map between %s and %s.", datesAdded, map.bounds[0], endBound.format("YYYY-MM-DD"));
  } else {
    x25log.d("[populateBounds][occurrences.ts]: No dates were added to occurrence map between %s and %s.", map.bounds[0], endBound.format("YYYY-MM-DD"));
  }

  return datesAdded > 0;
}


export const populateOccurrences = (items: Schema<"item">[], bounds: [Dayjs, Dayjs], map: OccurrenceMap, overwrite: boolean = false) => {
  const occs = calculateOccurrences(items, bounds[0], bounds[1]);
  occs.map(occ => {
    const { date, item } = occ;
    const datestring = date.format("YYYY-MM-DD");

    if (datestring in map.dates) {
      // Do not want to overwrite existing items unless explicitly told to.
      if (!(item.documentId in map.dates[datestring].items) || (item.documentId in map.dates[datestring].items && overwrite)) {
        map.dates[datestring].items[item.documentId] = { amount: item.amount }
      }
    } else {
      x25log.w("[populateOccurrences][occurrence.ts]: Date %s not in map. Item: %s.", datestring, item.documentId);
    }

  })
  return map;
}


export const calculate = (map: OccurrenceMap, startBalance: number): OccurrenceMap => {
  let sum = startBalance;

  for (const datestring in map.dates) {
    map.dates[datestring].sbal = Math.round(100 * sum) / 100;
    
    for (const item in map.dates[datestring].items) {
      const data = map.dates[datestring].items[item];
      const currentAmount: number = data.vAmount !== undefined && data.vId !== undefined ? data.vAmount : data.amount;
      sum += currentAmount;
    }
    map.dates[datestring].bal = Math.round(100 * sum) / 100;
  }
  return map;
}

export const findItem = (id: string, map: OccurrenceMap, fn: (date: string) => void) => {
  for (const datestring in map.dates) {
    for (const item in map.dates[datestring].items) {
      if (item === id) {
        fn(datestring);
      }
    }
  }
}

export const deleteItem = (id: string, map: OccurrenceMap): OccurrenceMap => {
  findItem(id, map, (datestring) => {
    delete map.dates[datestring].items[id];
  })
  return map;
}
