import * as React from "react"
import type { PageProps } from "gatsby"
import Chart from "react-apexcharts";

import { useBudgetDetails } from "../../hooks/useBudgetDetails"
import { getTheme } from "../../utils/theme";
import { ApexOptions } from "apexcharts";

const BudgetDetailsChart: React.FC = () => {
  const theme = getTheme("light");

  const options: ApexOptions = {
    series: [{
      name: 'Net Profit',
      data: [30, 30, 43, 43, 34, 34, 26, 26, 47, 47]
    }],
    chart: {
      fontFamily: 'inherit',
      type: 'area',
      height: '300',
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
  return (
    <div className="mixed-chart">
      <Chart
        options={options}
        series={options.series}
        type="area"
        width="500"
      />
    </div>
												
  )
}

const BudgetDetailsPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  const { budgetLineItems, ...details } = useBudgetDetails(slug);

  // console.log(budgetLineItems[0].frequency);

  return (
    <div>
      <h1>Hey it worked! {slug}</h1>
      <BudgetDetailsChart />
      {/* {budgetLineItems?.map((x, i) =>
        <p>{x.frequency}</p>
      )} */}
    </div>
  )
}

export default BudgetDetailsPage