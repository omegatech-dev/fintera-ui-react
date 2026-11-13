import { Link } from "react-router-dom";

const inputClass =
  "h-11 w-full rounded-control border border-line-strong bg-surface px-3 text-body-lg text-ink outline-none focus:border-brand focus:ring-0 placeholder:text-ink-3";

function EyeIcon() {
  return (
    <svg
      width="22"
      height="20"
      viewBox="0 0 22 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-ink-3"
    >
      <path
        d="M2 1L20 19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.58445 8.58704C9.20917 8.96205 8.99823 9.47079 8.99805 10.0013C8.99786 10.5319 9.20844 11.0408 9.58345 11.416C9.95847 11.7913 10.4672 12.0023 10.9977 12.0024C11.5283 12.0026 12.0372 11.7921 12.4125 11.417"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.363 3.36506C9.22042 3.11978 10.1082 2.9969 11 3.00006C15 3.00006 18.333 5.33306 21 10.0001C20.222 11.3611 19.388 12.5241 18.497 13.4881M16.357 15.3491C14.726 16.4491 12.942 17.0001 11 17.0001C7 17.0001 3.667 14.6671 1 10.0001C2.369 7.60506 3.913 5.82506 5.632 4.65906"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SignUpForm() {
  return (
    <form action="">
      <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row">
        <input type="text" className={inputClass} placeholder="First name" />
        <input type="text" className={inputClass} placeholder="Last name" />
      </div>
      <div className="mb-4">
        <input type="text" className={inputClass} placeholder="Email" />
      </div>
      <div className="relative mb-6">
        <input type="text" className={inputClass} placeholder="Password" />
        <button
          type="button"
          aria-label="none"
          className="absolute bottom-3 right-3 top-3"
        >
          <EyeIcon />
        </button>
      </div>
      <div className="relative mb-6">
        <input type="text" className={inputClass} placeholder="Confirm Password" />
        <button
          type="button"
          aria-label="none"
          className="absolute bottom-3 right-3 top-3"
        >
          <EyeIcon />
        </button>
      </div>
      <div className="mb-7 flex justify-between">
        <div className="flex items-center gap-x-3">
          <input
            type="checkbox"
            className="h-5 w-5 rounded-md border border-line-strong accent-brand"
            name="remember"
            id="remember"
          />
          <label htmlFor="remember" className="text-body text-ink-2">
            By creating an account, you agreeing to our{" "}
            <span className="text-ink">Privacy Policy,</span> and{" "}
            <span className="text-ink">Electronics Communication Policy</span>.
          </label>
        </div>
      </div>
      <Link
        to="/signin"
        className="flex w-full items-center justify-center rounded-control bg-brand py-3.5 font-bold text-white transition-all hover:bg-brand-strong"
      >
        Sign Up
      </Link>
    </form>
  );
}

export default SignUpForm;
