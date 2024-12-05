import React, { useContext, useState } from "react"
import type { PageProps } from "gatsby"

import { Layout } from "../../../components/layout"
import { BudgetContextProvider, BudgetContext } from "../../../contexts/budgetContext"
import { BudgetLineItemCard } from "../../../components/budget-line-item-card"
import { ytd } from "../../../utils/budget";
import { BudgetItemQuery } from "../../../components/budget-item-query";
import { BudgetLineItem } from "../../../hooks/useBudgetDetails";
import { AddNewBudgetItemModal } from "../../../components/modals/add-new-budget-item-modal"

// TODO:
//  - Fix ytd's. Some of them are wrong.

const BudgetLineItems: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, date } = context;

  const initialQuery = (): (items: BudgetLineItem[]) => BudgetLineItem[] => {
    return (items: BudgetLineItem[]) => items;
  }

  const [queryFn, setQueryFn] = useState<((items: BudgetLineItem[]) => BudgetLineItem[])>(initialQuery)
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);

  const queriedItems: BudgetLineItem[] = budget === null ? [] : queryFn(budget.budgetLineItems);
  

  return (
    budget ?
      <div>
        <div className="d-flex flex-row flex-stack mb-4">
          <div>
            <h1 className="text-dark fw-bold my-1 fs-2">{budget.title}</h1>
          </div>
          <div className="d-flex align-items-center flex-nowrap text-nowrap py-1">
            <a href="#" className="btn btn-primary" onClick={() => setModalIsOpen(true)}>Add New Item</a>
          </div>
        </div>
        <BudgetItemQuery setQuery={setQueryFn} />
        <div className="">
          <div className="row">
            {queriedItems.map((item, i) => {
              const runningTotal = ytd(date, budget.startDate, item);

              return (
                <BudgetLineItemCard key={i} item={item} date={date} runningTotal={runningTotal} />
              )
            })}
          </div>
        </div>
        <AddNewBudgetItemModal isOpen={modalIsOpen} setIsOpen={setModalIsOpen}/>
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