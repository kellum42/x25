import { Dayjs } from "dayjs";
import { Response, x25Result } from "./types";
import { create, delete_ } from "./strapi";


export const verify = async (jwt: string, item: string, date: Dayjs, amount: number): Promise<x25Result<Response<"verification", "one">>> => {
  const endpoint: string = "verifications";
  const body = {
    date: date.format("YYYY-MM-DD"),
    amount,
    item
  }
  const result = await create<"verification">(jwt, endpoint, { data: body })
  return result;
}

export const unverify = async (jwt: string, id: string): Promise<x25Result<boolean>> => {
  const endpoint: string = `verifications/${id}`;
  const result = await delete_(jwt, endpoint)
  return result;
}
