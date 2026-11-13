import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faHome,
  faImage,
} from "@fortawesome/free-solid-svg-icons";
import { useLocale } from "../../../contexts/LocaleContext";
import { mediaUrl } from "./media/mediaFiles";

const SWIPE_THRESHOLD = 40;

export default function ProjectPhotoCarousel({
  photos = [],
  projectName = "",
  coverClassName = "aspect-[16/10]",
  children,
}) {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(null);

  const count = photos.length;
  const hasMultiple = count > 1;

  useEffect(() => {
    setActiveIndex(0);
  }, [photos]);

  const goTo = (index) => {
    if (count === 0) return;
    setActiveIndex(((index % count) + count) % count);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD || !hasMultiple) return;
    goTo(activeIndex + (delta < 0 ? 1 : -1));
  };

  const photoLabel = (photo, index) =>
    photo.alt || t("projects.photoAlt", { name: projectName, number: index + 1 });

  const dots = useMemo(() => {
    if (!hasMultiple) return null;
    return (
      <div className="absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur-xs sm:flex">
        {photos.map((photo, index) => (
          <button
            key={photo.id ?? photo.url ?? index}
            type="button"
            onClick={() => goTo(index)}
            aria-label={t("projects.goToPhoto", { number: index + 1 })}
            aria-current={index === activeIndex}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === activeIndex
                ? "w-4 bg-white"
                : "w-1.5 bg-white/55 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    );
    // goTo is intentionally excluded: the handler is recreated every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, hasMultiple, photos, t]);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-brand via-brand-strong to-ink ${coverClassName}`}
      role="group"
      aria-roledescription="carousel"
      aria-label={t("projects.galleryFor", { name: projectName })}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {count === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <FontAwesomeIcon
            icon={faHome}
            className="text-5xl text-white/65 drop-shadow-sm"
          />
        </div>
      ) : (
        photos.map((photo, index) => (
          <img
            key={photo.id ?? photo.url ?? index}
            src={mediaUrl(photo.thumb_url || photo.url)}
            alt={photoLabel(photo, index)}
            loading={index === 0 ? "eager" : "lazy"}
            draggable="false"
            aria-hidden={index !== activeIndex}
            className={`absolute inset-0 h-full w-full select-none object-cover transition-opacity duration-500 ${
              index === activeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-black/10" />

      {children && <div className="absolute inset-0 z-10">{children}</div>}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label={t("common.previous")}
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label={t("common.next")}
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
          </button>
          <span
            aria-live="polite"
            className="absolute bottom-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-xs"
          >
            <FontAwesomeIcon icon={faImage} className="text-[9px]" />
            {activeIndex + 1} / {count}
          </span>
          {dots}
        </>
      )}

    </div>
  );
}

ProjectPhotoCarousel.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      url: PropTypes.string,
      thumb_url: PropTypes.string,
      alt: PropTypes.string,
    })
  ),
  projectName: PropTypes.string,
  coverClassName: PropTypes.string,
  children: PropTypes.node,
};

