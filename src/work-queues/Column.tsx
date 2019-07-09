import * as React from 'react';
import { eContentType } from '../models/FlowField';
import {FlowObjectData} from '../models/FlowObjectData';
import { FlowObjectDataArray } from '../models/FlowObjectDataArray';
import { FlowObjectDataProperty } from '../models/FlowObjectDataProperty';
import { IManywho } from '../models/interfaces';
import {Columns} from './Columns';
declare const manywho: IManywho;

export class Column {
    fieldName: string;
    caption: string;
    headerClassName: string;
    bodyClassName: string;
    type: eContentType;
    parent: Columns;
    canFilter: boolean;
    canSort: boolean;

    constructor(parent: Columns, fieldName: string, caption: string, headerClassName: string, bodyClassName: string, canFilter: boolean, canSort: boolean,  type: eContentType) {
        this.fieldName = fieldName;
        this.caption = caption;
        this.headerClassName = headerClassName;
        this.bodyClassName = bodyClassName;
        this.type = type;
        this.parent = parent;
        this.canFilter = canFilter;
        this.canSort = canSort;
    }

    makeHeader() {
        let sortIcon: JSX.Element;
        let filterIcon: JSX.Element;
        let clearIcon: JSX.Element;

        let sortFunction;
        const style: React.CSSProperties = {};

        if (this.canSort) {
            sortFunction = this.parent.setSort.bind(this.parent, this.fieldName, null);
            // style.cursor = 'pointer';
        } else {
            // style.cursor = 'default';
        }
        if (this.parent.sortColumn === this.fieldName) {

            if (this.parent.sortAscending === true) {
                sortIcon = (<span className="glyphicon glyphicon-chevron-up col-head-button col-head-button-hot" title="Sorted Ascending"></span>);
            } else {
                sortIcon = (<span className="glyphicon glyphicon-chevron-down col-head-button col-head-button-hot" title="Sorted Descending"></span>);
            }
        }

        if (this.canFilter) {
            let className = 'glyphicon glyphicon-search col-head-button';
            if (this.parent.filters.items[this.fieldName]) {
                clearIcon = (<span className="glyphicon glyphicon-remove col-head-button col-head-button-hot" title="Clear filters" onClick={this.parent.clearFilters.bind(this.parent, this.fieldName)}></span>);
                className += ' col-head-button-hot';
            }
            filterIcon = (<span className={className} title="Edit filters" onClick={this.parent.showFilters.bind(this.parent, this.fieldName)}></span>);
        }

        return (<th className={this.headerClassName}>
                    <div
                        style={style}
                        className="col-head"
                        draggable={true}
                        onDragStart={(e: any) => this.parent.columnDragStart(e)}
                        onDragEnter={(e: any) => this.parent.columnDragEnter(e)}
                        onDragLeave={(e: any) => this.parent.columnDragLeave(e)}
                        onDragOver={(e: any) => this.parent.columnDragOver(e)}
                        onDragEnd={(e: any) => this.parent.columnDragEnd(e)}
                        onClick={sortFunction}
                        onDrop={(e: any) => this.parent.columnDrop(e)}
                        data-colName={this.fieldName}>
                        <div className="col-head-caption">
                            <span>{this.caption}</span>
                        </div>
                        <div className="col-head-buttons">
                            {sortIcon}
                            {clearIcon}
                            {filterIcon}
                        </div>
                    </div>
                </th>);
    }

    makeCell(row: FlowObjectData) {
        // fieldName could be a child object e.g. fields.creator
        const bits = this.fieldName.split('.');

        let element: FlowObjectDataProperty = row.properties[bits[0]];
        for (let pos = 1; pos < bits.length ; pos++) {
            element = (element.value as FlowObjectDataArray).getItemWithPropertyName('field_name', bits[pos], 'field_value');
        }
        // const element: any = row.properties[bits[0]];
        let val: string = '';
        if (element != null) {
            switch (this.type) {
                case eContentType.ContentDateTime:
                    if (element.value) {
                        val = new Intl.DateTimeFormat('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                        }).format(new Date(element.value as string));
                    }
                    break;

                default:
                    val = element.value as string;
                    break;
            }
        }

        return (<td className={this.bodyClassName}>
                    {val}
                </td>);
    }

}
