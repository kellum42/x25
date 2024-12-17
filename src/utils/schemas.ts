import dayjs, { Dayjs } from 'dayjs';
import { z } from "zod";

// Errors
const x25Error = z.object({
  status: z.literal("fail"),
  message: z.string()
});

export type x25Error = z.infer<typeof x25Error>;

const zDayjs = z.custom<Dayjs>((val) => val instanceof dayjs, 'Missing or invalid date.');

export const BudgetItemFrequency = {
  once: "Once",
  weekly: "Weekly",
  biweekly: "Bi-weekly",
  monthly: "Monthly"
} as const;

export const WeekDays = {
  monday: "Monday", 
  tuesday: "Tuesday", 
  wednesday: "Wednesday", 
  thursday: "Thursday", 
  friday: "Friday", 
  saturday: "Saturday", 
  sunday: "Sunday"
} as const;


const zOneTimeBudgetItem = z.object({
  id: z.string(),
  name: z.string().max(49),
  amount: z.number().positive(), // look into transform()
  type: z.literal("income").or(z.literal("expense")),
  vers: z.optional(z.record(
    z.string(), z.record(
      z.string(), z.record(
        z.string(), z.number()
      )
    )
  )),
  // frequency: z.literal( "Once" ),
  frequency: z.literal(BudgetItemFrequency.once),
  date: zDayjs,
})

const zWeeklyBudgetItem = z.object({
  id: z.string(),
  name: z.string().max(49),
  amount: z.number().positive(),
  type: z.literal("income").or(z.literal("expense")),
  vers: z.optional(z.record(
    z.string(), z.record(
      z.string(), z.record(
        z.string(), z.number()
      )
    )
  )),
  frequency: z.enum([BudgetItemFrequency.weekly, BudgetItemFrequency.biweekly]),
  day: z.nativeEnum( WeekDays ),
  starts: zDayjs,
  ends: zDayjs.or(z.literal("-1"))
})

const zMonthlyBudgetItem = z.object({
  id: z.string(),
  name: z.string().max(49),
  amount: z.number().positive(),
  type: z.literal("income").or(z.literal("expense")),
  vers: z.optional(z.record(
    z.string(), z.record(
      z.string(), z.record(
        z.string(), z.number()
      )
    )
  )),
  frequency: z.literal(BudgetItemFrequency.monthly),
  dates: z.string().array(),
  starts: zDayjs,
  ends: zDayjs.or(z.literal("-1"))
})

export const zBudgetItem = z.discriminatedUnion(
  "frequency",
  [zOneTimeBudgetItem, zWeeklyBudgetItem, zMonthlyBudgetItem]
)
  .refine(
    (data) => {
      if (data.frequency !== "Once" && data.ends !== "-1") {
        return data.starts.isBefore(data.ends, "day");
      }
      return true;
    },
    {
      message: "Start date is after end date",
      path: ["starts"]
    }
  )

const Budget = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  startingBalance: z.number(),
  startDate: zDayjs,
  items: zBudgetItem.array()
})

export type BudgetItem = z.infer<typeof zBudgetItem>;
export type Budget = z.infer<typeof Budget>;

// export type BudgetItemFrequency = z.infer<typeof zBudgetItemFrequency>;
export type BudgetItemFrequency = typeof BudgetItemFrequency[keyof typeof BudgetItemFrequency];
// export type WeeklyBudgetItemDays = z.infer<typeof zWeeklyBudgetItemDays>;
// export type BaseBudgetItem = z.infer<typeof zBaseBudgetItem>;
export type OneTimeBudgetItem = z.infer<typeof zOneTimeBudgetItem>;
export type WeeklyBudgetItem = z.infer<typeof zWeeklyBudgetItem>;
export type MonthlyBudgetItem = z.infer<typeof zMonthlyBudgetItem>;


const zGetBudgetsResponse = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: z.record(z.string(), Budget)
  }),
  x25Error
]);

export type GetBudgetsResponse = z.infer<typeof zGetBudgetsResponse>;

const GetBudgetResponse = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("success"),
    data: Budget
  }),
  x25Error
]);
export type GetBudgetResponse = z.infer<typeof GetBudgetResponse>;

const SaveResponse = z.discriminatedUnion( "status", [
  z.object({
    status: z.literal( "success" )
  }),
  x25Error
])
export type SaveResponse = z.infer<typeof SaveResponse>;



