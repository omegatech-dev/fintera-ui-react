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
    <div className="flex w-full max-w-[380px] flex-col gap-4">
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
