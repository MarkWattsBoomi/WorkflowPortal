import * as React from 'react';
import {FlowComponent} from '../models/FlowComponent';
import { IManywho } from '../models/interfaces';
import './Footer.css';

declare const manywho: IManywho;

class Footer extends FlowComponent {

    waitSpinner = 'https://media.giphy.com/media/6Egwsh5J2kvhmXALVu/giphy.gif';

    constructor(props: any) {
        super(props);
    }

    render() {
        if (this.loadingState !== 'initial') {
           // const queueGroups = this.values.filter((value: Value) => value.stateValue.developerName === 'UserQueues')[0];
            // const queueItems = this.values.filter((value: Value) => value.stateValue.developerName === 'QueueItems')[0];
            // const queueItemRequest = this.values.filter((value: Value) => value.stateValue.developerName === 'QueueItemRequest')[0];
            const text: string = this.getAttribute('Title', '&copy; Boomi Flow - 2019');
            return (
                <div className="footer">
                <span className="footer-text">{text}</span>
            </div>
                    );
        } else {
            return (
                    <div className="footer"/>
                );
        }
    }

}

manywho.component.register('Footer', Footer);

export default Footer;
