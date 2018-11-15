Sets up a websocket proxy for any number of language servers.

Each server is run as a subprocess which is connected to by sending the client
to the URL /<language> based on a configuration file defined locally. For example,
with the following defined as `servers.yml`:

```
langservers:
  python:
    - python
    - python-langserver.py
    - --stdio
  go:
    - /usr/local/bin/go
    - langserver.go
```

The client would connect to `ws://localhost/python` to get a python language server

Usage:

```
npm install
npm run prepare
node dist/server.js --port 3000 --languageServers servers.yml
```
