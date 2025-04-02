import dayjs from "dayjs";

import { 
  BudgetItem, 
  BudgetItemFrequency, 
  WeekDays 
} from "../utils/schemas";

export const sampleBudgetTwoItems: BudgetItem[] = [
  {
    id: "1",
    name: "Apple Music",
    amount: 18.29,
    frequency: BudgetItemFrequency.monthly,
    dates: ["26"],
    type: "expense",
    starts: dayjs('2024-03-01'),
    ends: "-1"
  },
  {
    id: "2",
    name: "Savings",
    amount: 500,
    frequency: BudgetItemFrequency.weekly,
    day: WeekDays.friday,
    type: "expense",
    starts: dayjs('2024-03-01'),
    ends: "-1"
  },
  {
    id: "3",
    name: "Travel savings",
    amount: 300,
    frequency: BudgetItemFrequency.weekly,
    day: WeekDays.wednesday,
    type: "expense",
    starts: dayjs('2024-03-01'), // testing using 2024-03-06
    ends: dayjs('2024-04-02')
  },
  {
    id: "4",
    name: "HBO Max",
    amount: 17.21,
    frequency: BudgetItemFrequency.monthly,
    dates: ["2"],
    type: "expense",
    starts: dayjs('2024-03-01'),
    ends: "-1"
  },
  {
    id: "5",
    name: "Paycheck",
    amount: 3101.3,
    frequency: BudgetItemFrequency.biweekly,
    day: WeekDays.thursday,
    type: "income",
    starts: dayjs('2024-03-14'),
    ends: "-1"
  }
];