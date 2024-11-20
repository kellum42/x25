import { renderHook } from "@testing-library/react";
import dayjs from 'dayjs'

import {
  daysTillFirstOccurrence,
  calculateBalance,
  calculateBalanceOver,
  getWeeksBudgetLineItems
} from "../../utils/budget";
import { 
  BudgetLineItem, 
  BudgetLineItemFrequency, 
  useBudgetDetails, 
  WeeklyBudgetLineItemDays,
  UseBudgetDetails
} from "../../hooks/useBudgetDetails";
import { getSampleBudgetLineItems } from "../../utils/mockData";
import { sampleBudgetTwoItems } from '../../utils/sample-budget-two';

test('it gives 18 days between April 27th and a monthly bill due on May 15th', () => {
  const bill: BudgetLineItem = {
    id: "1",
    name: "Car Insurance",
    amount: 198.65,
    frequency: BudgetLineItemFrequency.Monthly,
    dates: [15],
    type: "expense",
    starts: dayjs('2024-01-01'),
    ends: -1,
    vers: {},
    adjs: {}
  };
  const offset = daysTillFirstOccurrence(bill, dayjs('2024-04-27'), 0);
  expect(offset).toBe(18);
});

test('it gives 5 days till allowance if today is Friday, and 2 days till allowance if today is Monday. Given payday is every Wednesday.', () => {
  const allowance: BudgetLineItem = {
    id: "1",
    name: "Allowance",
    amount: 30,
    frequency: BudgetLineItemFrequency.Weekly,
    day: WeeklyBudgetLineItemDays.Wednesday,
    type: "income",
    starts: dayjs('2020-01-01'),
    ends: -1,
    vers: {},
    adjs: {}
  };
  const offset = daysTillFirstOccurrence(allowance, dayjs('2024-10-04')); // Friday
  expect(offset).toBe(5);

  const _offset = daysTillFirstOccurrence(allowance, dayjs('2024-09-30')); // Monday
  expect(_offset).toBe(2);
});

test('it gives error for OneTimeBudgetLineItems', () => {
  const bonus: BudgetLineItem = {
    id: "1",
    name: "Bonus",
    amount: 3000,
    frequency: BudgetLineItemFrequency.Once,
    type: "income",
    date: dayjs('2024-05-15'),
    vers: {},
    adjs: {}
  };
  const offset = daysTillFirstOccurrence(bonus, dayjs('2024-10-01'));
  expect(typeof offset).toBe('string');
})

// test('it gives $5358.26 for the balance.', () => {
//   const budgetLineItems: BudgetLineItem[] = getSampleBudgetLineItems();

//   const monthBalance = calculateBalance(dayjs('2024-08-23'), 5346.14, budgetLineItems, dayjs('2024-10-10')); // entire span
//   expect(monthBalance).toBe(5358.26);

//   const Jan25ThruMar25Balance = calculateBalance(dayjs('2025-01-01'), 6135.26, budgetLineItems, dayjs('2025-02-28')); // entire span
//   expect(Jan25ThruMar25Balance).toBe(9387.12);
// })

test( 'it calculates daily periods and balances correctly for sample budget #2', () => {

  const { balances, dates } = calculateBalanceOver( [dayjs('2024-5-16')], 2000, dayjs('2024-3-1'), sampleBudgetTwoItems, );
  expect( dates.length ).toBe( 1 );
  expect( dates[0].format('M/D/YY') ).toBe( '5/16/24' );
  expect( balances[0] ).toEqual( 10718.29 );
});

// test('it calculates weekly periods and balances correctly for sample budget #2.', () => {

//   const w_data = calculateBalanceOverPeriod(dayjs("2024-3-1"), 2000, sampleBudgetTwoItems, dayjs("2024-5-15"), "1W");
//   expect(w_data.periods).toEqual(['Fri 5/10/24', 'Sat 5/11/24', 'Sun 5/12/24', 'Mon 5/13/24', 'Tue 5/14/24', 'Wed 5/15/24', 'Thu 5/16/24', 'Fri 5/17/24']);
//   expect(w_data.balances).toEqual([11218.29, 10718.29, 10718.29, 10718.29, 10718.29, 10718.29, 10718.29, 10718.29]);
// });

