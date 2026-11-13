import { Outlet } from "react-router-dom";

function Financing({ children }) {

  return (
    <main className="w-full bg-canvas px-6 pb-6 page-shell xl:px-[48px] xl:pb-[48px]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col space-y-10 2xl:flex-row 2xl:space-x-11 2xl:space-y-0">
        <div className="w-full 2xl:flex-1">
          {children}
          <Outlet />
        </div>
      </div>
    </main>
  );
}

export default Financing;
