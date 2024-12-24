
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';


import { numberOrNull } from './util';
import { Budget, BudgetItem, BudgetItemFrequency, MonthlyBudgetItem, OneTimeBudgetItem, WeeklyBudgetItem, x25Error } from './schemas';

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

type CalculateBalanceAt = "StartofDay" | "EndofDay";
export const calculateBalance = (startDate: Dayjs, startingAmount: number, items: BudgetItem[], endDate?: Dayjs, at: CalculateBalanceAt = "StartofDay"): number | string => {
  //  If endDate is null, set to today.
  //  If endDate is before startDate, return error
  const _endDate: Dayjs = endDate ?? dayjs();
  if (_endDate.isSameOrBefore(startDate, 'day') && at === "StartofDay" ) {
    return "End date is before start date. This is illegal.";
    // TODO: - Maybe just return startingAmount here?
  }

  //  Get sumDeltas (sum of expenses/income for line items between start date and end date)
  let sumDeltas = 0;
  let error: string | null;

  //  Loop through line items
  items.forEach((item, i) => {
    if (error) { return; } // if we encounter an error, forgo all calculations.

    if (item.frequency === "Once" ) {
      if (item.date.isBetween(startDate, endDate, 'day', '[)')) {

        // Check if verified.
        const vAmount = getVerificationOn(item.date, item);
        sumDeltas += (vAmount ?? item.amount) * (item.type === "expense" ? -1 : 1);
      }
      return;
    }

    // Incorporate the bounds of the line item into the time range.
    // Ex. - If the time range starts 5/15, but the line item isn't active until 5/25, we must use 5/25.
    // Same for end bounds.
    const localStartDate = item.starts.isAfter(startDate, 'day') ? item.starts : startDate;

    // Makes end date not inclusive --> _endDate.subtract( 1, "day" )
    const localEndDate = item.ends != "-1" && item.ends.isBefore(_endDate, 'day') ? item.ends : _endDate.subtract( at === "EndofDay" ? 0 : 1, "day");

    const spanInDays = localEndDate.diff(localStartDate, "day");

    if (localEndDate.isBefore(localStartDate)) {
      return "Budget line item ends before budget budget start date or line item start date.";
    }

    if ( item.frequency == BudgetItemFrequency.weekly || item.frequency == BudgetItemFrequency.biweekly ) {
      // calculate the first occurrence of line item.
      const daysUntilFirstOccurrence = daysTillFirstOccurrence(item, localStartDate);
      if (typeof daysUntilFirstOccurrence === 'string') { error = daysUntilFirstOccurrence; return; }

      // the days remaining in the time range after the first occurrence.
      const trueSpan: number = spanInDays - daysUntilFirstOccurrence;

      //  If trueSpan < 0, the first occurrence is outside of the given time range.
      //  We can skip it.
      if (trueSpan < 0) { return; }

      //  Divide the trueSpan by 7 (for weekly) or 14 (for biweekly) to see how many occurrences are left in the time range.
      //  Math.floor is used to get rid of any remainder, so we just get the occurrences.
      const numOccurrences: number = Math.floor(trueSpan / (item.frequency == "Weekly" ? 7 : 14)) + 1;

      // Check for verifications.
      const firstOccurrence = localStartDate.add(daysUntilFirstOccurrence, 'day');
      const vers = getVerificationsBetween([firstOccurrence, localEndDate], item);

      if (vers && vers.length > 0 && vers.length <= numOccurrences) {
        let verifiedAmount = 0;
        vers.forEach((v) => { verifiedAmount += v.amount });
        sumDeltas += verifiedAmount * (item.type === "expense" ? -1 : 1);
        sumDeltas += (numOccurrences - vers.length) * item.amount * (item.type === "expense" ? -1 : 1)
      } else {
        sumDeltas += numOccurrences * item.amount * (item.type === "expense" ? -1 : 1);
      }

    } else if (item.frequency == "Monthly" ) {
      item.dates.forEach((_, i) => {
        // calculate the first occurrence of line item.
        // this will be our frame of reference for calculating future occurrences.
        //  i is needed to tell daysTillFirstOccurrence which MonthlyBudgetItem.dates[] we're using.
        const daysUntilFirstOccurrence = daysTillFirstOccurrence(item, localStartDate, i);
        if (typeof daysUntilFirstOccurrence === 'string') { error = daysUntilFirstOccurrence; return; }

        const firstOccurrence = localStartDate.add(daysUntilFirstOccurrence, 'day');

        if (firstOccurrence.isAfter(localEndDate, 'date')) {
          return;
        }

        const fullMonthsRemaining: number = localEndDate.diff(firstOccurrence, 'month');

        // Check for verifications.
        const vers = getVerificationsBetween([firstOccurrence, localEndDate], item);

        //  Based on the date of the first occurrence, calculate the remaining occurrences in the time range.
        //  Occurrences will be equal to the number of remaining full months in time range.
        //  1 is added to fullMonthsRemaining to account for the first occurrence.
        //  1 is added to fullMonthsRemaining to account for the first occurrence.
        const numOccurrences = fullMonthsRemaining + 1;

        if (vers && vers.length > 0 && vers.length <= numOccurrences) {
          let verifiedAmount = 0;
          vers.forEach((v) => { verifiedAmount += v.amount });
          sumDeltas += verifiedAmount * (item.type === "expense" ? -1 : 1);
          sumDeltas += (numOccurrences - vers.length) * item.amount * (item.type === "expense" ? -1 : 1)

        } else {
          sumDeltas += numOccurrences * item.amount * (item.type === "expense" ? -1 : 1);
        }
      });
    }
  })

  // converts to two decimal places.
  return Math.round((sumDeltas + startingAmount) * 100) / 100;
}

