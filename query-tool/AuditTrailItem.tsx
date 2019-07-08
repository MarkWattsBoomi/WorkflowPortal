import * as React from 'react';
import { FlowObjectData } from '../models/FlowObjectData';
import QueryTool from './QueryTool';
import { SearchCriteria } from './SearchCriteria';
import WorkItemDetail from './WorkItemDetails';
import './WorkItemDetails.css';

class AuditTrailItem extends React.Component<any, any> {

    parent: WorkItemDetail;

    constructor(props: any) {
        super(props);
        this.parent = props.parent;

    }

    eventTypeToString(eventType: string): string {
        switch (eventType) {
            case '100':
                return 'Process Started';
            case '200':
                return 'SAP Validation Complete';
            case '300':
                return 'First Approver Retrieved';
            case '999':
                return 'An Error Occured';
            case '1000':
                return 'Delivering Work Item To Queue';
            case '1050':
                return 'Notifying Approver Of Work Item';
            case '1100':
                return 'Approver Notified Of Work Item';
            case '1200':
                return 'Journal Update Rejected';
            case '1300':
                return 'Journal Update Approved';
            case '1400':
                return 'Journal Update File Reviewed';

            default:
                return 'Unknown';
        }
    }

    render() {

        const date = new Date(this.props.auditItem.properties['event_date'].value);
        const datetime = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return (<div className="ati">
                    <span className="ati-element">{datetime}</span>
                    <span className="ati-element">{this.props.auditItem.properties['event_actor'].value}</span>
                    <span className="ati-element">{this.eventTypeToString(this.props.auditItem.properties['event_type'].value)}</span>
                    <span className="ati-element">{this.props.auditItem.properties['event_data'].value}</span>
                </div>);
    }
}

export default AuditTrailItem;
