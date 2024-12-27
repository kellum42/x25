import React, { FC, useState, useContext, useEffect } from "react"
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';

import { getTheme } from "../../utils/theme";
import { calculateBalanceOver } from "../../utils/budget";
import { BudgetContext } from "../../contexts/budgetContext";
import { Menu, MenuItem } from "../floating-menu";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

type ChartWidgetProps = {
  height?: string
}

export const ChartWidget: FC<ChartWidgetProps> = (props) => {

  const _context = useContext(BudgetContext);

  if (!_context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, date } = _context;

  if (!budget) {
    return <></>;
  }

  enum Period { 
    last3Y = "-3Y", 
    last1Y = "-1Y", 
    YTD = "YTD", 
    next1Y = "1Y", 
    next3Y = "3Y" 
  };
  const format = ("MM/DD/YYYY");

  const { startingBalance, startDate, items } = budget;

  const [period, setPeriod] = useState<Period>(Period.next1Y);

  const theme = getTheme("light");

  const getPeriodRanges = (): Dayjs[] => {
    if (period === Period.last3Y) {
      return [...Array(36).fill(0).map((_, i) => { return date.subtract(36-i, "month") }), date];

    } else if (period === Period.next3Y) {
      return [ date, ...Array(36).fill(0).map((_, i) => { return date.add(i + 1, "month") })];

    } else if (period === Period.last1Y) {
      return [ ...Array(365).fill(0).map((_, i) => { return date.subtract(365 - i, "day") }), date ];

    } else if (period === Period.next1Y) {
      return [ date, ...Array(365).fill(0).map((_, i) => { return date.add(i + 1, "day") }) ];

    } else {
      const j1 = date.set( 'month', 0 ).set( 'date', 1 );
      return Array(365).fill(0).map((_, i) => { return j1.add(i, 'day' )} )
    }
  }

  const { dates, balances } = calculateBalanceOver(getPeriodRanges(), startingBalance, startDate, items);

  const options: ApexOptions = {
    series: [{
      name: undefined,
      data: balances.map((bal,i) => {
        return {x: dates[i].toDate().getTime(), y: bal }
      })
    }],
    chart: {
      fontFamily: 'inherit',
      type: 'area',
      // height: '300px',
      // width: '100%',
      // toolbar: {
      //   show: false
      // },
      // zoom: {
      //   enabled: false
      // },
      zoom: {
        autoScaleYaxis: true
      }
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
      type: 'datetime',
      // labels: {
      //   datetimeFormatter: {
      //     month: 'MMM' // Show only the 3-letter month abbreviation
      //   }
      // },
      crosshairs: {
        show: false,
        position: 'front',
        stroke: {
          color: theme["grey-200"],
          width: 1,
          dashArray: 3
        }
      },
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          if (value > -1000 && value < 1000) {
            return value.toFixed(0); // Return the number as is
          }
        
          const kValue = value / 1000;
          return (value % 1000 === 0 ? kValue : kValue.toFixed(1)) + "k"; // Return the number with "k" suffix
        }
      },
    },
    tooltip: {
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: function (val: number | null) {
          if ( val === null ){ return "--"; }
          return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 })
        }
      }
    },
    colors: [theme.primary],
    markers: {
      colors: [theme["primary-light"]],
      strokeColors: [theme.primary],
      strokeWidth: 3
    }
  };

  return (
    <div className="card card-xl-stretch mb-6">
      <div className="card-body p-0 d-flex justify-content-between flex-column">
        <div className="d-flex flex-stack flex-grow-1 p-10">
          <div className="symbol symbol-45px">
            <div className="symbol-label">
              <Menu label={period} className="fw-bold text-gray-500" showLabel={true}>
                { Object.keys(Period)
                  // Filter limits options to YTD, 1Y, and 3Y for simulations.
                    .filter( 
                      key => budget.parent === undefined || 
                      [Period.YTD, Period.next1Y, Period.next3Y].includes( Period[key as keyof typeof Period] )
                    )
                    .map( (key,i) => { 
                      const value = Period[key as keyof typeof Period];
                      return <MenuItem label={value} key={i} onClick={() => setPeriod(value)} /> 
                    })
                }
              </Menu>
            </div>
          </div>

          <div className="d-flex flex-column text-end mb-4">
            <span className="fw-bolder text-gray-800 fs-2">Balance</span>
            <span className="text-gray-400 fw-semibold fs-6">{dates[0].format(format) + " - " + dates[dates.length - 1].format(format)}</span>
          </div>
        </div>

        <Chart
          options={options}
          series={options.series}
          type="area"
          height={props.height ?? ""}
        />
      </div>
    </div>
  )
}