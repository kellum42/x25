import { ApexOptions } from "apexcharts";
import dayjs, { Dayjs } from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween';
import isoWeek from 'dayjs/plugin/isoWeek';


import {
  BudgetLineItem,
  BudgetLineItemFrequency,
  WeeklyBudgetLineItemDays
} from "../hooks/useBudgetDetails"
import { getTheme } from "./theme";

// needed to use day.js plugins
dayjs.extend(isBetween);
dayjs.extend(isoWeek);


export const calculateBalance = (startDate: Dayjs, startingAmount: number, items: BudgetLineItem[], endDate?: Dayjs): number | string => {
  //  If endDate is null, set to today.
  //  If endDate is before startDate, return error
  const _endDate: Dayjs = endDate ?? dayjs();
  if (_endDate.isBefore(startDate, 'date')) {
    return "End date is before start date. This is illegal.";
  }

  //  Get sumDeltas (sum of expenses/income for line items between start date and end date)
  let sumDeltas = 0;
  let error: string | null;

  //  Loop through line items
  items.forEach((item, i) => {
    if (error) { return; } // if we encounter an error, forgo all calculations.

    if (item.frequency == BudgetLineItemFrequency.Once) {
      if (item.date.isBetween(startDate, endDate, 'day', '[]')) {
        sumDeltas += item.amount * (item.type === "expense" ? -1 : 1);
      }
      return;
    }

    // Incorporate the bounds of the line item into the time range.
    // Ex. - If the time range starts 5/15, but the line item isn't active until 5/25, we must use 5/25.
    // Same for end bounds.
    const localStartDate = item.starts.isAfter(startDate) ? item.starts : startDate;
    const localEndDate = item.ends != -1 && item.ends.isBefore(_endDate) ? item.ends : _endDate;

    const spanInDays = localEndDate.diff(localStartDate, "day");

    if ( localEndDate.isBefore( localStartDate ) ){
      return "Budget line item is not active inside the timeframe bounds.";
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
      item.dates.forEach((date, i) => {
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


// Calculates balances at the beginning of the day.
export const calculateBalanceOverPeriod = (budgetStartDate: Dayjs, startingBalance: number, lineItems: BudgetLineItem[], date: Dayjs, period: "1D" | "1W" | "1M" | "1Y"): { periods: string[], balances: (number | null)[] } => {
  let balances: (number | null)[] = [];
  let periods: string[] = [];
  let _balance: number | null = startingBalance;

  if (period === "1D") {
    const previousBalance = calculateBalance( budgetStartDate, startingBalance, lineItems, date.subtract( 1, "day" ) );
    const currentBalance = calculateBalance( budgetStartDate, startingBalance, lineItems, date );
   
    balances.push( numberOrNull( previousBalance ), numberOrNull( currentBalance ) );
    periods.push( date.format("M/D/YY") + " 12:00am", date.format("M/D/YY") + " 11:59pm")

  } else if (period === "1W") {
    // Weeks start on Friday.
    const daysFromFriday = (date.day() + 2) % 7;
    const friday: Dayjs = date.subtract(daysFromFriday, 'day');

    // calculate initial balance
    const initialBalance = calculateBalance(budgetStartDate, startingBalance, lineItems, friday.subtract(1, 'day'));
    _balance = (typeof initialBalance === 'number') ? initialBalance : null;

    for (let i = 0; i < 8; i++) {
      const calculatedBalance = calculateBalance(_balance ? friday.add(i, 'day') : budgetStartDate, _balance ?? startingBalance, lineItems, friday.add(i, 'day'));

      if (typeof calculatedBalance === 'string') {
        // log error
      }

      balances.push(_balance);
      periods.push(friday.add(i, 'day').format('ddd M/D/YY'));
      _balance = (typeof calculatedBalance === 'number') ? calculatedBalance : null;
    }

  } else if (period === "1M") {
    // 1st, 8th, 15th, 23rd, 30th/31st
    // 1st, 7th, 14th, 21st, 28th/29th

    // TODO: - Maybe incorporate start time inbetween datapoints.

    let datapoints: number[] = date.daysInMonth() >= 30 ? [1, 8, 15, 23] : [1, 7, 14, 21];
    // datapoints.push(date.daysInMonth());
    datapoints.push( date.daysInMonth() + 1 );

    // calculate initial balance
    const initialBalance = calculateBalance(budgetStartDate, startingBalance, lineItems, date.set('date', -1));
    _balance = numberOrNull( initialBalance );

    datapoints.forEach((datapoint, i) => {
      balances.push(_balance);
      periods.push(date.set('date', datapoint).format('M/D/YY'));

      if (i !== datapoints.length - 1) {
        const calculatedBalance = calculateBalance( _balance ? date.set('date', datapoint) : budgetStartDate, _balance ?? startingBalance, lineItems, date.set('date', datapoints[i + 1] - 1));
                
        _balance = numberOrNull( calculatedBalance );
      }
    });

  } else {
    // Graphs budget for calendar year. Graphs nothing when budget isn't active.
    // TODO: - Add annotation to selected date
    // 1st of every month, and J1 of next year.
    const january1 = date.set('date', 1).set('month', 0); // January 1st

    // Find when budget starts. 
    for (let i = 0; i < 13; i++) {

      const currentMonth = january1.add(i, 'month');

      if (budgetStartDate.isAfter(currentMonth, 'date')) {
        balances.push(null);
        periods.push(currentMonth.format('MMM \'YY'));

      } else {
        // Budget is active at this point in time.

        // See if budget started between this month and last.
        // We only care if the prorated amount will be graphed.
        if (i > 0 && budgetStartDate.isBetween(currentMonth, currentMonth.subtract(1, 'month'))) {
          const daysInStartingMonth = budgetStartDate.daysInMonth();
          const newBalance = calculateBalance(budgetStartDate, startingBalance, lineItems, budgetStartDate.set('date', daysInStartingMonth));
          _balance = (typeof newBalance === 'number') ? newBalance : null;
          balances.push(startingBalance);
          periods.push(budgetStartDate.format('MMM \'YY'));

        } else if (i === 0) {
          // Get initial balance.
          const initialBalance = calculateBalance(budgetStartDate, startingBalance, lineItems, january1.subtract(1, "day"));
          _balance = (typeof initialBalance === 'number') ? initialBalance : null;
        }

        const newBalance = calculateBalance(_balance == null ? budgetStartDate : currentMonth, _balance ?? startingBalance, lineItems, currentMonth.set('date', currentMonth.daysInMonth()));
        balances.push(_balance);
        periods.push(currentMonth.format('MMM \'YY'));
        _balance = (typeof newBalance === 'number') ? newBalance : null;
      }
    }
  }
  return { periods, balances };
}


export const getBudgetDetailsChartOptions = (series?: (number | null)[], xaxisLabels?: string[] | null, themeStyle?: "light" | "dark"): ApexOptions => {
  const theme = getTheme(themeStyle ?? "light");
  const filteredSeries: number[] = series ? series.filter((n) => n != null) : []; // remove nulls
  const max: number = series ? Math.max(...filteredSeries) + 250 : 60;
  const min: number = series ? Math.min(...filteredSeries) < 0 ? Math.min(...filteredSeries) - 100 : 0 : 0;

  return {
    series: [{
      name: 'Net Profit',
      data: series ?? [30, 30, 43, 43, 34, 34, 26, 26, 47, 47]
    }],
    chart: {
      fontFamily: 'inherit',
      type: 'area',
      height: '300px',
      width: '100%',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {},
    legend: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    fill: {
      type: 'solid',
      opacity: 0.075
    },
    stroke: {
      curve: 'smooth',
      show: true,
      width: 3,
      colors: [theme.primary]
    },
    xaxis: {
      categories: xaxisLabels ?? ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false
      },
      labels: {
        show: false,
        style: {
          colors: theme["grey-500"],
          fontSize: '12px',
        }
      },
      crosshairs: {
        show: false,
        position: 'front',
        stroke: {
          color: theme["grey-200"],
          width: 1,
          dashArray: 3
        }
      },
      tooltip: {
        enabled: true,
        formatter: undefined,
        offsetY: 0,
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      min: min,
      max: max,
      labels: {
        show: false,
        style: {
          colors: theme["grey-500"],
          fontSize: '12px'
        }
      }
    },
    states: {
      normal: {
        filter: {
          type: 'none',
          value: 0
        }
      },
      hover: {
        filter: {
          type: 'none',
          value: 0
        }
      },
      active: {
        allowMultipleDataPointsSelection: false,
        filter: {
          type: 'none',
          value: 0
        }
      }
    },
    tooltip: {
      style: {
        fontSize: '12px'
      },
      // y: {
      //   formatter: function (val: string) {
      //     return "$" + val + " sales"
      //   }
      // }
    },
    colors: [theme.primary],
    markers: {
      colors: [theme["primary-light"]],
      strokeColors: [theme.primary],
      strokeWidth: 3
    }
  };
};


export const numberOrNull = ( a: number | string ): number | null => {
  // return typeof a === 'number' ? a : null;
  return typeof a === 'string' ? null : a;
}

export const getFriday = ( from: Dayjs ): Dayjs => {
  const daysFromFriday = ( from.day() + 2) % 7;
  return from.subtract( daysFromFriday, 'day' );
}