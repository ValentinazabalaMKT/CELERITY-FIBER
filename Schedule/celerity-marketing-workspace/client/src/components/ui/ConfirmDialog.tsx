import { Dialog } from "./Dialog";
import { Button } from "./Button";
import { useI18n } from "../../i18n/I18nProvider";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}

export function ConfirmDialog({ open, title, body, confirmLabel, onConfirm, onClose, danger = true }: ConfirmDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("action.cancel")}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel ?? t("action.confirm")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{body}</p>
    </Dialog>
  );
}
