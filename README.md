# FXServer Starter Kit with Bun

A minimal template for setting up a FiveM server using `bun create`.

## Getting started
> [!NOTE]
> Install [Bun](https://bun.com) and [Git](https://git-scm.com/) if you don't already have them.

```bash
bun create overextended/fxserver
cd fxserver
```

## Configure

Most base settings can be configured in `server-data/server.cfg` (see https://aka.cfx.re/server-commands). For more configuration files, see `server-data/config`.

Your cfx license, mysql connection string, and other private variables (e.g. API keys) should be stored in `server-data/config/secrets.cfg`.


## Start FXServer

```bash
bun fx start
```
