Chrommander
===========

A simple REST API for interacting with [Headless Chrome](https://developers.google.com/web/updates/2017/04/headless-chrome).

**This package is a work in progress and not ready for use in production. Use at own risk.**

## Install

```sh
npm install -g chrommander
```

## Start

```sh
chrommander
```

### Options

```
--help         Show available arguments
--port, -p     The port to run the server on  [default: 8090]
--chrome-port  The port to run Chrome on      [default: 9222]
```

## REST API Endpoints

### [GET] /dom

Loads a page and returns the document's innerHTML.

#### Request Params

| Name | Description |
|---|---|
| **url** | **(Required)** URL to load and return the document's HTML |
| **block** | Comma separated list of url's or url patterns (supports wildcards, eg `*.js`) that will be used to block network requests. You can also use the following groups; `scripts`, `styles`, `media`, `fonts`. Or to block all non-document assets you can use `assets`. |

#### Example Request

```
[GET] http://localhost:8090/dom?url=http://google.com&block=media,styles,*analytics*
```
(Make sure you encode the query string params if they require it)

#### Success Response

```json
{
    "success": true,
    "startTime": 123456788,
    "endTime": 123456789,
    "totalTime": 1,
    "totalRequests": 12,
    "requests": [
        "http://example.com/example",
        ...
    ],
    "result": "<html>...</html>"
}
```

#### Error Response

```json
{
    "success": false,
    "error": "Error description..."
}
```
