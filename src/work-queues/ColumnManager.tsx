import * as React from 'react';
import { eContentType } from '../models/FlowField';
import { FlowObjectDataArray } from '../models/FlowObjectDataArray';
import { IManywho } from '../models/interfaces';
import { Columns, UserColumn } from './Columns';
import ItemList from './ItemList';
import './WorkQueues.css';

declare const manywho: IManywho;

class ColumnManager extends React.Component<any, any> {
    parent: ItemList;
    changedFlag: boolean = false;

    constructor(props: any) {

        super(props);
        this.parent = props.parent;

        this.toggleColumn = this.toggleColumn.bind(this);
        this.columnClicked = this.columnClicked.bind(this);
        this.closeMe = this.closeMe.bind(this);
    }

    columnClicked(e: any) {
        const colName = e.target.value;
        const checked: boolean = e.target.checked;

        this.toggleColumn(colName, checked);
    }

    render() {

        // build table of all columns and tick selected ones
        const columns: JSX.Element[] = [];
        const userColumns: Columns = this.props.userColumns;
        let sel: boolean;
        for (const col of this.props.allColumns.items) {
            if (userColumns.columns[col.properties.ColumnName.value]) {
                sel = true;
            } else {
                sel = false;
            }
            columns.push(<tr><td><input className="modal-table-checkbox" type="checkbox" checked={sel} value={col.properties['ColumnName'].value} onChange={(e) => this.columnClicked(e)}/></td><td>{col.properties['ColumnLabel'].value}</td></tr>);
        }

        return(
            <div className="modal-dialog">
                <div className="modal-dialog-header">
                    <div style={{float: 'left', display: 'flex', height: '100%'}}>
                        <span className="modal-dialog-header-title">{'Manage Columns'}</span>
                    </div>
                    <div style={{float: 'right', marginLeft: 'auto', display: 'flex', height: '100%'}}>
                        <span className="glyphicon glyphicon-remove modal-dialog-header-button" style={{cursor: 'pointer' , color: '#fefefe', marginRight: '5px', fontSize: '14pt'}}
                            title="Close" onClick={(e) => this.closeMe('cancel')}/>
                    </div>
                </div>
                <div className="modal-dialog-body">
                    <div className="modal-dialog-body-client">
                        <table className="modal-table">
                            <thead className="modal-table-head">
                                <tr>
                                    <th className="modal-table-head-cell">Selected</th>
                                    <th>Column</th>
                                </tr>
                            </thead>
                            <tbody>
                                {columns}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="modal-dialog-button-bar">
                    <button className="modal-dialog-button-bar-button" title="Save Columns" onClick={(e) => this.closeMe('save')}>Apply</button>
                    <button className="modal-dialog-button-bar-button" title="Cancel" onClick={(e) => this.closeMe('cancel')}>Cancel</button>
                </div>
            </div>
        );
    }

    closeMe(action: string) {
        if (this.changedFlag === true) {
            this.props.columnsChanged();
        }
        this.props.closeDialog('cancel');
    }

    toggleColumn(columnName: string, include: boolean) {

        const userColumns: Columns = this.props.userColumns;
        if (!include) {
            if (userColumns.columns[columnName]) {
                userColumns.removeColumn(columnName);
                this.changedFlag = true;
            }
        } else {
            const column = (this.props.allColumns as FlowObjectDataArray).getItemWithPropertyValue('ColumnName', columnName);
            if (! userColumns.columns[columnName]) {
                userColumns.addColumn((column.properties['ColumnName'].value as string), (column.properties['ColumnLabel'].value as string), 'item-list-table-head-cell', 'item-list-table-body-cell', (column.properties['IsSearchable'].value as number) === 1 ? true : false , (column.properties['IsSortable'].value as number) === 1 ? true : false , eContentType[(column.properties['ColumnType'].value as keyof typeof eContentType)]);
                this.changedFlag = true;
            }
        }
        this.forceUpdate();
    }

}

export default ColumnManager;
