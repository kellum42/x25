import React, { useState } from "react";
import dayjs from "dayjs";

import { Modal } from "./modal"
import { FormDatePicker } from "../form-datepicker";

type UpdateBudgetProps = {
  onCancel: () => void,
  onReadyToUpdate: (title: string, startingBalance: string, startDate: string) => void,
  mode: "create" | "update",
  defaults?: Record<string,string>
}

// TODO:
//    - Handle validation errors.
//  - Update budget. Issue with items deep copy.
//  - Delete budget.

export const UpdateBudget: React.FC<UpdateBudgetProps> = (props) => {
  const defaults = props.defaults ?? {};

  const [title, setTitle] = useState<string>(defaults["title"] ?? "");
  const [amount, setAmount] = useState<string>(defaults["amount"] ?? "");
  const [startDate, setStartDate] = useState<string>(
    dayjs(defaults["startDate"] ?? undefined ).format("MM/DD/YYYY")
  );    

  return (
    <Modal
      title={(props.mode === "create" ? "Create New" : "Update") + " Budget"}
      isOpen={true}
      setIsOpen={props.onCancel}
      action={{ 
        label: "Submit", 
        cancel: "Cancel", 
        actionFn: () => { props.onReadyToUpdate(title, amount, startDate) }
      }}
    >
      <div>
        <div className="mb-5 fv-row fv-plugins-icon-container">
          <label className="required fs-5 fw-semibold mb-2">Name</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="form-control form-control-solid" placeholder="Budget Title" name="name" />
          <div className="fv-plugins-message-container invalid-feedback"></div>
        </div>

        <div className="mb-5 fv-row fv-plugins-icon-container">
          <label className="required fs-5 fw-semibold mb-2">Starting Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="form-control form-control-solid" placeholder="25.00" name="amount" />
          <div className="fv-plugins-message-container invalid-feedback"></div>
        </div>
      </div>

      <div className="col-6 fv-plugins-icon-container">
        <label className="required fs-6 fw-semibold mb-2">Starting Date</label>
        <div>
          <FormDatePicker
            name="startdate"
            value={startDate}
            onUpdate={(_, value) => {
              if (value) { setStartDate(dayjs(value).format("MM/DD/YYYY")) }
            }}
          />
        </div>
      </div>
    </Modal>
  )
}