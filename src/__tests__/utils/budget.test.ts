import {
  daysTillFirstOccurrence,
  calculateBalance,
  getWeekNumber
} from "../../utils/budget";
import { BudgetLineItem, BudgetLineItemFrequency, WeeklyBudgetLineItemDays } from "../../hooks/useBudgetDetails";


test('it gives 18 days between April 27th and a monthly bill due on May 15th', () => {
  const bill: BudgetLineItem = {
    id: 1,
    name: "Car Insurance",
    amount: 198.65,
    frequency: BudgetLineItemFrequency.Monthly,
    dates: [15],
    type: "expense",
    starts: new Date(2024, 1, 1),
    ends: -1
  };
  const offset = daysTillFirstOccurrence(bill, new Date(2024, 3, 27), 0);
  expect( offset ).toBe( 18 );
});

test('it gives 5 days till allowance if today is Friday, and 2 days till allowance if today is Monday. Given payday is every Wednesday.', () => {
  const allowance: BudgetLineItem = {
    id: 1,
    name: "Allowance",
    amount: 30,
    frequency: BudgetLineItemFrequency.Weekly,
    day: WeeklyBudgetLineItemDays.Wednesday,
    type: "income",
    starts: new Date(2020, 1, 1),
    ends: -1
  };
  const offset = daysTillFirstOccurrence(allowance, new Date(2024, 10, 1)); // Friday
  expect( offset ).toBe( 5 );

  const _offset = daysTillFirstOccurrence(allowance, new Date(2024, 9, 28)); // Monday
  expect( _offset ).toBe( 2 );
});

test('it gives error for OneTimeBudgetLineItems', () => {
  const bonus: BudgetLineItem = {
    id: 1,
    name: "Bonus",
    amount: 3000,
    frequency: BudgetLineItemFrequency.Once,
    type: "income",
    date: new Date(2024, 5, 15)
  };
  const offset = daysTillFirstOccurrence(bonus, new Date(2024, 10, 1));
  expect( typeof offset ).toBe('string');
})

test('it gives ___ for the balance.', () => {
  const budgetLineItems: BudgetLineItem[] = [
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
      date: new Date(2024,7,27),
      type: "expense",
    },
    {
      id: 1,
      name: "Verizon",
      amount: 167.4,
      frequency: BudgetLineItemFrequency.Once,
      date: new Date(2024,8,27),
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
      dates: [10,25],
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
    },
  ];

  // Test week by week.

  // const firstWeekBalance = calculateBalance(new Date(2024, 7, 23), 5346.14, budgetLineItems, new Date(2024, 7, 29)); // first week
  // expect( firstWeekBalance ).toBe( 5776.80 );

  // const secondWeekBalance = calculateBalance(new Date(2024, 7, 30), 5776.80, budgetLineItems, new Date(2024, 8, 5)); // second week
  // expect( secondWeekBalance ).toBe( 3812.42 );

  // const thirdWeekBalance = calculateBalance(new Date(2024, 8, 6), 3812.42, budgetLineItems, new Date(2024, 8, 12)); // third week
  // expect( thirdWeekBalance ).toBe( 5310.37 );

  // const fourthWeekBalance = calculateBalance(new Date(2024, 8, 13), 5310.37, budgetLineItems, new Date(2024, 8, 19)); // fourth week
  // expect( fourthWeekBalance ).toBe( 5574.06 );

  // const fifthWeekBalance = calculateBalance(new Date(2024, 8, 20), 5574.06, budgetLineItems, new Date(2024, 8, 26)); // fifth week
  // expect( fifthWeekBalance ).toBe( 6509.76 );

  // const sixthWeekBalance = calculateBalance(new Date(2024, 8, 27), 6509.76, budgetLineItems, new Date(2024, 9, 3)); // sixth week
  // expect( sixthWeekBalance ).toBe( 4560.31 );

  // const seventhWeekBalance = calculateBalance(new Date(2024, 9, 4), 4560.31, budgetLineItems, new Date(2024, 9, 10)); // seventh week
  // expect( seventhWeekBalance ).toBe( 5358.26 );

  const monthBalance = calculateBalance(new Date(2024, 7, 23), 5346.14, budgetLineItems, new Date(2024, 9, 10)); // entire span
  expect( monthBalance ).toBe( 5358.26 );
})

test('it give the correct week numbers', () => {
  expect( getWeekNumber( new Date(2023,9,23) ) ).toBe( 43 );
  expect( getWeekNumber( new Date( 2022, 1, 23 ) ) ).toBe( 8 );
});