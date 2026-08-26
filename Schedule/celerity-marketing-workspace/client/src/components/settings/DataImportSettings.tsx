import { useState } from "react";
import { DatabaseZap } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";
import { useI18n } from "../../i18n/I18nProvider";
import type { ImportSummary } from "../../services/importApi";
import { Button } from "../ui/Button";
import { Card, CardBody } from "../ui/Card";

export function DataImportSettings() {
  const { reimportCsv } = useAppData();
  const { t } = useI18n();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportSummary | null>(null);

  const handleImport = async () => {
    setImporting(true);
    try {
      const summary = await reimportCsv();
      setResult(summary);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card>
      <CardBody className="pt-5">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
            <DatabaseZap className="h-5 w-5 text-brand-700" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground">{t("settings.data.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("settings.data.body")}</p>
          </div>
        </div>

        <Button onClick={handleImport} disabled={importing}>
          {importing ? t("settings.data.importing") : t("settings.data.importNow")}
        </Button>

        {result && (
          <div className="mt-4 rounded-lg border border-border bg-surface px-4 py-3 text-sm">
            <p className="mb-1 font-medium text-foreground">{t("settings.data.result")}</p>
            <ul className="space-y-0.5 text-muted-foreground">
              <li>
                {result.fileName ?? "—"} · {result.totalRows} rows
              </li>
              <li>
                +{result.imported} · ↻{result.updated} · ⏭{result.skippedUnchanged + result.skippedManuallyEdited}
              </li>
            </ul>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
