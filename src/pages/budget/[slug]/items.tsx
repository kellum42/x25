import React, { useContext, useState } from "react"
import type { PageProps } from "gatsby"
import { Link } from "gatsby"

import { Layout } from "../../../components/layout"
import { BudgetContext, BudgetContextProvider } from "../../../contexts/budgetContext"
import { BudgetItem } from "../../../utils/schemas"
import { BudgetItemQuery } from "../../../components/budget-item-query"
import { BudgetItemCard } from "../../../components/budget-item-card"
import { ytd } from "../../../utils/budget";
import { AddNewBudgetItem } from "../../../components/modals/add-new-budget-item-modal"
import { Popup } from "../../../components/popups/popup"
import { deleteBudgetItem } from "../../../utils/localStorage"

// TODO:
//  - Fix ytd's. Some of them are wrong.
//  - z-index of start date datepicker is too low. its getting cut off.
//  - Got past due verifications (13) when starting a new budget with just one weekly expense.

const BudgetItems: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, error, date } = context;

  const initialQuery = (): (items: BudgetItem[]) => BudgetItem[] => {
    return (items: BudgetItem[]) => items;
  }

  const [queryFn, setQueryFn] = useState<((items: BudgetItem[]) => BudgetItem[])>(initialQuery)
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const [deleteItem, setDeleteItem] = useState<BudgetItem | null>(null);

  const queriedItems: BudgetItem[] = budget === undefined ? [] : queryFn(budget.items);


  return (
    <>
      {budget &&
        <div>
          <div className="d-flex flex-row flex-stack mb-4">
            <div>
              <h1 className="text-dark fw-bold mb-4 fs-2">{budget.title}</h1>
              <ul className="breadcrumb fw-semibold fs-base my-1">
                <li className="breadcrumb-item text-muted">
                  <Link to="/" className="text-muted text-hover-primary">Home</Link>
                </li>
                <li className="breadcrumb-item text-muted">
                  <Link to={`/budget/${budget.slug}`} className="text-muted text-hover-primary">Dashboard</Link>
                </li>
                <li className="breadcrumb-item text-dark">Items</li>
              </ul>
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
                  <BudgetItemCard
                    key={i}
                    item={item}
                    date={date}
                    runningTotal={runningTotal}
                    onDelete={(item) => {
                      setDeleteItem(item);
                    }}
                  />
                )
              })}
            </div>
          </div>
          <AddNewBudgetItem isOpen={modalIsOpen} setIsOpen={setModalIsOpen} />
          {deleteItem &&
            <Popup
              item={deleteItem}
              onDeleteItem={(item) => {
                const response = deleteBudgetItem(budget.id, item);
                if (response.status === "success") {
                  setDeleteItem(null);
                } else {
                  console.log(response.message);
                }
              }}
              onCancel={() => setDeleteItem(null)}
            />
          }
        </div>
      }
      {error &&
        <div>{error.message}</div>
      }
    </>
  );
};

const ItemsPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  return (
    <Layout>
      <BudgetContextProvider slug={slug}>
        <BudgetItems />
      </BudgetContextProvider>
    </Layout>
  )
}

export default ItemsPage;