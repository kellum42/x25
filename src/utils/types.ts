import { Dayjs } from "dayjs";

type Requires<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
type RequireExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;

export type BaseSchema = {
  documentId: string;
  id?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

export type PersistentSchema = {
  "budget": {
    startAmount?: number;
    startDate?: string;
    title?: string;
    items?: Schemas["item"][];
    parent?: Schemas["budget"]
  },
  "item": {
    amount?: number;
    frequency?: "Once" | "Weekly" | "Bi-weekly" | "Monthly";
    name?: string;
    type?: 'income' | 'expense';
    date?: string;
    dates?: string;
    day?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
    starts?: string;
    ends?: string;
    budget?: Schemas["budget"];
    verifications?: Schemas["verification"][]
  },
  "verification": {
    amount?: number;
    date?: string;
    item?: Schemas["item"];
  }
}

// type NonPersistentSchema = {
//   "budget": {
//     // current?: number;
//     // startOfWeek?: number;
//     // itemCount?: number;
//   },
//   "item": {},
//   "verification": {}
// }

export type Schemas = {
  "budget": BaseSchema & PersistentSchema["budget"],
  "item": BaseSchema & PersistentSchema["item"],
  "verification": BaseSchema & PersistentSchema["verification"]
}

export type SchemaCategory = keyof Schemas;
export type Schema<TCategory extends SchemaCategory> = Schemas[TCategory];
export type ResponseType = "one" | "many"
export type Response<TCategory extends SchemaCategory, TType extends ResponseType> = TType extends "one" ? Schema<TCategory> | null : Schema<TCategory>[];
export type x25Result<T> = { status: "success", data: T } | { status: "fail", error: string }

export type x25Budget = Omit<Schema<"budget">, "startAmount" | "startDate" | "title"> & {
  startAmount: number,
  startDate: Dayjs,
  title: string
};

type x25ItemBase = "amount"|"name"|"type"|"frequency"
export type MonthlySchemaItem = Requires<Schema<"item">, "dates"|"starts"|"ends"|x25ItemBase>
export type WeeklySchemaItem =  Requires<Schema<"item">, "starts"|"ends"|"day"|x25ItemBase>
export type OnceSchemaItem = Requires<Schema<"item">, "date"|x25ItemBase>
// export type x25Item = x25OneTimeItem | x25MonthlyItem | x25WeeklyItem

// export type x25Item =   
// { frequency: "Once", date: Dayjs } & x25ItemBase |
  // { frequency: "Monthly", starts: Dayjs, ends: "-1"|Dayjs, dates: string }  & x25ItemBase |
  // { frequency: "Bi-weekly"|"Weekly", starts: Dayjs, ends: "-1"|Dayjs, day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"} & x25ItemBase
  // Omit<(
  //   Omit<Schema<"item">, "date"|"frequency"> & { date: Dayjs, frequency: "Once" } |
  //   Omit<Schema<"item">, "starts"|"ends"|"day"|"frequency"> & { starts: Dayjs, ends: Dayjs|"-1", frequency: "Bi-weekly"|"Weekly", day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"} |
  //   Omit<Schema<"item">, "dates"|"starts"|"ends"|"frequency"> & { dates: string[], starts: Dayjs, ends: Dayjs|"-1", frequency: "Monthly"}
  // ), "amount"|"name"|"type"> & { amount: number, name: string, type: "income"|"expense"}
