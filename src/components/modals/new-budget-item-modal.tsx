import React from "react";
import { MultiscreenModal } from "./multiscreen-modal";
import { prettyDate } from "../../utils/util";

type NewBudgetItemModalType = {
  onCancel: () => void
}

export const NewBudgetItemModal: React.FC<NewBudgetItemModalType> = ({ onCancel }) => {
  return (
    <MultiscreenModal
      title="New Budget Item"
      onSave={(params) => { console.log(params) }}
      onCancel={onCancel}
      fields={
        [
          [
            { name: "name", type: "text", format: "full", validations: [] },
            { name: "amount", type: "text", format: "full", validations: [] },
            {
              name: "type", type: "radio", format: "full", validations: [], options: [
                { label: "Expense", value: "expense" },
                { label: "Income", value: "income" },
              ]
            }
          ],
          [
            {
              name: "frequency", type: "select", format: "full", validations: [], defaultValue: "Monthly", options: [
                { label: "Once", value: "Once" },
                { label: "Weekly", value: "Weekly" },
                { label: "Bi-weekly", value: "Bi-weekly" },
                { label: "Monthly", value: "Monthly" }
              ]
            },
            { name: "starts", label: "Starting", type: "date", format: "full", validations: [], showOn: obj => obj["frequency"] !== "Once" },
            { name: "date", label: "Due Date", type: "date", format: "full", validations: [], showOn: obj => obj["frequency"] === "Once" },
            {
              name: "day", type: "select", format: "full", validations: [], options: [
                { label: "Sunday", value: "Sunday" },
                { label: "Monday", value: "Monday" },
                { label: "Tuesday", value: "Tuesday" },
                { label: "Wednesday", value: "Wednesday" },
                { label: "Thursday", value: "Thursday" },
                { label: "Friday", value: "Friday" },
                { label: "Saturday", value: "Saturday" },
              ],
              desc: "What day will this occur?",
              showOn: (obj) => obj["frequency"] === "Weekly" || obj["frequency"] === "Bi-weekly"
            },
            {
              name: "dates", type: "select", multi: true, format: "full", validations: [],
              options: Array(31).fill(0).map((_, _i) => {
                const i = _i + 1;
                return { label: prettyDate(i), value: i.toString() }
              }),
              desc: "What dates will this occur? (ex. 1st of month)",
              showOn: (obj) => obj["frequency"] === "Monthly"
            },
            { name: "hasEnd?", label: "Is there an end date?", desc: "Most budget items will not have an end date.", type: "checkbox", format: "full", validations: [], showOn: obj => obj["frequency"] !== "Once" },
            { name: "ends", label: "End Date", type: "date", format: "full", validations: [], showOn: obj => obj["frequency"] !== "Once" && obj["hasEnd?"] === "true" }
          ]
        ]
      }
    />
  )
}