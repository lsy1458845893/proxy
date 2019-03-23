import * as http from "http";
import * as https from "https";
import * as net from "net";
import { parse } from "url";

export default class Proxy {

  constructor(server: http.Server | https.Server) {
    server.on('request', async (req: http.IncomingMessage, res: http.ServerResponse) => {
      if (req.url.startsWith('/')) {
        this.direct(req, res);
      } else if (await this.authorization(req)) {
        this.onproxy('request', req);
        this.request(req, res);
      } else {
        this.onerror('request', req, new Error('authorization error'));
        res.writeHead(404);
        res.end();
      }
    });

    server.on('connect', async (req: http.IncomingMessage, client_socket: net.Socket, head: Buffer) => {
      if (await this.authorization(req)) {
        this.onproxy('connect', req);
        this.connect(req, client_socket, head);
      } else {
        client_socket.end();
        this.onerror('connect', req, new Error('authorization error'));
      }
    });
  }

  protected request(req: http.IncomingMessage, res: http.ServerResponse) {
    const url = parse(req.url);
    const headers = {};
    for (const key in req.headers) {
      if (key == 'proxy-connection') continue;
      if (key == 'proxy-authorization') continue;
      if (key == 'proxy-authenticate') continue;
      headers[key] = req.headers[key];
    }
    const { method } = req;
    const { hostname, pathname, port } = url;
    const options: http.RequestOptions = {
      headers, method, hostname,
      path: pathname,
      port: port || 80
    };
    const server = http.request(options, server => {
      res.writeHead(server.statusCode, server.headers);
      server.pipe(res);
    });
    req.pipe(server);
    server.on('error', e => this.onerror('request', req, e));
  }

  protected connect(req: http.IncomingMessage, client_socket: net.Socket, head: Buffer) {
    const url = parse(`http://${req.url}`);
    const server_socket = net.connect(Number(url.port) || 80, url.hostname);
    client_socket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: Node.js-Proxy\r\n\r\n');
    server_socket.write(head);
    server_socket.pipe(client_socket);
    client_socket.pipe(server_socket);
    server_socket.on('error', e => this.onerror('connect', req, e));
  }

  protected direct(req: http.IncomingMessage, res: http.ServerResponse): void { res.writeHead(404); }

  public authorization(req: http.IncomingMessage): Promise<boolean> | boolean { return true; }

  public onproxy(type: 'request' | 'connect', req: http.IncomingMessage): void { }

  public onerror(type: 'request' | 'connect', req: http.IncomingMessage, e: Error): void { }
}
