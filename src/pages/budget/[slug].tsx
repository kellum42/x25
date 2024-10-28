import * as React from "react"
import type { PageProps } from "gatsby"
import { useBudgetDetails } from "../../hooks/useBudgetDetails"

// const BudgetDetailsGraph: React.FC = () => {
//   return (
  
												
//   )
// }

const BudgetDetailsPage: React.FC<PageProps & {slug: string}> = ({ slug }) => {
  const { budgetLineItems, ...details } = useBudgetDetails(slug);

  // console.log(budgetLineItems[0].frequency);

  return (
    <div>
      <h1>Hey it worked! {slug}</h1>
      {budgetLineItems?.map((x, i) =>
        <p>{x.frequency}</p>
      )}
    </div>
  )
}

export default BudgetDetailsPage