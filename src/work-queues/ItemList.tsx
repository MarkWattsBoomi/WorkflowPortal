import * as React from 'react';
import ModalDialog from '../models/ModalDialog';
import {Columns, UserColumn} from './Columns';
import './ItemList.css';
import WorkQueues from './WorkQueues';

import {eContentType} from '../models/FlowField';
import { FlowField } from '../models/FlowField';
import { FlowObjectData } from '../models/FlowObjectData';
import { FlowObjectDataArray } from '../models/FlowObjectDataArray';
import { FlowObjectDataProperty } from '../models/FlowObjectDataProperty';
import IconPicker from '../models/IconPicker';
import { IManywho} from '../models/interfaces';
import ColumnManager from './ColumnManager';

declare const manywho: IManywho;

// this is a worker class to handle all table header and cell generation
// populate it once at creation

enum eSortDirection {
    ascending,
    desceding,
}

class ItemList extends React.Component<any, any> {
    parent: WorkQueues;

    sortColumn: string;
    sortDirection: string = 'ASC';

    columns: Columns;
    columnEvent = this._columnEvent.bind(this);
    columnsNeedSaving: boolean = false;

    modalDialog: ModalDialog;
    modalShown: boolean = false;
    modalContent: JSX.Element;

    selectedItem: number;

    editQueueObject: any = {};

    constructor(props: any) {

        super(props);
        this.parent = props.parent;

        this.selectItem = this.selectItem.bind(this);
        this.openItem = this.openItem.bind(this);
        this.refreshItems = this.refreshItems.bind(this);
        this.refresh = this.refresh.bind(this);
        this.manageColumns = this.manageColumns.bind(this);
        this.closeManageColumns = this.closeManageColumns.bind(this);
        this.columnsChanged = this.columnsChanged.bind(this);
        this.saveColumns = this.saveColumns.bind(this);
        this.editQueue = this.editQueue.bind(this);
        this.saveQueue = this.saveQueue.bind(this);

        this.showDialog = this.showDialog.bind(this);
        this.closeDialog = this.closeDialog.bind(this);

        // set the column headers
        this.columns = new Columns(this, this.columnEvent, this.showDialog, this.closeDialog, this.columnsChanged);
    }

    async _columnEvent() {
        await this.refreshItems();
        this.forceUpdate();
    }

    render() {

         // queueColumns
        // this.columns.clearColumns();
        const buttons: JSX.Element[] = [];
        if (this.parent.getSelectedQueueId()) {
            if (this.parent.user.email.length > 0) {
                if (this.columnsNeedSaving) {
                    buttons.push(<span className="glyphicon glyphicon-floppy-disk item-list-header-button attention" title="Save Columns" onClick={this.saveColumns}></span>);
                }
                buttons.push(<span className="glyphicon glyphicon-pencil item-list-header-button" title="Edit Queue" onClick={(e) => {this.editQueue(this.parent.getSelectedQueueId()); }}></span>);
                buttons.push(<span className="glyphicon glyphicon-th-list item-list-header-button" title="Manage Columns" onClick={this.manageColumns}></span>);
            }
            buttons.push(<span className="glyphicon glyphicon-refresh item-list-header-button" title="Refresh Items" onClick={this.refresh}></span>);
        } else {
            // no headers
        }

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
                    <div className="item-list-spinner">Refeshing</div>
                );
                break;

            case !this.parent.getSelectedQueueId():
                message = (
                    <div className="item-list-spinner">No queue selected</div>
                );
                break;

            case (this.props.queueItems.value.items.length === 0):
                message = (
                    <div className="item-list-spinner">No items in queue</div>
                );
                break;

