export default function isValidDate(stringDate: string) {
    return !isNaN(Date.parse(stringDate));
}