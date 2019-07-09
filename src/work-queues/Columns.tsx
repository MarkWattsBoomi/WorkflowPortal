import * as React from 'react';
import DateTimePicker from 'react-datetime-picker';
import { eContentType } from '../models/FlowField';
import { FlowObjectData } from '../models/FlowObjectData';
import {Column} from './Column';
import {Filters} from './Filters';

class Comparator {
    name: string;
    symbol: string;
    desc: string;
    appliesTo: eContentType[] = [];

    constructor(name: string, symbol: string, desc: string, appliesTo: eContentType[]) {
        this.name = name;
        this.symbol = symbol;
        this.desc = desc;
        this.appliesTo.push(...appliesTo);
    }
}

class Comparators {
    private items: {[key: string]: Comparator} = {};

    constructor() {
        this.add('EQ', '=', 'Equal To', [eContentType.ContentBoolean, eContentType.ContentNumber, eContentType.ContentString, eContentType.ContentContent, eContentType.ContentDateTime]);
        this.add('!EQ', '!=', 'Not Equal To', [eContentType.ContentBoolean, eContentType.ContentNumber, eContentType.ContentString, eContentType.ContentContent, eContentType.ContentDateTime]);
        this.add('GT', '>', 'Greater Than', [eContentType.ContentNumber, eContentType.ContentDateTime]);
        this.add('GTE', '>=', 'Greater Than or Equal To', [eContentType.ContentNumber, eContentType.ContentDateTime]);
        this.add('LT', '<', 'Less Than', [eContentType.ContentNumber, eContentType.ContentDateTime]);
        this.add('LTE', '<=', 'Less Than or Equal To', [eContentType.ContentNumber, eContentType.ContentDateTime]);
        this.add('BT', '<...>', 'Between', [eContentType.ContentNumber, eContentType.ContentDateTime]);
        this.add('LIKE', '~', 'Like', [eContentType.ContentString, eContentType.ContentContent]);
        this.add('!LIKE', '!~', 'Not Like', [eContentType.ContentString, eContentType.ContentContent]);
        this.add('CONT', '|~|', 'Contains', [eContentType.ContentString, eContentType.ContentContent]);
        this.add('START', '=|', 'Starts With', [eContentType.ContentString, eContentType.ContentContent]);
        this.add('END', '|=', 'Ends With', [eContentType.ContentString, eContentType.ContentContent]);
     }

    add(name: string, symbol: string, desc: string, appliesTo: eContentType[]) {
        this.items[name] = new Comparator(name, symbol, desc, appliesTo);
    }

    get(key: string) {
        return this.items[key];
    }

    getComparatorsForType(type: eContentType): Comparator[] {
        const results: Comparator[] = [];

        for (const key in this.items) {
            if (this.items[key].appliesTo.indexOf(type) >= 0) {
                results.push(this.items[key]);
            }
        }
        return results;
    }
}

export class UserColumn {
    ColumnName: string;
    ColumnOrder: number;
    ColumnSort: string;

    constructor(ColumnName: string, ColumnOrder: number, ColumnSort: string) {
        this.ColumnName = ColumnName;
        this.ColumnOrder = ColumnOrder;
        this.ColumnSort = ColumnSort;
    }
}

export class Columns {
    parentNotify: Function;
    showDialog: Function;
    closeDialog: Function;
    columnsChanged: Function;
    columnKeys: string[] = [];
    columns: {[key: string]: Column} = {};
    comparators: Comparators = new Comparators();
    parent: React.Component;

    sortColumn: string = '';
    sortAscending: boolean = true;  // false=ASC

    filters: Filters = new Filters();

    comparatorPickerValue: any;
    valuePickerValue: any;

    getUserColumns(): UserColumn[] {
        let pos: number = 0;
        let colSort: string = '';
        const columns: UserColumn[] = [];
        for (const key of this.columnKeys) {
            colSort = '';
            if (key === this.sortColumn) {
                if (this.sortAscending === true) {
                    colSort = 'ASC';
                } else {
                    colSort = 'DESC';
                }
            }
            columns.push(new UserColumn(key, pos, colSort));
            pos++;
        }

        return columns;
    }

