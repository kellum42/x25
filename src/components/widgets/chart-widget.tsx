import React, { FC, useState, useContext } from "react"
// import type { PageProps } from "gatsby"
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
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
// import LocalizedFormat from 'dayjs/plugin/localizedFormat';
// import CustomParseFormat from 'dayjs/plugin/customParseFormat';
// import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBetween from 'dayjs/plugin/isBetween';

// import { BudgetDetailsResponse, BudgetLineItem } from "../../hooks/useBudgetDetails";
import { getTheme } from "../../utils/theme";
import { calculateBalanceOver } from "../../utils/budget";
import { BudgetContext } from "../../contexts/budgetContext";

// dayjs.extend(LocalizedFormat);
// dayjs.extend(CustomParseFormat)
// dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(isBetween);

// type ChartWidgetProps = {
//   date: Dayjs,
//   budget: BudgetDetailsResponse,
// }

type ChartWidgetSpan = "1M" | "3M" | "1Y" 

export const ChartWidget: FC = () => {
  
  const _context = useContext( BudgetContext );

  if ( !_context ){
    throw new Error( "Calling Budget Context from outside of provider." );
  }

  const { budget, date } = _context;

  if ( !budget ){
    return <></>;
  }

  const { startingBalance, startDate, budgetLineItems } = budget;

  const [span, setSpan] = useState<ChartWidgetSpan>("1Y");
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);

  // const { date, budget } = props;
  // const { startDate, startingBalance, budgetLineItems } = budget;
  const theme = getTheme("light");
  const nodeId = useFloatingNodeId();
  const format = "M/D/YY";

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

  const onClick = (timeSpan: ChartWidgetSpan) => {
    setMenuIsOpen(false);
    setSpan(timeSpan);
  }

  const getSpanDates = (): Dayjs[] => {
    const _date = date;
    if ( span === "1M" ){
      return [ _date.subtract( 1, "month" ), _date.subtract( 3, "weeks" ),  _date.subtract( 2, "weeks" ),  _date.subtract( 1, "weeks" ), _date, _date.add( 1, "week" ), _date.add( 2, "weeks" ),  _date.add( 3, "weeks" ),  _date.add( 1, "month" ) ]
    
    } else if ( span === "3M" ){
      return [ _date.subtract( 3, "month" ), _date.subtract( 2, "month" ), _date.subtract( 1, "month" ) , _date, _date.add( 1, "month" ), _date.add( 2, "month" ), _date.add( 3, "month" )]
    
    } else {
      return [ _date.subtract( 1, "year" ), _date.subtract( 9, "month" ), _date.subtract( 6, "month" ), _date.subtract( 3, "month" ), _date, _date.add( 3, "month" ), _date.add( 6, "month" ), _date.add( 9, "month" ), _date.add( 1, "year" )]
    }
  }


  const { dates, balances } = calculateBalanceOver( getSpanDates(), startingBalance, startDate, budgetLineItems );
  const cleanDatapoints: number[] = balances.filter((n) => n != null); // remove nulls

  // console.log(dates.map((d)=> d.format("MM/DD/YYYY")), balances);

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
      categories: dates.map((_d) => { return _d.format( format ) }),
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
    <div>
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
                          <p className={"menu-link p-3 m-0 text-gray-500 " + (span === "1M" ? "fw-bold text-gray-700" : "")} onClick={() => onClick("1M")}>1 Month</p>
                          <p className={"menu-link p-3 m-0 text-gray-500 " + (span === "3M" ? "fw-bold text-gray-700" : "")} onClick={() => onClick("3M")}>3 Months</p>
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
                <span className="text-gray-400 fw-semibold fs-6">{ dates[0].format(format) + " - " + dates[dates.length - 1].format(format) }</span>
              </div>
            </div>


            {/* <div className="pt-1"> */}
            <Chart
              options={options}
              series={options.series}
              type="area"
              height="150"
            />
            {/* </div> */}
          </div>
        </div>
    </div>
  )
}