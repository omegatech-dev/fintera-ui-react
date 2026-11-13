import Login from "../../components/signin";
import RightSide from "../../components/signin/RightSide";

function SignIn() {
  return (
    <section className="min-h-screen bg-surface-2">
      <div className="flex min-h-screen flex-col items-stretch lg:flex-row">
        <div className="flex w-full flex-1 items-center justify-center px-4 py-10">
          <Login />
        </div>
        <RightSide />
      </div>
    </section>
  );
}

export default SignIn;
