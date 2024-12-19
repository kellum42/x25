import dayjs from "dayjs";

import {
  Budget,
  BudgetItem,
  GetBudgetsResponse,
  GetBudgetResponse,
  SaveResponse,
  x25Error
} from "./schemas";

const budgetsKey = "x25__budgets";
const intialUseKey = "x25__initialuse";

export const getBudgets = (): GetBudgetsResponse => {
  const firstSave = null === localStorage.getItem(intialUseKey);

  // No budgets have been saved yet.
  if (firstSave) {
    return { status: "success", data: {} };
  }

  const _budgets = localStorage.getItem(budgetsKey);
  if (_budgets === null) {
    // error out
    return {
      status: "fail",
      message: "Error occurred pulling budgets. Please try again later."
    };

  } else {
    try {
      const budgets: Record<string, Budget> = JSON.parse(_budgets);
      // Parse dayjs.
      Object.entries(budgets).forEach(([_id, _budget]) => {
        budgets[_id] = {
          ..._budget,
          startDate: dayjs(_budget.startDate),
          items: _budget.items.map((_item, _) => {
            if (_item.frequency === "Once") {
              _item.date = dayjs(_item.date);
            } else {
              _item.starts = dayjs(_item.starts);
              _item.ends = _item.ends === "-1" ? "-1" : dayjs(_item.ends);

            }
            return _item;
          })
        }

        if ( budgets[_id].createDate !== undefined ){
          budgets[_id].createDate = dayjs( budgets[_id].createDate );
        }
      });
      return { status: "success", data: budgets };

    } catch (e) {
      let message;
      if (typeof e === "string") {
        message = e;
      } else if (e instanceof Error) {
        message = e.message;

      } else {
        message = "An unknown error occurred getting the budgets."
      }
      return { status: "fail", message };
    }
  }
}

export const getBudget = (slug: string): GetBudgetResponse => {
  const response = getBudgets();
  // if ( response instanceof x25Error ) {
  //   return response;
  // }
  if (response.status === "fail") {
    return response;
  }
  let budget: GetBudgetResponse = {
    status: "fail",
    message: `Budget with slug '${slug}' could not be found.`
  };
  Object.entries(response.data).forEach(([_, _budget]) => {
    if (slug === _budget.slug) {
      budget = { status: "success", data: _budget };
    }
  })
  return budget;
}

export const getSimulationsForBudget = (id?: string): {status: "success", sims: Budget[]} | x25Error => {
  if ( id === undefined ){
    return {status: "fail", message: "Can't get simulations for invalid budget id."};
  }
  
  const response = getBudgets();
  if (response.status === "fail") {
    return response;
  }
  
  return { status: "success", sims: Object.values(response.data).filter( _budget => _budget.parent === id) };
}

export const saveBudget = (budget: Budget): SaveResponse => {
  const response = getBudgets();

  if (response.status === "fail") {
    return { status: "fail", message: "Error occurred saving budget. Please try again later." };
  }

  const budgets = response.data;

  budgets[budget.id] = budget;
  localStorage.setItem(budgetsKey, JSON.stringify(budgets));
  localStorage.setItem(intialUseKey, "initial");

  return { status: "success" }
}

export const saveBudgetItem = (slug: string, item: BudgetItem): SaveResponse => {
  const response = getBudget(slug);

  if (response.status === "fail") {
    return { status: "fail", message: "Error occurred saving budget item. Please try again later." };
  }

  const budget = response.data;

  budget.items.push(item);
  return saveBudget(budget);
}

export const deleteBudgetItem = (id: string, item: BudgetItem): {status: "success"} | x25Error => {
  const response = getBudgets();

  if (response.status === "fail") {
    return { status: "fail", message: "Error occurred deleting budget item. Please try again later." };
  }

  const budgets = response.data;
  if ( id in budgets){
    const budget = budgets[id];
    budget.items = budget.items.filter((_item) => _item.id !== item.id);
    return saveBudget( budget );
    
  } else {
    return { status: "fail", message: "Could not find budget." };
  }
}
