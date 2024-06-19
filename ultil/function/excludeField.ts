export function removeExcludedKeys<T>(obj: Record<string, any>, exclude: string[]): Partial<T> {
    const cloneObj = structuredClone(obj);
    const result: Partial<T> = {};
    for (const key in cloneObj) {
        if (obj.hasOwnProperty(key) && !exclude.includes(key)) {
            result[key] = obj[key];
        }
    }
    return result;
}