    constructor(parent: React.Component, parentNotify: Function, showDialog: Function, closeDialog: Function, columnsChanged: Function) {
        this.parent = parent;
        this.parentNotify = parentNotify;
        this.showDialog = showDialog;
        this.closeDialog = closeDialog;
        this.columnsChanged = columnsChanged;

        this.makeHeaders = this.makeHeaders.bind(this);
        this.makeCells = this.makeCells.bind(this);

        this.valuePickerChanged = this.valuePickerChanged.bind(this);
        this.comparatorSelected = this.comparatorSelected.bind(this);

        this.columnDragStart = this.columnDragStart.bind(this);
        this.columnDragEnter = this.columnDragEnter.bind(this);
        this.columnDragOver = this.columnDragOver.bind(this);
        this.columnDragEnd = this.columnDragEnd.bind(this);
        this.columnDrop = this.columnDrop.bind(this);
    }

    dragSource: any = null;
    columnDragStart(e: DragEvent) {
        this.dragSource = (e.target as any);
        e.dataTransfer.setData('text', 'banana');
    }

    columnDragEnter(e: DragEvent) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }

        if ((e.target as any).innerText !== this.dragSource.innerText) {
            (e.target as any).classList.add('modal-table-head-cell-over');
        }
    }

    columnDragLeave(e: DragEvent) {
        (e.target as any).classList.remove('modal-table-head-cell-over');
    }

    columnDragOver(e: DragEvent) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessary. Allows us to drop.
        }
    }

    columnDragEnd(e: DragEvent) {
        (e.target as any).classList.remove('modal-table-head-cell-over');
        this.dragSource = null;
    }

    columnDrop(e: DragEvent) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        (e.target as any).classList.remove('modal-table-head-cell-over');

        this.moveColumn(this.dragSource.attributes['data-colName'].value, (e.target as any).attributes['data-colName'].value);
        this.dragSource = null;
    }

    moveColumn(moverKey: string, moveBeforeKey: string) {
        console.log('moving ' + moverKey + ' before ' + moveBeforeKey);
        const moverPos = this.columnKeys.indexOf(moverKey);
        const targetPos = this.columnKeys.indexOf(moveBeforeKey);

        this.columnKeys.splice(targetPos, 0, this.columnKeys.splice(moverPos, 1)[0]);
        this.columnsChanged();
    }

    setSort(fieldName: string, ascending?: boolean) {
        // if field name set then apply that then see if we have a direction - default to flip direction
        if (fieldName) {
            // is it a different field
            if (this.sortColumn !== fieldName) {
                this.sortColumn = fieldName;
                if (ascending) {
                    this.sortAscending = ascending;
                } else {
                    this.sortAscending = true;
                }
            } else {
                if (ascending) {
                    this.sortAscending = ascending;
                } else {
                    this.sortAscending = !this.sortAscending;
                }
            }
        } else {
            // no field spec'd - we either set direction or flip it
            if (ascending) {
                this.sortAscending = ascending;
            } else {
                this.sortAscending = !this.sortAscending;
            }
        }

        this.parentNotify();
    }

    clearColumns() {
        this.columns = {};
        this.columnKeys = [];
    }

    addColumn(fieldName: string, caption: string, headerClassName: string, bodyClassName: string, canFilter: boolean, canSort: boolean, type: eContentType) {
        this.columns[fieldName] = new Column(this, fieldName , caption , headerClassName, bodyClassName, canFilter, canSort, type);
        this.columnKeys.push(fieldName);
    }

    removeColumn(fieldName: string) {
        if (this.columns[fieldName]) {
            delete this.columns[fieldName];
        }

        if (this.columnKeys.indexOf(fieldName) >= 0) {
            this.columnKeys.splice(this.columnKeys.indexOf(fieldName), 1);
        }
    }

    makeHeaders() {
        const heads: JSX.Element[] = [];
        // for (const col of this.cols) {
        //    heads.push(col.makeHeader());
        // }
        for (const key of this.columnKeys) {
            heads.push(this.columns[key].makeHeader());
        }

        return heads;
    }

    makeCells(row: FlowObjectData) {
        const cells: JSX.Element[] = [];

        // for (const col of this.cols) {
        //    cols.push(col.makeCell(row));
        // }

        for (const key of this.columnKeys) {
            cells.push(this.columns[key].makeCell(row));
        }
        return cells;
    }

    clearFilters(fieldName: string, e: Event) {
        e.preventDefault();
        e.stopPropagation();

        this.filters.removeFilter(fieldName);

        this.parentNotify();
    }

    valuePickerChanged(value: any) {
        this.valuePickerValue = ((event.target) as any).value;
    }

    comparatorSelected(event: React.FormEvent) {
        this.comparatorPickerValue = ((event.target) as any).value;
     }

    showFilters(fieldName: string, e: Event) {
        e.preventDefault();
        e.stopPropagation();

        this.comparatorPickerValue = 'EQ';

        // make the actual column related content
        const column = this.columns[fieldName];

        // make the existing filter row
        const currentFilter = this.filters.items[fieldName];
        let currentFilterElement: JSX.Element;
        if (currentFilter) {
            let val: string = '';
            if (column.type === eContentType.ContentDateTime) {
                val = ((currentFilter.value) as Date).toDateString();
            } else {
                val = currentFilter.value as string;
            }
            currentFilterElement = (
                                    <div style={{marginBottom: '15px'}}>
                                        <span style={{marginRight: '15px'}}>{currentFilter.fieldName}</span><span style={{marginRight: '15px'}}>{this.comparators.get(currentFilter.comparator).desc}</span><span>{val}</span>
                                    </div>
            );
        }

        const comparators = this.comparators.getComparatorsForType(column.type);
        const options: JSX.Element[] = comparators.map((comparator: Comparator) => (<option title={comparator.desc} value={comparator.name} selected={comparator.name === this.comparatorPickerValue ? true : false}>{comparator.symbol}</option>));
        const combo: JSX.Element = (
                                    <select style={{marginRight: '10px'}} onChange={this.comparatorSelected}>{options}</select>
        );

        let values: JSX.Element;
        switch (column.type) {
            case eContentType.ContentDateTime:
                this.valuePickerValue = new Date();
                values = (
                    <DateTimePicker
                    onChange={this.valuePickerChanged}
                    value={this.valuePickerValue}
                    />
                );
                break;

            case eContentType.ContentBoolean:
                this.valuePickerValue = true;
                values = (
                    <input
                        type="checkbox"
                        onChange={this.valuePickerChanged}
                        />
                );
                break;

            default:
                this.valuePickerValue = '';
                values = (
                    <input
                        type="text"
                        onChange={this.valuePickerChanged}
                        />
                );
                break;
        }

        const addElement: JSX.Element = (
                                            <div>
                                                <span style={{marginRight: '10px'}}>{column.fieldName}</span>
                                                {combo}
                                                {values}
                                            </div>
        );

        // make the dialog content for the modal
        const content: JSX.Element = (
                        <div className="filter-dialog">
                            <div className="filter-dialog-header">
                                <div style={{float: 'left', display: 'flex'}}>
                                    <span className="filter-dialog-header-title">{fieldName + ' filters'}</span>
                                </div>
                                <div style={{float: 'right', marginLeft: 'auto', display: 'flex'}}>
                                    <span className="glyphicon glyphicon-remove" style={{cursor: 'pointer' , color: '#fefefe', marginRight: '5px', fontSize: '14pt'}}
                                        title="Close" onClick={this.filterClosed.bind(this, 'cancel', fieldName)}/>
                                </div>
                            </div>
                            <div className="filter-dialog-body">
                                <div className="filter-dialog-body-client">
                                    <div className="filter-dialog-field">
                                        {currentFilterElement}
                                        {addElement}

                                    </div>
                                </div>
                            </div>
                            <div className="filter-dialog-button-bar">
                                <button className="filter-dialog-button-bar-button" title="Apply filter" onClick={this.filterClosed.bind(this, 'apply', fieldName)}>Apply</button>
                                <button className="filter-dialog-button-bar-button" title="Clear filters" onClick={this.filterClosed.bind(this, 'clear', fieldName)}>Clear</button>
                                <button className="filter-dialog-button-bar-button" title="Cancel" onClick={this.filterClosed.bind(this, 'cancel', fieldName)}>Cancel</button>
                            </div>
                        </div>
                    );
        this.showDialog(content);
    }

    filterClosed(action: string, fieldName: string) {
        switch (action) {
            case 'apply':
                this.filters.addFilter(fieldName, this.comparatorPickerValue , this.valuePickerValue);
                this.parentNotify();
                break;

            case 'clear':
                this.filters.removeFilter(fieldName);
                this.parentNotify();

            default:
                break;
        }
        this.closeDialog();

    }
}