            default:
                for (const item of this.props.queueItems.value.items || []) {
                    cells = this.columns.makeCells(item);
                    let selected = '';
                    if (this.selectedItem && this.selectedItem === item.properties.rowid.value) {
                        selected = ' item-list-table-body-row-selected';
                    }
                    rows.push(<tr className={'item-list-table-body-row' + selected} onClick={() => this.selectItem(item)} onDoubleClick={() => this.openItem(item)}>{cells}</tr>);
                }
                break;
        }

        return(<div className="item-list">
                    <div className="item-list-header">
                        <div className="item-list-header-title">
                            <span className="item-list-header-text">Work Items</span>
                        </div>
                        <div className="item-list-header-buttons">
                            {buttons}
                        </div>
                    </div>
                    <div className="item-list-body">
                                <table className="item-list-table">
                                    <thead className="item-list-table-head">
                                        <tr className="item-list-table-head-row">
                                            {heads}
                                        </tr>
                                    </thead>
                                    <tbody className="item-list-table-body">
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

    async refreshItems() {

        // get filters and sorts and push into the QueueItemRequest value

        if (!this.props.root.selectedQueueId) {
            this.selectedItem = null;
            return;
        }
        const searchRequest: FlowField = this.props.queueItemRequest;
        const columnGetterRequest: FlowField = this.props.columnGetterRequest;
        const FilterValues: FlowObjectDataArray = new FlowObjectDataArray([]);

        // set queue & user

        const username: string = this.parent.user.email;

        // FilterValues.addItem(this.createFilter('workqueue_id', '=', this.props.root.selectedQueueId));
        FilterValues.addItem(this.createFilter('status', '=', 'A'));

        // incorporate the where
        const where: string = (this.parent.fields.UserQueues.value as FlowObjectDataArray).getItemWithPropertyName('queue_id', this.parent.selectedQueueId.toString(), 'query').value as string;

        if (where && where.length > 0) {
            // maybe multi, split on AND
            const clauses = where.split('AND');
            for (const clause of clauses) {
                const bits = clause.split('=');
                if (bits.length === 2) {
                    let value: string = '';
                    switch (bits[1].trim().toLowerCase()) {
                        case '%me%':
                            value = username;
                            break;

                        default:
                            value = bits[1].trim();
                    }
                    FilterValues.addItem(this.createFilter(bits[0].trim(), '=', value));
                }
            }
        }
        // FilterValues.addItem(this.createFilter('assignee_name', '=', username));

         // set sort
        if (this.columns.sortColumn) {
            (searchRequest.value as FlowObjectData).properties.Sort.value = this.createSort(this.columns.sortColumn, this.columns.sortAscending === true ? eSortDirection.ascending : eSortDirection.desceding);
        } else {
            (searchRequest.value as FlowObjectData).properties.Sort.value = this.createSort('rowid', eSortDirection.ascending);
        }

        if (this.columns.filters.length > 0) {

            for (const filter of this.columns.filters.filters) {
                // make a new object data for the sort's value
                FilterValues.addItem(this.createFilter(filter.fieldName, this.columns.comparators.get(filter.comparator).symbol, filter.value));
            }
        }

        (searchRequest.value as FlowObjectData).properties.Filters.value = FilterValues;

        // update the column getter too
        (columnGetterRequest.value as FlowObjectData).properties.QueueId.value = this.parent.selectedQueueId;
        (columnGetterRequest.value as FlowObjectData).properties.UserId.value = username;
        await this.parent.updateValues([searchRequest, columnGetterRequest]);
         // trigger outcome
        await this.parent.triggerOutcome('refresh items');

        await this.parent.loadValues();

         // this.forceUpdate();
         // add the new columns
        this.columns.clearColumns();
        if (this.parent.getSelectedQueueId()) {
            if (this.props.queueColumns.value.items.length > 0) {
                for (const column of this.props.queueColumns.value.items) {
                    this.columns.addColumn(column.properties['ColumnName'].value, column.properties['ColumnLabel'].value, 'item-list-table-head-cell', 'item-list-table-body-cell', column.properties['Queryable'].value === 1 ? true : false, column.properties['Sortable'].value === 1 ? true : false, eContentType[(column.properties['ColumnType'].value as keyof typeof eContentType)]);
                }
            } else {
                this.columns.addColumn('rowid', 'Workflow Id', 'item-list-table-head-cell', 'item-list-table-body-cell', true, true, eContentType.ContentString);
            }
        } else {
            // no headers
        }
        this.forceUpdate();
    }

    queueSelected() {
        this.selectedItem = null;
        this.refreshItems();
    }

    showDialog(content: JSX.Element) {
        this.modalContent = content;
        this.modalShown = true;
        this.forceUpdate();
    }

    async closeDialog(action: string) {
        this.modalShown = false;
        this.forceUpdate();
        switch (action) {
            case 'saveQueue':
                await this.saveQueue();
                break;
            default:
                break;

        }

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
        this.parent.openPage(item.properties['join_uri'].value as string);
    }

    editQueue(queueId: number) {
        const queue: FlowObjectData = (this.parent.fields.UserQueues.value as FlowObjectDataArray).getItemWithPropertyValue('queue_id', this.parent.selectedQueueId.toString());

        this.editQueueObject.rowId = queue.properties.rowid.value;
        this.editQueueObject.queueId = queue.properties.queue_id.value;
        this.editQueueObject.queueName = queue.properties.queue_name.value;
        this.editQueueObject.description = queue.properties.description.value;
        this.editQueueObject.where = queue.properties.query.value;
        this.editQueueObject.notifyEmail = queue.properties.notify_email.value;
        this.editQueueObject.notifySMS = queue.properties.notify_sms.value;
        this.editQueueObject.icon = queue.properties.icon.value;

        const modalContent = (
        <div className="modal-dialog">
            <div className="modal-dialog-header">
                <div style={{float: 'left', display: 'flex', height: '100%'}}>
                    <span className="modal-dialog-header-title">{'Queue Details'}</span>
                </div>
                <div style={{float: 'right', marginLeft: 'auto', display: 'flex', height: '100%'}}>
                    <span
                        className="glyphicon glyphicon-remove modal-dialog-header-button"
                        style={{cursor: 'pointer' , color: '#fefefe', marginRight: '5px', fontSize: '14pt'}}
                        title="Close"
                        onClick={(e) => this.closeDialog('cancel')}/>
                </div>
            </div>
            <div className="modal-dialog-body">
                <div className="modal-dialog-body-client">
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Queue Id</span>
                        <input
                        className="modal-dialog-input"
                        type="text"
                        defaultValue={this.editQueueObject.queueId}
                        onChange={(e) => {this.editQueueObject.queueId = e.target.value; this.forceUpdate(); }}/>

                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Name</span>
                        <input
                        className="modal-dialog-input"
                        type="text"
                        defaultValue={this.editQueueObject.queueName}
                        onChange={(e) => {this.editQueueObject.queueName = e.target.value; }}/>
                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Description</span>
                        <input
                        style={{width: '500px'}}
                        className="modal-dialog-input"
                        type="text"
                        defaultValue={this.editQueueObject.description}
                        onChange={(e) => {this.editQueueObject.description = e.target.value; }}/>
                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Icon</span>
                        <IconPicker onChange={(e: string) => {this.editQueueObject.icon = e; }}/>
                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Where</span>
                        <input
                        style={{width: '500px'}}
                        className="modal-dialog-input"
                        type="text"
                        value={this.editQueueObject.where}
                        onChange={(e) => {this.editQueueObject.where = e.target.value; }}/>
                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Notify Email</span>
                        <input
                        style={{width: '500px'}}
                        className="modal-dialog-input"
                        type="text"
                        value={this.editQueueObject.notifyEmail}
                        onChange={(e) => {this.editQueueObject.notifyEmail = e.target.value; }}/>
                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Notify SMS</span>
                        <input
                        style={{width: '500px'}}
                        className="modal-dialog-input"
                        type="text"
                        value={this.editQueueObject.notifySMS}
                        onChange={(e) => {this.editQueueObject.notifySMS = e.target.value; }}/>
                    </div>
                </div>;
            </div >
            <div className="modal-dialog-button-bar">
                <button className="modal-dialog-button-bar-button" title="Save Columns" onClick={(e) => this.closeDialog('saveQueue')}>Save</button>
                <button className="modal-dialog-button-bar-button" title="Cancel" onClick={(e) => this.closeDialog('cancel')}>Cancel</button>
            </div>
        </div >
        );

        this.showDialog(modalContent);
    }

    async saveQueue() {
        const req: FlowField = this.parent.fields['SaveWorkQueueRequest'];
        const od: FlowObjectData = (req.value as FlowObjectData);
        od.addProperty(FlowObjectDataProperty.newInstance('rowid', eContentType.ContentNumber, this.editQueueObject.rowId));
        od.addProperty(FlowObjectDataProperty.newInstance('queue_id', eContentType.ContentNumber, this.editQueueObject.queueId));
        od.addProperty(FlowObjectDataProperty.newInstance('queue_name', eContentType.ContentString, this.editQueueObject.queueName));
        od.addProperty(FlowObjectDataProperty.newInstance('description', eContentType.ContentString, this.editQueueObject.description));
        od.addProperty(FlowObjectDataProperty.newInstance('icon', eContentType.ContentString, this.editQueueObject.icon));
        od.addProperty(FlowObjectDataProperty.newInstance('query', eContentType.ContentString, this.editQueueObject.where));
        od.addProperty(FlowObjectDataProperty.newInstance('notify_email', eContentType.ContentString, this.editQueueObject.notifyEmail));
        od.addProperty(FlowObjectDataProperty.newInstance('notify_sms', eContentType.ContentString, this.editQueueObject.notifySMS));

        await this.parent.updateValues([req]);
        await this.parent.triggerOutcome('SaveWorkQueue');
    }

    manageColumns() {

        this.modalContent = (
            <ColumnManager
                allColumns={(this.parent.fields['SelectableColumns'].value as FlowObjectDataArray)}
                userColumns={(this.columns)}
                closeDialog={this.closeManageColumns}
                columnsChanged={this.columnsChanged}
                />
        );
        this.modalShown = true;
        this.forceUpdate();
    }

    columnsChanged() {
        // need to persist this to the DB
        this.columnsNeedSaving = true;
        this.forceUpdate();
    }

    createUserColumn(QueueId: number, UserName: string, ColumnName: string, ColumnOrder: number, ColumnSort: string): FlowObjectData {
        const userColumn: FlowObjectData = FlowObjectData.newInstance('SaveQueueColumns REQUEST - Column');
        userColumn.addProperty(FlowObjectDataProperty.newInstance('ColumnName', eContentType.ContentString, ColumnName));
        userColumn.addProperty(FlowObjectDataProperty.newInstance('ColumnOrder', eContentType.ContentNumber, ColumnOrder));
        userColumn.addProperty(FlowObjectDataProperty.newInstance('ColumnSort', eContentType.ContentString, ColumnSort));
        return userColumn;
    }

    async saveColumns() {
        const userCols: UserColumn[] = this.columns.getUserColumns();
        const queueId: number = this.props.root.selectedQueueId;
        const userName: string = this.parent.user.email;

        // set the value
        const saveUserQueueColumns: FlowField = this.props.saveQueueColumns;
        (saveUserQueueColumns.value as FlowObjectData).properties['QueueId'].value = queueId;
        (saveUserQueueColumns.value as FlowObjectData).properties['UserId'].value = userName;
        ((saveUserQueueColumns.value as FlowObjectData).properties['Columns'].value as FlowObjectDataArray).clearItems();

        for (const item of userCols) {
            ((saveUserQueueColumns.value as FlowObjectData).properties['Columns'].value as FlowObjectDataArray).addItem(this.createUserColumn(queueId, userName, item.ColumnName, item.ColumnOrder, item.ColumnSort));
        }

        // trigger the outcome
        await this.props.updateValues([saveUserQueueColumns]);
         // trigger outcome
        await this.props.triggerOutcome('save columns');

        this.columnsNeedSaving = false;
        this.forceUpdate();
    }

    closeManageColumns(action: string) {
        this.closeDialog(action);
    }
}

class Item extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
       }

    render() {

        return (<tr></tr>);
    }

}

export default ItemList;
