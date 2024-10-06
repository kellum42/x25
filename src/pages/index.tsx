import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import {wrapper, header} from '../components/index.module.css'

// TODO:
//  - Get popup on budget cards working
//  - Ensure it looks good on mobile
// - Break out budget card to its own file

const IndexPage: React.FC<PageProps> = () => {
  return (
    <div>
      <div className={header}>
        <img style={{ height: "32px" }} src={'/img/logo-compact-craft.svg'} />
      </div>
      <div className={wrapper}>
        <h1 className="text-dark fw-bold my-1 fs-2">My Budgets</h1>
        <div className="row g-6 g-xl-9">
          

        <div className="col-sm-6 col-xl-4">
										{/* begin::Card */} 
										<div className="card h-100">
											{/* begin::Card header */} 
											<div className="card-header flex-nowrap border-0 pt-9">
												{/* begin::Card title */} 
												<div className="card-title m-0">
													{/* begin::Icon */} 
													<div className="symbol symbol-45px w-45px bg-light me-5">
														<img src="/img/twitch.svg" alt="image" className="p-3" />
													</div>
													{/* end::Icon */} 
													{/* begin::Title */} 
													<a href="#" className="fs-4 fw-semibold text-hover-primary text-gray-600 m-0">Twitch Posts</a>
													{/* end::Title */} 
												</div>
												{/* end::Card title */} 
												{/* begin::Card toolbar */} 
												<div className="card-toolbar m-0">
													{/* begin::Menu */} 
													<button type="button" className="btn btn-clean btn-sm btn-icon btn-icon-primary btn-active-light-primary me-n3" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
														{/* begin::Svg Icon | path: icons/duotune/general/gen024.svg */} 
														<span className="svg-icon svg-icon-3 svg-icon-primary">
															<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
																<g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
																	<rect x="5" y="5" width="5" height="5" rx="1" fill="currentColor"></rect>
																	<rect x="14" y="5" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
																	<rect x="5" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
																	<rect x="14" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
																</g>
															</svg>
														</span>
														{/* end::Svg Icon */} 
													</button>
													{/* begin::Menu 3 */} 
													<div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px py-3" data-kt-menu="true">
														{/* begin::Heading */} 
														<div className="menu-item px-3">
															<div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
														</div>
														{/* end::Heading */} 
														{/* begin::Menu item */} 
														<div className="menu-item px-3">
															<a href="#" className="menu-link px-3">Create Invoice</a>
														</div>
														{/* end::Menu item */} 
														{/* begin::Menu item */} 
														<div className="menu-item px-3">
															<a href="#" className="menu-link flex-stack px-3">Create Payment
															<i className="fas fa-exclamation-circle ms-2 fs-7" data-bs-toggle="tooltip" aria-label="Specify a target name for future usage and reference" data-kt-initialized="1"></i></a>
														</div>
														{/* end::Menu item */} 
														{/* begin::Menu item */} 
														<div className="menu-item px-3">
															<a href="#" className="menu-link px-3">Generate Bill</a>
														</div>
														{/* end::Menu item */} 
														{/* begin::Menu item */} 
														<div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end">
															<a href="#" className="menu-link px-3">
																<span className="menu-title">Subscription</span>
																<span className="menu-arrow"></span>
															</a>
															{/* begin::Menu sub */} 
															<div className="menu-sub menu-sub-dropdown w-175px py-4">
																{/* begin::Menu item */} 
																<div className="menu-item px-3">
																	<a href="#" className="menu-link px-3">Plans</a>
																</div>
																{/* end::Menu item */} 
																{/* begin::Menu item */} 
																<div className="menu-item px-3">
																	<a href="#" className="menu-link px-3">Billing</a>
																</div>
																{/* end::Menu item */} 
																{/* begin::Menu item */} 
																<div className="menu-item px-3">
																	<a href="#" className="menu-link px-3">Statements</a>
																</div>
																{/* end::Menu item */} 
																{/* begin::Menu separator */} 
																<div className="separator my-2"></div>
																{/* end::Menu separator */} 
																{/* begin::Menu item */} 
																<div className="menu-item px-3">
																	<div className="menu-content px-3">
																		{/* begin::Switch */} 
																		<label className="form-check form-switch form-check-custom form-check-solid">
																			{/* begin::Input */} 
																			<input className="form-check-input w-30px h-20px" type="checkbox" value="1" checked="checked" name="notifications" />
																			{/* end::Input */} 
																			{/* end::Label */} 
																			<span className="form-check-label text-muted fs-6">Recuring</span>
																			{/* end::Label */} 
																		</label>
																		{/* end::Switch */} 
																	</div>
																</div>
																{/* end::Menu item */} 
															</div>
															{/* end::Menu sub */} 
														</div>
														{/* end::Menu item */} 
														{/* begin::Menu item */} 
														<div className="menu-item px-3 my-1">
															<a href="#" className="menu-link px-3">Settings</a>
														</div>
														{/* end::Menu item */} 
													</div>
													{/* end::Menu 3 */} 
													{/* end::Menu */} 
												</div>
												{/* end::Card toolbar */} 
											</div>
											{/* end::Card header */} 
											{/* begin::Card body */} 
											<div className="card-body d-flex flex-column px-9 pt-6 pb-8">
												{/* begin::Heading */} 
												<div className="fs-2tx fw-bold mb-3">$500.00</div>
												{/* end::Heading */} 
												{/* begin::Stats */} 
												<div className="d-flex align-items-center flex-wrap mb-5 mt-auto fs-6">
													{/* SVG file not found: icons/duotune/arrows/Up-right.svg */} 
													{/* begin::Number */} 
													<div className="fw-bold text-danger me-2">+40.5%</div>
													{/* end::Number */} 
													{/* begin::Label */} 
													<div className="fw-semibold text-gray-400">more impressions</div>
													{/* end::Label */} 
												</div>
												{/* end::Stats */} 
												{/* begin::Indicator */} 
												<div className="d-flex align-items-center fw-semibold">
													<span className="badge bg-light text-gray-700 px-3 py-2 me-2">0.5%</span>
													<span className="text-gray-400 fs-7">MRR</span>
													<i className="fas fa-exclamation-circle fs-7 ms-2" data-bs-toggle="tooltip" aria-label="Recurring" data-kt-initialized="1"></i>
												</div>
												{/* end::Indicator */} 
											</div>
											{/* end::Card body */} 
										</div>
										{/* end::Card */} 
									</div>
    

        </div>
      </div>
    </div>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Custom Title</title>
