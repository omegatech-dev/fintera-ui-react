import PropTypes from "prop-types";
import LoginHeader from "./LoginHeader";
import LoginForm from "./LoginForm";
import LoginFooter from "./LoginFooter";

function LeftSide({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  handleSubmit,
  loading,
  apiError,
  setModalOpen
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-surface-2 px-4 py-10">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <LoginHeader />
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          errors={errors}
          handleSubmit={handleSubmit}
          loading={loading}
          apiError={apiError}
          setModalOpen={setModalOpen}
        />
        <LoginFooter />
      </div>
    </div>
  );
}

LeftSide.propTypes = {
  email: PropTypes.string.isRequired,
  setEmail: PropTypes.func.isRequired,
  password: PropTypes.string.isRequired,
  setPassword: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    email: PropTypes.string,
    password: PropTypes.string,
  }).isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  apiError: PropTypes.string,
  setModalOpen: PropTypes.func.isRequired,
};

export default LeftSide;
