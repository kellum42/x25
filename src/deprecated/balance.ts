// Calculates balance.

import { Occurrence } from "./occurrence";

export const calculateBalance = (startBalance: number, occurrences: Occurrence[]): number => {
  // Sort occurrences.
  // Loop through occurrences and sum amount and/or verification. 
  let sum = 0;
  occurrences.map( occ => {
    if ( occ.verification && occ.verification.amount !== undefined ){
      sum += occ.verification.amount * (occ.item.type === "expense" ? -1 : 1)
    } else {
      sum += occ.item.amount * (occ.item.type === "expense" ? -1 : 1);
    }
  })
  return sum + startBalance;
}