export const daysTillFirstOccurrence = (item: BudgetItem, startDate: Dayjs, i?: number): number | string => {
  if (item.frequency == "Weekly" || item.frequency == BudgetItemFrequency.biweekly ) {
    
    const getDayAsInt = (day: string ):number => {
      if ( day === "Sunday" ){ return 0; }
      if ( day === "Monday" ){ return 1; }
      if ( day === "Tuesday" ){ return 2; }
      if ( day === "Wednesday" ){ return 3; }
      if ( day === "Thursday" ){ return 4; }
      if ( day === "Friday" ){ return 5; }
      else { return 6; }
    }

    // start of calculation time range.
    const startDay = startDate.day();
    const firstOccurrence = getDayAsInt( item.day );

    const isBiWeekly = item.frequency === BudgetItemFrequency.biweekly;
    const occursThisWeek = (startDate.isoWeek() - item.starts.isoWeek()) % 2 === 0 // for biweekly line items

    // is upcoming this week
    if (firstOccurrence >= startDay) {
      return firstOccurrence - startDay + ((isBiWeekly && !occursThisWeek) ? 7 : 0);
    } else {
      // occurrence has already passed this week.
      // Add the remaining days of the current week to the day of the week of the first occurrence.
      // If biweekly, it has already occurred this week. It won't occur again next week, so a 7 day offset is needed.
      return (7 - startDay) + firstOccurrence + (isBiWeekly && occursThisWeek ? 7 : 0);
    }

  } else if (item.frequency == "Monthly" ) {
    const _i = i ?? -1;
    if (_i >= 0 && _i <= item.dates.length) {
      const _startDate = startDate.date();
      const firstOccurrence = parseInt( item.dates[_i] );

      if (firstOccurrence >= _startDate) {
        return firstOccurrence - _startDate;

      } else {
        // Get the rest of the days to finish out the month.
        // Add those days to the date of the occurrence.
        return startDate.daysInMonth() - _startDate + firstOccurrence;
      }
    } else {
      return "A valid iterator is required for MonthlyBudgetItems.";
    }

  } else {
    return "Offset can only be calculated for reoccurring BudgetItems.";
  }
}

// Weekly, Bi-weekly, and monthly items occurs on or after budget start date.
// One time items have not already occurred.
export const itemIsActive = (on: Dayjs, budgetStart: Dayjs, item: BudgetItem,): boolean => {
  if (item.frequency === "Once" ) {
    return !on.isBefore(budgetStart) && item.date.isAfter(on, 'day');

  } else {
    return (
      item.starts.isSameOrBefore(on, 'day')
      && (item.ends === "-1" || item.ends.isSameOrAfter(on, 'day'))
      && !budgetStart.isBefore(item.starts)
    );
  }
}

type UpcomingBudgetItem = {
  days: number,
  item: BudgetItem
}

