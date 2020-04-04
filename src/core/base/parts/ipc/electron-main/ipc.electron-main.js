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
const lifecycle_1 = require("../../../common/lifecycle");
const buffer_1 = require("../../../common/buffer");
function createScopedOnMessageEvent(senderId, eventName) {
    const onMessage = event_1.Event.fromNodeEventEmitter(electron_1.ipcMain, eventName, (event, message) => ({ event, message }));
    const onMessageFromSender = event_1.Event.filter(onMessage, ({ event }) => event.sender.id === senderId);
    return event_1.Event.map(onMessageFromSender, ({ message }) => message ? buffer_1.VSBuffer.wrap(message) : message);
}
class Server extends ipc_1.IPCServer {
    constructor() {
        super(Server.getOnDidClientConnect());
    }
    static getOnDidClientConnect() {
        const onHello = event_1.Event.fromNodeEventEmitter(electron_1.ipcMain, 'ipc:hello', ({ sender }) => sender);
        return event_1.Event.map(onHello, webContents => {
            const id = webContents.id;
            const client = Server.Clients.get(id);
            if (client) {
                client.dispose();
            }
            const onDidClientReconnect = new event_1.Emitter();
            Server.Clients.set(id, lifecycle_1.toDisposable(() => onDidClientReconnect.fire()));
            const onMessage = createScopedOnMessageEvent(id, 'ipc:message');
            const onDidClientDisconnect = event_1.Event.any(event_1.Event.signal(createScopedOnMessageEvent(id, 'ipc:disconnect')), onDidClientReconnect.event);
            const protocol = new ipc_electron_1.Protocol(webContents, onMessage);
            return { protocol, onDidClientDisconnect };
        });
    }
}
exports.Server = Server;
Server.Clients = new Map();
