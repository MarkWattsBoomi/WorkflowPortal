import { ColumnCountProperty } from 'csstype';
import * as React from 'react';
import WorkQueues from './WorkQueues';

import './WorkItem.css';

import { IManywho} from '../models/interfaces';

declare const manywho: IManywho;

// this is a worker class to handle all table header and cell generation
// populate it once at creation

class WorkItem extends React.Component<any, any> {
    parent: WorkQueues;
    iFrame: any;

    constructor(props: any) {

        super(props);
        this.parent = props.parent;

        this.openPage = this.openPage.bind(this);
        this.closeItem = this.closeItem.bind(this);
        this.deselect = this.deselect.bind(this);
    }

    render() {

        return(<div className="work-item">
                    <div className="work-item-header">
                        <div className="work-item-header-title">
                            <span className="work-item-header-text">Work Item</span>
                        </div>
                        <div className="work-item-header-buttons">
                            <span className="glyphicon glyphicon-remove item-list-header-button" title="Close Item" onClick={this.closeItem}></span>
                        </div>
                    </div>
                    <div className="work-item-body">
                          <iframe
                            className="work-item-iframe"
                            ref={(c) => {this.iFrame = c; }}
                            scrolling="no"
                            />
                    </div>
                </div>);
    }

    openPage(page: string) {
        this.iFrame.src = page;
    }

    closeItem() {
        this.parent.deselectItem();
    }

    deselect() {
        this.iFrame.src = '';
    }
}

export default WorkItem;
