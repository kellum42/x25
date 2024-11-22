
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';


import {
  BudgetLineItem,
  BudgetLineItemFrequency,
  WeeklyBudgetLineItemDays
} from "../hooks/useBudgetDetails"
import { numberOrNull } from './util';

// needed to use day.js plugins
dayjs.extend(isBetween);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const calculateBalance = (startDate: Dayjs, startingAmount: number, items: BudgetLineItem[], endDate?: Dayjs): number | string => {
  //  If endDate is null, set to today.
  //  If endDate is before startDate, return error
  const _endDate: Dayjs = endDate ?? dayjs();
  if (_endDate.isSameOrBefore(startDate, 'day')) {
    // console.log( "start date: %s, end date: %s", startDate.format("MM/DD/YYYY"), _endDate.format("MM/DD/YYYY") )
    return "End date is before start date. This is illegal.";
  }

  //  Get sumDeltas (sum of expenses/income for line items between start date and end date)
  let sumDeltas = 0;
  let error: string | null;

  //  Loop through line items
  items.forEach((item, i) => {
    if (error) { return; } // if we encounter an error, forgo all calculations.

    if (item.frequency == BudgetLineItemFrequency.Once) {
      if (item.date.isBetween(startDate, endDate, 'day', '[)')) {
        sumDeltas += item.amount * (item.type === "expense" ? -1 : 1);
      }
      return;
    }

    // Incorporate the bounds of the line item into the time range.
    // Ex. - If the time range starts 5/15, but the line item isn't active until 5/25, we must use 5/25.
    // Same for end bounds.
    const localStartDate = item.starts.isAfter(startDate, 'day' ) ? item.starts : startDate;
    
    // Makes end date not inclusive --> _endDate.subtract( 1, "day" )
    const localEndDate = item.ends != -1 && item.ends.isBefore(_endDate, 'day' ) ? item.ends : _endDate.subtract( 1, "day" );
    
    const spanInDays = localEndDate.diff(localStartDate, "day");

    if ( localEndDate.isBefore( localStartDate ) ){
      return "Budget line item ends before budget budget start date or line item start date.";
    }

    if (item.frequency == BudgetLineItemFrequency.Weekly || item.frequency == BudgetLineItemFrequency.Biweekly) {
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
      const numOccurrences: number = Math.floor(trueSpan / (item.frequency == BudgetLineItemFrequency.Weekly ? 7 : 14)) + 1;

      sumDeltas += numOccurrences * item.amount * (item.type === "expense" ? -1 : 1);

    } else if (item.frequency == BudgetLineItemFrequency.Monthly) {
      item.dates.forEach(( _, i) => {
        // calculate the first occurrence of line item.
        // this will be our frame of reference for calculating future occurrences.
        //  i is needed to tell daysTillFirstOccurrence which MonthlyBudgetLineItem.dates[] we're using.
        const daysUntilFirstOccurrence = daysTillFirstOccurrence(item, localStartDate, i);
        if (typeof daysUntilFirstOccurrence === 'string') { error = daysUntilFirstOccurrence; return; }

        const firstOccurrence = localStartDate.add(daysUntilFirstOccurrence, 'day');

        if (firstOccurrence.isAfter(localEndDate, 'date')) {
          return;
        }

        const fullMonthsRemaining: number = localEndDate.diff(firstOccurrence, 'month');
        //  Based on the date of the first occurrence, calculate the remaining occurrences in the time range.
        //  Occurrences will be equal to the number of remaining full months in time range.
        //  1 is added to ullMonthsRemaining to account for the first occurrence.
        sumDeltas += (fullMonthsRemaining + 1) * item.amount * (item.type === "expense" ? -1 : 1);

      });
    }
  })

  // converts to two decimal places.
  return Math.round((sumDeltas + startingAmount) * 100) / 100;
}

