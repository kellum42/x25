import { Budget } from "../hooks/useBudgetDetails"

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

export const saveBudget = (budget: Budget): string|undefined => {
  const budgets = getBudgets();

  if (typeof budgets === "string") {
    // error out
    console.log( budgets );
    return "Error occurred saving  budget. Please try again later.";
  }

  budgets[budget.id] = budget;
  localStorage.setItem(budgetsKey, JSON.stringify(budget));
}