// for items that occur right before startdate.
// will need this.
// !from.add( days, 'day' ).isBefore( startdate ) 

// Does not check if item is active.
export const getUpcomingBudgetItems = (from: Dayjs, toInDays: number, items: BudgetItem[], order: "asc" | "desc" = "asc"): UpcomingBudgetItem[] => {
  let upcomingItems: UpcomingBudgetItem[] = [];

  const addItem = (_item: BudgetItem, _j?: number) => {
    const days = daysTillFirstOccurrence(_item, from, _j);
    if (typeof days === 'number' && days >= 0 && days <= toInDays) {
      // console.log("%s - from: %s, days: %s, occurrence day: %s", _item.name, from.format("YYYY-MM-DD"), days, from.add(days, 'day').format("YYYY-MM-DD"));
      upcomingItems.push({ days, item: _item });
    } else {
      // console.log("GOT ERROR: %s, item: %s", days, _item.name);
    }
  }

  items.forEach((item, _) => {
    // if ( itemIsActive( date, item ) ){

    // For one-time items, ensure the item occurs within the range.
    if (item.frequency === "Once") {
      const toDate = from.add(toInDays, 'day');
      if (item.date.isBetween(from, toDate, "day", "[]")) {
        upcomingItems.push({ days: item.date.diff(from, "date"), item });
      }

    } else if (item.frequency === "Monthly") {
      item.dates.forEach((_, j) => {
        addItem(item, j)
      })
    } else {
      addItem(item);
    }
    // }
  });

  upcomingItems.sort((a, b) => {
    if (a.days < b.days) { return order === "asc" ? -1 : 1; }
    else if (a.days > b.days) { return order === "asc" ? 1 : -1; }
    else { return 0; }
  });
  return upcomingItems;
}


export const getFriday = (from: Dayjs): Dayjs => {
  const daysFromFriday = (from.day() + 2) % 7;
  return from.subtract(daysFromFriday, 'day');
}


export const calculateBalanceOver = (dates: Dayjs[], startingBalance: number, startdate: Dayjs, lineItems: BudgetItem[], addStartDate: boolean = true, at: CalculateBalanceAt = "StartofDay"): { dates: Dayjs[], balances: (number | null)[] } => {
  let returnDates: Dayjs[] = [];
  let balances: (number | null)[] = [];
  let runningBalance: number | null = null;

  dates.forEach((_date, i) => {
    if (_date.isSame(startdate, 'day')) {
      returnDates.push(startdate);
      balances.push(startingBalance);

    } else if (_date.isAfter(startdate, 'day')) {
      // Account for if budget started between the last date and this one.
      if (addStartDate && i !== 0 && startdate.isBetween(dates[i - 1], _date, 'day', "()")) {
        returnDates.push(startdate);
        balances.push(startingBalance);
      }

      //  If "at" is set to EndofDay, then the date would have already been calculated on the last run.
      //  Increase the lower bound by one day so we don't double count.
      const lowerBound = i === 0 || runningBalance === null ? 
        startdate : 
        dates[i - 1].add( at === "EndofDay" ? 1 : 0, "day" );

      const upperBound = _date
      const balance = i === 0 || runningBalance === null ? startingBalance : runningBalance;
      
      const calculatedBalance = calculateBalance(lowerBound, balance, lineItems, upperBound, at);
      returnDates.push(_date);
      balances.push(numberOrNull(calculatedBalance));
      runningBalance = numberOrNull(calculatedBalance);

    } else {
      returnDates.push(_date);
      balances.push(null);
    }
  });

  return { dates: returnDates, balances };
}

export const ytd = (to: Dayjs, budgetStart: Dayjs, item: BudgetItem): number | null => {
  const january1 = to.set( 'date', 1 ).set( 'month', 0 );
  const start = january1.isAfter( budgetStart ) ? january1 : budgetStart;
  const ytd = calculateBalance( start, 0, [item], to );
  return numberOrNull( ytd );
}


export const getVerificationOn = (date: Dayjs, item: BudgetItem): number | null => {
  const year = date.get('year');
  const month = date.get('month') + 1;
  const day = date.get('date');

  if (item.vers && year in item.vers && month in item.vers[year] && day in item.vers[year][month]) {
    return item.vers[year][month][day];
  }

  return null;
}


