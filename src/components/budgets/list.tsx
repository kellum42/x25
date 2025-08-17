import React, { useState, useEffect } from "react"

import BudgetCard from "../budget-card"

// import { getBudgets, saveBudget } from "../utils/localStorage"
// import { UpdateBudget } from "../components/modals/update-budget"
// import { x25Error } from "../utils/schemas"
// import { generateAvatar, getUniqueID, slugify } from "../utils/util"
import dayjs from "dayjs"
import { get } from "../../utils/strapi"
import { x25log } from "../../utils/log"
import { Schema } from "../../utils/types"
import useAuth from "../../hooks/useAuth"
// import PrivatePage from "../components/private-route"
// import { AuthProvider } from "../contexts/authContext"

// TODO:
//  - Get popup on budget cards working
//  - Ensure it looks good on mobile

// Fetch budgets. Include items and all verifications until today.
// Calculate occurrences. Then calculate current balance for each budget.

const BudgetList: React.FC = () => {
  const [createNewBudget, setCreateNewBudget] = useState<boolean>(false);
  const [budgets, setBudgets] = useState<Schema<"budget">[]>([]);

  const { jwt, handleTimeout, user } = useAuth();
  // const [error, setError] = useState<x25>();

  // TODO:
  // For now, get budgets where logged in user is an owner. 
  // Don't worry about permissions.
  // Later, build middleware that incorporates privacy and permissions.
  const fetchBudgets = async () => {
    const today = dayjs().format("YYYY-MM-DD");
    // const endpoint = `budgets?populate[items][populate][verifications][fields][0]=date&populate[items][populate][verifications][fields][1]=amount&populate[items][populate][verifications][filters][date][$lte]=${today}&filters[owners][users_permissions_user][username]=${user?.username}`;
    const endpoint = `users/me?populate[ties][populate][budget][populate][items][populate]=verifications&status=published`;
    const result = await get<"user", "one">(jwt ?? "", endpoint);
    if (result.status === "success") {
      const budgets: Schema<"budget">[] = (result.data?.ties ?? []).map(tie => tie.budget).filter( budget => budget !== undefined )
      // .map( budget => budgetTox25(budget))
      // .filter( budget => budget !== null )
      x25log.d("[fetchBudgets][list.tsx]: Fetched %d budgets from endpoint %s", budgets.length, endpoint);
      setBudgets(budgets);

    } else {
      x25log.d("[fetchBudgets][list.tsx]: Error fetching budgets from endpoint %s. Error - %s", endpoint, result.error);
      
      if ( result.error.includes("401") ){
        handleTimeout();
      }
    }
  }

  useEffect(() => {
    // if (user){
      fetchBudgets();
    // }
  }, [])

  return (
    // <Layout>
    <>
      <div className="d-flex flex-wrap flex-stack mb-6">
        <h3 className="text-dark fw-bold mb-4 fs-2">My Budgets</h3>
        <div className="d-flex align-items-center my-2">
          <button onClick={() => setCreateNewBudget(true)} className="btn btn-primary">Add New Budget</button>
        </div>
      </div>

      <div className="row">
        {/* {error && <p>{error.message}</p>} */}
        {budgets.map(budget => (
          <BudgetCard key={budget.documentId} budget={budget} onDeleteSuccess={() => fetchBudgets()} />
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
      </>
    // </Layout>
  )
}

// const IndexPage: React.FC<PageProps> = (props) => {
//   return (
//     // <AuthProvider>
//       <PrivatePage path={props.path}>
//         <BudgetList />
//         {/* <div>hello</div> */}
//       </PrivatePage>
//     // </AuthProvider>
//   )
// }

export default BudgetList;

// export const Head: HeadFC = () => (
//   <>
//     <title>Custom Title</title>
//     <body className="aside-fixed aside-default-enabled" />
//   </>
// )
