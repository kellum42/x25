import React, { useState, useEffect } from "react"
import type { HeadFC, PageProps } from "gatsby"

import BudgetCard from '../components/budget-card'
import { Layout } from "../components/layout"
// import { getBudgets, saveBudget } from "../utils/localStorage"
import { UpdateBudget } from "../components/modals/update-budget"
import { Budget, x25Error } from "../utils/schemas"
// import { generateAvatar, getUniqueID, slugify } from "../utils/util"
import dayjs from "dayjs"
import { get } from "../utils/strapi";
import { x25log } from "../utils/log"
import { Schema } from "../utils/types"

// TODO:
//  - Get popup on budget cards working
//  - Ensure it looks good on mobile

// Fetch budgets. Include items and all verifications until today.
// Calculate occurrences. Then calculate current balance for each budget.

const IndexPage: React.FC<PageProps> = () => {
  const [createNewBudget, setCreateNewBudget] = useState<boolean>(false);
  const [budgets, setBudgets] = useState<Schema<"budget">[]>([]);
  const [error, setError] = useState<x25Error>();

  const fetchBudgets = async () => {
    const today = dayjs().format("YYYY-MM-DD");
    const endpoint = `budgets?populate[items][populate][verifications][fields][0]=date&populate[items][populate][verifications][fields][1]=amount&populate[items][populate][verifications][filters][date][$lte]=${today}`;
    const result = await get<"budget", "many">(endpoint);
    if ( result.status === "success" ){
      const budgets: Schema<"budget">[] = result.data
        // .map( budget => budgetTox25(budget))
        // .filter( budget => budget !== null )
      x25log.d("[fetchBudgets][index.tsx]: Fetched %d budgets from endpoint %s", budgets.length, endpoint );
      setBudgets(budgets);

    } else {
      x25log.d("[fetchBudgets][index.tsx]: Error fetching budgets from endpoint %s. Error - %s", endpoint, result.error );
      console.log(result.error);
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

      {/* {createNewBudget &&
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
      } */}
    </Layout>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Custom Title</title>
