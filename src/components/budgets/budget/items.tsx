import React, { useContext, useEffect, useState } from "react"
import type { HeadFC, PageProps } from "gatsby"
import { Link } from "gatsby"

import { Layout } from "../../layout"
import { BudgetContext, BudgetContextProvider } from "../../../deprecated/budgetContext"
import { ManageItems } from "../../manage-items/manage-items"
import { truncate } from "../../../utils/util"
import { Schema } from "../../../utils/types"
import dayjs from "dayjs"
import useAuth from "../../../hooks/useAuth"
import { useBudget } from "../../../hooks/useBudget"
import { x25log } from "../../../utils/log"

// TODO:
//  - Fix ytd's. Some of them are wrong.
//  - z-index of start date datepicker is too low. its getting cut off.
//  - Got past due verifications (13) when starting a new budget with just one weekly expense.

// const Items: React.FC = () => {
const Items: React.FC<{ budgetId: string }> = ({ budgetId }) => {
  const date = dayjs();

  const { jwt } = useAuth();
  const { budget, load: loadBudget } = useBudget(jwt ?? "", budgetId );
  
  const [items, setItems] = useState<Schema<"item">[]>([]);

  useEffect(() => {
    if ( budget === undefined ){
      loadBudget();
    }

    if ( budget ){
      if ( budget.items === undefined ){
        x25log.w("[useEffect][items.tsx]: Budget loaded fine, but errors occurred loading items.");
      } 
      setItems(budget.items ?? [])
    }
  }, [budget])
  
  return (
    <>
      <div>
        <div className="d-md-flex flex-stack">
          <div>
            <div className="d-flex flex-row align-items-center">
              <h1 className="text-dark fw-bold mb-0 fs-2 me-1">Items</h1>
            </div>
            <ul className="breadcrumb fw-semibold fs-base my-1 mt-2">
              <li className="breadcrumb-item text-muted">
                <Link to="/budgets" className="text-muted text-hover-primary">Home</Link>
              </li>
              <li className="breadcrumb-item text-muted">
                <Link to={`/budgets/${budgetId}`} className="text-muted text-hover-primary">
                  {truncate(budget?.title ?? "", 20)}
                </Link>
              </li>
              <li className="breadcrumb-item text-dark">Items</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="row">
          <div className="col-lg-12">
            <div className="card mb-6">
              <div className="p-8 pb-2">
                <div className="">
                  <h3 className="m-0 mb-6 text-gray-900">Summary</h3>
                  <p className="text-muted">Total Items</p>
                  <h3 className="fw-bold">{items.length}</h3>

                  <div className="my-8 fw-semibold">
                    <div className="fs-6 d-flex justify-content-between my-4">
                      <div className="">Weekly</div>
                      <div className="d-flex">{items.filter(item => item.frequency === "Weekly").length}</div>
                    </div>
                    <div className="separator separator-dashed"></div>

                    <div className="fs-6 d-flex justify-content-between my-4">
                      <div className="">Bi-Weekly</div>
                      <div className="d-flex">{items.filter(item => item.frequency === "Bi-weekly").length}</div>
                    </div>
                    <div className="separator separator-dashed"></div>

                    <div className="fs-6 d-flex justify-content-between my-4">
                      <div className="">Monthly</div>
                      <div className="d-flex">{items.filter(item => item.frequency === "Monthly").length}</div>
                    </div>
                    <div className="separator separator-dashed"></div>

                    <div className="fs-6 d-flex justify-content-between my-4">
                      <div className="">One-time</div>
                      <div className="d-flex">{items.filter(item => item.frequency === "Once").length}</div>
                    </div>
                    <div className="separator separator-dashed"></div>

                    <div className="fs-6 d-flex justify-content-between my-4">
                      <div className="">Inactive</div>
                      <div className="d-flex">5</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="row">
          <div className="col-lg-12">
            <div className="card mb-6">
              <div className="p-8 pb-2">
                <ManageItems items={items} date={date} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


// const ItemsPage: React.FC<PageProps & { slug: string }> = ( props ) => {
//   return (
//     <Layout budget={props.slug} uri={props.uri}>
//       <BudgetContextProvider slug={props.slug}>
//         <Items />
//       </BudgetContextProvider>
//     </Layout>
//   )
// }

export default Items;

// export const Head: HeadFC = () => (
//   <>
//     <title>Your Budget</title>
//     {/* data-kt-aside-minimize="on" */}
//     <body className="aside-fixed aside-default-enabled" />
//   </>
// )