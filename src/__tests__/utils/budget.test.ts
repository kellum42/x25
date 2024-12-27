import dayjs from 'dayjs'

import {
  daysTillFirstOccurrence,
  calculateBalanceOver,
  getVerificationOn,
  getVerificationsBetween,
  calculateBalance,
  JSONtoBudgetItem,
} from "../../utils/budget";
// import {
//   BudgetItem,
//   BudgetItemFrequency,
//   WeeklyBudgetLineItemDays,
// } from "../../hooks/useBudgetDetails";
import { Budget, BudgetItem, BudgetItemFrequency } from '../../utils/schemas';
import { sampleBudgetTwoItems } from '../../utils/sample-budget-two';
import { sampleBudgetThreeItems } from '../../utils/sample-budget-3';

describe('daysTillFirstOccurrence()', () => {
  test('it gives 18 days between April 27th and a monthly bill due on May 15th', () => {
    const bill: BudgetItem = {
      id: "1",
      name: "Car Insurance",
      amount: 198.65,
      frequency: BudgetItemFrequency.monthly,
      dates: ["15"],
      type: "expense",
      starts: dayjs('2024-01-01'),
      ends: "-1"
    };
    const offset = daysTillFirstOccurrence(bill, dayjs('2024-04-27'), 0);
    expect(offset).toBe(18);
  });

  test('it gives 5 days till allowance if today is Friday, and 2 days till allowance if today is Monday. Given payday is every Wednesday.', () => {
    const allowance: BudgetItem = {
      id: "1",
      name: "Allowance",
      amount: 30,
      frequency: BudgetItemFrequency.weekly,
      day: "Wednesday",
      type: "income",
      starts: dayjs('2020-01-01'),
      ends: "-1"
    };
    const offset = daysTillFirstOccurrence(allowance, dayjs('2024-10-04')); // Friday
    expect(offset).toBe(5);

    const _offset = daysTillFirstOccurrence(allowance, dayjs('2024-09-30')); // Monday
    expect(_offset).toBe(2);
  });

  test('it gives error for OneTimeBudgetLineItems', () => {
    const bonus: BudgetItem = {
      id: "1",
      name: "Bonus",
      amount: 3000,
      frequency: BudgetItemFrequency.once,
      type: "income",
      date: dayjs('2024-05-15')
    };
    const offset = daysTillFirstOccurrence(bonus, dayjs('2024-10-01'));
    expect(typeof offset).toBe('string');
  })
});

describe('calculateBalance()', () => {
  test('computes balance correctly', () => {
    const balance = calculateBalance(dayjs("03-01-2024"), 2000, sampleBudgetTwoItems, dayjs("03-08-2024"));
    expect(balance).toBe(1182.79);
  });

  test('computes balance correctly again', () => {
    const balance = calculateBalance(dayjs("07-02-2024"), 16468.40, sampleBudgetTwoItems, dayjs("12-27-2024"));
    expect(balance).toBe(44072.30);
  });


  // Must make deep copies of vers.
  const verifiedSampleBudgetTwoItems = sampleBudgetTwoItems.map( item => {
    return {
      ...item,
      vers: {
        ...item.vers
      }
    }
  });
  verifiedSampleBudgetTwoItems.forEach( item => {
    if (item.name === "Apple Music") {
      item.vers = {
        "2024": {
          "3": { "26": 18.27 },
          "4": { "26": 19.84 }
        }
      }
    } else if (item.name === "Paycheck") {
      item.vers = {
        "2024": {
          "3": { "14": 3120.30 },
          "4": { "11": 2999.45 },
          "5": { "9": 3300, "23": 3001.40 }
        }
      }
    }
  });

  test('computes balance correctly with verifications', () => {
    const balance = calculateBalance(dayjs("03-01-2024"), 2000, verifiedSampleBudgetTwoItems, dayjs("03-15-2024"));
    expect(balance).toBe(3503.09);
  });

  test('computes balance correctly with verifications again', () => {
    const balance = calculateBalance(dayjs("03-14-2024"), 382.79, verifiedSampleBudgetTwoItems, dayjs("07-01-2024"));
    expect(balance).toBe(16482.82);
  });

  test( 'gets correct end of day balance', () => {
    let balance = calculateBalance( dayjs("2024-09-01"), 4000, sampleBudgetThreeItems, dayjs("2024-09-06"), "EndofDay" );
    expect( balance ).toBe( -894.00 );

    balance = calculateBalance( dayjs("2024-09-01"), 4000, sampleBudgetThreeItems, dayjs("2025-04-05"), "EndofDay" );
    expect( balance ).toBe( -1941.48 );
  });
});

describe('JSONtoBudgetItem()', () => {
  test('it parses Record correctly', () => {
    const _item: Record<string, string> = {
      id: "12345",
      name: "Test Item",
      amount: "300.00",
      type: "expense",
      frequency: "monthly",
      dates: "1,15",
      starts: "1/1/2025",
      ends: "-1"
    }

    const item = JSONtoBudgetItem( JSON.stringify( _item ) );
    expect( item ).toBeDefined();
  });
});

