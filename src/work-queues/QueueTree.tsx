import * as React from 'react';

import { eContentType, FlowField } from '../models/FlowField';
import { FlowObjectData } from '../models/FlowObjectData';
import { FlowObjectDataArray } from '../models/FlowObjectDataArray';
import { FlowObjectDataProperty } from '../models/FlowObjectDataProperty';
import IconPicker from '../models/IconPicker';
import ModalDialog from '../models/ModalDialog';
import './QueueTree.css';
import QueueTreeNode from './QueueTreeNode';
import WorkQueues from './WorkQueues';

declare const manywho: any;

class QueueTree extends React.Component<any, any> {

    parent: WorkQueues;

    nodes: QueueTreeNode[] = [];

    modalDialog: ModalDialog;
    modalShown: boolean = false;
    modalContent: JSX.Element;

    editQueueObject: any = {};

    constructor(props: any) {
        super(props);
        this.parent = props.parent;
        this.refreshQueues = this.refreshQueues.bind(this);
        this.newQueue = this.newQueue.bind(this);
        this.newQueueValueChanged = this.newQueueValueChanged.bind(this);
    }

    render() {
        this.nodes = [];
        const rootNodes = [];
        let elements: FlowObjectDataArray = new FlowObjectDataArray([]);
        if (this.props.queueGroups) {
            elements = this.props.queueGroups.value;
        }

        for (const item of elements.items) {
            rootNodes.push(<QueueTreeNode parent={this} attributes={this.props.attributes} ref={(me) => {this.nodes.push(me); }} queue={item}/>);
        }

        let modalDialog: JSX.Element;
        if (this.modalShown) {
            modalDialog = (<ModalDialog ref={(c) => {this.modalDialog = c; }} onCloseRequest={this.closeDialog.bind(this)}>
                                {this.modalContent}
                            </ModalDialog>);
        }

        return(
                <div className="queue-tree">
                    <div className="queue-tree-header">
                        <div className="queue-tree-header-title">
                            <span className="queue-tree-header-text">Work Queues</span>
                        </div>
                        <div className="queue-tree-header-buttons">
                            <span className="glyphicon glyphicon-plus queue-tree-header-button" title="New Queue" onClick={this.newQueue}/>
                            <span className="glyphicon glyphicon-refresh queue-tree-header-button" title="Refresh queues" onClick={this.refreshQueues}/>
                        </div>
                    </div>
                    <div className="queue-tree-body">
                        <ul className="tree">
                            {rootNodes}
                        </ul>
                    </div>
                    {modalDialog}
                </div>
                );
    }

    refreshQueues() {
        this.parent.refreshQueues();
    }

    newQueueValueChanged(valToSet: any, e: any) {
        const val: string = e.target.value;

    }

    newQueue() {
        // show dialog
        this.editQueueObject.rowId = null;
        this.editQueueObject.queueId = null;
        this.editQueueObject.queueName = null;
        this.editQueueObject.description = null;
        this.editQueueObject.where = null;
        this.editQueueObject.notifyEmail = null;
        this.editQueueObject.notifySMS = null;
        this.editQueueObject.icon = null;

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
                        value={this.editQueueObject.queueId}
                        onChange={(e) => {this.editQueueObject.queueId = e.target.value; }}/>

                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Name</span>
                        <input
                        className="modal-dialog-input"
                        type="text"
                        value={this.editQueueObject.queueName}
                        onChange={(e) => {this.editQueueObject.queueName = e.target.value; }}/>
                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Description</span>
                        <input
                        style={{width: '500px'}}
                        className="modal-dialog-input"
                        type="text"
                        value={this.editQueueObject.description}
                        onChange={(e) => {this.editQueueObject.description = e.target.value; }}/>
                    </div>
                    <div className="modal-dialog-input-row">
                        <span className="modal-dialog-input-label">Icon</span>
                        <IconPicker onChangeValue={(e: any) => {this.editQueueObject.icon = e.target.value; }}/>
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

    showDialog(content: JSX.Element) {
        this.modalContent = content;
        this.modalShown = true;
        this.forceUpdate();
    }

    async closeDialog(action: any) {
        this.modalShown = false;

        if (action === 'saveQueue') {
            await this.saveQueue();
        }
        this.forceUpdate();
    }

    queueSelected(queueId: number) {
        this.parent.queueSelected(queueId);
        for (const node of this.nodes) {
            if (node) {
                node.refresh();
            }

        }
    }

    getSelectedQueueId() {
        return this.parent.getSelectedQueueId();
    }
}

export default QueueTree;
