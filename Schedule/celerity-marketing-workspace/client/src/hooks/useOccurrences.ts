import { useMemo } from "react";
import { expandTasksToOccurrences } from "../shared/taskLogic";
import { useCronogramaTasks } from "./useCronogramaSplit";
import type { TaskOccurrence } from "../types";

/**
 * Expands cronograma tasks into concrete calendar occurrences within [rangeStart, rangeEnd].
 * The cronograma (Calendar/Dashboard) only shows tasks whose type is flagged
 * showOnCronograma — everything else lives in Other Tasks.
 */
export function useOccurrences(rangeStart: Date, rangeEnd: Date): TaskOccurrence[] {
  const cronogramaTasks = useCronogramaTasks();

  return useMemo(
    () => expandTasksToOccurrences(cronogramaTasks, rangeStart, rangeEnd),
    // rangeStart/rangeEnd are re-created per render by callers; compare by time value instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cronogramaTasks, rangeStart.getTime(), rangeEnd.getTime()]
  );
}
