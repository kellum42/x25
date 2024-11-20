import React, { FC, useState, useEffect, createContext, ReactNode } from "react"
import type { PageProps } from "gatsby"
import dayjs, { Dayjs } from "dayjs"

import { useBudgetDetails, UseBudgetDetails } from "../../hooks/useBudgetDetails"
import { ChartWidget } from "../../components/widgets/chart-widget"
import { Layout } from "../../components/layout"
import { WeeklyWidget } from "../../components/widgets/weekly-widget"
import { BudgetDetailsDatePicker } from "../../components/budget-details-datepicker"
import { calculateBalance, getFriday } from "../../utils/budget"
import { numberOrNull } from "../../utils/util"

// TODO: Add context provider to easily pass variables between components.



// const BudgetContext = createContext<UseBudgetDetails|undefined>( undefined );

// const BudgetContextProvider: React.FC<{slug: string, children: ReactNode}> = ({ slug, children }) => {
//   const details = useBudgetDetails( slug );
//   return (
//     <BudgetContext.Provider value={{ ...details }}>
//       { children }
//     </BudgetContext.Provider>
//   )
// }

const BudgetDashboardPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  const { budget, verifyAmount } = useBudgetDetails(slug);
  const [date, setDate] = useState<Dayjs>( dayjs( "15-Oct-2024") )
  const friday = getFriday( date );

  const weekStartingBalance = (): number|null => { 
    if ( budget ){
      if ( date.isSame( budget.startDate, 'day' ) ){
        return budget.startingBalance;
      
      } else if ( date.isAfter( budget.startDate, 'day' )){
        return numberOrNull( calculateBalance( budget.startDate, budget.startingBalance, budget.budgetLineItems, friday )); 
      
      }
    }
    return null;
  }

  // return (
    // <Layout>
    //   <BudgetContextProvider slug={}>
    //     <div></div>
    //   </BudgetContextProvider>
    // </Layout>
  // )

  return (
    <Layout>
      {budget &&
        <div>
          <h1 className="text-dark fw-bold my-1 fs-2">{budget.title}</h1>
          <div className="mt-8">
            <BudgetDetailsDatePicker date={date} setDate={setDate} />
            <ChartWidget budget={budget} date={date} />
            <WeeklyWidget 
              lineItems={budget.budgetLineItems} 
              startdate={budget.startDate} 
              date={friday} 
              weekStartingBalance={weekStartingBalance()} 
              verifyAmount={verifyAmount}
            />
          </div>
        </div>
      }
    </Layout>
  )
}

export default BudgetDashboardPage