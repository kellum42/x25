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

// TODO:
//  - Chart data not right on simulations.

export const ChartWidget: FC = () => {

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

  const [period, setPeriod] = useState<Period>(Period.YTD);

  const theme = getTheme("light");

  // useEffect(() => {
  //   console.log("date changed. period: %s", period);
  // }, [date])

  const getPeriodRanges = (): Dayjs[] => {
    if (period === Period.last3Y) {
      return [...Array(6).fill(0).map((_, i) => { return date.subtract(6 * (6-i), "month") }), date];

    } else if (period === Period.next3Y) {
      return [ date, ...Array(6).fill(0).map((_, i) => { return date.add(6 * (i + 1), "month") })];

    } else if (period === Period.last1Y) {
      return [ ...Array(11).fill(0).map((_, i) => { return date.subtract(12 - i, "month") }), date ];

    } else if (period === Period.next1Y) {
      return [ date, ...Array(12).fill(0).map((_, i) => { return date.add(i + 1, "month") }) ];

    } else {
      const j1 = date.set( 'month', 0 ).set( 'date', 1 );
      return Array(13).fill(0).map((_, i) => { return j1.add(i, 'month' )} )
    }
  }

  const { dates, balances } = calculateBalanceOver(getPeriodRanges(), startingBalance, startDate, items);
  const cleanDatapoints: number[] = balances.filter((n) => n != null); // remove nulls

  const options: ApexOptions = {
    series: [{
      name: 'Balance',
      data: balances
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
      categories: dates.map((_d) => { return _d.format(format) }),
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
      min: Math.min(...cleanDatapoints) < 0 ? Math.min(...cleanDatapoints) - 100 : 0,
      max: Math.max(...cleanDatapoints) + 250,
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

  return (
    <div className="card card-xl-stretch mb-6">
      <div className="card-body p-0 d-flex justify-content-between flex-column">
        <div className="d-flex flex-stack flex-grow-1 p-10">
          <div className="symbol symbol-45px">
            <div className="symbol-label">
              <Menu label={period} >
                { Object.keys(Period).map( (key,i) => { 
                  const value = Period[key as keyof typeof Period];
                  return <MenuItem label={value} key={i} onClick={() => setPeriod(value)} /> 
                })}
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
          height="150"
        />
      </div>
    </div>
  )
}