export const getVerificationsBetween = (dates: [Dayjs, Dayjs], item: BudgetItem): { date: string, amount: number }[] | null => {
  const start = dates[0];
  const end = dates[1];

  if (start.isAfter(end, 'date')) {
    console.log("Not a valid date range.");
    return null;
  }

  // console.log("%s -- vers: %s", item.name, JSON.stringify(item.vers));

  const output: { date: string, amount: number }[] = [];
  let currentDate = start;

  while (currentDate.isSameOrBefore(end, 'month')) {
    const year = currentDate.get('year');
    const month = currentDate.get('month') + 1;
    if (item.vers && item.vers[year] && item.vers[year][month]) {
      const _monthsVers = item.vers[year][month];

      Object.entries(_monthsVers).forEach(([day, amount]) => {
        const dateString = month + "-" + day + "-" + year;

        if (dayjs(dateString).isBetween(start, end, "day", "[]")) {
          const formattedDateString = dayjs(dateString).format("YYYY-MMM-DD");
          output.push({ date: formattedDateString, amount })
        }
      });
    }
    currentDate = currentDate.add(1, 'month');
  }
  return output;
}

export const JSONtoBudgetItem = (json: string): BudgetItem|undefined => {
  try {
    const item = JSON.parse(json) as BudgetItem;
    // Parse dayjs.

    if (item.frequency === "Once") {
      item.date = dayjs(item.date);

    } else {
      item.starts = dayjs(item.starts);
      item.ends = item.ends === "-1" ? "-1" : dayjs(item.ends);
    }
    
    return item

  } catch (e) {
    if (typeof e === "string") {
      console.log(e);
    
    } else if (e instanceof Error) {
      console.log( e.message );

    } else {
      console.log( "An unknown error occurred getting the budgets." );
    }
  }
}


export const budgetItemToRecord = (item: BudgetItem): Record<string, string> => {
  const obj: Record<string, string> = {};

    for (const key in item) {
      if (item.frequency === "Monthly") {
        const value = item[key as keyof MonthlyBudgetItem];
        if (Array.isArray(value)) {
          obj[key] = value.join(",");
        } else if (dayjs.isDayjs(value)) {
          obj[key] = value.format("MM/DD/YYYY");
        } else {
          obj[key] = (typeof value === "string" || typeof value === "number") ? value.toString() : JSON.stringify(value);
        }
      } else {
        const value = item[key as keyof (OneTimeBudgetItem | WeeklyBudgetItem)];
        if (dayjs.isDayjs(value)) {
          obj[key] = value.format("MM/DD/YYYY");
        } else {
          obj[key] = (typeof value === "string" || typeof value === "number") ? value.toString() : JSON.stringify(value);
        }
      }
    }
    return obj;
}

type DatesBelowThresholdReturn = {status: "success", data: {date: Dayjs, balance: number}[]} | x25Error;
export const datesBelowThreshold = (budget: Budget, start: Dayjs, end: Dayjs, threshold: number = 0 ): DatesBelowThresholdReturn => {
  const { startDate: budgetStart, startingBalance, items } = budget;

  if ( end.isBefore( start, 'date' )){
    return {status: "fail", message: "End date must be after start date. datesBelowThreshold()"};
  }

  if ( budgetStart.isAfter( end, 'date' )){
    return {status: "fail", message: "Budget is not active on given date range. datesBelowThreshold()"};
  }

  const _start = budgetStart.isAfter( start, 'day' ) ? budgetStart : start;
  const days = end.diff( _start , 'day' );
  
  const dates = [_start, ...Array(days).fill(0).map((_, i) => _start.add(i + 1, 'days'))];
  const balances = calculateBalanceOver(dates, startingBalance, budgetStart, items, false, "EndofDay" );
  
  return {
    status: "success",
    data: balances.balances
      .map(( a,i ) => ({date: balances.dates[i], balance: a }))
      .filter( (a): a is { date: Dayjs, balance: number } => typeof a.balance === "number" && a.balance <= threshold )
  }
}

// Get dates and amounts
// Check if person is in excess or underage
// Excess = all over threshold. Else --> underage.
// Get dollar per day for each underage instance
// If overage, tell them how much per week/month they can spare over a certain period of time.
// If underage, tell them how much extra to put in per week/month for how long to not be in underage.