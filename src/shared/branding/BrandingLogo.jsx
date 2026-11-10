import { useState } from "react";
import PropTypes from "prop-types";
import { useBranding } from "../../contexts/branding";
import { getBundledLogo, resolveBrandingAssetUrl } from "./brandingUtils";

/**
 * Renders the configured application logo with bundled fallbacks.
 *
 * Resolution order for `src`:
 *   1. Custom logo for the variant (dark falls back to the light custom logo
 *      when no dark variant is configured).
 *   2. Bundled asset (`logo-color`/`logo-white`, or the `logo-short` pair for
 *      the collapsed sidebar).
 *
 * If the custom logo fails to load (e.g. the stored file was removed), the
 * bundled asset is shown instead.
 */
function BrandingLogo({ variant = "light", short = false, className = "", alt, ...imgProps }) {
  const { branding } = useBranding();

  const customPath =
    variant === "dark" ? branding.logo_dark_url || branding.logo_url : branding.logo_url;
  const customSrc = customPath ? resolveBrandingAssetUrl(customPath) : "";
  const bundledSrc = getBundledLogo(variant, short);

  // Track which source failed; a changed source resets automatically
  const [failedSrc, setFailedSrc] = useState(null);
  const failed = Boolean(customSrc) && failedSrc === customSrc;

  const src = !customSrc || failed ? bundledSrc : customSrc;

  return (
    <img
      src={src}
      className={className}
      alt={alt || branding.app_name}
      onError={() => {
        if (customSrc) setFailedSrc(customSrc);
      }}
      {...imgProps}
    />
  );
}

BrandingLogo.propTypes = {
  variant: PropTypes.oneOf(["light", "dark"]),
  short: PropTypes.bool,
  className: PropTypes.string,
  alt: PropTypes.string,
};

export default BrandingLogo;
