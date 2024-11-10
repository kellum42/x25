import React, { FC, useState, useEffect } from "react"
// import type { PageProps } from "gatsby"
import Chart from "react-apexcharts";
import {
  autoUpdate,
  flip,
  FloatingNode,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useInteractions,
} from "@floating-ui/react";
import dayjs, { Dayjs } from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';

import { BudgetDetailsResponse, BudgetLineItem } from "../hooks/useBudgetDetails";
import { getTheme } from "../utils/theme";
import { calculateBalanceOverPeriod, getBudgetDetailsChartOptions } from "../utils/budget";

dayjs.extend(LocalizedFormat);
dayjs.extend(CustomParseFormat)

type BudgetDetailsChartProps = {
  date: Dayjs,
  budget: BudgetDetailsResponse
}

export const BudgetDetailsChart: FC<BudgetDetailsChartProps> = (props) => {
  const [span, setSpan] = useState<"1D" | "1W" | "1M" | "1Y">("1W");
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);

  const { date, budget } = props;
  const { startDate, startingBalance, budgetLineItems } = budget;
  const theme = getTheme("light");
  const nodeId = useFloatingNodeId();

  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
    nodeId,
    open: menuIsOpen,
    onOpenChange: setMenuIsOpen,
    placement: "bottom-start",
    middleware: [
      offset({ mainAxis: 4, alignmentAxis: 0 }),
      flip(),
      shift()
    ],
    whileElementsMounted: autoUpdate
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const {
    getReferenceProps,
    getFloatingProps,
  } = useInteractions([click, dismiss]);

  const onClick = (timeSpan: "1D" | "1W" | "1M" | "1Y") => {
    setMenuIsOpen(false);
    setSpan(timeSpan);
  }

  const { periods, balances } = calculateBalanceOverPeriod( startDate, startingBalance, budgetLineItems, date, span );
  const _chartData = getBudgetDetailsChartOptions( balances, periods );

  const formattedSpan = (): string => {
    const format = "M/D/YY";

    if (_chartData.xaxis) {
      const labels: string[] = _chartData.xaxis.categories;
      if (labels) {
        if ("1D" === span) {
          return dayjs(labels[0], "M/D/YY h:mma").format(format);

        } else if ("1Y" === span) {
          return dayjs(labels[0], 'MMM \'YY').format(format) + " - " + dayjs(labels[labels.length - 1], 'MMM \'YY').format(format);

        } else {
          return dayjs(labels[0]).format(format) + " - " + dayjs(labels[labels.length - 1]).format(format);
        }
      }
    }
    return "";
  };

  return (
    <div>
      {_chartData &&
        <div className="mixed-chart card card-xl-stretch mb-5 mb-xl-8">
          <div className="card-body p-0 d-flex justify-content-between flex-column">
            <div className="d-flex flex-stack card-p flex-grow-1">
              <div className="symbol symbol-45px">
                <div className="symbol-label">
                  <FloatingNode id={nodeId}>
                    <button
                      ref={refs.setReference}
                      {...getReferenceProps()}
                      data-open={menuIsOpen ? "" : undefined}
                      type="button"
                      className="btn btn-clean btn-sm btn-icon btn-icon-primary btn-active-light-primary text-gray-500 fw-bold" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end"
                    >
                      {span}
                    </button>
                    {menuIsOpen && (
                      <div
                        ref={refs.setFloating}
                        {...getFloatingProps()}
                        style={{ ...floatingStyles, backgroundColor: theme["kt-symbol-label-bg"] }}
                        className="menu menu-column menu-sub-dropdown menu-sub menu-rounded menu-state-bg-light-primary fw-semibold w-100px py-3"
                        data-kt-menu="true"
                      >
                        {/* begin::Menu item */}
                        <div className="menu-item px-3">
                          <p className={"menu-link p-3 m-0 text-gray-500 " + (span === "1D" ? "fw-bold text-gray-700" : "")} onClick={() => onClick("1D")}>1 Day</p>
                          <p className={"menu-link p-3 m-0 text-gray-500 " + (span === "1W" ? "fw-bold text-gray-700" : "")} onClick={() => onClick("1W")}>1 Week</p>
                          <p className={"menu-link p-3 m-0 text-gray-500 " + (span === "1M" ? "fw-bold text-gray-700" : "")} onClick={() => onClick("1M")}>1 Month</p>
                          <p className={"menu-link p-3 m-0 text-gray-500 " + (span === "1Y" ? "fw-bold text-gray-700" : "")} onClick={() => onClick("1Y")}>1 Year</p>
                        </div>
                        {/* end::Menu item */}
                      </div>
                    )}
                  </FloatingNode>
                </div>
              </div>

              <div className="d-flex flex-column text-end">
                <span className="fw-bolder text-gray-800 fs-2">Balance</span>
                <span className="text-gray-400 fw-semibold fs-6">{formattedSpan()}</span>
              </div>
            </div>


            {/* <div className="pt-1"> */}
            <Chart
              options={_chartData}
              series={_chartData.series}
              type="area"
              height="150"
            />
            {/* </div> */}
          </div>
        </div>
      }
    </div>
  )
}