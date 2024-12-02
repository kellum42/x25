import React, { useContext } from "react"
import type { PageProps } from "gatsby"
// import dayjs, { Dayjs } from "dayjs"

import { BudgetContext, BudgetContextProvider } from "../../contexts/budgetContext"
// import { useBudgetDetails, UseBudgetDetails } from "../../hooks/useBudgetDetails"
import { ChartWidget } from "../../components/widgets/chart-widget"
import { Layout } from "../../components/layout"
import { WeeklyWidget } from "../../components/widgets/weekly-widget"
// import { BudgetDetailsDatePicker } from "../../components/budget-details-datepicker"
// import { calculateBalance, getFriday } from "../../utils/budget"
// import { numberOrNull } from "../../utils/util"
import { SummaryWidget } from "../../components/widgets/summary-widget"

// TODO: Model dashboards -> logistics -> top selling categories for top expenses widget


const BudgetDashboard: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget } = context;

  return (
    budget ?
      <div>
        <div className="d-flex flex-row flex-stack">
          <h1 className="text-dark fw-bold my-1 fs-2">{budget.title}</h1>
          <div className="d-flex align-items-center flex-nowrap text-nowrap py-1">
            <a href="#" className="btn bg-body btn-color-gray-700 btn-active-primary me-4">Edit Items</a>
            <a href="#" className="btn btn-primary">View Items</a>
          </div>
        </div>
        <div className="mt-8">
          <div className="row">
            <div className="col-lg-6">
              <SummaryWidget />
              <ChartWidget />
            </div>
            <div className="col-lg-6">
              <WeeklyWidget />
            </div>
          </div>
        </div>
      </div>
      :
      <></>
  )
}

const BudgetBySlugPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  return (
    <Layout>
      <BudgetContextProvider slug={slug}>
        <BudgetDashboard />
      </BudgetContextProvider>
    </Layout>
  )
}

export default BudgetBySlugPage;
