#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";

const cliModuleUrl = pathToFileURL(path.join(process.cwd(), "node_modules/next-sitemap/dist/esm/cli.js")).href;
const { CLI } = await import(cliModuleUrl);

const cli = new CLI();
await cli.execute();