// test('it calculates monthly periods and balances correctly for sample budget #2', () => {

//   const m_data = calculateBalanceOverPeriod(dayjs("2024-3-1"), 2000, sampleBudgetTwoItems, dayjs("2024-5-15"), "1M");
//   expect(m_data.periods).toEqual(['5/1/24', '5/8/24', '5/15/24', '5/23/24', '6/1/24']);
//   expect(m_data.balances).toEqual([8634.20, 8116.99, 10718.29, 10218.29, 12301.30]);
// });

// test('it calculates yearly periods and balances correctly for sample budget #2', () => {

//   const y_data = calculateBalanceOverPeriod(dayjs("2024-3-1"), 2000, sampleBudgetTwoItems, dayjs("2024-5-15"), "1Y");
//   expect(y_data.periods).toEqual(['Jan \'24', 'Feb \'24', 'Mar \'24', 'Apr \'24', 'May \'24', 'Jun \'24', 'Jul \'24', 'Aug \'24', 'Sep \'24', 'Oct \'24', 'Nov \'24', 'Dec \'24', 'Jan \'25']);
//   expect(y_data.balances).toEqual([null, null, 2000, 4467.10, 8634.20, 12301.3, 16468.40, 20635.50, 27403.90, 31571.00, 35738.10, 39405.20, 43572.30]);
// });

// test('it calculates yearly periods and balances correctly for sample budget #2 when it doesn\'t start on the first of the month', () => {

//   // start on 3/18 to test the offset.
//   const yoffset_data = calculateBalanceOverPeriod(dayjs("2024-3-18"), 2000, sampleBudgetTwoItems, dayjs("2024-5-15"), "1Y");
//   expect(yoffset_data.periods).toEqual(['Jan \'24', 'Feb \'24', 'Mar \'24', 'Mar \'24', 'Apr \'24', 'May \'24', 'Jun \'24', 'Jul \'24', 'Aug \'24', 'Sep \'24', 'Oct \'24', 'Nov \'24', 'Dec \'24', 'Jan \'25']);
//   expect(yoffset_data.balances).toEqual([null, null, null, 2000, 3483.01, 7650.11, 11317.21, 15484.31, 19651.41, 26419.81, 30586.91, 34754.01, 38421.11, 42588.21]);
// });

// // Issue came up when testing.
// // Was getting negative numbers.
// test( 'it returns null for all datapoints when the selected date is before the budget starts', () => {
//   const { balances } = calculateBalanceOverPeriod( dayjs("10-15-2024"), 5000, getSampleBudgetLineItems(), dayjs( '2024-05-15' ), "1M" );
//   expect( balances ).toEqual([ null, null, null, null, null ]);
// })

test( 'it shows the correct items for the week of 4/5/24 for sample budget #2 via getThisWeeksBudgetLineItems()', () => {
  const items = getWeeksBudgetLineItems( dayjs( '4/8/24' ), dayjs( '1/1/24' ), sampleBudgetTwoItems );
  expect( items.length ).toBe( 2 );
  expect( items[0].item.name ).toBe( 'Savings' );
  expect( items[0].days ).toBe( 0 );
  expect( items[1].item.name ).toBe( 'Paycheck' );
  expect( items[1].days ).toBe( 6 );
});

test( 'it shows the correct items for the week of 3/22/24 for sample budget #2 via getThisWeeksBudgetLineItems()', () => {
  const items = getWeeksBudgetLineItems( dayjs( '3/22/24' ), dayjs( '1/1/24' ), sampleBudgetTwoItems );
  expect( items.length ).toBe( 4 );
  expect( items[0].item.name ).toBe( 'Savings' );
  expect( items[1].item.name ).toBe( 'Apple Music' );
  expect( items[2].item.name ).toBe( 'Travel savings' );
  expect( items[3].item.name ).toBe( 'Paycheck' );
});

test( 'it adds verifications', () => {
  const { result } = renderHook<UseBudgetDetails, { slug:string }>( () => useBudgetDetails("test") );
  const { budget, verifyAmount } = result.current;
  const item = budget!.budgetLineItems[5];
  verifyAmount( dayjs( "05-15-2025"), item, 25 );
  expect( budget?.budgetLineItems[5].vers![ "2025-May-15" ]).toBe( 25 );
});