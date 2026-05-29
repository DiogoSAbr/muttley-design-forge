export function unmaskCpf(value: string): string {
    return value.replace(/\D/g, "").slice(0, 11);
}

export function maskCpf(value: string): string {
    const digits = unmaskCpf(value);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function isValidCpf(value: string): boolean {
    const digits = unmaskCpf(value);
    if (digits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(digits)) return false;

    const calcCheckDigit = (slice: string, factor: number): number => {
        let sum = 0;
        for (let i = 0; i < slice.length; i++) {
            sum += parseInt(slice.charAt(i), 10) * (factor - i);
        }
        const remainder = (sum * 10) % 11;
        return remainder === 10 ? 0 : remainder;
    };

    const firstCheck = calcCheckDigit(digits.slice(0, 9), 10);
    if (firstCheck !== parseInt(digits.charAt(9), 10)) return false;

    const secondCheck = calcCheckDigit(digits.slice(0, 10), 11);
    if (secondCheck !== parseInt(digits.charAt(10), 10)) return false;

    return true;
}
