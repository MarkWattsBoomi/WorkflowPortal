import * as React from 'react';
import { IManywho } from '../models/interfaces';
import QueueTree from './QueueTree';
import './QueueTree.css';
declare const manywho: IManywho;

class QueueTreeNode extends React.Component<any, any> {
    parent: QueueTree;
    expanded: boolean = true;
    nodes: QueueTreeNode[] = [];

    constructor(props: any) {
        super(props);
        this.parent = props.parent;

        this.toggleExpand = this.toggleExpand.bind(this);
    }

    render() {
        // wipe children
        this.nodes = [];
        const children: JSX.Element[] = [];
        // expand - contract icon
        let expIcon: JSX.Element;
        if (this.props.queue.properties.Queues) {
            if (this.expanded === true) {
                expIcon = (
                            <span
                                className={'glyphicon glyphicon-' + (this.props.attributes.contractIcon.value || 'minus-sign') + ' queue-expand-icon'}
                                onClick={this.toggleExpand}
                            />
                        );

                for (const queue of this.props.queue.properties.Queues.value.items || []) {
                     children.push(
                                     <QueueTreeNode parent={this.parent} ref={(me) => {this.nodes.push(me); }} queue={queue} isSub={true}/>,
                                 );
                }

            } else {
                expIcon = (
                            <span className={'glyphicon glyphicon-' + (this.props.attributes.expandIcon.value || 'plus-sign') + ' queue-expand-icon'} />
                        );
                }

        }

        const icon: any = (
                            <span className={'glyphicon glyphicon-' + (this.props.queue.properties.icon.value || 'envelope') + ' queue-icon'}/>
                        );

        const label: any = (
                            <span className={'queue-label'} >{this.props.queue.properties.description.value}</span>
                        );

        let onclick: any;
        let nodeClass = '';
        let isSelected = '';
        // if (this.props.queue.developerName === 'workqueue') {
        onclick = this.queueSelected.bind(this, this.props.queue);
        nodeClass = 'sub-tree-item';
        isSelected = this.props.queue.properties.queue_id.value === this.parent.getSelectedQueueId() ? ' sub-tree-item-selected' : '';
        // } else {
        //    onclick = this.toggleExpand.bind(this);
        //    nodeClass = 'tree-item';
        // }

        return (
                <li className={nodeClass + ' ' + isSelected} onClick={onclick}>
                    {expIcon}
                    {icon}
                    {label}
                    <ul className="sub-tree">
                        {children}
                    </ul>
                </li>
                );
    }

    toggleExpand(e: any) {
        e.stopPropagation();
        this.expanded = !this.expanded;
        this.forceUpdate();
    }

    queueSelected(node: any, e: Event) {
        // only trigger for real queues, not groups
        // if (node.developerName === 'workqueue') {
            e.stopPropagation();
            this.parent.queueSelected(node.properties.queue_id.value);
            this.forceUpdate();
        // }
    }

    refresh() {
        this.forceUpdate();
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

export default QueueTreeNode;
