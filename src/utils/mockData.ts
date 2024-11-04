import {
  BudgetLineItem,
  BudgetLineItemFrequency,
  WeeklyBudgetLineItemDays
} from "../hooks/useBudgetDetails";

export const getSampleBudgetLineItems = (): BudgetLineItem[] => {
  return [
    {
      id: 1,
      name: "Savings",
      amount: 500,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Travis food, drink, and entertianment",
      amount: 125,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Rahni food, drink, and entertianment",
      amount: 125,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Groceries",
      amount: 175,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Gas",
      amount: 75,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Travel savings",
      amount: 300,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Travis cash on hand",
      amount: 30,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Rahni cash on hand",
      amount: 50,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Kiddos",
      amount: 100,
      frequency: BudgetLineItemFrequency.Weekly,
      day: WeeklyBudgetLineItemDays.Friday,
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Mattress",
      amount: 100,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [23],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "LASIK",
      amount: 150,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [24],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Emler",
      amount: 124.5,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [25],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Apple Music",
      amount: 18.29,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [26],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Verizon",
      amount: 189.92,
      frequency: BudgetLineItemFrequency.Once,
      date: new Date(2024, 7, 27),
      type: "expense",
    },
    {
      id: 1,
      name: "Verizon",
      amount: 167.4,
      frequency: BudgetLineItemFrequency.Once,
      date: new Date(2024, 8, 27),
      type: "expense",
    },
    {
      id: 1,
      name: "Identity IQ",
      amount: 60,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [27],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Timeshare",
      amount: 177.14,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [27],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "NFM",
      amount: 325,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [28],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Rent",
      amount: 1999,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [1],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Water Bill",
      amount: 111.08,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [1],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: new Date(2024, 8, 30)
    },
    {
      id: 1,
      name: "Water Bill",
      amount: 110,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [1],
      type: "expense",
      starts: new Date(2024, 8, 15),
      ends: new Date(2024, 9, 15)
    },
    {
      id: 1,
      name: "Electric Bill",
      amount: 201.39,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [1],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: new Date(2024, 8, 2)
    },
    {
      id: 1,
      name: "Electric Bill",
      amount: 158,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [1],
      type: "expense",
      starts: new Date(2024, 8, 3),
      ends: new Date(2024, 9, 2)
    },
    {
      id: 1,
      name: "Rahni Student Loans",
      amount: 440.31,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [1],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Travis Student Loans",
      amount: 100,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [1],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Netflix",
      amount: 16.69,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [2],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "HBO Max",
      amount: 17.21,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [2],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Harvest",
      amount: 700,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [5],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Audible",
      amount: 17.21,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [8],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Internet",
      amount: 60.35,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [9],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Disney+",
      amount: 15.46,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [14],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Car Note",
      amount: 1010.16,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [15],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Car Insurance",
      amount: 135.17,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [22],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Life Insurance",
      amount: 11.85,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [22],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Great Commission",
      amount: 100,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [22],
      type: "expense",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Travis Paycheck",
      amount: 3055.51,
      frequency: BudgetLineItemFrequency.Monthly,
      dates: [10, 25],
      type: "income",
      starts: new Date(2024, 1, 1),
      ends: -1
    },
    {
      id: 1,
      name: "Rahni Paycheck",
      amount: 3101.3,
      frequency: BudgetLineItemFrequency.Biweekly,
      day: WeeklyBudgetLineItemDays.Thursday,
      type: "income",
      starts: new Date(2024, 7, 30),
      ends: -1
    },
    {
      id: 1,
      name: "Rahni Paycheck Adjustment",
      amount: 331.99,
      frequency: BudgetLineItemFrequency.Once,
      date: new Date(2024, 8, 13),
      type: "expense"
    }
  ]
};