import { renderHook, act } from "@testing-library/react";
import dayjs from 'dayjs'

import {
  useBudgetDetails,
  UseBudgetDetails,
} from "../../hooks/useBudgetDetails";
import { Budget, BudgetItemFrequency } from "../../utils/schemas";
import * as localStorage from "../../utils/localStorage";

const mockItem: Budget = {
  id: "1",
  title: "Test Budget",
  slug: "test-budget",
  startingBalance: 2000,
  startDate: dayjs("2024-01-01"),
  items: [
    {
      id: "1",
      name: "Car Insurance",
      amount: 198.65,
      frequency: BudgetItemFrequency.monthly,
      dates: ["15"],
      type: "expense",
      starts: dayjs('2024-01-01'),
      ends: "-1",
    },
    {
      id: "2",
      name: "Netflix",
      amount: 22.65,
      frequency: BudgetItemFrequency.monthly,
      dates: ["2"],
      type: "expense",
      starts: dayjs('2024-01-01'),
      ends: "-1",
    }
  ]
};

describe('useBudgetDetails', () => {
  test('verifyAmount() verifies correctly', () => {
    const spyGetBudget = jest.spyOn(localStorage, "getBudget").mockReturnValue( mockItem );
    const spySaveBudget = jest.spyOn(localStorage, "saveBudget").mockReturnValue();

    const { result } = renderHook<UseBudgetDetails, { slug: string }>(() => useBudgetDetails("test"));
    const { budget, verifyAmount } = result.current;
    expect(budget!.items[0].vers).toBe(undefined);

    const item = budget!.items[0];
    act(() => {
      verifyAmount(dayjs("05-15-2025"), item, 25);
    });
    expect(budget?.items[0].vers).toEqual({ "2025": { "5": { "15": 25 } } });

    act(() => {
      verifyAmount(dayjs("10-1-2025"), item, 15);
    });
    expect(budget?.budget.items[0].vers!["2025"]["10"]["1"]).toBe(15);
    
    spyGetBudget.mockRestore();
    spySaveBudget.mockRestore();
  });

  test('verifyAmount() unverifies correctly', () => {
    const spyGetBudget = jest.spyOn(localStorage, "getBudget").mockReturnValue( mockItem );
    const spySaveBudget = jest.spyOn(localStorage, "saveBudget").mockReturnValue();

    const { result } = renderHook<UseBudgetDetails, { slug: string }>(() => useBudgetDetails("test"));
    const { budget, verifyAmount } = result.current;

    const item = budget!.items[0];
    item.vers = {
      "2025": {
        "2": {
          "7": 150,
          "14": 151,
          "21": 150
        },
        "3": {
          "25": 1234
        }
      }
    }

    act(() => {
      verifyAmount(dayjs("2-14-2025"), item, null);
    });
    expect(budget?.items[0].vers!["2025"]).toEqual({ "2": { "7": 150, "21": 150 }, "3": { "25": 1234 } });
    
    spyGetBudget.mockRestore();
    spySaveBudget.mockRestore();
  });
});

describe( 'updateBudget', () => {
  test( 'it updates the budget items correctly', () => {
    const spyGetBudget = jest.spyOn(localStorage, "getBudget").mockReturnValue({ status: "success", data: mockItem });
    const spySaveBudget = jest.spyOn(localStorage, "saveBudget").mockReturnValue({ status: "success" });

    const { result } = renderHook<UseBudgetDetails, { slug: string }>(() => useBudgetDetails("test"));
    const { updateBudget } = result.current;

    const updates: Record<string,string> = {
      title: "Updated budget",
      startDate: "2024/05/15",
      startingBalance: "2500"
    };

    act(() => { updateBudget(updates) })
    
    expect( result.current.budget?.slug ).toBe( "test-budget" );
    expect( result.current.budget?.title ).toBe( updates.title );
    expect( result.current.budget?.startingBalance ).toBe( parseFloat(updates.startingBalance));
    expect( result.current.budget?.startDate.format("YYYY/MM/DD") ).toBe( updates.startDate );
    expect( result.current.budget?.items.length).toBe( 2 );

    spyGetBudget.mockRestore();
    spySaveBudget.mockRestore();
  })
})
