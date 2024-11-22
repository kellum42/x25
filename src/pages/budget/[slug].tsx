import React, { FC, useState, useEffect, createContext, ReactNode, useContext } from "react"
import type { PageProps } from "gatsby"
import dayjs, { Dayjs } from "dayjs"

import { BudgetContext, BudgetContextProvider } from "../../contexts/budgetContext"
import { useBudgetDetails, UseBudgetDetails } from "../../hooks/useBudgetDetails"
import { ChartWidget } from "../../components/widgets/chart-widget"
import { Layout } from "../../components/layout"
import { WeeklyWidget } from "../../components/widgets/weekly-widget"
import { BudgetDetailsDatePicker } from "../../components/budget-details-datepicker"
import { calculateBalance, getFriday } from "../../utils/budget"
import { numberOrNull } from "../../utils/util"

// TODO: Add context provider to easily pass variables between components.


const BudgetDashboard: React.FC = () => {
  const context = useContext( BudgetContext );

  if ( !context ){
    throw new Error( "Calling Budget Context from outside of provider." );
  }

  const { budget } = context;

  return (
    <Layout>
      {budget &&
        <div>
          <h1 className="text-dark fw-bold my-1 fs-2">{budget.title}</h1>
          <div className="mt-8">
            <BudgetDetailsDatePicker />
            <ChartWidget />
            <WeeklyWidget />
          </div>
        </div>
      }
    </Layout>
  )
}

const BudgetBySlugPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
  return (
    <Layout>
      <BudgetContextProvider slug={slug}>
        <BudgetDashboard />
      </BudgetContextProvider>
    </Layout>
  )
}

export default BudgetBySlugPage;
