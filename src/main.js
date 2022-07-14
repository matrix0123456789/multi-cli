#!/usr/bin/env node

import {Manager} from "./Manager.js";


import {log} from "./debug.js";
log('Start')

import {spawn, execSync} from "child_process"

execSync("cmd /c chcp 65001");

function parseCommand(command) {
    const splitted = command.split(' ');
    return {executable: splitted[0], args: splitted.slice(1)};
}


let interactive = process.argv.some(x => x === '-i' || x === '--interactive');
let processes = process.argv.splice(2).filter(x => x[0] !== '-').map(x => {
    const {executable, args} = parseCommand(x);
    return spawn(executable, args);
});

new Manager(process.stdin, process.stdout, processes, interactive)



