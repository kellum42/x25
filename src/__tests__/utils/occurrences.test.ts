import dayjs, { Dayjs } from "dayjs";
import { calculate, populateBounds, populateOccurrences } from "../../utils/occurrence";
import { Schema } from "../../utils/types";

const items: Schema<"item">[] = [
  {
    id: "1",
    documentId: "Rent",
    name: "test",
    type: "expense",
    frequency: "Monthly",
    dates: "1",
    starts: "01-01-2024",
    ends: "-1",
    amount: 1999
  },
  {
    id: "1",
    documentId: "Savings",
    name: "test",
    type: "expense",
    frequency: "Weekly",
    day: "Friday",
    starts: "01-01-2024",
    ends: "-1",
    amount: 500
  },
  {
    id: "1",
    documentId: "Leisure",
    name: "test",
    type: "expense",
    frequency: "Weekly",
    day: "Friday",
    starts: "01-01-2024",
    ends: "-1",
    amount: 765
  },
  {
    id: "1",
    documentId: "Travel",
    name: "test",
    type: "expense",
    frequency: "Weekly",
    day: "Friday",
    starts: "01-01-2024",
    ends: "-1",
    amount: 300
  },
  {
    id: "1",
    documentId: "Harvest",
    name: "test",
    type: "expense",
    frequency: "Monthly",
    dates: "5",
    starts: "01-01-2024",
    ends: "-1",
    amount: 1330
  },
  {
    id: "1",
    documentId: "Travis Paycheck",
    name: "test",
    type: "income",
    frequency: "Monthly",
    dates: "10,25",
    starts: "01-01-2024",
    ends: "-1",
    amount: 3055.51
  },
  {
    id: "1",
    documentId: "Rahni Paycheck",
    name: "test",
    type: "income",
    frequency: "Bi-weekly",
    day: "Friday",
    starts: "01-01-2024",
    ends: "-1",
    amount: 3101.3
  },
  {
    id: "1",
    documentId: "Acura",
    name: "test",
    type: "expense",
    frequency: "Monthly",
    dates: "15",
    starts: "01-01-2024",
    ends: "-1",
    amount: 1010.16
  },
  {
    id: "1",
    documentId: "Rest",
    name: "test",
    type: "expense",
    frequency: "Monthly",
    dates: "22",
    starts: "01-01-2024",
    ends: "-1",
    amount: 1860
  },
]

test('it populates bounds correctly.', () => {
  const bounds: [Dayjs, Dayjs] = [dayjs("2025/05/01"), dayjs("2025/05/31")];
  const result = populateBounds(bounds, {});

  // expect(result.status).toBe("success");
  // if (result.status === "success") {
    expect(result).toHaveProperty("2025-05-01");
    expect(result).toHaveProperty("2025-05-15");
    expect(result).toHaveProperty("2025-05-31");
    expect(result).not.toHaveProperty("2025-04-01");
  // }

  // Test failure cases as well.
})

test('it populates items correctly.', () => {
  const bounds: [Dayjs, Dayjs] = [dayjs("2024-10-01"), dayjs("2024-10-31")];
  const result = populateBounds(bounds, {});
  // if (result.status === "success") {
    expect(result).not.toBeNull();
    const map = populateOccurrences(items, bounds, result || {});
    expect(Object.keys(map["2024-10-04"]).length).toBe(3);
    expect(map["2024-10-11"]["Rahni Paycheck"]).toBeDefined();
    expect(map["2024-10-25"]["Rahni Paycheck"]).toBeDefined();
  // }
});

test('it populates calculations correctly.', () => {
  const bounds: [Dayjs, Dayjs] = [dayjs("2024-10-01"), dayjs("2024-10-31")];
  const result = populateBounds(bounds, {});
  // expect(result.status).toBe("success");

  // if ( result.status === "success"){
  expect(result).not.toBeNull();
  let map = populateOccurrences(items, bounds, result || {});
  map = calculate(map);

  const startingBalance = 3854.46;
  expect(map["2024-10-15"]["Acura"].balance).toBe(2542.11 - startingBalance)
  // }
});