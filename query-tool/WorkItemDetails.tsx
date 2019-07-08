import * as React from 'react';

import { FlowField } from '../models/FlowField';
import { FlowObjectData } from '../models/FlowObjectData';
import { FlowObjectDataArray } from '../models/FlowObjectDataArray';
import AuditTrailItem from './AuditTrailItem';
import PropertyItem from './PropertyItem';
import QueryTool from './QueryTool';
import { SearchCriteria } from './SearchCriteria';
import './WorkItemDetails.css';

declare const manywho: any;

class WorkItemDetail extends React.Component<any, any> {

    parent: QueryTool;

    selectedItem: FlowObjectData;
    auditEvents: FlowField = null;

    constructor(props: any) {
        super(props);
        this.parent = props.parent;

        this.showItem = this.showItem.bind(this);
        this.deselectItem = this.deselectItem.bind(this);
        this.loadAudit = this.loadAudit.bind(this);
    }

    render() {

        // build audit trail
        const auditTrailItems = [];

        const values = [];

        if (this.auditEvents != null) {
            for (const auditItem of ((this.auditEvents as FlowField).value as FlowObjectDataArray).items) {
                auditTrailItems.push(<AuditTrailItem parent={this} auditItem={auditItem} />);
            }
        }
        if (this.selectedItem) {
            for (const key in this.selectedItem.properties) {
                values.push(<PropertyItem parent={this} field={this.selectedItem.properties[key]}/>);
            }
        }

        return(
                <div className="wid">
                    <div className="wid-header">
                        <div className="wid-header-title">
                            <span className="wid-header-text">Work Item Details</span>
                        </div>
                        <div className="wid-header-buttons">

                        </div>
                    </div>
                    <div className="wid-body">
                        <div className="wid-left">
                            <div className="wid-left-header">
                                <div className="wid-header-title">
                                    <span className="wid-header-text">Properties</span>
                                </div>
                                <div className="wid-header-buttons">

                                </div>
                            </div>
                            <div className="wid-left-body">
                                {values}
                            </div>
                        </div>
                        <div className="wid-right">
                            <div className="wid-right-header">
                                <div className="wid-header-title">
                                    <span className="wid-header-text">Audit Trail</span>
                                </div>
                                <div className="wid-header-buttons">
                                    <span className="glyphicon glyphicon-download-alt wid-header-button" title="Load Audit Items" onClick={this.loadAudit}/>
                                </div>
                            </div>
                            <div className="wid-right-body">
                                {auditTrailItems}
                            </div>
                        </div>

                    </div>
                </div>
                );
    }

    async showItem(item: FlowObjectData) {
        this.selectedItem = item;

        this.auditEvents = null;

        this.forceUpdate();
    }

    async loadAudit() {
        this.auditEvents = null;

        this.props.selectedStateId.value = this.selectedItem.properties['state_id'].value as string;

        await this.props.updateValues([this.props.selectedStateId]);

        // trigger outcome
        await this.props.triggerOutcome('get audit');

        this.auditEvents = this.props.auditEvents;

        this.forceUpdate();
    }

    deselectItem() {
        this.selectedItem = null;
        this.forceUpdate;
    }

}

export default WorkItemDetail;
