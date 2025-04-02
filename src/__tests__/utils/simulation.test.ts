import dayjs from "dayjs";

import { Budget, BudgetItemFrequency, WeekDays, WeeklyBudgetItem } from "../../utils/schemas";
import { datesBelowThreshold, getSimulationDiffs } from "../../utils/simulation";
import { sampleBudgetThreeItems } from "../../utils/testing/sample-budget-3";
import * as localStorage from "../../utils/localStorage";

const budgetTwo: Budget = {
  id: "2",
  title: "TESTING TWO",
  slug: "testing-two",
  startingBalance: 2000,
  startDate: dayjs("02/02/24"),
  items: [
    {
      id: "2",
      name: "House",
      amount: 3250,
      frequency: BudgetItemFrequency.monthly,
      dates: ["1"],
      type: "expense",
      starts: dayjs('2025-10-01'),
      ends: dayjs('2055-09-01'),
    },
    {
      id: "3",
      name: "Acura",
      amount: 50000.00,
      frequency: BudgetItemFrequency.once,
      date: dayjs("2025-01-01"),
      type: "expense",
    },
    {
      id: "5",
      name: "Savings",
      amount: 100,
      frequency: BudgetItemFrequency.weekly,
      day: WeekDays.thursday,
      type: "expense",
      starts: dayjs('2024-09-01'),
      ends: dayjs('2025-07-15'),
    }
  ]
};

const budgetThree: Budget = {
  id: "3",
  title: "TESTING THREE",
  slug: "testing-three",
  startingBalance: 3000,
  startDate: dayjs("03/03/24"),
  parent: "2",
  items: [
    {
      id: "2",
      name: "House",
      amount: 4250,
      frequency: BudgetItemFrequency.monthly,
      dates: ["15"],
      type: "expense",
      starts: dayjs('2025-10-10'),
      ends: dayjs('2027-05-15'),
    },
    {
      id: "4",
      name: "HBO Max",
      amount: 17.21,
      frequency: BudgetItemFrequency.monthly,
      dates: ["2"],
      type: "expense",
      starts: dayjs('2024-03-01'),
      ends: dayjs('2055-09-10')
    }
  ]
};

const budgetFour: Budget = {
  id: "4",
  title: "TESTING FOUR",
  slug: "testing-four",
  startingBalance: 2000,
  startDate: dayjs("02/02/24"),
  parent: "2",
  items: [
    {
      id: "3",
      name: "Acura",
      amount: 50000.00,
      frequency: BudgetItemFrequency.once,
      date: dayjs("2025-07-31"),
      type: "expense",
    },
    {
      id: "5",
      name: "Savings",
      amount: 50,
      frequency: BudgetItemFrequency.biweekly,
      day: WeekDays.friday,
      type: "income",
      starts: dayjs('2024-09-01'),
      ends: "-1",
    }
  ]
};

test('datesBelowThreshold()', () => {
  const budget: Budget = {
    id: "1",
    title: "TESTING",
    slug: "TESTING",
    startingBalance: 4000,
    startDate: dayjs("09/01/24"),
    items: sampleBudgetThreeItems
  };

  const results = datesBelowThreshold(budget, dayjs("2024-09-01"), dayjs("2025-01-01"));
  expect(results.status).toBe("success");

  if (results.status === "success") {
    results.data.map(result => {
      console.log("Date: %s, Balance: %d", result.date.format("YYYY-MM-DD"), result.balance)
      return result;
    })
    expect(results.data.length).toBe(3);
  }
});

describe('getSimulationDiffs', () => {
  let spyGetBudget;

  beforeEach(() => {
    spyGetBudget = jest.spyOn(localStorage, "getBudgetByID")
      .mockReturnValue({ status: "success", data: budgetTwo }); 
  });

  it('it captures starting balance change', () => {
    const response = getSimulationDiffs( budgetThree );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "startingBalance" );
      expect(results.length).toBe(1);
      expect(results[0].prev).toBe("2000");
      expect(results[0].new).toBe("3000");
    }
  })

  it('it captures create', () => {
    const response = getSimulationDiffs( budgetThree );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "create" );
      expect(results.length).toBe(1);
    }
  })

  it('it captures delete', () => {
    const response = getSimulationDiffs( budgetThree );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "delete" );
      expect(results.length).toBe(2);
    }
  })

  it('it captures amount change', () => {
    const response = getSimulationDiffs( budgetThree );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "amount" );
      expect(results.length).toBe(1);
      expect(results[0].name).toBe("House");
      expect(results[0].id).toBe("2");
    }
  })

  it('it captures start date change', () => {
    const response = getSimulationDiffs( budgetThree );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "startdate" );
      expect(results.length).toBe(1);
      expect(results[0].name).toBe("House");
      expect(results[0].id).toBe("2");
      expect(results[0].prev).toBe("2025/10/01");
      expect(results[0].new).toBe("2025/10/10");
    }
  })

  it('it captures end date change', () => {
    const response = getSimulationDiffs( budgetThree );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "endate" );
      expect(results.length).toBe(1);
      expect(results[0].name).toBe("House");
      expect(results[0].id).toBe("2");
      expect(results[0].prev).toBe("2055/09/01");
      expect(results[0].new).toBe("2027/05/15");
    }
  })

  it('it captures dates change', () => {
    const response = getSimulationDiffs( budgetThree );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "dates" );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe("2");
      expect(results[0].prev).toBe("1");
      expect(results[0].new).toBe("15");
    }
  })

  it('it captures frequency change', () => {
    const response = getSimulationDiffs( budgetFour );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "frequency" );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe("5");
      expect(results[0].prev).toBe(BudgetItemFrequency.weekly);
      expect(results[0].new).toBe(BudgetItemFrequency.biweekly);
    }
  })

  it('it captures type change', () => {
    const response = getSimulationDiffs( budgetFour );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "type" );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe("5");
      expect(results[0].prev).toBe("expense");
      expect(results[0].new).toBe("income");
    }
  })

  it('it captures day change', () => {
    const budgetFour__copy = { ...budgetFour, items: [...budgetFour.items] };
    budgetFour__copy.items[1].frequency = BudgetItemFrequency.weekly;
    const response = getSimulationDiffs( budgetFour__copy );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "day" );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe("5");
      expect(results[0].prev).toBe(WeekDays.thursday);
      expect(results[0].new).toBe(WeekDays.friday);
    }
  })

  it('it captures date change', () => {
    const response = getSimulationDiffs( budgetFour );
    expect(response.status).toBe("success");
    if ( response.status === "success" ){
      const results = response.data.filter( diff => diff.change === "startdate" );
      expect(results.length).toBe(1);
      expect(results[0].id).toBe("3");
      expect(results[0].prev).toBe("2025/01/01");
      expect(results[0].new).toBe("2025/07/31");
    }
  })
})