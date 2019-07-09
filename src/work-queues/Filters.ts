import {Filter} from './Filter';

export class Filters {
    items: {[key: string]: Filter} = {};

    addFilter(fieldName: string, comparator: string, value: string) {
        this.items[fieldName] = new Filter(fieldName, comparator, value);
    }

    removeFilter(fieldName: string) {
        delete this.items[fieldName];
    }

    get length(): number {
        return Object.keys(this.items).length;
    }

    get filters(): Filter[] {
        const results: Filter[] = [];
        for (const key in this.items) {
            results.push(this.items[key]);
        }
        return results;
    }

}
