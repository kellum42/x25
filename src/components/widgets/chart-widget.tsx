import React, { FC, useState, useContext, useEffect, PureComponent } from "react"
// import React, { PureComponent } from 'react';
// import "./styles.css";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';

import { getTheme } from "../../utils/theme";
// import { calculateBalanceOver } from "../../utils/budget";
import { BudgetContext } from "../../contexts/budgetContext";
import { Menu, MenuItem } from "../floating-menu";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export type ChartWidgetProps = {
  height?: string
  subtitle?: string
  title: string,
  data: { date: string, balance: number | null }[]
}
// const isBrowser = typeof window !== "undefined"

export const ChartWidget: FC<ChartWidgetProps> = (props) => {
  // const [isClient, setIsClient] = useState<boolean>(false);

  const data = [
    {
      name: "Page A",
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Page B",
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: "Page C",
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: "Page D",
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: "Page E",
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: "Page F",
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: "Page G",
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

  const theme = getTheme("light");


  // const { dates, balances } = calculateBalanceOver(getPeriodRanges(), startingBalance, startDate, items);

  // const options: ApexOptions = {
  //   // series: [{
  //   //   name: undefined,
  //   //   // data: balances.map((bal,i) => {
  //   //   //   return {x: dates[i].toDate().getTime(), y: bal }
  //   //   // })
  //   //   data: props.data.map(({date, balance},i) => {
  //   //     return {x: dayjs(date).toDate().getTime(), y: balance }
  //   //   })
  //   // }],
  //   chart: {
  //     fontFamily: 'inherit',
  //     type: 'area',
  //     zoom: {
  //       autoScaleYaxis: true
  //     }
  //   },
  //   dataLabels: {
  //     enabled: false
  //   },
  //   fill: {
  //     type: 'solid',
  //     opacity: 0.075
  //   },
  //   stroke: {
  //     curve: 'smooth',
  //     show: true,
  //     width: 3,
  //     colors: [theme.primary]
  //   },
  //   xaxis: {
  //     type: 'datetime',
  //     crosshairs: {
  //       show: false,
  //       position: 'front',
  //       stroke: {
  //         color: theme["grey-200"],
  //         width: 1,
  //         dashArray: 3
  //       }
  //     },
  //   },
  //   yaxis: {
  //     labels: {
  //       formatter: function (value) {
  //         if (value > -1000 && value < 1000) {
  //           return value.toFixed(0); // Return the number as is
  //         }

  //         const kValue = value / 1000;
  //         return (value % 1000 === 0 ? kValue : kValue.toFixed(1)) + "k"; // Return the number with "k" suffix
  //       }
  //     },
  //   },
  //   tooltip: {
  //     style: {
  //       fontSize: '12px'
  //     },
  //     y: {
  //       formatter: function (val: number | null) {
  //         if ( val === null ){ return "--"; }
  //         return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 })
  //       }
  //     }
  //   },
  //   colors: [theme.primary],
  //   markers: {
  //     colors: [theme["primary-light"]],
  //     strokeColors: [theme.primary],
  //     strokeWidth: 3
  //   }
  // };

  // if (typeof window !== 'undefined') {
  return (
    <div className="card card-xl-stretch mb-6">
      <div className="card-body p-0 d-flex justify-content-between flex-column">
        <div className="d-flex flex-stack flex-grow-1 p-10">

          <div className="d-flex flex-column text-end mb-4">
            <span className="fw-bolder text-gray-800 fs-2">Balance</span>
            {props.subtitle && <span className="text-gray-400 fw-semibold fs-6">{props.subtitle}</span>}
          </div>
        </div>
      <ResponsiveContainer width={'99%'} height={350}>
        <AreaChart
      // width={500}
      // height={400}
      data={props.data}
      margin={{
        top: 10,
        right: 30,
        left: 0,
        bottom: 0,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date"  stroke="#A1A5B7"/>
      <YAxis stroke="#A1A5B7" />
      <Tooltip />
      <Area type="monotone" dataKey="balance" stroke={theme.primary} strokeWidth="3" fill={theme.primary} fillOpacity={0.075} />
    </AreaChart>
    </ResponsiveContainer>
        {/* { isBrowser && <Chart
            // options={options}
            // series={options.series}
            series={[{
              name: undefined,
              data: props.data.map(({ date, balance }, i) => {
                return { x: dayjs(date).toDate().getTime(), y: balance }
              })
            }]}
            type="area"
            height={props.height ?? ""}
          />} */}
      </div>
    </div>
  )
}
// return null;
// }