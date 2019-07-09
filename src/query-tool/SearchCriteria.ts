export class SearchCriteria {
    field: string;
    comparator: string;
    value: string;

    constructor(field: string, comparator: string, value: string) {
        this.field = field;
        this.comparator = comparator;
        this.value = value;
    }
}
