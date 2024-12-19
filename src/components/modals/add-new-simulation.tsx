import React, { FC, useState, ReactNode } from "react";
import dayjs from "dayjs";

import { Modal } from "./modal";
import { Budget } from "../../utils/schemas";
import { generateAvatar, getUniqueID } from "../../utils/util";
import { saveBudget } from "../../utils/localStorage";
import { slugify } from "../../utils/util";

type AddNewSimulationProps = {
  budget: Budget,
  onCancelSimulation: () => void,
  onNewSimulationAdded: () => void
}

// TODO:
//  - Add error handling.

export const AddNewSimulation: FC<AddNewSimulationProps> = (props) => {
  const {budget, onCancelSimulation, onNewSimulationAdded} = props;

  const [title, setTitle] = useState<string>( budget.title + " Simulation");

  const saveSimulation = () => {
    const avatar = generateAvatar();

    // do validation...
    const simulation = {
      ...budget,
      id: getUniqueID(),
      createDate: dayjs(),
      title,
      slug: slugify(title),
      parent: budget.id,
      avatar
    }

    const response = saveBudget(simulation);
    
    if ( response.status === "success" ){
      onNewSimulationAdded();
    } else {
      console.log(response.message);
    }
  }

  return (
    <Modal
      title="Add New Simulation"
      isOpen={true}
      setIsOpen={onCancelSimulation}
      action={{ 
        label: "Add New Simulation",
        actionFn: saveSimulation,
        cancel: "Cancel",
        cancelFn: onCancelSimulation
      }}
    >
      <div className="mb-5 fv-row fv-plugins-icon-container">
        <label className="required fs-5 fw-semibold mb-2">Name</label>
        <input type="text" value={title} onChange={(e) => setTitle( e.target.value )} className="form-control form-control-solid" placeholder="Simulation Name" name="name" />
        <div className="fv-plugins-message-container invalid-feedback"></div>
      </div>

      <div className="mb-5 fv-row fv-plugins-icon-container">
        <label className="fs-5 fw-semibold mb-2">Branched From</label>
        <input disabled={true} type="text" value={budget.title} className="disabled form-control form-control-solid" name="branch" />
        <div className="fv-plugins-message-container invalid-feedback"></div>
      </div>
    </Modal>
  );
}