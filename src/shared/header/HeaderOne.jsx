import PropTypes from "prop-types";
import HeaderBar from "./HeaderBar";

function HeaderOne({ handleSidebar, sidebarOpen }) {
  return <HeaderBar handleSidebar={handleSidebar} sidebarOpen={sidebarOpen} />;
}

HeaderOne.propTypes = {
  handleSidebar: PropTypes.func,
  sidebarOpen: PropTypes.bool,
};

export default HeaderOne;
