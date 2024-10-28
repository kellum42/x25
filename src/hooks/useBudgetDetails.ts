import { useState, useEffect } from 'react';

enum BudgetLineItemFrequency { Once = "Once", Weekly = "weekly", Biweekly = "Bi-Weekly", Monthly = "Monthly" }
enum WeeklyBudgetLineItemDays {
  Monday = "Monday",
  Tuesday = "Tuesday",
  Wednesday = "Wednesday",
  Thursday = "Thursday",
  Friday = "Friday",
  Saturday = "Saturday",
  Sunday = "Sunday"
}

type BaseBudgetLineItem = {
  id: Number;
  groupId?: Number;
  name: String;
  amount: Number;
  type: "income" | "expense";
  frequency: BudgetLineItemFrequency;
}
type OneTimeBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Once,
  date: Number
}
type WeeklyBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Weekly | BudgetLineItemFrequency.Biweekly,
  day: WeeklyBudgetLineItemDays,
  starts: Date
}
type MonthlyBudgetLineItem = BaseBudgetLineItem & {
  frequency: BudgetLineItemFrequency.Monthly,
  dates: [Number]
}
type BudgetLineItem = OneTimeBudgetLineItem | WeeklyBudgetLineItem | MonthlyBudgetLineItem;

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
        {
          id: 1,
          name: "Car Insurance",
          amount: 198.65,
          frequency: BudgetLineItemFrequency.Monthly,
          dates: [22],
          type: "expense"
        },
        {
          id: 2,
          name: "Apple Music",
          amount: 18.29,
          frequency: BudgetLineItemFrequency.Monthly,
          type: "expense",
          dates: [26]
        },
        {
          id: 3,
          name: "Rahni Paycheck",
          amount: 3101.30,
          frequency: BudgetLineItemFrequency.Biweekly,
          type: "income",
          day: WeeklyBudgetLineItemDays.Friday,
          starts: new Date()
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