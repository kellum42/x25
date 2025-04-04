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

// import { getTheme } from "../../utils/theme";
// import { calculateBalanceOver } from "../../utils/budget";
// import { BudgetContext } from "../../contexts/budgetContext";
// import { Menu, MenuItem } from "../floating-menu";

dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

export type ChartWidgetProps = {
  height?: string
  subtitle?: string
  title?: string,
  data: { date: string, balance: number | null }[]
}
// const isBrowser = typeof window !== "undefined"

export const ChartWidget: FC<ChartWidgetProps> = (props) => {
  const primary: string = "#00A3FF";
  return (
    <div className="card card-xl-stretch mb-6">
      <div className="card-body p-0 d-flex justify-content-between flex-column">
        { (props.title || props.subtitle) && 
          <div className="d-flex flex-stack flex-grow-1 p-10">
            <div className="d-flex flex-column text-end mb-4">
              <span className="fw-bolder text-gray-800 fs-2">Balance</span>
              {props.subtitle && <span className="text-gray-400 fw-semibold fs-6">{props.subtitle}</span>}
            </div>
          </div>
        }
        <ResponsiveContainer width={'99%'} height={350}>
          <AreaChart
            data={props.data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#A1A5B7" />
            <YAxis stroke="#A1A5B7" />
            <Tooltip />
            <Area type="monotone" dataKey="balance" stroke={primary} strokeWidth="3" fill={primary} fillOpacity={0.075} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
// return null;
// }