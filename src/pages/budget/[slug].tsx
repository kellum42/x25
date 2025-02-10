import React, { useContext, useEffect, useState } from "react"
import type { PageProps } from "gatsby"
import { Link } from "gatsby"

import { BudgetContext, BudgetContextProvider } from "../../contexts/budgetContext"
import { ChartWidget } from "../../components/widgets/chart-widget"
import { Layout } from "../../components/layout"
import { WeeklyWidget } from "../../components/widgets/weekly-widget"
import { SummaryWidget } from "../../components/widgets/summary-widget"
import { SimulationsWidget } from "../../components/widgets/simulations-widget"
import { UpdateBudget } from "../../components/modals/update-budget"
import { SimulationsSummaryWidget } from "../../components/widgets/simulation-summary-widget"
import { SimulationChangesWidget } from "../../components/widgets/simulation-changes-widget"
import { Menu, MenuItem } from "../../components/floating-menu"
import { Modal } from "../../components/modals/modal"
import { NoteDrawer } from "../../components/drawers/note"

// TODO: Model dashboards -> logistics -> top selling categories for top expenses widget
//  - Title doesn't refresh when arriving here from clicking on simulation url.
//  - Remove simulations widget on simulations

const BudgetDashboard: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { budget, updateBudget, error, convertToBudget, addNote, deleteNote } = context;

  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [isConvertingSim, setIsConvertingSim] = useState<boolean>(false);
  const [isShowingNotes, setIsShowingNotes] = useState<boolean>(false);

  const isSimulation = budget?.parent !== undefined;

  const convertSimulationToBudget = () => {
    convertToBudget();
    setIsConvertingSim(false);

    if (error) {
      console.log(error);
    }
  }

  // const notes = [
  //   {body: "How likely are you to recommend our company to your friends and family?", date: "5/15/25 8:02pm"},
  //   {body: "Not at all good brother.", date: "5/15/25 8:05pm"}
  // ]

  return (
    budget ?
      <div>
        <div className="d-flex flex-row flex-stack">
          <div>
            <div className="d-flex flex-row align-items-center">
              <h1 className="text-dark fw-bold mb-0 fs-2 me-1">{budget.title}</h1>
              {budget.notes && budget.notes.length > 0 && <span className="badge badge-primary fs-7 mb-6">{budget.notes.length}</span>}
              <Menu label="">
                <MenuItem label={`Edit ${isSimulation ? 'Simulation' : 'Budget'}`} onClick={() => setIsEditingBudget(true)} />
                <MenuItem label="View Notes" onClick={() => { setIsShowingNotes(true) }} />
                {isSimulation && <MenuItem label="Convert to Budget" onClick={() => setIsConvertingSim(true)} />}
              </Menu>
            </div>
            <ul className="breadcrumb fw-semibold fs-base my-1 mt-4">
              <li className="breadcrumb-item text-muted">
                <Link to="/" className="text-muted text-hover-primary">Home</Link>
              </li>
              <li className="breadcrumb-item text-dark">Dashboard</li>
            </ul>
          </div>
          <div className="d-flex align-items-center flex-nowrap text-nowrap py-1">
            <Link
              to={`/budget/${budget.id}/items`}
              className="btn bg-body btn-color-gray-700 btn-active-primary me-4 w-125px">
              View Items
            </Link>
            <Menu label="" rootMenuButton={
              <button
                className="btn btn-primary w-125px form-select"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23FFFFFF' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e")`
                }}
              >
                New
              </button>
            }>
              <MenuItem label="Item" />
              <MenuItem label="Note" />
              <MenuItem label="Simulation" />
            </Menu>

          </div>
        </div>
        <div className="mt-8">
          {isSimulation &&
            <div className="row">
              <div className="col-md-4">
                <SimulationsSummaryWidget />
              </div>
              <div className="col-md-8">
                <ChartWidget height="300px" />
              </div>
              <div className="col-12">
                <SimulationChangesWidget />
              </div>
            </div>
          }
          {!isSimulation &&
            <div className="row">
              <div className="col-lg-6">
                <SummaryWidget />
                <ChartWidget />
                <div className="d-none d-lg-block">
                  <SimulationsWidget />
                </div>
              </div>
              <div className="col-lg-6">
                <WeeklyWidget />
                <div className="d-lg-none">
                  <SimulationsWidget />
                </div>
              </div>
            </div>
          }
        </div>
        {isEditingBudget &&
          <UpdateBudget
            mode="update"
            onReadyToUpdate={(title, startingBalance, startDate) => {
              updateBudget({ title, startingBalance, startDate });
              setIsEditingBudget(false);
            }}
            onCancel={() => setIsEditingBudget(false)}
            defaults={{
              title: budget.title,
              amount: budget.startingBalance.toString(),
              startDate: budget.startDate.format("YYYY-MM-DD")
            }}
          />
        }
        {isSimulation && isConvertingSim &&
          <Modal
            title="Convert Simulation"
            isOpen={true}
            setIsOpen={() => setIsConvertingSim(false)}
            action={{
              label: "Convert",
              actionFn: () => { convertSimulationToBudget() },
              cancel: "Cancel"
            }}
          >
            <p>Are you sure you want to convert this simulation to a budget? This cannot be undone. </p>
          </Modal>
        }
        {isShowingNotes && <div style={{ zIndex: 109 }} className="drawer-overlay" onClick={() => { setIsShowingNotes(false) }}></div>}
        <NoteDrawer open={isShowingNotes} notes={budget.notes} save={addNote} error={error} deleteNote={deleteNote} />
      </div>
      :
      <></>
  )
}

const BudgetBySlugPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  // useEffect(() => {
  //   console.log("SLUG CHANGED ON PAGE");
  // }, [slug])

  return (
    <Layout>
      <BudgetContextProvider slug={slug}>
        <BudgetDashboard />
      </BudgetContextProvider>
    </Layout>
  )
}

export default BudgetBySlugPage;
