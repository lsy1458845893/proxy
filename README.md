# proxy
simple http proxy

## example

```ts

import * as http from "http";
import * as https from "https";
import Proxy from "@ya-lsy/proxy";

class MyProxyServer extends Proxy {

  constructor(server: http.Server | https.Server) {
    super(server);
  }

  authorization(req: http.IncomingMessage): boolean {
    return true;
  }

  direct(req: http.IncomingMessage, res: http.ServerResponse) {
    res.end('hello world');
  }

  onerror(type: 'request' | 'connect', req: http.IncomingMessage) {
    console.log('onerror:', type, req.socket.remoteAddress, req.url);
  }

  onproxy(type: 'request' | 'connect', req: http.IncomingMessage) {
    console.log('onproxy:', type, req.socket.remoteAddress, req.url);
  }
}

const server = http.createServer();

const proxy = new MyProxyServer(server);

server.listen(8080);

```
You can test `curl -vv --proxy http://localhost:8080 https://github.com`
js will print `onproxy: connect ::ffff:127.0.0.1 github.com:443`

