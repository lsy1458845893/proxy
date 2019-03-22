/// <reference types="node" />
import * as http from "http";
import * as https from "https";
import * as net from "net";
export default class Proxy {
    constructor(server: http.Server | https.Server);
    request(req: http.IncomingMessage, res: http.ServerResponse): void;
    connect(req: http.IncomingMessage, client_socket: net.Socket, head: Buffer): void;
    direct(req: http.IncomingMessage, res: http.ServerResponse): void;
    authorization(req: http.IncomingMessage): Promise<boolean> | boolean;
    onproxy(type: 'request' | 'connect', req: http.IncomingMessage): void;
    onerror(type: 'request' | 'connect', req: http.IncomingMessage, e: Error): void;
}
