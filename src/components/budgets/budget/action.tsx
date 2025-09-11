import React, { useContext, useEffect, useState } from "react"
import { Link,HeadFC, type PageProps } from "gatsby"
import { Layout } from "../../layout"
import { BudgetContext, BudgetContextProvider } from "../../../deprecated/budgetContext"

import dayjs, { Dayjs } from "dayjs"
import { getFriday, truncate } from "../../../utils/util"
import { VerifyOccurrenceRow } from "../../verify-occurrence-row"
import { x25log } from "../../../utils/log"
import { Schema } from "../../../utils/types"
import { SeeMore } from "../../see-more"
import { Occurrence, useOccurrences } from "../../../hooks/useOccurrences"

const Actions = () => {
  const context = useContext(BudgetContext);

  if (!context) {
    throw new Error("Calling Budget Context from outside of provider.");
  }

  const { data, getVerifications } = context;
  const today = dayjs();
  const friday = getFriday(today);
  const endOfWeek = friday.add(6, 'days');
  const threeMonthsAgo: Dayjs = today.subtract(3, 'months');
  const { getOccurrences, addVerifications, deleteVerification, populateMapThrough } = useOccurrences();

  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // loads verifications.
  const load = async () => {
    x25log.d("[load][action.tsx]: Loading verifications for action page data.");

    // include verifications.
    // get verifications through end of week.
    let result = await getVerifications(threeMonthsAgo, endOfWeek);
    if (result.status === "success") {
      populateMapThrough(endOfWeek);
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
        <p>Loading actions data...</p> :
        <>
          <div>
            <div className="d-md-flex flex-stack">
              <div>
                <div className="d-flex flex-row align-items-center">
                  <h1 className="text-dark fw-bold mb-0 fs-2 me-1">Actions</h1>
                </div>
                <ul className="breadcrumb fw-semibold fs-base my-1 mt-2">
                  <li className="breadcrumb-item text-muted">
                    <Link to="/" className="text-muted text-hover-primary">Home</Link>
                  </li>
                  <li className="breadcrumb-item text-muted">
                    <Link to={`/budget/${data.documentId}`} className="text-muted text-hover-primary">{truncate(data.title, 20)}</Link>
                  </li>
                  <li className="breadcrumb-item text-dark">Actions</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <div className="row">
              <div className="col-lg-12">
                <div className="card mb-6">
                  <div className="p-8 pb-2">
                    <div className="">
                      <h3 className="m-0 text-gray-900">Missing Actions</h3>
                      <MissingActions
                        label="This week"
                        accent="warning"
                        occurrences={getOccurrences(friday, endOfWeek).filter(occ => occ.verification === undefined)}
                        addVerifications={addVerifications}
                        deleteVerification={deleteVerification}
                      // onVerify={addVerifications}
                      // delete
                      // onVerify={onVerify}
                      // onUnverify={onUnverify}
                      />
                      <MissingActions
                        label="Last 3 months"
                        accent="danger"
                        occurrences={getOccurrences(threeMonthsAgo, dayjs(friday.subtract(1, 'day'))).filter(occ => occ.verification === undefined).sort((a, b) => a.date.isBefore(b.date, 'date') ? 1 : -1)}
                        addVerifications={addVerifications}
                        deleteVerification={deleteVerification}
                      // onVerify={onVerify}
                      // onUnverify={onUnverify}
                      />
                      <RecentActions />
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


type MissingActionsProps = {
  label: string,
  accent: "warning" | "danger",
  occurrences: Occurrence[],
  addVerifications: (verification: Schema<"verification">[]) => void,
  deleteVerification: (verification: Schema<"verification">) => void
  // onVerify: (item: string, date: Dayjs, amount: number) => Promise<boolean>
  // onUnverify: (verification: Schema<"verification">) => Promise<boolean>
}

const MissingActions: React.FC<MissingActionsProps> = (props) => {
  const [occs, setOccs] = useState<Occurrence[]>([]);
  const { addVerifications, deleteVerification } = props;

  useEffect(() => {
    setOccs(props.occurrences);
  }, [props.occurrences])

  const _unaccountedMoney = (): number | null => {
    let sum: number | null = 0;
    occs.map(occ => {
      if (occ.balance === undefined || sum === null) {
        sum = null;
      } else {
        sum += Math.abs(occ.verification?.amount ?? occ.item.amount);
      }
    })
    return sum;
  }

  const unaccountedMoney = _unaccountedMoney();

  return (
    <div>
      <div className="d-flex flex-row justify-content-between mt-8">
        <div className="d-flex flex-row">
          <div className="fw-bold">{props.label}</div>
          <span className={`badge badge-light-${props.accent} fs-6 fw-bolder ms-2`}>{occs.length >= 100 ? "100+" : occs.length}</span>
        </div>
        <div className="text-muted">{unaccountedMoney === null ? "--" : "$" + unaccountedMoney.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
      </div>
      <div>
        <SeeMore
          items={occs.map((occ, i) => {
            return <VerifyOccurrenceRow
              key={i}
              occ={occ}
              onVerified={(v) => { addVerifications([v]) }} // updates map
              onUnVerified={(v) => { deleteVerification(v) }} // updates map
            // onVerify={props.onVerify}
            // onUnverify={props.onUnverify}
            />
          })}
        />
      </div>
    </div>
  )
}

type RecentActionsProps = {

}
const RecentActions: React.FC<RecentActionsProps> = (props) => {
  // const refresh
  return <></>
}

// const Actions: React.FC<PageProps & { slug: string }> = (props) => {
//   return (
//     <Layout budget={props.slug} uri={props.uri}>
//       <BudgetContextProvider slug={props.slug}>
//         <Actions />
//       </BudgetContextProvider>
//     </Layout>
//   )
// }

export default Actions;

// export const Head: HeadFC = () => (
//   <>
//     <title>Action</title>
//     <body className="aside-fixed aside-default-enabled"/>
//   </>
// )