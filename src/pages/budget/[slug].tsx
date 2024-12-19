import React, { useContext, useState } from "react"
import type { PageProps } from "gatsby"
import { Link } from "gatsby"

import { BudgetContext, BudgetContextProvider } from "../../contexts/budgetContext"
import { ChartWidget } from "../../components/widgets/chart-widget"
import { Layout } from "../../components/layout"
import { WeeklyWidget } from "../../components/widgets/weekly-widget"
import { SummaryWidget } from "../../components/widgets/summary-widget"
import { SimulationsWidget } from "../../components/widgets/simulations-widget"
// import { Budget } from "../../utils/schemas"

// TODO: Model dashboards -> logistics -> top selling categories for top expenses widget
//  - Title doesn't refresh when arriving here from clicking on simulation url.

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
          <div>
            <h1 className="text-dark fw-bold mb-4 fs-2">{budget.title}</h1>
            <ul className="breadcrumb fw-semibold fs-base my-1">
              <li className="breadcrumb-item text-muted">
                <Link to="/" className="text-muted text-hover-primary">Home</Link>
              </li>
              <li className="breadcrumb-item text-dark">Dashboard</li>
            </ul>
          </div>
          <div className="d-flex align-items-center flex-nowrap text-nowrap py-1">
            <a href="#" className="btn bg-body btn-color-gray-700 btn-active-primary me-4">Edit Items</a>
            <Link to={`/budget/${budget.slug}/items`} className="btn btn-primary">View Items</Link>
          </div>
        </div>
        <div className="mt-8">
          <div className="row">
            <div className="col-lg-6">
              <SummaryWidget />
              <ChartWidget />
              <div className="d-none d-lg-block">
                <SimulationsWidget />
              </div>
            </div>
            <div className="col-lg-6">
              <WeeklyWidget />
              <div className="d-lg-none">
                <SimulationsWidget />
              </div>
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
