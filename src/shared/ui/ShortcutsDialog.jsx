import PropTypes from "prop-types";
import { useLocale } from "../../contexts/LocaleContext";
import Button from "./Button";
import Chip from "./Chip";
import Dialog from "./Dialog";
import Table from "./Table";

function KeyChord({ keys }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, index) => (
        <span key={`${key}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 && (
            <span aria-hidden="true" className="text-micro text-ink-3">
              +
            </span>
          )}
          <Chip
            tone="neutral"
            className="min-w-6 px-1.5 font-mono text-[11px] uppercase"
          >
            {key}
          </Chip>
        </span>
      ))}
    </span>
  );
}

KeyChord.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

function ShortcutsDialog({ open, onClose, shortcuts = [] }) {
  const { t } = useLocale();

  const toRows = (items) =>
    items.map((shortcut) => ({
      id: shortcut.labelKey,
      label: t(shortcut.labelKey),
      keys: shortcut.keys,
    }));

  const navigation = shortcuts.filter((shortcut) => shortcut.keys[0] === "g");
  const actions = shortcuts.filter((shortcut) => shortcut.keys[0] === "n");
  const other = shortcuts.filter(
    (shortcut) => !["g", "n"].includes(shortcut.keys[0])
  );

  const columns = [
    { key: "label", header: t("shortcuts.action") },
    {
      key: "keys",
      header: t("shortcuts.keys"),
      align: "right",
      render: (row) => <KeyChord keys={row.keys} />,
    },
  ];

  const renderTable = (items) => (
    <Table
      columns={columns}
      rows={toRows(items)}
      getRowKey={(row) => row.id}
      mobileCard={(row) => (
        <div className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2">
          <span className="truncate text-body font-medium text-ink">
            {row.label}
          </span>
          <KeyChord keys={row.keys} />
        </div>
      )}
    />
  );

  const groups = [
    { id: "navigate", title: t("shortcuts.navigateGroup"), items: navigation },
    { id: "create", title: t("shortcuts.createGroup"), items: actions },
    { id: "other", title: null, items: other },
  ].filter((group) => group.items.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t("shortcuts.title")}
      description={t("shortcuts.description")}
      size="md"
      footer={<Button onClick={onClose}>{t("shortcuts.close")}</Button>}
    >
      <div className="space-y-5">
        {groups.map((group) => (
          <section key={group.id} className="space-y-2">
            {group.title && (
              <h3 className="text-micro font-semibold uppercase tracking-wide text-ink-3">
                {group.title}
              </h3>
            )}
            {renderTable(group.items)}
          </section>
        ))}
      </div>
      <p className="mt-4 text-label text-ink-3">{t("shortcuts.typingNote")}</p>
    </Dialog>
  );
}

ShortcutsDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  shortcuts: PropTypes.arrayOf(
    PropTypes.shape({
      keys: PropTypes.arrayOf(PropTypes.string).isRequired,
      labelKey: PropTypes.string.isRequired,
      to: PropTypes.string,
    })
  ),
};

export default ShortcutsDialog;
