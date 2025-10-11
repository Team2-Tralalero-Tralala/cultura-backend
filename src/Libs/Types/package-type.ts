// libs/composeDateTimeIso.ts
export function composeDateTimeIso(
    dateStr: string,              // "yyyy-mm-dd"
    timeStr?: string,             // "HH:mm"
    useEndOfDayIfMissing = false
): Date {
    if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        throw new Error(`Invalid dateStr: ${dateStr}`);
    }

    const hhmm = (timeStr && /^\d{2}:\d{2}$/.test(timeStr))
        ? timeStr
        : (useEndOfDayIfMissing ? "23:59" : "00:00");

    // ทำเป็น "YYYY-MM-DDTHH:mm:ss" (ไม่มี Z ⇒ ตีความเป็น local)
    const isoLocal = `${dateStr}T${hhmm}:${useEndOfDayIfMissing && !timeStr ? "59" : "00"}`;
    return new Date(isoLocal);
}
