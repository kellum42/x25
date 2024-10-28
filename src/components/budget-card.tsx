import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  useTypeahead
} from "@floating-ui/react";
import React, { FC, useState } from "react";
import { Link } from "gatsby"


// const BudgetCardMenuButton: FC = () => {
//     return (
//         <>
//         <button type="button" className="btn btn-clean btn-sm btn-icon btn-icon-primary btn-active-light-primary me-n3" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
//             {/* begin::Svg Icon | path: icons/duotune/general/gen024.svg */} 
//             <span className="svg-icon svg-icon-3 svg-icon-primary">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">
//                     <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
//                         <rect x="5" y="5" width="5" height="5" rx="1" fill="currentColor"></rect>
//                         <rect x="14" y="5" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
//                         <rect x="5" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
//                         <rect x="14" y="14" width="5" height="5" rx="1" fill="currentColor" opacity="0.3"></rect>
//                     </g>
//                 </svg>
//             </span>
//             {/* end::Svg Icon */} 
//         </button>
//         </>
//     )
// };

const BudgetCardMenu: FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();

  const { floatingStyles, refs, context } = useFloating<HTMLButtonElement>({
    nodeId,
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [
      offset({ mainAxis: 4, alignmentAxis: 0 }),
      flip(),
      shift()
    ],
    whileElementsMounted: autoUpdate
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const {
    getReferenceProps,
    getFloatingProps,
    getItemProps
  } = useInteractions([click, dismiss]);

  return (
    <>
      <FloatingNode id={nodeId}>
        {/* <BudgetCardMenuButton /> */}
        <button
          ref={refs.setReference}
          {...getReferenceProps()}
          // tabIndex={
          //   !isNested ? undefined : parent.activeIndex === item.index ? 0 : -1
          // }
          // role={isNested ? "menuitem" : undefined}
          data-open={isOpen ? "" : undefined}
          // data-nested={isNested ? "" : undefined}
          //data-focus-inside={hasFocusInside ? "" : undefined}
          // className={isNested ? "MenuItem" : "RootMenu"}

          // onFocus(event: React.FocusEvent<HTMLButtonElement>) {
          //     props.onFocus?.(event);
          //     setHasFocusInside(false);
          //     parent.setHasFocusInside(true);
          // }

          //)}
          type="button"
          className="btn btn-clean btn-sm btn-icon btn-icon-primary btn-active-light-primary me-n3" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end"
        >
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

        {/* menu-sub-dropdown menu-sub */}
        {isOpen && (
          <div
            ref={refs.setFloating}
            {...getFloatingProps()}
            style={floatingStyles}
            className="menu menu-column menu-sub-dropdown menu-sub menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px py-3"
            data-kt-menu="true"
          >
            {/* begin::Menu item */}
            <div className="menu-item px-3">
              <a href="#" className="menu-link px-3">Duplicate Budget</a>
            </div>
            {/* end::Menu item */}
          </div>
        )}
      </FloatingNode>
    </>
  )
};

const BudgetCard: FC<{ title: String }> = ({ title }) => {
  return (
    <div className="col-sm-6 col-xl-4">
      <Link to="/budget/12345">
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
              <Link to="/budget/12345" className="fs-4 fw-semibold text-hover-primary text-gray-600 m-0">{title}</Link>
              {/* end::Title */}
            </div>
            {/* end::Card title */}
            {/* begin::Card toolbar */}
            <div className="card-toolbar m-0">
              {/* begin::Menu */}
              <BudgetCardMenu />
            </div>
            {/* end::Card toolbar */}
          </div>
          {/* end::Card header */}
          {/* begin::Card body */}
          <div className="card-body d-flex flex-column px-9 pt-6 pb-8">
            {/* begin::Heading */}
            <div className="fw-semibold text-gray-400 text-gray-400 fs-7">Balance Today:</div>
            <div className="fs-2tx fw-bold mb-3" style={{ color: "#000000" }}>$500.00</div>
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
              <span className="badge bg-light text-gray-700 px-3 py-2 me-2">25 line items</span>
              <span className="text-gray-400 fs-7">MRR</span>
              <i className="fas fa-exclamation-circle fs-7 ms-2" data-bs-toggle="tooltip" aria-label="Recurring" data-kt-initialized="1"></i>
            </div>
            {/* end::Indicator */}
          </div>
          {/* end::Card body */}
        </div>
        {/* end::Card */}
      </Link>
    </div>
  );
};

export default BudgetCard;