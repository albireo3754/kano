export function toTimestamp(value: Date | number): number {
    return value instanceof Date ? value.getTime() : value;
}
