import { ApexOptions } from "apexcharts";
import {
  BudgetLineItem,
  BudgetLineItemFrequency,
  WeeklyBudgetLineItemDays
} from "../hooks/useBudgetDetails"
import { getTheme } from "./theme";


export const calculateBalance = (startDate: Date, startingAmount: number, items: BudgetLineItem[], endDate?: Date): number | string => {
  //  If endDate is null, set to today.
  //  If endDate is before startDate, return error
  const _endDate: Date = endDate ?? new Date();
  if (_endDate < startDate) {
    return "End date is before start date. This is illegal.";
  }

  //  Get sumDeltas (sum of expenses/income for line items between start date and end date)
  let sumDeltas = 0;
  let error: string | null;

  //  Loop through line items
  items.forEach((item, i) => {
    if (error) { return; } // if we encounter an error, forgo all calculations.

    if (item.frequency == BudgetLineItemFrequency.Once) {
      if (item.date >= startDate && item.date <= _endDate) {
        sumDeltas += item.amount * (item.type === "expense" ? -1 : 1);
      }
      return;
    }

    // Incorporate the bounds of the line item into the time range.
    // Ex. - If the time range starts 5/15, but the line item isn't active until 5/25, we must use 5/25.
    // Same for end bounds.
    const localStartDate = item.starts > startDate ? item.starts : startDate;
    const localEndDate = item.ends != -1 && item.ends < _endDate ? item.ends : _endDate;
    const span = localEndDate.getTime() - localStartDate.getTime();

    // If span is a negative number, continue to next line item. 
    // The line item is not active inside of the bounds of this given time range. 
    if (span <= 0) { return; }

    const spanInDays = Math.round(span / (1000 * 60 * 60 * 24));

    if (item.frequency == BudgetLineItemFrequency.Weekly || item.frequency == BudgetLineItemFrequency.Biweekly) {
      // calculate the first occurrence of line item.
      const offset = daysTillFirstOccurrence(item, localStartDate);
      if (typeof offset === 'string') { error = offset; return; }

      // the days remaining in the time range after the first occurrence.
      const trueSpan: number = spanInDays - offset;

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
        const firstOccurrence = daysTillFirstOccurrence(item, localStartDate, i);
        if (typeof firstOccurrence === 'string') { error = firstOccurrence; return; }

        // the days remaining in the time range after the first occurrence.
        const trueSpan: number = spanInDays - firstOccurrence;

        //  If trueSpan < 0, the first occurrence is outside of the given time range.
        //  We can skip it.
        if (trueSpan < 0) { return; }

        const firstOccurrenceDate = new Date(localStartDate);
        firstOccurrenceDate.setDate(firstOccurrenceDate.getDate() + firstOccurrence);
        const year = firstOccurrenceDate.getFullYear();
        const month = firstOccurrenceDate.getMonth();

        //  Based on the date of the first occurrence, calculate the remaining occurrences in the time range.
        //  Occurrences will be equal to the number of remaining full months in time range.
        let spanRemaining = trueSpan;
        let monthsAdded = 0;
        let daysInMonth = new Date(year, month + monthsAdded + 1, 0).getDate();
        while (spanRemaining >= daysInMonth) {
          spanRemaining -= daysInMonth;
          monthsAdded += 1;
          daysInMonth = new Date(year, month + monthsAdded + 1, 0).getDate();
        }

        //  1 is added to monthsAdded to account for the first occurrence.
        sumDeltas += (monthsAdded + 1) * item.amount * (item.type === "expense" ? -1 : 1);
      });
    }
  })

  // converts to two decimal places.
  return Math.round((sumDeltas + startingAmount) * 100) / 100;
}

export const daysTillFirstOccurrence = (item: BudgetLineItem, startDate: Date, i?: number): number | string => {
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
    const startDay = startDate.getDay();
    const firstOccurrence = dayMap[item.day];

    //  Take into account the week the biweekly line item starts on.
    //  This will prevent biweekly line items from occurring on the off week.
    let biWeeklyOffset = 0;

    if (item.frequency == BudgetLineItemFrequency.Biweekly) {
      const lineItemStartingWeek = getWeekNumber(item.starts);
      const startingWeek = getWeekNumber(startDate);

      // If this is the "bye" week, add 7 more days to get to the next week.
      if ((startingWeek - lineItemStartingWeek) % 2 !== 0) { biWeeklyOffset += 7; }
    }

    if (firstOccurrence >= startDay) {
      return firstOccurrence - startDay + biWeeklyOffset;
    } else {
      // Add the remaining days of the current week to the day of the week of the first occurrence.
      return (7 - startDay) + firstOccurrence + biWeeklyOffset;
    }

  } else if (item.frequency == BudgetLineItemFrequency.Monthly) {
    const _i = i ?? -1;
    if (_i >= 0 && _i <= item.dates.length) {
      const _startDate = startDate.getDate();
      const firstOccurrence = item.dates[_i];

      if (firstOccurrence >= _startDate) {
        return firstOccurrence - _startDate;

      } else {
        // Get the rest of the days to finish out the month.
        // Add those days to the date of the occurrence.
        const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
        return daysInMonth - _startDate + firstOccurrence;
      }
    } else {
      return "A valid iterator is required for MonthlyBudgetLineitems.";
    }

  } else {
    return "Offset can only be calculated for reoccurring BudgetLineItems.";
  }
}

export const getWeekNumber = (date: Date): number => {
  // Copy date so don't modify original
  const d: Date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number
  // Make Sunday's day number 7
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart: Date = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo;
  // Return array of year and week number
  // return [d.getUTCFullYear(), weekNo];
}

export const getBudgetDetailsChartOptions = (themeStyle: "light" | "dark"): ApexOptions => {
  const theme = getTheme(themeStyle);
  return {
    series: [{
      name: 'Net Profit',
      data: [30, 30, 43, 43, 34, 34, 26, 26, 47, 47]
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
      categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
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
      min: 0,
      max: 60,
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
