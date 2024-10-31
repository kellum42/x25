import { useState, useEffect } from 'react';

export enum BudgetLineItemFrequency { Once = "Once", Weekly = "weekly", Biweekly = "Bi-Weekly", Monthly = "Monthly" }
export enum WeeklyBudgetLineItemDays {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday"
}

type BaseBudgetLineItem = {
  id: number;
  groupId?: number;
  name: String;
  amount: number;
  type: "income" | "expense";
  frequency: BudgetLineItemFrequency;
}
type OneTimeBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Once,
  date: Date
}
type WeeklyBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Weekly | BudgetLineItemFrequency.Biweekly,
  day: WeeklyBudgetLineItemDays,
  starts: Date,
  ends: Date | -1
}
type MonthlyBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Monthly,
  dates: number[],
  starts: Date,
  ends: Date | -1
}
export type BudgetLineItem = OneTimeBudgetLineItem | WeeklyBudgetLineItem | MonthlyBudgetLineItem;

type BudgetDetailsResponse = {
  title: string,
  slug: string,
  startingBalance: number,
  startDate: Date,
  budgetLineItems: BudgetLineItem[]
}


export const useBudgetDetails = (slug: String) => {

  const [data, setData] = useState<BudgetDetailsResponse | null>(null)

  useEffect(() => {

    // query budget based on slug.

    const response: BudgetDetailsResponse = {
      title: "2024 Kellum Family Vacation",
      slug: "2024-kellum-family-vacation",
      startingBalance: 20,
      startDate: new Date("10-15-2024"),
      budgetLineItems: [
        // {
        //   id: 1,
        //   name: "Car Insurance",
        //   amount: 198.65,
        //   frequency: BudgetLineItemFrequency.Monthly,
        //   dates: [22],
        //   type: "expense",
        //   ends: -1
        // },
        // {
        //   id: 2,
        //   name: "Apple Music",
        //   amount: 18.29,
        //   frequency: BudgetLineItemFrequency.Monthly,
        //   type: "expense",
        //   dates: [26],
        //   ends: -1
        // },
        {
          id: 3,
          name: "Rahni Paycheck",
          amount: 3101.30,
          frequency: BudgetLineItemFrequency.Biweekly,
          type: "income",
          day: WeeklyBudgetLineItemDays.Friday,
          starts: new Date(),
          ends: -1
        }
      ]
    }
    setData(response);
  }, []);

  return {
    budgetLineItems: data?.budgetLineItems,
    ...data
    // details: { slug: data?.slug, title: data?.title }
  }
}