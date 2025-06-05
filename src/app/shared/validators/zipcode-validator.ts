import { AbstractControl, ValidatorFn } from '@angular/forms';

export function ZipCodeValidator(countryControlName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.parent) {
            return null;
        }

        const country = control.parent.get(countryControlName)?.value;
        const value = control.value;

        if (!value) {
            return null; // Let required validator handle empty values
        }

        if (country === 'US') {
            const usZipRegex = /^\d{5}$/;
            return usZipRegex.test(value) ? null : { invalidUSZip: true };
        }
        else if (country === 'CA') {
            const canadaPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/i;
            return canadaPostalRegex.test(value) ? null : { invalidCanadaPostal: true };
        }

        return null; // No validation for other countries
    };
}