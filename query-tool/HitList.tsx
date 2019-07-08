import { ColumnCountProperty } from 'csstype';
import * as React from 'react';
import ModalDialog from '../models/ModalDialog';
// import '../modal-dialog/ModalDialog.css';
import {Columns} from '../work-queues/Columns';
import {Filter} from '../work-queues/Filter';
import './HitList.css';
import QueryTool from './QueryTool';

import {eContentType} from '../models/FlowField';
import { FlowField } from '../models/FlowField';
import { FlowObjectData } from '../models/FlowObjectData';
import { FlowObjectDataArray } from '../models/FlowObjectDataArray';
import { FlowObjectDataProperty } from '../models/FlowObjectDataProperty';
import { IManywho} from '../models/interfaces';
import { SearchCriteria } from './SearchCriteria';

declare const manywho: IManywho;

// this is a worker class to handle all table header and cell generation
// populate it once at creation

export enum eSortDirection {
    ascending,
    desceding,
}

class HitList extends React.Component<any, any> {
    parent: QueryTool;

    sortColumn: string;
    sortDirection: string = 'ASC';

    columns: Columns;
    columnEvent = this._columnEvent.bind(this);

    modalDialog: ModalDialog;
    modalShown: boolean = false;
    modalContent: JSX.Element;

    selectedItem: number;

    constructor(props: any) {

        super(props);
        this.parent = props.parent;

        this.selectItem = this.selectItem.bind(this);
        this.openItem = this.openItem.bind(this);
        this.refreshItems = this.refreshItems.bind(this);
        this.refresh = this.refresh.bind(this);
        this.search = this.search.bind(this);

        this.showDialog = this.showDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);
        this.columnsChanged = this.columnsChanged.bind(this);

