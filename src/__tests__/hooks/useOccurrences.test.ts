import { renderHook, act } from "@testing-library/react";
import dayjs, { Dayjs } from 'dayjs'

import { useOccurrences, UseOccurrences } from "../../hooks/useOccurrences";
import { populateBounds } from "../../utils/occurrence";
import { Schema } from "../../utils/types";

// items from sample budget 3.
const items: Schema<"item">[] = [
  {
    id: "1",
    documentId: "Rent",
    name: "Rent",
    type: "expense",
    frequency: "Monthly",
    dates: "1",
    starts: "2024-01-01",
    ends: "-1",
    amount: 1999
  },
  {
    id: "1",
    documentId: "Savings",
    name: "Savings",
    type: "expense",
    frequency: "Weekly",
    day: "Friday",
    starts: "01-01-2024",
    ends: "2025-07-12",
    amount: 500
  },
  {
    id: "1",
    documentId: "Leisure",
    name: "Leisure",
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
    name: "Travel",
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
    name: "Harvest",
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
    name: "Travis Paycheck",
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
    name: "Rahni Paycheck",
    type: "income",
    frequency: "Bi-weekly",
    day: "Friday",
    starts: "2024-09-13",
    ends: "-1",
    amount: 3101.3
  },
  {
    id: "1",
    documentId: "Acura",
    name: "Acura",
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
    name: "Rest",
    type: "expense",
    frequency: "Monthly",
    dates: "22",
    starts: "01-01-2024",
    ends: "-1",
    amount: 1860
  },
]

test('it gets balance correctly.', () => {
  const { result } = renderHook<UseOccurrences, {start: Dayjs, end: Dayjs, items: Schema<"item">[]}>(
    () => useOccurrences(dayjs("2024-09-01"), dayjs("2025-09-01"), items)
  );
  // const { setBounds } = result.current;

  // act(() => { setBounds(["2025/05/01", "2025/05/31"]) })

  const startBal = 4000;
  const { balance } = result.current
  let bal = balance( dayjs("2025-01-17"), "end");
  expect(bal).not.toBeNull()
  expect((bal || 0) + startBal ).toBe(2076.79);
  
  bal = balance( dayjs("2024-10-01"), "end");
  expect(bal).not.toBeNull()
  expect((bal || 0) + startBal ).toBe(1855.46);

  bal = balance( dayjs("2024-09-01"), "end", startBal);
  expect(bal).not.toBeNull()
  expect(bal).toBe(2001.00);
})

test('it gets occurrences correctly.', () => {
  const { result } = renderHook<UseOccurrences, {start: Dayjs, end: Dayjs, items: Schema<"item">[]}>(
    () => useOccurrences(dayjs("2024-09-01"), dayjs("2025-09-01"), items)
  );
  const { occurrences } = result.current;
  const occs = occurrences(dayjs("2024-12-20"), dayjs("2024-12-30"))
  expect(occs.length).toBe(9);
})

// test('it verifies correctly.', () => {
//   const { result } = renderHook<UseOccurrences, {start: Dayjs, end: Dayjs, items: Schema<"item">[]}>(
//     () => useOccurrences(dayjs("2024-09-01"), dayjs("2025-09-01"), items)
//   );
//   const startBal = 4000;
//   const { verify, balance,  } = result.current;
//   let bal = balance( dayjs("2025-01-01"), "end");
//   // expect(bal).not.toBeNull()
//   // expect((bal || 0) + startBal ).toBe( 146.16 );

//   const v = { id: "test", documentId: "12345", amount: 2599.6, date: "2024-11-08"}
//   act(() => { verify("Rahni Paycheck", v) })
// })

