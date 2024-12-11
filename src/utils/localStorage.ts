import dayjs from "dayjs";
import { Budget, BudgetLineItem, BudgetLineItemFrequency } from "../hooks/useBudgetDetails"

const budgetsKey = "x25__budgets";
const intialUseKey = "x25__initialuse";

export const getBudgets = (): (Record<string, Budget> | string) => {
  const firstSave = null === localStorage.getItem(intialUseKey);

  if (firstSave) {
    return {};
  }

  const _budgets = localStorage.getItem(budgetsKey);
  if (_budgets === null) {
    // error out
    return "Error occurred pulling budgets. Please try again later.";

  } else {
    try {
      const budgets: Record<string, Budget> = JSON.parse(_budgets);
      // Parse dayjs.
      Object.entries( budgets ).forEach(([ _id, _budget ]) => {
        budgets[_id] = {
          ..._budget,
          startDate: dayjs( _budget.startDate ),
          budgetLineItems: _budget.budgetLineItems.map(( _item, _ ) => {
            if ( _item.frequency === BudgetLineItemFrequency.Once ){
              _item.date = dayjs( _item.date );
            } else {
              _item.starts = dayjs( _item.starts );
              _item.ends = _item.ends === -1 ? -1 : dayjs( _item.ends );
            }
            return _item;
          })
        }
      });
      return budgets;

    } catch (e) {
      if (typeof e === "string") {
        return e;
      } else if (e instanceof Error) {
        return e.message;

      } else {
        return "An unknown error occurred getting the budgets."
      }
    }
  }
}

export const getBudget = (slug: string): Budget | null => {
  const budgets = getBudgets();
  let budget = null;
  if ( typeof budgets !== "string" ){
    Object.entries( budgets ).forEach(([ _, _budget ]) => {
      if ( slug === _budget.slug ){
        budget = _budget;
      }
    })
  }
  return budget;
}

export const saveBudget = (budget: Budget): string|void => {
  const budgets = getBudgets();

  if (typeof budgets === "string") {
    // error out
    console.log( budgets );
    return "Error occurred saving  budget. Please try again later.";
  }

  budgets[ budget.id ] = budget;
  localStorage.setItem( budgetsKey, JSON.stringify( budgets ));
  localStorage.setItem( intialUseKey, "initial" );
}

export const saveBudgetItem = ( slug: string, item: BudgetLineItem ): string | void => {
  const budget = getBudget( slug );

  if ( budget !== null ){
    const _budget = { ...budget } as Budget;
    _budget.budgetLineItems.push( item );
    return saveBudget( _budget );
  }
}
