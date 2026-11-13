import PropTypes from "prop-types";

function Overlay({ handleClick }) {
  return (
    <div
      style={{ zIndex: "25" }}
      className="aside-overlay motion-fade-in fixed left-0 top-0 block h-full w-full cursor-pointer bg-black/30 lg:hidden"
      onClick={handleClick}
      aria-label="Close sidebar"
    ></div>
  );
}

Overlay.propTypes = {
  handleClick: PropTypes.func,
};

export default Overlay;
