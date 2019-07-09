import { IManywho} from '../models/interfaces';

declare const manywho: IManywho;

let workflowFlag: boolean = false;
let selectedOutcome: string = '';

// need to only do this if manywho.eventManager does not exist
if (!(manywho as any).eventManager) {
    const beforeSendListeners: Array<(xhr: XMLHttpRequest, request: any) => void> = [];
    const doneListeners: Array<(xhr: XMLHttpRequest, request: any) => void> = [];
    const failListeners: Array<(xhr: XMLHttpRequest, request: any) => void> = [];

    const beforeSend = (xhr: XMLHttpRequest, request: any) => {
        beforeSendListeners.forEach((listener) => listener(xhr, request));
    };

    const done = (xhr: XMLHttpRequest, request: any) => {
        doneListeners.forEach((listener) => listener(xhr, request));
    };

    const fail = (xhr: XMLHttpRequest, request: any) => {
        failListeners.forEach((listener) => listener(xhr, request));
    };

    manywho.settings.initialize(null, {
        invoke: {
            beforeSend,
            done,
            fail,
        },
    });

    const addBeforeSendListener = (handler: (xhr: XMLHttpRequest, request: any) => void) => {
        beforeSendListeners.push(handler);
    };

    const addDoneListener = (handler: (xhr: XMLHttpRequest, request: any) => void) => {
        doneListeners.push(handler);
    };

    const addFailListener = (handler: (xhr: XMLHttpRequest, request: any) => void) => {
        failListeners.push(handler);
    };

    (manywho as any).eventManager = {
        addBeforeSendListener,
        addDoneListener,
        addFailListener,
    };
}

export const notifyWorkqueues = (xhr: any, request: any) => {
    if (workflowFlag) {
        // need to construct a flowkey to get outcome
        const tenant = xhr.runFlowUri.split('/')[3];
        const state = xhr.stateId;
        const flowkey = manywho.utils.getFlowKey(tenant, null, null, state, null);
        const outcome = manywho.model.getOutcome(selectedOutcome, flowkey);

        if (outcome.attributes && outcome.attributes['NotifyParent'] && outcome.attributes['NotifyParent'] === 'true') {
            let data: string = null;
            let action: string = null;
            if (outcome.attributes['NotifyParentAction']) {
                action = outcome.attributes['NotifyParentAction'];
            }
            if (outcome.attributes['NotifyParentData']) {
                data = outcome.attributes['NotifyParentData'];
            }
            notify(action, data);
        } else {
            // notify('RESELECT');
        }
        workflowFlag = false;
        selectedOutcome = '';
    }
};

const notify = (action: string, data?: string) => {
    const msg: any = {};
    msg.action = action;
    msg.data = data;
    const json: string = JSON.stringify(msg);
    if (window.parent) {
        window.parent.postMessage(json, '*');
    }

    if (window.opener) {
        window.opener.postMessage(json, '*');
    }
};

export const loading = (xhr: XMLHttpRequest, request: any) => {
    const outcomeId: string = request.mapElementInvokeRequest.selectedOutcomeId;
    if (outcomeId && outcomeId.length > 0) {
        workflowFlag = true;
        selectedOutcome = outcomeId;
    }
};

(manywho as any).eventManager.addDoneListener(notifyWorkqueues);
(manywho as any).eventManager.addBeforeSendListener(loading);
// (manywho as any).eventManager.addFailListener(notifyWorkqueues);
