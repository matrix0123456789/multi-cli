import {Manager} from "./Manager.js";

import {spawn} from "child_process"


function parseCommand(command) {
    const splitted = command.split(' ');
    return {executable: splitted[0], args: splitted.slice(1)};
}


let processes = process.argv.splice(2).map(x => {
    const {executable, args} = parseCommand(x);
    return spawn(executable, args);
});

new Manager(process.stdin, process.stdout, processes)



