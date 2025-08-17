import React, { useState, useEffect } from "react"
import { Router, RouteComponentProps } from "@reach/router"
import type { HeadFC, PageProps } from "gatsby"
// import { Layout } from "../../components/layout"
import PrivateRoute from "../../components/private-route"
import Actions from "../../components/budgets/budget/action"
// import Dashboard from "../../components/budgets/budget/dashboard"
import { AuthProvider } from "../../contexts/authContext"
// import { BudgetContextProvider } from "../../contexts/budgetContext"
import BudgetList from "../../components/budgets/list"
import Login from "./login"
import useAuth from "../../hooks/useAuth"
import { Layout } from "../../components/layout"


// const BudgetIndexPage: React.FC<PageProps & { slug: string }> = ({ slug }) => {
// return <p>{`Index page for budget: ${slug}`}</p>

const App = () => {
  // console.log(key);

  return (
    // <AuthProvider>
    <Router basepath="/budgets">
      {/* <AuthProvider> */}
      <Login path="/login" />
      {/* </AuthProvider> */}
      {/* <BudgetContextProvider> */}
      {/* <PrivateRoute path="/:slug/action" component={<Actions />} /> */}
      {/* <PrivateRoute path="/details" component={Details} /> */}
      <PrivateRoute path="/" component={BudgetList} />

      {/* </BudgetContextProvider> */}
    </Router>
    // </AuthProvider>

  )
}


export default App;

// export default BudgetIndexPage;

export const Head: HeadFC = () => (
  <>
    <title>Custom Title</title>
    <body className="aside-fixed aside-default-enabled" />
  </>
)