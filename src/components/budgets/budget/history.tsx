import React, { useContext, useEffect, useState } from "react"
import { HeadFC, Link, type PageProps } from "gatsby"
import { Layout } from "../../layout"
import { BudgetContext, BudgetContextProvider } from "../../../deprecated/budgetContext"
import { asCurrency, truncate } from "../../../utils/util"
import { x25log } from "../../../utils/log"
import { Occurrence, useOccurrences } from "../../../hooks/useOccurrences"
import { ChartWidget } from "../../widgets/chart-widget"
import { VerifyOccurrenceRow } from "../../verify-occurrence-row"
import { SeeMore } from "../../see-more"

// TODO: - Implement paging with verification data pull.

const History: React.FC = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { data, getVerifications, date } = context;
  const { populateMapThrough, addVerifications, getBalance, deleteVerification, getOccurrences } = useOccurrences();
  const lastWeek = date.subtract(1, 'week');
  const lastMonth = date.subtract(1, 'month');
  const lastQuarter = date.subtract(3, 'months');
  const lastYear = date.subtract(1, 'year');
  const lowerBound = data.startDate.isAfter(lastYear, 'date') ? data.startDate : lastYear;

  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const occurrences: Occurrence[] = getOccurrences(lowerBound, date, "desc");

  const getChartdata = (): { date: string, balance: number | null }[] => {
    const days = date.diff(lowerBound, 'days');

    x25log.d("[getChartData][history.tsx]: Graphing balances for %d days between %s and %s.", days, lowerBound.format("YYYY-MM-DD"), date.format("YYYY-MM-DD"));

    return Array(days).fill(0).map((_, i) => {
      const currentDate = lowerBound.add(i, 'days');
      return {
        date: currentDate.format("M/D/YY"),
        balance: getBalance(currentDate, "end")
      }
    })
  }

  // loads verifications.
  const load = async () => {
    x25log.d("[load][history.tsx]: Loading verifications for history page data.");

    // include verifications.
    let result = await getVerifications(data.startDate, date);
    if (result.status === "success") {
      populateMapThrough(date);
      addVerifications(result.data);
    }
    setHasLoaded(true);
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <>
      {!hasLoaded ?
        <p>Loading history data...</p> :
        <>
          <div>
            <div className="d-md-flex flex-stack">
              <div>
                <div className="d-flex flex-row align-items-center">
                  <h1 className="text-dark fw-bold mb-0 fs-2 me-1">History</h1>
                </div>
                <ul className="breadcrumb fw-semibold fs-base my-1 mt-2">
                  <li className="breadcrumb-item text-muted">
                    <Link to="/" className="text-muted text-hover-primary">Home</Link>
                  </li>
                  <li className="breadcrumb-item text-muted">
                    <Link to={`/budget/${data.documentId}`} className="text-muted text-hover-primary">{truncate(data.title, 20)}</Link>
                  </li>
                  <li className="breadcrumb-item text-dark">History</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="row">
              <div className="col-lg-12">
                <div className="card mb-6">
                  <div className="p-4 pb-2">
                    <div className="">
                      <h3 className="mb-6 text-gray-900">Snapshot</h3>
                      <p className="text-muted">Current Balance</p>
                      <h3 className="fw-bold">{asCurrency(getBalance(date, "end"))}</h3>

                      <div className="my-8 fw-semibold">
                        <div className="fs-6 d-flex justify-content-between my-4">
                          <div className="">Last week</div>
                          <div className="d-flex">{asCurrency(getBalance(lastWeek, "end"))}</div>
                        </div>
                        <div className="separator separator-dashed"></div>

                        <div className="fs-6 d-flex justify-content-between my-4">
                          <div className="">Last month</div>
                          <div className="d-flex">{asCurrency(getBalance(lastMonth, "end"))}</div>
                        </div>
                        <div className="separator separator-dashed"></div>

                        <div className="fs-6 d-flex justify-content-between my-4">
                          <div className="">3 months ago</div>
                          <div className="d-flex">{asCurrency(getBalance(lastQuarter, "end"))}</div>
                        </div>
                      </div>

                      <ChartWidget title="" data={getChartdata()} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2">
            <div className="row">
              <div className="col-lg-12">
                <div className="card mb-6">
                  <div className="p-4 py-6">
                    <div className="">
                      <h3 className="mb-6 text-gray-900">Past Activity</h3>
                      <div>
                        <SeeMore 
                          pageSize={10}
                          items={occurrences.map( (occ,i) => {
                            return <VerifyOccurrenceRow 
                              key={i}
                              occ={occ}
                              onVerified={(v) => { addVerifications([v]) }} // updates map
                              onUnVerified={(v) => { deleteVerification(v) }} // updates map
                              subLabel={asCurrency(occ.balance)}
                              subtitle={occ.date.format("MMM DD, YYYY")}
                            />
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      }
    </>
  )
}

const HistoryPage: React.FC<PageProps & { slug: string }> = (props) => {
  return (
    <Layout budget={props.slug} uri={props.uri}>
      <BudgetContextProvider slug={props.slug}>
        <History />
      </BudgetContextProvider>
    </Layout>
  )
}

export default HistoryPage;

export const Head: HeadFC = () => (
  <>
    <title>History</title>
    <body className="aside-fixed aside-default-enabled" />
  </>
)