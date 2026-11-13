import PropTypes from "prop-types";
import HeaderBar from "./HeaderBar";

function HeaderOne({ handleSidebar, sidebarOpen, onOpenShortcuts }) {
  return (
    <HeaderBar
      handleSidebar={handleSidebar}
      sidebarOpen={sidebarOpen}
      onOpenShortcuts={onOpenShortcuts}
    />
  );
}

HeaderOne.propTypes = {
  handleSidebar: PropTypes.func,
  sidebarOpen: PropTypes.bool,
  onOpenShortcuts: PropTypes.func,
};

export default HeaderOne;
