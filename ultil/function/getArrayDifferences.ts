

type ReturnArrayDifferences<T> = {
    removedItems: T[];
    newItems: T[];
};

export default function getArrayDifferences<T>(currentAr: T[], newAr: T[]): ReturnArrayDifferences<T> {
    const removedItems = currentAr.filter(item => !newAr.includes(item));
    const newItems = newAr.filter(item => !currentAr.includes(item));
    return {
        removedItems,
        newItems
    }
}