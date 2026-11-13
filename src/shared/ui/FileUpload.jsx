import { useId } from "react";
import PropTypes from "prop-types";

function FileUpload({
  label,
  accept,
  multiple = true,
  files = [],
  onChange,
  hint,
}) {
  const inputId = useId();

  const handleFiles = (fileList) => {
    onChange?.([...fileList]);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-label font-semibold text-ink-2"
        >
          {label}
        </label>
      )}
      <label
        htmlFor={inputId}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleFiles(event.dataTransfer.files);
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-card border-2 border-dashed border-line-strong bg-surface-2 px-4 py-6 text-center transition-colors hover:border-brand/60"
      >
        <span className="text-body font-semibold text-ink-2">
          Arrastra archivos o haz clic
        </span>
        {hint && <span className="text-micro text-ink-3">{hint}</span>}
        <input
          id={inputId}
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </label>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1 text-micro text-ink-3">
          {files.map((file) => (
            <li key={`${file.name}-${file.size}`}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

FileUpload.propTypes = {
  label: PropTypes.node,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  files: PropTypes.array,
  onChange: PropTypes.func,
  hint: PropTypes.node,
};

export default FileUpload;
