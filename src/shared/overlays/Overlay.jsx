import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";

function Overlay({ handleClick }) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      className="aside-overlay motion-fade-in fixed left-0 top-0 block h-full w-full cursor-pointer border-0 bg-black/30 p-0 lg:hidden"
      onClick={handleClick}
      aria-label={t("header.closeSidebar")}
    />
  );
}

Overlay.propTypes = {
  handleClick: PropTypes.func,
};

export default Overlay;