export const daysTillFirstOccurrence = (item: BudgetLineItem, startDate: Dayjs, i?: number): number | string => {
  if (item.frequency == BudgetLineItemFrequency.Weekly || item.frequency == BudgetLineItemFrequency.Biweekly) {
    const dayMap: Record<WeeklyBudgetLineItemDays, number> = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    }

    // start of calculation time range.
    const startDay = startDate.day();
    const firstOccurrence = dayMap[item.day];

    const isBiWeekly = item.frequency === BudgetLineItemFrequency.Biweekly;
    const occursThisWeek = (startDate.isoWeek() - item.starts.isoWeek()) % 2 === 0 // for biweekly line items
    
    // is upcoming this week
    if (firstOccurrence >= startDay) {
      return firstOccurrence - startDay + (( isBiWeekly && !occursThisWeek ) ? 7 : 0 ); 
    } else {
      // occurrence has already passed this week.
      // Add the remaining days of the current week to the day of the week of the first occurrence.
      // If biweekly, it has already occurred this week. It won't occur again next week, so a 7 day offset is needed.
      return (7 - startDay) + firstOccurrence + ( isBiWeekly && occursThisWeek ? 7 : 0 );
    }

  } else if (item.frequency == BudgetLineItemFrequency.Monthly) {
    const _i = i ?? -1;
    if (_i >= 0 && _i <= item.dates.length) {
      const _startDate = startDate.date();
      const firstOccurrence = item.dates[_i];

      if (firstOccurrence >= _startDate) {
        return firstOccurrence - _startDate;

      } else {
        // Get the rest of the days to finish out the month.
        // Add those days to the date of the occurrence.
        return startDate.daysInMonth() - _startDate + firstOccurrence;
      }
    } else {
      return "A valid iterator is required for MonthlyBudgetLineitems.";
    }

  } else {
    return "Offset can only be calculated for reoccurring BudgetLineItems.";
  }
}


type CurrentBudgetDetailsLineItem = {
  days: number,
  item: BudgetLineItem
}

export const getWeeksBudgetLineItems = ( date: Dayjs, startdate: Dayjs, lineItems: BudgetLineItem[] ): CurrentBudgetDetailsLineItem[] => {
  // Week starts on Friday.
  const friday = getFriday( date );
  let currentItems: CurrentBudgetDetailsLineItem[] = [];

  const addItem = ( _item: BudgetLineItem, _j?: number ) => {
    const days = daysTillFirstOccurrence( _item, friday, _j );
    if ( typeof days === 'number' ){
      if ( 
        days < 7 && 
        budgetLineItemIsActive( date, _item ) && 
        !friday.add( days, 'day' ).isBefore( startdate ) 
      ){
        currentItems.push({ days, item: _item });
      }
    } else {
      console.log( "GOT ERROR: %s, item: %s", days, _item.name );
    }
  }
  lineItems.forEach(( item, i ) => {
    if ( item.frequency === BudgetLineItemFrequency.Once ){
      if ( item.date.isBetween( friday, date, "day", "[]" ) ) {
        currentItems.push({ days: item.date.diff( friday, "date" ), item });
      }

    } else if ( item.frequency === BudgetLineItemFrequency.Monthly ){
      item.dates.forEach(( _, j ) => {
        addItem( item, j )
      })
    } else {
      addItem( item );
    }
  })
  currentItems.sort(( a, b) => {
    if ( a.days < b.days ){ return -1; }
    else if ( a.days > b.days ){ return 1; }
    else { return 0; }
  });
  return currentItems;
}


const budgetLineItemIsActive = ( date: Dayjs, item: BudgetLineItem ): boolean => {
  if ( item.frequency === BudgetLineItemFrequency.Once ){
    return false;
  } else {
    return item.starts.isSameOrBefore( date, 'day' ) && ( item.ends === -1 || item.ends.isSameOrAfter( date, 'day' ));
  }
}


export const getFriday = ( from: Dayjs ): Dayjs => {
  const daysFromFriday = ( from.day() + 2) % 7;
  return from.subtract( daysFromFriday, 'day' );
}


export const calculateBalanceOver = ( dates: Dayjs[], startingBalance: number, startdate: Dayjs, lineItems: BudgetLineItem[], addStartDate: boolean = true ): { dates: Dayjs[], balances: (number|null)[] } => {
  let returnDates: Dayjs[] = [];
  let balances: (number|null)[] = [];
  let runningBalance: number|null = null;

  dates.forEach(( _date, i ) => {
    if ( _date.isSame( startdate, 'day' ) ){
      returnDates.push( startdate );
      balances.push( startingBalance );

    } else if ( _date.isAfter( startdate, 'day' )){
      // console.log( dates, startdate );
      // Account for if budget started between the last date and this one.
      if ( addStartDate && i !== 0 && startdate.isBetween( dates[i - 1], _date, 'day', "()" ) ){
        returnDates.push( startdate );
        balances.push( startingBalance );
      }

      const lowerBound = i === 0 || runningBalance === null ? startdate : dates[ i - 1 ];
      const upperBound = _date
      const balance = i === 0 || runningBalance === null ? startingBalance : runningBalance;
      const calculatedBalance = calculateBalance( lowerBound, balance, lineItems, upperBound );      

      returnDates.push( _date );
      balances.push( numberOrNull( calculatedBalance ));
      runningBalance = numberOrNull( calculatedBalance );

    } else {
      returnDates.push( _date );
      balances.push( null );
    }
  });

  return { dates: returnDates, balances };
}

