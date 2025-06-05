import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ApiErrorHandlerService {
    private genericErrorMessage = 'An unexpected error occurred. Please try again later.';

    /**
     * Extracts user-friendly error messages from API error responses
     * @param error The error response object
     * @returns Array of error messages to display
     */
    handleApiError(error: HttpErrorResponse | any, customErrorMessage: string): string {
        if (!error) {
            return (customErrorMessage) ? customErrorMessage : this.genericErrorMessage;
        }

        // Handle 400 Bad Request with pipe-delimited messages
        if (error.status === 400 && error.error?.message) {
            return this.parsePipeDelimitedMessages(error.error.message);
        }

        // Handle other status codes
        return this.getAppropriateGenericMessage(error.status, customErrorMessage);
    }

    /**
     * Splits pipe-delimited messages and cleans them up
     * @param messageString The raw message string from API
     * @returns Array of cleaned error messages
     */
    private parsePipeDelimitedMessages(messageString: string): string {
        if (!messageString || typeof messageString !== 'string') {
            return this.genericErrorMessage;
        }

        return messageString.slice(0, -1);
        //   .split('|')
        //   .map(msg => msg.trim())
        //   .filter(msg => msg.length > 0);
    }

    /**
     * Returns appropriate generic message based on status code
     * @param status HTTP status code
     * @returns Generic error message
     */
    private getAppropriateGenericMessage(status: number, customErrorMessage: string): string {
        switch (status) {
            case 401:
                return 'Unauthorized access. Please login again.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 500:
            default:
                return (customErrorMessage) ? customErrorMessage : this.genericErrorMessage;;
        }
    }
}