import React, { useContext, useEffect, useState } from "react"
import type { PageProps } from "gatsby"
import { Link } from "gatsby"

import { BudgetContext, BudgetContextProvider } from "../../contexts/budgetContext"
import { ChartWidget } from "../../components/widgets/chart-widget"
import { Layout } from "../../components/layout"
import { WeeklyWidget } from "../../components/widgets/weekly-widget"
import { SummaryWidget } from "../../components/widgets/summary-widget"
// import { SimulationsWidget } from "../../components/widgets/simulations-widget"
// import { SimulationsSummaryWidget } from "../../components/widgets/simulation-summary-widget"
// import { SimulationChangesWidget } from "../../components/widgets/simulation-changes-widget"
import { ActionNeededWidget } from "../../components/widgets/action-needed-widget"
import { x25log } from "../../utils/log"
import { getFriday } from "../../utils/util"
import { Dayjs } from "dayjs"
import { useOccurrences } from "../../hooks/useOccurrences"

// TODO: Model dashboards -> logistics -> top selling categories for top expenses widget
//  - Title doesn't refresh when arriving here from clicking on simulation url.
//  - Remove simulations widget on simulations

const Dashboard: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { data, date, getVerifications } = context;
  
  const [loadedVerifications, setLoadedVerifications] = useState<boolean>(false);

  const isSimulation = data?.parent !== undefined;

  const friday = getFriday(date);
  const endOfWeek = friday.add(6, 'days');
  const j1 = date.set('month', 0).set('date', 1);
  const eoy = j1.add(365, 'days');
  // const lower: Dayjs = j1.isBefore(data.startDate) ? j1 : data.startDate; 
  const upper: Dayjs = endOfWeek.isBefore(eoy, 'date') ? eoy : endOfWeek;
  const { getBalance, getOccurrences, addVerifications, deleteVerification, updateTo } = useOccurrences();

  const loadData = async () => {
    x25log.d("[useEffect][slug.tsx]: Loading verifications for dashboard data.");
    
    // include verifications.
    // get verifications through end of week.
    let result = await getVerifications(data.startDate, endOfWeek);
    if ( result.status === "success" ){
      updateTo(upper);
      addVerifications(result.data);
    }
    setLoadedVerifications(true);
  }

  const getChartdata = (): {date: string, balance: number|null}[] => {
    return Array(365).fill(0).map((_, i) => {
      const currentDate = j1.add(i, 'days');
      return {
        date: currentDate.format("M/D/YY"),
        balance: data.startDate.isAfter(currentDate) ? null : getBalance(currentDate, "end", data.startAmount)
      }
    })
  }

  useEffect(() => {
    loadData();
  }, [])


  return (
    <div>
      { !loadedVerifications ?
        (<p>Loading dashboard data...</p>) :
        (<div>
          <div className="d-md-flex flex-stack">
            <div>
              <div className="d-flex flex-row align-items-center">
                <h1 className="text-dark fw-bold mb-0 fs-2 me-1">{data.title}</h1>
                {/* {budget.notes && budget.notes.length > 0 && <span className="badge badge-primary fs-7 mb-6">{budget.notes.length}</span>} */}
                {/* <Menu label="">
                  <MenuItem label={`Edit ${isSimulation ? 'Simulation' : 'Budget'}`} onClick={() => setIsEditingBudget(true)} />
                  <MenuItem label="View Notes" onClick={() => { setIsShowingNotes(true) }} />
                  {isSimulation && <MenuItem label="Convert to Budget" onClick={() => setIsConvertingSim(true)} />}
                </Menu> */}
              </div>
              <ul className="breadcrumb fw-semibold fs-base my-1 mt-2">
                <li className="breadcrumb-item text-muted">
                  <Link to="/" className="text-muted text-hover-primary">Home</Link>
                </li>
                <li className="breadcrumb-item text-dark">Dashboard</li>
              </ul>
            </div>
            {/* <div className="d-flex align-items-center flex-nowrap text-nowrap my-6 my-md-0">
              <Link
                to={`/budget/${data.documentId}/items`}
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
            </div> */}
          </div>
          <div className="mt-8">
            {isSimulation &&
              <div className="row">
                <div className="col-md-4">
                  {/* <SimulationsSummaryWidget /> */}
                </div>
                <div className="col-md-8">
                  {/* <ChartWidget height="300px" /> */}
                </div>
                <div className="col-12">
                  {/* <SimulationChangesWidget /> */}
                </div>
              </div>
            }
            {!isSimulation &&
              <div className="row">
                <div className="col-lg-12">
                  <SummaryWidget balance={getBalance(date, "end", data.startAmount)} />
                  <ActionNeededWidget 
                    date={date} 
                    occurrences={getOccurrences(date.subtract(3, 'month'), date).filter( occ => occ.verification === undefined )}/>
                  <ChartWidget 
                    title="Balance" 
                    subtitle={date.year().toString()} 
                    data={getChartdata()} 
                  />
                  <div className="d-none d-lg-block">
                    {/* <SimulationsWidget /> */}
                  </div>
                </div>
                <div className="col-lg-6">
                  <WeeklyWidget 
                    occurrences={getOccurrences(friday, friday.add(6, 'day'))} 
                    startBal={getBalance(friday, "start", data.startAmount) ?? undefined} 
                    range={`${friday.format("MMM DD, YYYY")} - ${friday.add(6, 'day').format("MMM DD, YYYY")}`}
                    addVerification={addVerifications}
                    deleteVerification={deleteVerification}
                  />
                  <div className="d-lg-none">
                    {/* <SimulationsWidget /> */}
                  </div>
                </div>
              </div>
            }
          </div>
          {/* {isEditingBudget &&
            <UpdateBudget
              mode="update"
              onReadyToUpdate={(title, startingBalance, startDate) => {
                // updateBudget({ title, startingBalance, startDate });
                // setIsEditingBudget(false);
              }}
              onCancel={() => setIsEditingBudget(false)}
              defaults={{
                title: data.title ?? "",
                amount: (data.startAmount ?? "").toString(),
                startDate: dayjs(data.startDate).format("YYYY-MM-DD")
              }}
            />
          } */}
          {/* {isSimulation && isConvertingSim &&
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
          } */}
          {/* {isShowingNotes && <div style={{ zIndex: 109 }} className="drawer-overlay" onClick={() => { setIsShowingNotes(false) }}></div>} */}
          {/* <NoteDrawer open={isShowingNotes} notes={budget.notes} save={addNote} error={error} deleteNote={deleteNote} /> */}
          {/* <NoteDrawer open={isShowingNotes} notes={budget.notes} save={addNote} deleteNote={deleteNote} /> */}
        </div>)
      }
    </div>
  )
}

const BudgetPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  // useEffect(() => {
  //   console.log("SLUG CHANGED ON PAGE");
  // }, [slug])

  // Do fetching and checking here.
  // Pass variables to contexts here.


  return (
    <Layout>
      <BudgetContextProvider slug={slug}>
        {/* <OccurrencesContextProvider end={dayjs()}> */}
        <Dashboard />
        {/* </OccurrencesContextProvider> */}
      </BudgetContextProvider>
    </Layout>
  )
}

export default BudgetPage;
