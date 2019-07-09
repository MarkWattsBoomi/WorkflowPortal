import * as React from 'react';

import { FlowObjectData } from '../models/FlowObjectData';
import QueryTool from './QueryTool';
import { SearchCriteria } from './SearchCriteria';
import './Searcher.css';

declare const manywho: any;

class Searcher extends React.Component<any, any> {

    parent: QueryTool;

    inputCreatedBy: any;
    inputSAPFileName: any;

    constructor(props: any) {
        super(props);
        this.parent = props.parent;
        this.search = this.search.bind(this);
        this.clearCriteria = this.clearCriteria.bind(this);
        this.setValue = this.setValue.bind(this);
    }

    render() {

        return(
                <div className="searcher">
                    <div className="searcher-header">
                        <div className="searcher-header-title">
                            <span className="searcher-header-text">Search Criteria</span>
                        </div>
                        <div className="searcher-header-buttons">
                            <span className="glyphicon glyphicon-search searcher-header-button" title="Search" onClick={this.search}/>
                            <span className="glyphicon glyphicon-remove searcher-header-button" title="Clear criteria" onClick={this.clearCriteria}/>
                        </div>
                    </div>
                    <div className="searcher-body">
                        <div className="search-field">
                            <div className="search-field-inner">
                                <span className="search-field-label">Created By</span>
                                <input className="search-field-input-text" style={{width: '210px'}} type="text" ref={(c) => {this.inputCreatedBy = c; }}></input>
                                <span className="glyphicon glyphicon-user search-field-input-button" title="Set to me" onClick={(e: any) => this.setValue(this.inputCreatedBy, this.parent.user.email , e)}/>
                            </div>
                        </div>
                        <div className="search-field">
                            <div className="search-field-inner">
                                <span className="search-field-label">SAP File Name</span>
                                <input className="search-field-input-text" type="text" ref={(c) => {this.inputSAPFileName = c; }}/>
                            </div>
                        </div>
                    </div>
                </div>
                );
    }

    search() {
        this.parent.search();
    }

    getCriteria(): SearchCriteria[] {
        const criteria: SearchCriteria[] = [];

        if (this.inputCreatedBy.value.length > 0) {
            criteria.push(new SearchCriteria('fields.creator', '=', this.inputCreatedBy.value));
        }
        if (this.inputSAPFileName.value.length > 0) {
            criteria.push(new SearchCriteria('fields.SAPFileName', ' LIKE ', '%' + this.inputSAPFileName.value + '%'));
        }
        return criteria;
    }
    clearCriteria() {
        this.inputCreatedBy.value = '';
        this.inputSAPFileName.value = '';
        this.forceUpdate();
    }

    setValue(component: any, value: any, e: Event) {
        e.stopPropagation();
        component.value = value;
        this.forceUpdate();
    }
}

export default Searcher;
