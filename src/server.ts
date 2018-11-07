#!/usr/bin/env node

import * as net from 'net';
import * as ws from 'ws';
import * as rpc from 'vscode-ws-jsonrpc';
import * as rpcServer from 'vscode-ws-jsonrpc/lib/server';
import * as parseArgs from 'minimist';

let argv = parseArgs(process.argv.slice(2));

if (argv.help) {
  console.log(`Usage: server.js --port 3000 --remotePath localhost -- 2089`);
  process.exit(1);
}

let serverPath : number = parseInt(argv.port) || 3000;
let remotePath : string = argv.remotePath || '127.0.0.1';
let remotePort : number = parseInt(argv.remotePort);

if (!remotePort) {
  console.log('--remotePort is required');
  process.exit(1);
}

const wss : ws.Server = new ws.Server({
  port: serverPath,
  perMessageDeflate: false
}, () => {
  console.log(`Listening to http and ws requests on ${serverPath}`);
});

const localSocket = net.connect(remotePort, remotePath, () => {
  console.log(`Connected to local server ${remotePath}:${remotePort}`);
});
const localReader : rpc.SocketMessageReader = new rpc.SocketMessageReader(localSocket);
const localWriter : rpc.SocketMessageWriter = new rpc.SocketMessageWriter(localSocket);
const localConnection : rpcServer.IConnection = rpcServer.createConnection(localReader, localWriter, () => {});

wss.on('connection', (client : ws) => {
  // The ws interface is compatible with the expected socket interface, except binaryType support
  const socket : rpc.IWebSocket = rpc.toSocket(client as any as WebSocket);
  const connection : rpcServer.IConnection = rpcServer.createWebSocketConnection(socket);
  rpcServer.forward(connection, localConnection);
  console.log(`Forwarding new client`);
});