        // set the column headers
        this.columns = new Columns(this, this.columnEvent, this.showDialog, this.closeDialog, this.columnsChanged);
        this.columns.addColumn('rowid', 'Workflow Id', 'hit-list-table-head-cell', 'hit-list-table-body-cell', true, true, eContentType.ContentString);
        this.columns.addColumn('assignee_name', 'Assignee', 'hit-list-table-head-cell', 'hit-list-table-body-cell', true, true, eContentType.ContentString);
        this.columns.addColumn('created_date', 'Created On', 'hit-list-table-head-cell', 'hit-list-table-body-cell', true, true, eContentType.ContentDateTime);
        this.columns.addColumn('status', 'Status', 'hit-list-table-head-cell', 'hit-list-table-body-cell', true, true, eContentType.ContentString);
        this.columns.addColumn('fields.creator', 'Creator', 'hit-list-table-head-cell', 'hit-list-table-body-cell', true, false, eContentType.ContentString);
        this.columns.addColumn('fields.SAPFileName', 'SAP File Name', 'hit-list-table-head-cell', 'hit-list-table-body-cell', true, false, eContentType.ContentString);

    }

    columnsChanged() {
        this.forceUpdate();
    }

    async _columnEvent() {
        await this.refreshItems();
        this.forceUpdate();
    }

    render() {

        let item: any;
        let cells: JSX.Element[] = [];
        const heads: JSX.Element[] = this.columns.makeHeaders();

        const rows: JSX.Element[] = [];

        // handle no queue selection

        let modalDialog: JSX.Element;
        if (this.modalShown) {
            modalDialog = (<ModalDialog ref={(c) => {this.modalDialog = c; }} onCloseRequest={this.closeDialog.bind(this)}>
                                {this.modalContent}
                            </ModalDialog>);
        }

        // if refreshing show spinner
        let message: JSX.Element;

        switch (true) {
            case this.props.root.loadingState === 'refreshing':
                message = (
                    <div className="hit-list-spinner">Refeshing</div>
                );
                break;

            case (this.props.searchResults.value.items.length === 0):
                message = (
                    <div className="hit-list-spinner">No results</div>
                );
                break;

            default:
                for (const item of this.props.searchResults.value.items || []) {
                    cells = this.columns.makeCells(item);
                    let selected = '';
                    if (this.selectedItem && this.selectedItem === item.properties.rowid.value) {
                        selected = ' hit-list-table-body-row-selected';
                    }
                    rows.push(<tr className={'hit-list-table-body-row' + selected} onClick={() => this.selectItem(item)} onDoubleClick={() => this.openItem(item)}>{cells}</tr>);
                }
                break;
        }

        return(<div className="hit-list">
                    <div className="hit-list-header">
                        <div className="hit-list-header-title">
                            <span className="hit-list-header-text">Work Items</span>
                        </div>
                        <div className="hit-list-header-buttons">
                            <span className="glyphicon glyphicon-refresh hit-list-header-button" title="Refresh Itms" onClick={this.refresh}></span>
                        </div>
                    </div>
                    <div className="hit-list-body">
                                <table className="hit-list-table">
                                    <thead className="hit-list-table-head">
                                        <tr className="hit-list-table-head-row">
                                            {heads}
                                        </tr>
                                    </thead>
                                    <tbody className="hit-list-table-body">
                                        {rows}
                                    </tbody>
                                </table>
                                {message}
                            </div>
                    {modalDialog}
                </div>);
    }

    async refresh() {
        // tell parent to deselct item
        this.parent.deselectItem();
        this.selectedItem = null;
        await this.refreshItems();
    }

    createFilter(fieldName: string, comparator: string, value: string): FlowObjectData {
        const filterObjectData: FlowObjectData = FlowObjectData.newInstance('GetWorkItems REQUEST - Filter');
        filterObjectData.addProperty(FlowObjectDataProperty.newInstance('FieldName', eContentType.ContentString, fieldName));
        filterObjectData.addProperty(FlowObjectDataProperty.newInstance('Comparator', eContentType.ContentString, comparator));
        filterObjectData.addProperty(FlowObjectDataProperty.newInstance('Value', eContentType.ContentString, value));
        return filterObjectData;
    }

    createSort(fieldName: string, direction: eSortDirection): FlowObjectData {
        const sortObjectData: FlowObjectData = FlowObjectData.newInstance('GetWorkItems REQUEST - Sort');
        sortObjectData.addProperty(FlowObjectDataProperty.newInstance('FieldName', eContentType.ContentString, fieldName));
        sortObjectData.addProperty(FlowObjectDataProperty.newInstance('Ascending', eContentType.ContentString, direction === eSortDirection.ascending ? true : false));
        return sortObjectData;
    }

    search() {
        this.refreshItems();
    }

    async refreshItems() {
        // get filters and sorts and push into the QueueItemRequest value

        const searchRequest: FlowField = this.props.searchRequest;

         // const od = req.getObjectData();

        const FilterValues: FlowObjectDataArray = new FlowObjectDataArray([]);

        // set sort
        if (this.columns.sortColumn) {
            (searchRequest.value as FlowObjectData).properties.Sort.value = this.createSort(this.columns.sortColumn, this.columns.sortAscending === true ? eSortDirection.ascending : eSortDirection.desceding);
        }

        if (this.columns.filters.length > 0) {

            for (const filter of this.columns.filters.filters) {
                // make a new object data for the sort's value
                FilterValues.addItem(this.createFilter(filter.fieldName, this.columns.comparators.get(filter.comparator).symbol, filter.value));
            }
        }

        for (const crit of this.parent.searcher.getCriteria()) {
                FilterValues.addItem(this.createFilter(crit.field, crit.comparator, crit.value));
        }

        (searchRequest.value as FlowObjectData).properties.Filters.value = FilterValues;

        await this.props.updateValues([searchRequest]);

         // trigger outcome
        await this.props.triggerOutcome('search');

         // this.forceUpdate();
    }

    showDialog(content: JSX.Element) {
        this.modalContent = content;
        this.modalShown = true;
        this.forceUpdate();
    }

    closeDialog(action: any) {
        this.modalShown = false;
        this.forceUpdate();
    }

    selectItem(item: FlowObjectData) {
        this.selectedItem = item.properties.rowid.value as number;
        this.openItem(item);
        this.forceUpdate();
    }

    deselect() {
        this.selectedItem = null;
        this.forceUpdate();
    }

    async openItem(item: FlowObjectData) {
        // await this.props.triggerOutcome('OpenItem', item.iFlowObjectDataArray());
        // push join uri into iframe
        this.parent.openItem(item);
    }
}

export default HitList;
