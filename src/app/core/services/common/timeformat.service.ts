import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class TimeFormatService {
    /**
     * Formats a time range with timezone
     * @param startTime 24-hour format (e.g., "13:00")
     * @param endTime 24-hour format (e.g., "17:00") - optional
     * @param timezone Timezone abbreviation (e.g., "EST")
     * @returns Formatted time range string
     */
    formatTimeRange(startTime: string, timezone: string, endTime?: string): string {
        if (!startTime) return '';

        const start = this.formatSingleTime(startTime);

        if (!endTime) {
            return start.endsWith('m') ? `${start} above ${timezone}` : `${start}am above ${timezone}`;
        }

        const end = this.formatSingleTime(endTime);
        const formattedTz = timezone ? ` ${timezone}` : '';

        // If both times have the same meridian (am/pm), only show it at the end
        if (start.slice(-2) === end.slice(-2)) {
            return `${start.replace(/[ap]m$/, '')}-${end}${formattedTz}`;
        }

        return `${start}-${end}${formattedTz}`;
    }

    private formatSingleTime(time24: string): string {
        if (!time24) return time24;

        const hours = +time24;
        const period = hours >= 12 ? 'pm' : 'am';
        let displayHours = hours % 12;
        displayHours = displayHours === 0 ? 12 : displayHours; // Convert 0 to 12

        return `${displayHours}${period}`;
    }
}
