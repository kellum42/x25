import React, { useContext, useState } from "react"
import type { PageProps } from "gatsby"
import { Link } from "gatsby"

import { BudgetContext, BudgetContextProvider } from "../../contexts/budgetContext"
import { ChartWidget } from "../../components/widgets/chart-widget"
import { Layout } from "../../components/layout"
import { WeeklyWidget } from "../../components/widgets/weekly-widget"
import { SummaryWidget } from "../../components/widgets/summary-widget"
import { SimulationsWidget } from "../../components/widgets/simulations-widget"
import { UpdateBudget } from "../../components/modals/update-budget"
import { SimulationsSummaryWidget } from "../../components/widgets/simulation-summary-widget"
import { SimulationChangesWidget } from "../../components/widgets/simulation-changes-widget"
// import { Budget } from "../../utils/schemas"

// TODO: Model dashboards -> logistics -> top selling categories for top expenses widget
//  - Title doesn't refresh when arriving here from clicking on simulation url.
//  - Remove simulations widget on simulations

const BudgetDashboard: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, updateBudget, error } = context;

  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  
  const isSimulation = budget?.parent !== undefined;

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
            <button onClick={() => setIsEditingBudget(true)} className="btn bg-body btn-color-gray-700 btn-active-primary me-4">
              Edit { isSimulation ? "Simulation" : "Budget" }
            </button>
            <Link to={`/budget/${budget.slug}/items`} className="btn btn-primary">View Items</Link>
          </div>
        </div>
        <div className="mt-8">
          {isSimulation && 
            <div className="row">
              <div className="col-md-4">
                <SimulationsSummaryWidget />
              </div>
              <div className="col-md-8">
                <ChartWidget height="300px" />
              </div>
              <div className="col-12">
                <SimulationChangesWidget />
              </div>
            </div>
          }
          {!isSimulation &&
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
          }
        </div>
        {isEditingBudget &&
          <UpdateBudget
            mode="update"
            onReadyToUpdate={(title, startingBalance, startDate) => { 
              updateBudget({ title, startingBalance, startDate });
              setIsEditingBudget(false);
            }}
            onCancel={() => setIsEditingBudget(false)}
            defaults={{
              title: budget.title,
              amount: budget.startingBalance.toString(),
              startDate: budget.startDate.format("YYYY-MM-DD")
            }}
          />
        }
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
