import * as React from 'react';
import { eContentType } from '../models/FlowField';
import { FlowObjectData } from '../models/FlowObjectData';
import QueryTool from './QueryTool';
import { SearchCriteria } from './SearchCriteria';
import WorkItemDetail from './WorkItemDetails';
import './WorkItemDetails.css';

class PropertyItem extends React.Component<any, any> {

    parent: WorkItemDetail;

    constructor(props: any) {
        super(props);
        this.parent = props.parent;

    }

    render() {

        let value: string = '';

        // might need multiple
        const content = [];

        switch (this.props.field.contentType) {
            case eContentType.ContentNumber:
            case eContentType.ContentString:
                value = this.props.field.value as string;
                content.push(<div className="prop">
                    <span className="prop-element">{this.props.field.developerName}</span>
                    <span className="prop-element">{'='}</span>
                    <span className="prop-element">{value}</span>
                </div>);
                break;

            case eContentType.ContentDateTime:
                value = this.props.field.value ? new Date(this.props.field.value).toLocaleString() : '';
                content.push(<div className="prop">
                    <span className="prop-element">{this.props.field.developerName}</span>
                    <span className="prop-element">{'='}</span>
                    <span className="prop-element">{value}</span>
                </div>);
                break;
            case eContentType.ContentList:
                for (const item of this.props.field.value.items) {

                    content.push(<div className="prop">
                        <span className="prop-element">{item.properties['field_name'].value}</span>
                        <span className="prop-element">{'='}</span>
                        <span className="prop-element">{item.properties['field_value'].value}</span>
                    </div>);
                }

                break;
            default:
                value = '';
                content.push(<div className="prop">
                    <span className="prop-element">{this.props.field.developerName}</span>
                    <span className="prop-element">{'='}</span>
                    <span className="prop-element">{value}</span>
                </div>);
                break;
        }

        const date = new Date();
        const datetime = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        return (<div>{content}</div>);
    }
}

export default PropertyItem;
