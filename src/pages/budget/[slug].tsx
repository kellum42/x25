import React, { FC, useState, useEffect } from "react"
import type { PageProps } from "gatsby"
import dayjs, { Dayjs } from "dayjs"

import { useBudgetDetails } from "../../hooks/useBudgetDetails"
import { BudgetDetailsChart } from "../../components/budget-details-chart"
import { Layout } from "../../components/layout"
import { BudgetDetailsLineItemList } from "../../components/budget-details-list"
import { BudgetDetailsDatePicker } from "../../components/budget-details-datepicker"


const BudgetDetailsPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  const budget = useBudgetDetails(slug);
  const [date, setDate] = useState<Dayjs>( dayjs() )

  return (
    <Layout>
      {budget &&
        <div>
          <h1 className="text-dark fw-bold my-1 fs-2">{budget.title}</h1>
          <div className="mt-8">
            <BudgetDetailsDatePicker date={date} setDate={setDate} />
            <BudgetDetailsChart budget={budget} date={date} />
            <BudgetDetailsLineItemList lineItems={budget.budgetLineItems} date={date} />
          </div>
        </div>
      }
    </Layout>
  )
}

export default BudgetDetailsPage