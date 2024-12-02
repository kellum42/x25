import React, { useContext, useEffect, useState } from "react"
import type { PageProps } from "gatsby"
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

import { Layout } from "../../../components/layout"
import { BudgetContextProvider, BudgetContext } from "../../../contexts/budgetContext"
// import { BudgetLineItemFrequency } from "../../../hooks/useBudgetDetails"
import { BudgetLineItemCard } from "../../../components/budget-line-item-card"
import { calculateBalance, ytd } from "../../../utils/budget";
import dayjs from "dayjs";
import { DateChanger } from "../../../components/datechanger";
import { BudgetItemQuery } from "../../../components/budget-item-query";
import { BudgetLineItem } from "../../../hooks/useBudgetDetails";

const BudgetLineItems: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, date } = context;

  const initialQuery = (): (items: BudgetLineItem[]) => BudgetLineItem[] => {
    return (items: BudgetLineItem[]) => items;
  }

  const [ queryFn, setQueryFn ] = useState<( (items: BudgetLineItem[]) => BudgetLineItem[] )>( 
    initialQuery
  )

  useEffect(() => {
    

  }, [queryFn]);

  const queriedItems: BudgetLineItem[] = budget === null ? [] : queryFn( budget.budgetLineItems );

  return (
    budget ?
      <div>
        <div className="d-flex flex-row flex-stack mb-4">
          <div>
            <h1 className="text-dark fw-bold my-1 fs-2">{budget.title}</h1>
            {/* <p className="fs-5 fw-semibold text-gray-600 my-3">{budget.budgetLineItems.length} Budget Line Items</p> */}
          </div>
          <div className="d-flex align-items-center flex-nowrap text-nowrap py-1">
            {/* <a href="#" className="btn bg-body btn-color-gray-700 btn-active-primary me-4">Edit Items</a> */}
            <a href="#" className="btn btn-primary">Add New Item</a>
          </div>
        </div>
        {/* <div className="card p-4"> */}
          <BudgetItemQuery setQuery={setQueryFn} />
        {/* </div> */}
        {/* <p className="fs-5 fw-semibold text-gray-600 mt-6 mb-4">{budget.budgetLineItems.length} Budget Items</p> */}
        <div className="">
          <div className="row">
            {queriedItems.map((item, i) => {
              // const runningTotal = calculateBalance(start, 0, [item], date);
              const runningTotal = ytd( date, budget.startDate, item );

              return (
                <BudgetLineItemCard key={i} item={item} date={date} runningTotal={runningTotal} />
              )
            })}
          </div>
        </div>
      </div> :
      <></>
  );
};

const ItemsPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  return (
    <Layout>
      <BudgetContextProvider slug={slug}>
        <BudgetLineItems />
      </BudgetContextProvider>
    </Layout>
  )
}

export default ItemsPage;