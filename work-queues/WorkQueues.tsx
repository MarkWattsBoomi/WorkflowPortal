import * as React from 'react';
import { FlowPage } from '../models/FlowPage';
import { IManywho } from '../models/interfaces';
import ItemList from './ItemList';
import QueueTree from './QueueTree';
import WorkItem from './WorkItem';
import './WorkQueues.css';

declare const manywho: IManywho;

class WorkQueues extends FlowPage {

    selectedQueueId: number = undefined;
    waitSpinner = 'https://media.giphy.com/media/6Egwsh5J2kvhmXALVu/giphy.gif';

    private queueTree: QueueTree;
    private itemList: ItemList;
    private workItem: WorkItem;
    private currentWorkitemPage: string;

    constructor(props: any) {
        super(props);
        this.openPage = this.openPage.bind(this);
        this.closeApplication = this.closeApplication.bind(this);
        this.receiveMessage = this.receiveMessage.bind(this);
        this.deselectItem = this.deselectItem.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
    }

    render() {
        if (this.loadingState !== 'initial') {
            const queueGroups = this.fields.UserQueues;
            const queueItems = this.fields.WorkItems;
            const queueItemRequest = this.fields.GetQueueItemsRequest;
            const columnGetterRequest = this.fields.GetQueueColumnsRequest;
            const queueColumns = this.fields.QueueColumns;
            const SaveUserQueueColumns = this.fields.SaveUserQueueColumns;

            if (!this.selectedQueueId) {
                // this.selectedQueueId = queueItemRequest.getObjectData()[0].QueueId as number;
            }

            return (
                    <div className="work-queues">
                        <div className="work-queues-tree">
                            <QueueTree
                                ref={(c) => {this.queueTree = c; }}
                                queueGroups={queueGroups}
                                attributes={this. attributes}
                                parent={this}
                                root={this}
                            />
                        </div>
                        <div className="work-items">
                            <div className="work-items-list">
                                <ItemList
                                    ref={(c) => {this.itemList = c; }}
                                    queueItems={queueItems}
                                    queueItemRequest={queueItemRequest}
                                    saveQueueColumns={SaveUserQueueColumns}
                                    columnGetterRequest={columnGetterRequest}
                                    queueColumns={queueColumns}
                                    updateValues={this.updateValues}
                                    triggerOutcome={this.triggerOutcome}
                                    parent={this}
                                    attributes={this.attributes}
                                    root={this}
                                    outcomes={this.outcomes}
                                />
                            </div>
                            <div className="work-item-frame">
                                <WorkItem
                                    ref={(c) => {this.workItem = c; }}
                                    parent={this}
                                    root={this}
                                    attributes={this.attributes}
                                />
                            </div>

                        </div>
                    </div>
                    );
        } else {
            return (
                    <div className="work-queues">
                        <div className="wait-container">
                        LOAD
                            <div className="wait-spinner"/>
                        </div>
                    </div>
                );
        }
    }

    deselectItem() {
        this.workItem.deselect();
        this.itemList.deselect();
    }

    refreshQueues() {
        this.selectedQueueId = undefined;
        this.itemList.queueSelected();
        this.workItem.deselect();
        this.triggerOutcome('refresh queues');
    }

    queueSelected(queueId: number) {
        this.selectedQueueId = queueId;
        this.itemList.queueSelected();
        this.workItem.deselect();
    }

    getSelectedQueueId() {
        return this.selectedQueueId;
    }

    openPage(page: string) {
        // replace default
        this.currentWorkitemPage = page.replace('default', 'WorkItem');
        this.workItem.openPage(this.currentWorkitemPage);
    }

    closeApplication() {
        window.close();
        // this.props.triggerOutcome();
    }

    async handleMessage(msg: any) {

        switch (msg.action.toUpperCase()) {

            case 'REFRESH':
                this.currentWorkitemPage = '';
                this.workItem.deselect();
                this.itemList.deselect();
                this.itemList.refreshItems();
                break;

            case 'RESELECT':
                this.workItem.openPage(this.currentWorkitemPage);
                break;

            default:
                alert(msg.message + '-' + msg.data);
                break;
        }
    }
}

manywho.component.register('WorkQueues', WorkQueues);

export default WorkQueues;
