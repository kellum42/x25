import React, { FC, ReactNode, useState, useContext } from "react"

import { svgs } from "../../utils/svg";
import { AddNewSimulation } from "../modals/add-new-simulation";
import { Budget } from "../../utils/schemas";
import { BudgetContext } from "../../contexts/budgetContext";
import { getSimulationsForBudget } from "../../utils/localStorage";
import { Link } from "gatsby";

// TODO:
//  - Reload widget on new simulation added.

export const SimulationsWidget: FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget } = context;

  const [newSim, setNewSim] = useState<Budget | null>(null);

  const onNewSimulationAdded = () => {
    console.log("Added new simulation");
    setNewSim(null);
  };

  const simulations = getSimulationsForBudget(budget?.id);

  return (
    <div className="card card-flush p-10 d-block mb-6">
      <div className="px-0">
        <h3 className="m-0 text-gray-900">Simulations</h3>
      </div>
      <div className="pt-10">
        <div className="pb-5 position-relative">
          {simulations.status === "success" && simulations.sims.length === 0 && 
            <p className="text-muted">You currently have no simulations. Add a new simulation today and start predicting your budget.</p>
          }
          {simulations.status === "success" && simulations.sims.map(sim => (
            <div className="d-flex flex-stack mb-6">
              <div className="d-flex align-items-center me-2">
                <div className="symbol symbol-45px me-5">
                  <span className={`symbol-label bg-${sim.avatar?.bg}`}>
                    <span className={`svg-icon svg-icon-2 svg-icon-${sim.avatar?.color}`}>
                      {sim.avatar !== undefined && svgs[sim.avatar.svg]}
                    </span>
                  </span>
                </div>
                <div>
                  <Link to={`/budget/${sim.slug}`} className="fs-5 text-gray-800 text-hover-primary fw-bolder">{sim.title}</Link>
                  {/* <a href="#" className="fs-5 text-gray-800 text-hover-primary fw-bolder">{sim.title}</a> */}
                  <div className="fs-7 text-gray-400 fw-semibold mt-1">
                    { sim.createDate && `Created ${sim.createDate.format('MMM D, YYYY')}`}.
                    0 changes
                    </div>
                </div>
              </div>
              <Link to={`/budget/${sim.slug}`} className="btn btn-icon btn-light btn-sm">
                <span className="svg-icon svg-icon-4 svg-icon-gray-400">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect opacity="0.5" x="18" y="13" width="13" height="2" rx="1" transform="rotate(-180 18 13)" fill="currentColor"></rect>
                    <path d="M15.4343 12.5657L11.25 16.75C10.8358 17.1642 10.8358 17.8358 11.25 18.25C11.6642 18.6642 12.3358 18.6642 12.75 18.25L18.2929 12.7071C18.6834 12.3166 18.6834 11.6834 18.2929 11.2929L12.75 5.75C12.3358 5.33579 11.6642 5.33579 11.25 5.75C10.8358 6.16421 10.8358 6.83579 11.25 7.25L15.4343 11.4343C15.7467 11.7467 15.7467 12.2533 15.4343 12.5657Z" fill="currentColor"></path>
                  </svg>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
      <div>
        <button
          className="btn btn-primary"
          onClick={() => {
            if (budget !== undefined) {
              setNewSim(budget);
            }
          }}
        >
          Add New Simulation
        </button>
      </div>
      {newSim && budget &&
        <AddNewSimulation
          budget={budget}
          onCancelSimulation={() => setNewSim(null)}
          onNewSimulationAdded={onNewSimulationAdded}
        />
      }
    </div>
  );
}