describe( 'calculateBalanceOver()', () => {
  test( 'it calculates daily periods and balances correctly for sample budget #2', () => {
  
    const { balances, dates } = calculateBalanceOver( [dayjs('2024-5-16')], 2000, dayjs('2024-3-1'), sampleBudgetTwoItems, );
    expect( dates.length ).toBe( 1 );
    expect( dates[0].format('M/D/YY') ).toBe( '5/16/24' );
    expect( balances[0] ).toEqual( 10718.29 );
  });

  // Also tests we get null before the start date.
  test( 'calculates balance over the next year correctly', () => {
    const date = dayjs("2024-07-12");
    const periods = [ date, ...Array(12).fill(0).map((_, i) => { return date.add(i + 1, "month") }) ];
    const { balances } = calculateBalanceOver( periods, 4000, dayjs("2024-09-01"), sampleBudgetThreeItems, false );
    expect( balances[0] ).toEqual( null );
    expect( balances[1] ).toEqual( null );
    expect( balances[2] ).toEqual( 2161.51 );
    expect( balances[3] ).toEqual( 3552.27 );
    expect( balances[4] ).toEqual( 3406.73 );
    expect( balances[5] ).toEqual( 3261.19 );
    expect( balances[6] ).toEqual( 1550.65 );
    expect( balances[7] ).toEqual( 1405.11 );
    expect( balances[8] ).toEqual( 1259.57 );
    expect( balances[9] ).toEqual( 2650.33 );
    expect( balances[10] ).toEqual( 2504.79 );
    expect( balances[11] ).toEqual( 2359.25 );
    expect( balances[12] ).toEqual( 648.71 );
    // expect( balances[11] ).toEqual( 2503.17 );
    // expect( balances[12] ).toEqual( 7366.79 );
  });

  test( 'calculates end of day balance correctly', () => {
    const _dates = [
      ["2024/09/05", 671.00],
      ["2024/09/06", -894.00],
      ["2024/09/10", 2161.51],
      ["2024/09/22", -737.35],
      ["2024/09/25", 2318.16 ],
      ["2024/10/01", 1855.46 ],
      ["2024/11/08", 351.22 ],
      ["2024/12/27", 1852.84 ],
      ["2025/01/10", 1550.65],
      ["2025/06/22", -539.61],
      ["2025/08/15", 4539.47],
      ["2026/10/28", 34489.56],
    ];
    const { balances, dates } = calculateBalanceOver(
      _dates.map( d => dayjs( d[0] )),
      4000,
      dayjs( "2024/09/01" ),
      sampleBudgetThreeItems,
      false,
      "EndofDay"
    );
    _dates.map( (d,i) => {
      expect( dates[i].format("YYYY/MM/DD") ).toBe( _dates[i][0]);
      expect( balances[i] ).toBe( _dates[i][1])
    })
  });
});



// test( 'it shows the correct items for the week of 4/5/24 for sample budget #2 via getThisWeeksBudgetLineItems()', () => {
//   const items = getWeeksBudgetLineItems( dayjs( '4/8/24' ), dayjs( '1/1/24' ), sampleBudgetTwoItems );
//   expect( items.length ).toBe( 2 );
//   expect( items[0].item.name ).toBe( 'Savings' );
//   expect( items[0].days ).toBe( 0 );
//   expect( items[1].item.name ).toBe( 'Paycheck' );
//   expect( items[1].days ).toBe( 6 );
// });

// test( 'it shows the correct items for the week of 3/22/24 for sample budget #2 via getThisWeeksBudgetLineItems()', () => {
//   const items = getWeeksBudgetLineItems( dayjs( '3/22/24' ), dayjs( '1/1/24' ), sampleBudgetTwoItems );
//   expect( items.length ).toBe( 4 );
//   expect( items[0].item.name ).toBe( 'Savings' );
//   expect( items[1].item.name ).toBe( 'Apple Music' );
//   expect( items[2].item.name ).toBe( 'Travel savings' );
//   expect( items[3].item.name ).toBe( 'Paycheck' );
// });

const mockItemWithVerifications: BudgetItem = {
  id: "1",
  name: "Car Insurance",
  amount: 198.65,
  frequency: BudgetItemFrequency.monthly,
  dates: ["15"],
  type: "expense",
  starts: dayjs('2024-01-01'),
  ends: "-1",
  vers: { 
    "2024": { 
      "1": {
        "15": 186.80
      },
      "5": {
        "15": 210.84
      },
      "10": {
        "15": 211.22
      },
      "11": {},
      "12": {
        "15": 232.99
      }
    },
    "2025": {
      "4": {
        "15": 222.17
      },
      "5": {
        "15": 220.94
      }
    }
  }
}

test( 'getVerificationOn() gets correct value', () => {
  const result1 = getVerificationOn( dayjs( "05/15/2024" ), mockItemWithVerifications );
  expect( result1 ).toBe( 210.84 );

});

test( 'getVerificationBetween() gets correct values', () => {
  const result2 = getVerificationsBetween( [ dayjs("3/15/24"), dayjs("5/1/25" ) ], mockItemWithVerifications );
  expect( result2!.length ).toBe( 4 );
  expect( result2 ).toEqual([ 
    { date: "2024-May-15", amount: 210.84 }, 
    { date: "2024-Oct-15", amount: 211.22 }, 
    { date: "2024-Dec-15", amount: 232.99 }, 
    { date: "2025-Apr-15", amount: 222.17 } 
  ])
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


// test('it gives $5358.26 for the balance.', () => {
//   // const budgetLineItems: BudgetItem[] = getSampleBudgetLineItems();

//   const monthBalance = calculateBalance(dayjs('2024-08-23'), 5346.14, budgetLineItems, dayjs('2024-10-10')); // entire span
//   expect(monthBalance).toBe(5358.26);

//   const Jan25ThruMar25Balance = calculateBalance(dayjs('2025-01-01'), 6135.26, budgetLineItems, dayjs('2025-02-28')); // entire span
//   expect(Jan25ThruMar25Balance).toBe(9387.12);
// })