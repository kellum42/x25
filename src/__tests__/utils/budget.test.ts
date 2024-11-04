import {
  daysTillFirstOccurrence,
  calculateBalance,
  getWeekNumber
} from "../../utils/budget";
import { BudgetLineItem, BudgetLineItemFrequency, WeeklyBudgetLineItemDays } from "../../hooks/useBudgetDetails";
import { getSampleBudgetLineItems } from "../../utils/mockData";


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

test('it gives $5358.26 for the balance.', () => {
  const budgetLineItems: BudgetLineItem[] = getSampleBudgetLineItems();

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