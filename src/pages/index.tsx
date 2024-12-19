import React, { useState } from "react"
import type { HeadFC, PageProps } from "gatsby"

import BudgetCard from '../components/budget-card'
import { Layout } from "../components/layout"
import { getBudgets } from "../utils/localStorage"
import { AddNewBudget } from "../components/modals/add-new-budget"

// TODO:
//  - Get popup on budget cards working
//  - Ensure it looks good on mobile

const IndexPage: React.FC<PageProps> = () => {
  const [createNewBudget, setCreateNewBudget] = useState<boolean>(false);

  const response = getBudgets();

  return (
    <Layout>
      <div className="d-flex flex-wrap flex-stack mb-6">
        <h3 className="text-dark fw-bold mb-4 fs-2">My Budgets</h3>
        <div className="d-flex align-items-center my-2">
          <button onClick={() => setCreateNewBudget(true)} className="btn btn-primary">Add New Budget</button>
        </div>
      </div>

      <div className="row">
        {response.status === "fail" && <p>{response.message}</p>}
        {response.status === "success" && Object.values(response.data).filter(budget => budget.parent === undefined).map(budget => (
          <BudgetCard budget={budget} />
        ))}
      </div>

      {createNewBudget &&
        <AddNewBudget 
          onCancel={() => setCreateNewBudget(false)}
          onNewBudgetCreated={() => {
            console.log("yay new budget created.");
            setCreateNewBudget(false);
          }}
        />
      }
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Custom Title</title>
