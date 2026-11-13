import { Outlet } from "react-router-dom";

function Financing({ children }) {

  return (
    <main className="w-full xl:px-[48px] px-6 pb-6 xl:pb-[48px] page-shell bg-bgray-50 dark:bg-darkblack-700 ">
      {/* write your code here */}
      <div className="flex 2xl:flex-row 2xl:space-x-11 flex-col space-y-10">
        <div className="2xl:flex-1 w-full">
          {children}
          <Outlet />
        </div>
      </div>
    </main>
  );
}

export default Financing;
