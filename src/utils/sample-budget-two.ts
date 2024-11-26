import dayjs from "dayjs";

import { 
  BudgetLineItem, 
  BudgetLineItemFrequency, 
  WeeklyBudgetLineItemDays 
} from "../hooks/useBudgetDetails";

export const sampleBudgetTwoItems: BudgetLineItem[] = [
  {
    id: "1",
    name: "Apple Music",
    amount: 18.29,
    frequency: BudgetLineItemFrequency.Monthly,
    dates: [26],
    type: "expense",
    starts: dayjs('2024-03-01'),
    ends: -1
  },
  {
    id: "2",
    name: "Savings",
    amount: 500,
    frequency: BudgetLineItemFrequency.Weekly,
    day: WeeklyBudgetLineItemDays.Friday,
    type: "expense",
    starts: dayjs('2024-03-01'),
    ends: -1
  },
  {
    id: "3",
    name: "Travel savings",
    amount: 300,
    frequency: BudgetLineItemFrequency.Weekly,
    day: WeeklyBudgetLineItemDays.Wednesday,
    type: "expense",
    starts: dayjs('2024-03-01'), // testing using 2024-03-06
    ends: dayjs('2024-04-02')
  },
  {
    id: "4",
    name: "HBO Max",
    amount: 17.21,
    frequency: BudgetLineItemFrequency.Monthly,
    dates: [2],
    type: "expense",
    starts: dayjs('2024-03-01'),
    ends: -1
  },
  {
    id: "5",
    name: "Paycheck",
    amount: 3101.3,
    frequency: BudgetLineItemFrequency.Biweekly,
    day: WeeklyBudgetLineItemDays.Thursday,
    type: "income",
    starts: dayjs('2024-03-14'),
    ends: -1
  }
];