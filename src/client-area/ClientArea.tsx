import * as React from 'react';
import {FlowComponent} from '../models/FlowComponent';
import { IManywho } from '../models/interfaces';
import './ClientArea.css';

declare const manywho: IManywho;

class ClientArea extends FlowComponent {

    constructor(props: any) {
        super(props);
        this.handleMessage = this.handleMessage.bind(this);
    }

    render() {
        if (this.loadingState !== 'initial') {

            const url: string = this.getStateValue() as string;
            return (
                <div className="client-area">
                    <iframe
                        style={{ width: '100%', height: '100%', border: 'none', overflow: 'hidden'}}
                        src={this.getStateValue() as string}
                        scrolling="no"></iframe>
                </div>
                    );
        } else {
            return (
                    <div className="footer"/>
                );
        }
    }

    async handleMessage(msg: any) {
        alert(msg.action + ' - ' + msg.data);
    }

}

manywho.component.register('ClientArea', ClientArea);

export default ClientArea;
