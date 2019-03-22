"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var http = require("http");
var net = require("net");
var url_1 = require("url");
var Proxy = /** @class */ (function () {
    function Proxy(server) {
        var _this = this;
        server.on('request', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!req.url.startsWith('/')) return [3 /*break*/, 1];
                        this.direct(req, res);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.authorization(req)];
                    case 2:
                        if (_a.sent()) {
                            this.onproxy('request', req);
                            this.request(req, res);
                        }
                        else {
                            this.onerror('request', req, new Error('authorization error'));
                            res.writeHead(404);
                            res.end();
                        }
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        server.on('connect', function (req, client_socket, head) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.authorization(req)];
                    case 1:
                        if (_a.sent()) {
                            this.onproxy('connect', req);
                            this.connect(req, client_socket, head);
                        }
                        else {
                            client_socket.end();
                            this.onerror('connect', req, new Error('authorization error'));
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    Proxy.prototype.request = function (req, res) {
        var _this = this;
        var url = url_1.parse(req.url);
        var headers = {};
        for (var key in req.headers) {
            if (key == 'proxy-connection')
                continue;
            if (key == 'proxy-authorization')
                continue;
            if (key == 'proxy-authenticate')
                continue;
            headers[key] = req.headers[key];
        }
        var method = req.method;
        var hostname = url.hostname, pathname = url.pathname, port = url.port;
        var options = {
            headers: headers, method: method, hostname: hostname,
            path: pathname,
            port: port || 80
        };
        var server = http.request(options, function (server) {
            res.writeHead(server.statusCode, server.headers);
            server.pipe(res);
        });
        req.pipe(server);
        server.on('error', function (e) { return _this.onerror('request', req, e); });
    };
    Proxy.prototype.connect = function (req, client_socket, head) {
        var _this = this;
        var url = url_1.parse("http://" + req.url);
        var server_socket = net.connect(Number(url.port) || 80, url.hostname);
        client_socket.write('HTTP/1.1 200 Connection Established\r\nProxy-agent: Node.js-Proxy\r\n\r\n');
        server_socket.write(head);
        server_socket.pipe(client_socket);
        client_socket.pipe(server_socket);
        server_socket.on('error', function (e) { return _this.onerror('connect', req, e); });
    };
    Proxy.prototype.direct = function (req, res) { res.writeHead(404); };
    Proxy.prototype.authorization = function (req) { return true; };
    Proxy.prototype.onproxy = function (type, req) { };
    Proxy.prototype.onerror = function (type, req, e) { };
    return Proxy;
}());
exports["default"] = Proxy;
