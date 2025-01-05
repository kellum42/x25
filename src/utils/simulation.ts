import { Dayjs } from "dayjs";

import { Budget, BudgetItemFrequency, MonthlyBudgetItem, OneTimeBudgetItem, WeeklyBudgetItem, x25Error } from "./schemas";
import { calculateBalanceOver } from "./budget";
import { getBudget, getBudgetByID } from "./localStorage";


type DatesBelowThresholdReturn = { status: "success", data: { date: Dayjs, balance: number }[] } | x25Error;

export const datesBelowThreshold = (budget: Budget, start: Dayjs, end: Dayjs, threshold: number = 0): DatesBelowThresholdReturn => {
  const { startDate: budgetStart, startingBalance, items } = budget;

  if (end.isBefore(start, 'date')) {
    return { status: "fail", message: "End date must be after start date. datesBelowThreshold()" };
  }

  if (budgetStart.isAfter(end, 'date')) {
    return { status: "fail", message: "Budget is not active on given date range. datesBelowThreshold()" };
  }

  const _start = budgetStart.isAfter(start, 'day') ? budgetStart : start;
  const days = end.diff(_start, 'day');

  const dates = [_start, ...Array(days).fill(0).map((_, i) => _start.add(i + 1, 'days'))];
  const balances = calculateBalanceOver(dates, startingBalance, budgetStart, items, false, "EndofDay");

  return {
    status: "success",
    data: balances.balances
      .map((a, i) => ({ date: balances.dates[i], balance: a }))
      .filter((a): a is { date: Dayjs, balance: number } => typeof a.balance === "number" && a.balance <= threshold)
  }
}


export type SimulationItemChange = {
  id: string,
  name: string,
  change: "create" | "delete" | "frequency" | "startdate" | "endate" | "dates" | "day" | "amount" | "type" | "startingBalance",
  prev: string,
  new: string
};
type GetSimulationDiffsResponse = { status: "success", data: SimulationItemChange[] } | x25Error

export const getSimulationDiffs = (simulation: Budget): GetSimulationDiffsResponse => {
  if (simulation.parent) {
    const response = getBudgetByID(simulation.parent);

    if (response.status === "fail") {
      return { status: "fail", message: "Failed to get parent budget. More: " + response.message };
    }
    const parent: Budget = response.data;
    const changes: SimulationItemChange[] = [];
    const simulationItemsMap: Record<string,string> = {};

    console.log(parent);

    // Compare startingBalance
    if (simulation.startingBalance !== parent.startingBalance) {
      changes.push({ id: simulation.id, name: simulation.title, change: "startingBalance", prev: parent.startingBalance.toString(), new: simulation.startingBalance.toString() })
    }

    // Compare items
    simulation.items.forEach(item => {
      simulationItemsMap[item.id] = "";

      // If not on parent, note it was created.
      const parentItems = parent.items.filter(pItem => item.id === pItem.id);
      const parentItem = parentItems.length > 0 ? parentItems[0] : null;

      if (parentItem) {
        // Note frequency, amount, type, and date.
        if (parentItem.frequency === item.frequency) {
          if ( item.frequency === BudgetItemFrequency.once ){
            const _parentItem = parentItem as OneTimeBudgetItem;
            if ( item.date !== _parentItem.date ){
              changes.push({ id: item.id, name: item.name, change: "startdate", prev: _parentItem.date.format("YYYY/MM/DD"), new: item.date.format("YYYY/MM/DD") })
            }

          } else {
            const _parentItem = parentItem as MonthlyBudgetItem | WeeklyBudgetItem;
            
            if ( !item.starts.isSame(_parentItem.starts, 'day') ){
              changes.push({ id: item.id, name: item.name, change: "startdate", prev: _parentItem.starts.format("YYYY/MM/DD"), new: item.starts.format("YYYY/MM/DD") })
            }

            if ( 
              (item.ends !== "-1" && _parentItem.ends !== "-1" && !item.ends.isSame(_parentItem.ends, 'day')) || 
              item.ends !== _parentItem.ends 
            ){
              changes.push({ 
                id: item.id, 
                name: item.name, 
                change: "endate", 
                prev: _parentItem.ends === "-1" ? "-1" : _parentItem.ends.format("YYYY/MM/DD"), 
                new: item.ends === "-1" ? "-1" : item.ends.format("YYYY/MM/DD"), 
              })
            }

            if ( item.frequency === BudgetItemFrequency.monthly ){
              const _parentItem = parentItem as MonthlyBudgetItem;
              if ( item.dates.join(",") !== _parentItem.dates.join(",") ){
                changes.push({ id: item.id, name: item.name, change: "dates", prev: _parentItem.dates.join(","), new: item.dates.join(",") })
              }

            } else {
              const _parentItem = parentItem as WeeklyBudgetItem;
              if ( item.day !== _parentItem.day ){
                changes.push({ id: item.id, name: item.name, change: "day", prev: _parentItem.day, new: item.day })
              }
            }
          } 

        } else {
          changes.push({ id: item.id, name: item.name, change: "frequency", prev: parentItem.frequency, new: item.frequency })
        }

        if (parentItem.amount !== item.amount) {
          changes.push({ id: item.id, name: item.name, change: "amount", prev: parentItem.amount.toString(), new: item.amount.toString() })
        }

        if ( parentItem.type !== item.type ){
          changes.push({ id: item.id, name: item.name, change: "type", prev: parentItem.type, new: item.type })
        }

      } else {
        changes.push({ id: item.id, name: item.name, change: "create", prev: "", new: "" })
      }
    });

    // Items in parent but not on simulation were deleted.
    parent.items.forEach( item => {
      if ( !( item.id in simulationItemsMap )){
        changes.push({ id: item.id, name: item.name, change: "delete", prev: "", new: "" })
      }
    });
    return { status: "success", data: changes };

  } else {
    return { status: "fail", message: "Only simulations can get differences." };
  }
}

// export const convertToBudget = (simulation: Budget) => {
//   delete simulation.parent;

// }