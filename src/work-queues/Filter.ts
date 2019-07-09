export class Filter {
    fieldName: string;
    comparator: string;
    value: any;

    constructor(fieldName: string, comparator: string, value: any) {
        this.fieldName = fieldName;
        this.comparator = comparator;
        this.value = value;
    }
}
