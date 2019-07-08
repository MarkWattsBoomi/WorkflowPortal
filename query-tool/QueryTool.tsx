import * as React from 'react';
import { FlowObjectData } from '../models/FlowObjectData';
import { FlowPage } from '../models/FlowPage';
import { IManywho } from '../models/interfaces';
import HitList from './HitList';
import './QueryTool.css';
import Searcher from './Searcher';
import WorkItemDetail from './WorkItemDetails';

declare const manywho: IManywho;

class QueryTool extends FlowPage {

    waitSpinner = 'https://media.giphy.com/media/6Egwsh5J2kvhmXALVu/giphy.gif';

    searcher: Searcher;
    hitList: HitList;
    workItemDetail: WorkItemDetail;

    constructor(props: any) {
        super(props);

        this.deselectItem = this.deselectItem.bind(this);
        this.search = this.search.bind(this);
    }

    render() {
        if (this.loadingState !== 'initial') {
            return (
                    <div className="query-tool">
                        <div className="query-tool-tools">
                            <Searcher
                                ref={(c) => {this.searcher = c; }}
                                parent={this}
                                attributes={this.attributes}
                                root={this}
                            />
                        </div>
                        <div className="query-tool-results">
                            <div className="query-tool-items">
                                <HitList
                                    ref={(c) => {this.hitList = c; }}
                                    parent={this}
                                    attributes={this.attributes}
                                    root={this}
                                    searchResults={this.fields['searchResults']}
                                    searchRequest={this.fields['GetQueueItemsRequest']}
                                    updateValues={this.updateValues}
                                    triggerOutcome={this.triggerOutcome}
                                />
                            </div>
                            <div className="query-tool-details">
                                <WorkItemDetail
                                    ref={(c) => {this.workItemDetail = c; }}
                                    parent={this}
                                    attributes={this.attributes}
                                    root={this}
                                    auditEvents={this.fields['AuditEvents']}
                                    selectedStateId={this.fields['SelectedStateId']}
                                    updateValues={this.updateValues}
                                    triggerOutcome={this.triggerOutcome}
                                />
                            </div>

                        </div>
                    </div>
                    );
        } else {
            return (
                    <div className="query-tool"/>
                );
        }
    }

    selectItem(stateId: string) {

    }

    deselectItem() {

    }

    openItem(item: FlowObjectData) {
       this.workItemDetail.showItem(item);
    }

    search() {
        this.hitList.search();
    }
}

manywho.component.register('QueryTool', QueryTool);

export default QueryTool;
