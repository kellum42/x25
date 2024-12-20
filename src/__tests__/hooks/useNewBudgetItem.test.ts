import { renderHook, act } from "@testing-library/react";
import dayjs from 'dayjs'

import { BudgetItemFrequency } from "../../hooks/useBudgetDetails";
import { useNewBudgetItem, UseNewBudgetItemType } from "../../hooks/useUpdateBudgetItem";
import * as localStorage from "../../utils/localStorage";

// TODO: - Finish rest of validations.

// Validations:
//  - Start date is after end date.
//  - date exists on Once items
//  - starts exists on Weekly and Monthly items
//  - amount is not negative
//  - amount is a valid number
//  - name is less than 50 characters
//  - type is "expense" or "income"
//  - dates is between 1 and 31
//  - day is valid day of week
//  - a valid day is given to starts, date, ends
//  - ends can take -1
//  - date and starts can't take -1
describe('validate()', () => {
  
  test('start date is after end date', () => {
    const saveBudget = jest.spyOn(localStorage, "saveBudget");

    const { result } = renderHook<UseNewBudgetItemType, undefined>(() => useNewBudgetItem());
    act(() => {
      result.current.update( "name", "Car Insurance" );
      result.current.update( "frequency", "Monthly" );
      result.current.update( "amount", "3000" );
      result.current.update( "dates", "15" );
      result.current.update( "starts", "2024-12-12" );
      result.current.update( "ends", "2024-12-11" );
    });
    
    act(() => result.current.save( "test" ));
    console.log(result.current.error);
    expect( result.current.error ).not.toBeNull();

    act(() => result.current.update( "ends", "2024-12-13" ));
    act(() => result.current.save( "test" ));

    expect( result.current.error ).toBeNull();

    saveBudget.mockRestore();
  });

  test('date exists on one-time budget items', () => {
    const saveBudget = jest.spyOn(localStorage, "saveBudget");
    const { result } = renderHook<UseNewBudgetItemType, undefined>(() => useNewBudgetItem());
    const { update } = result.current;
    act(() => {
      update( "name", "Car Insurance" );
      update( "frequency", "Once" );
      update( "amount", "3000" );
    });

    act(() => result.current.save( "test" ));
    expect( result.current.error ).not.toBeNull();

    act(() => update( "date", "2024-05-15" ));
    act(() => result.current.save( "test" ));
    expect( result.current.error ).toBeNull();
    saveBudget.mockRestore();
  });

  test('start date exists on weekly and monthly budget items', () => {
    const saveBudget = jest.spyOn(localStorage, "saveBudget");
    const { result } = renderHook<UseNewBudgetItemType, undefined>(() => useNewBudgetItem());
    const { update } = result.current;
    act(() => {
      update( "name", "Car Insurance" );
      update( "frequency", "Monthly" );
      update( "amount", "3000" );
      update( "dates", "1,15" );
    });

    act(() => result.current.save( "test" ));
    expect( result.current.error ).not.toBeNull();

    act(() => update( "frequency", BudgetItemFrequency.biweekly ));
    act(() => result.current.save( "test" ));
    expect( result.current.error ).not.toBeNull();

    act(() => update( "starts", "2024-12-13" ));
    act(() => result.current.save( "test" ));
    expect( result.current.error ).toBeNull();

    act(() => update( "frequency", "Monthly" ));
    act(() => result.current.save( "test" ));
    expect( result.current.error ).toBeNull();
    saveBudget.mockRestore();
  });

  test('amount is not negative', () => {
    const saveBudget = jest.spyOn(localStorage, "saveBudget");
    const { result } = renderHook<UseNewBudgetItemType, undefined>(() => useNewBudgetItem());
    const { update } = result.current;
    act(() => {
      update( "name", "Car Insurance" );
      update( "frequency", "Monthly" );
      update( "amount", "-125" );
      update( "starts", "2024-12-13" );
    });

    act(() => result.current.save( "test" ));
    expect( result.current.error ).not.toBeNull();

    act(() => update( "amount", "58.67" ));
    act(() => result.current.save( "test" ));
    expect( result.current.error ).toBeNull();

    saveBudget.mockRestore();
  });

  test('name is less than 50 characters', () => {
    const saveBudget = jest.spyOn(localStorage, "saveBudget");
    const { result } = renderHook<UseNewBudgetItemType, undefined>(() => useNewBudgetItem());
    const { update } = result.current;
    act(() => {
      update( "name", "Car Insurance Car Insurance Car Insurance Car Insurance Car Insurance" );
      update( "frequency", "Monthly" );
      update( "amount", "125" );
      update( "starts", "2024-12-13" );
    });

    act(() => result.current.save( "test" ));
    expect( result.current.error ).not.toBeNull();

    act(() => update( "name", "testing" ));
    act(() => result.current.save( "test" ));
    expect( result.current.error ).toBeNull();

    saveBudget.mockRestore();
  });
});
