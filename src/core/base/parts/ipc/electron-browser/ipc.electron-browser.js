"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const event_1 = require("../../../common/event");
const ipc_1 = require("../common/ipc");
const ipc_electron_1 = require("../node/ipc.electron");
const electron_1 = require("electron");
const buffer_1 = require("../../../common/buffer");
class Client extends ipc_1.IPCClient {
    constructor(id) {
        const protocol = Client.createProtocol();
        super(protocol, id);
        this.protocol = protocol;
    }
    static createProtocol() {
        const onMessage = event_1.Event.fromNodeEventEmitter(electron_1.ipcRenderer, 'ipc:message', (_, message) => buffer_1.VSBuffer.wrap(message));
        electron_1.ipcRenderer.send('ipc:hello');
        return new ipc_electron_1.Protocol(electron_1.ipcRenderer, onMessage);
    }
    dispose() {
        this.protocol.dispose();
    }
}
exports.Client = Client;
