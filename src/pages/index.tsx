import React, { useState, useEffect } from "react"
import type { HeadFC, PageProps } from "gatsby"

import BudgetCard from '../components/budget-card'
import { Layout } from "../components/layout"
import { getBudgets, saveBudget } from "../utils/localStorage"
import { UpdateBudget } from "../components/modals/update-budget"
import { Budget, x25Error } from "../utils/schemas"
import { generateAvatar, getUniqueID, slugify } from "../utils/util"
import dayjs from "dayjs"

// TODO:
//  - Get popup on budget cards working
//  - Ensure it looks good on mobile

const IndexPage: React.FC<PageProps> = () => {
  const [createNewBudget, setCreateNewBudget] = useState<boolean>(false);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [error, setError] = useState<x25Error>();

  const fetchBudgets = () => {
    const response = getBudgets();
    if ( response.status === "success" ){
      const _budgets = Object.values(response.data).filter(budget => budget.parent === undefined);
      setBudgets(_budgets);
    } else {
      setError(response);
    }
  }

  useEffect(() => {
    fetchBudgets();
  },[])

  return (
    <Layout>
      <div className="d-flex flex-wrap flex-stack mb-6">
        <h3 className="text-dark fw-bold mb-4 fs-2">My Budgets</h3>
        <div className="d-flex align-items-center my-2">
          <button onClick={() => setCreateNewBudget(true)} className="btn btn-primary">Add New Budget</button>
        </div>
      </div>

      <div className="row">
        {error && <p>{error.message}</p>}
        { budgets.map( budget => (
          <BudgetCard budget={budget} onDeleteSuccess={() => fetchBudgets()} />
        ))} 
      </div>

      {createNewBudget &&
        <UpdateBudget
          mode="create"
          onCancel={() => setCreateNewBudget(false)}
          onReadyToUpdate={(title, startingBalance, startDate) => {
            const budget: Record<string,any> = {
              id: getUniqueID(),
              title,
              slug: slugify(title),
              startingBalance: parseInt(startingBalance),
              startDate: dayjs(startDate),
              items: [],
              createDate: dayjs(),
              avatar: generateAvatar()
            }
            const response = Budget.safeParse( budget );
            if ( response.success ){
              const saved = saveBudget( budget as Budget );
              if ( saved.status === "success" ){
                fetchBudgets();
        
              } else {
                setError(saved);
              }
            } else {
              // error with budget schema.
              setError({ status: "fail", message: "Budget is invalid." });
            }
            setCreateNewBudget(false);
          }}
        />
      }
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Custom Title</title>
