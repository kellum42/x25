import React, { useState } from "react";
import dayjs from "dayjs";

import { Modal } from "./modal"
import { FormDatePicker } from "../form-datepicker";
import { generateAvatar, getUniqueID, slugify } from "../../utils/util";
import { Budget } from "../../utils/schemas";
import { saveBudget } from "../../utils/localStorage";

type AddNewBudgetProps = {
  onCancel: () => void,
  onNewBudgetCreated: () => void
}

// TODO:
//    - Handle validation errors.

export const AddNewBudget: React.FC<AddNewBudgetProps> = (props) => {
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(dayjs().format("MM/DD/YYYY"));

  const createNewBudget = () => {
    const budget: Record<string,any> = {
      id: getUniqueID(),
      title,
      slug: slugify(title),
      startingBalance: parseInt(amount),
      startDate: dayjs(startDate),
      items: [],
      createDate: dayjs(),
      avatar: generateAvatar()
    }
    const response = Budget.safeParse( budget );
    if ( response.success ){
      const saved = saveBudget( budget as Budget );
      if ( saved.status === "success" ){
        props.onNewBudgetCreated();

      } else {
        console.log(saved.message);
      }
    } else {
      console.log(response.error);
    }
  }

  return (
    <Modal
      title="Create New Budget"
      isOpen={true}
      setIsOpen={props.onCancel}
      action={{ label: "Submit", cancel: "Cancel", actionFn: createNewBudget }}
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