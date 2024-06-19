export default function removeDuplicatesInFlatMap<T>(arr:T[]):T[] {
    // Use Set to store unique values
    let uniqueArray = [...new Set(arr)];
    return uniqueArray;
}