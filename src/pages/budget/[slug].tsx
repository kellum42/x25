import React, { FC, useState, useEffect } from "react"
import type { PageProps } from "gatsby"
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
import { ApexOptions } from "apexcharts";
import dayjs, { Dayjs } from 'dayjs'

import { BudgetLineItem, useBudgetDetails } from "../../hooks/useBudgetDetails"
import { getTheme } from "../../utils/theme";
import { calculateBalance, getBudgetDetailsChartOptions } from "../../utils/budget";

type BudgetDetailsChartProps = {
  startingDate: Date,
  startingBalance: number,
  budgetLineItems: [BudgetLineItem]
}

const BudgetDetailsChart: FC<BudgetDetailsChartProps> = (props) => {
  const [span, setSpan] = useState<"1D" | "1W" | "1M" | "1Y">("1M");
  const [chartData, setChartData] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);

  const { startingDate, startingBalance, budgetLineItems } = props;
  const theme = getTheme("light");
  const nodeId = useFloatingNodeId();
  const selectedDay = new Date();

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

  const options: ApexOptions = getBudgetDetailsChartOptions("light");

  const getChartData = (): { series: number[], xaxis: string[] } => {
    if ( span === "1D" ){
      const previousDay = new Date(selectedDay);
      previousDay.setDate(selectedDay.getDate() - 1);

      const selectedDayBalance = calculateBalance(startingDate, startingBalance, budgetLineItems, selectedDay );
      const previousDayBalance = calculateBalance(startingDate, startingBalance, budgetLineItems, previousDay);

      if ( typeof selectedDayBalance === 'string' || typeof previousDayBalance === 'string' ){
        // error
        return { series: [], xaxis: [] };
      } else {
        return {
          series: [previousDayBalance, selectedDayBalance],
          xaxis: []
        }
      }
    }
    return { series: [], xaxis: []}
  }
  

  useEffect(() => {
    // set options.xaxis.categories, options.series.data
    const { series, xaxis } = getChartData();
    if ( options.series ){
      options.series = [{
        name: 'Net Profit',
        data: series
      }];
    }
    
    if ( options.xaxis ){
      options.xaxis.categories = xaxis
    }
    
  }, [span]);

  useEffect(() => {
    //  compute original
    
  }, []);

  return (
    <div className="mixed-chart">
      <div className="p-8 pb-0">
        <div className="symbol symbol-45px">
          <div className="symbol-label">
            <FloatingNode id={nodeId}>
              {/* <BudgetCardMenuButton /> */}
              <button
                ref={refs.setReference}
                {...getReferenceProps()}
                // tabIndex={
                //   !isNested ? undefined : parent.activeIndex === item.index ? 0 : -1
                // }
                // role={isNested ? "menuitem" : undefined}
                data-open={menuIsOpen ? "" : undefined}
                // data-nested={isNested ? "" : undefined}
                //data-focus-inside={hasFocusInside ? "" : undefined}
                // className={isNested ? "MenuItem" : "RootMenu"}

                // onFocus(event: React.FocusEvent<HTMLButtonElement>) {
                //     props.onFocus?.(event);
                //     setHasFocusInside(false);
                //     parent.setHasFocusInside(true);
                // }

                //)}
                type="button"
                className="btn btn-clean btn-sm btn-icon btn-icon-primary btn-active-light-primary text-gray-500 fw-bold" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end"
              >
                { span }
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
                    <p className={"menu-link p-3 m-0 text-gray-500 " + ( span === "1D" ? "fw-bold text-gray-700" : "")}>1 Day</p>
                    <p className={"menu-link p-3 m-0 text-gray-500 " + ( span === "1W" ? "fw-bold text-gray-700" : "")}>1 Week</p>
                    <p className={"menu-link p-3 m-0 text-gray-500 " + ( span === "1M" ? "fw-bold text-gray-700" : "")}>1 Month</p>
                    <p className={"menu-link p-3 m-0 text-gray-500 " + ( span === "1Y" ? "fw-bold text-gray-700" : "")}>1 Year</p>
                  </div>
                  {/* end::Menu item */}
                </div>
              )}
            </FloatingNode>
          </div>
        </div>
      </div>

      <Chart
        options={options}
        series={options.series}
        type="area"
        height="250"
      />
    </div>

  )
}

const BudgetDetailsPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  const budget = useBudgetDetails(slug);

  // console.log(budgetLineItems[0].frequency);

  return (
    <div>
      { budget &&
      <div>
        <h1>Hey it worked! {slug}</h1>
        <BudgetDetailsChart startingBalance={budget.startingBalance} budgetLineItems={budget.budgetLineItems} startDate={budget.startDate} />
      </div>
    }
    </div>
  )
}

export default BudgetDetailsPage