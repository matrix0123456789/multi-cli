import {Buffer} from "./Buffer.js";

import {spawn} from "child_process"

let currentTask = null;
let isInside = false;

class SubTask {
    constructor(path, args = []) {
        this.name = path;
        this.buffer = '';
        const proc = spawn(path, args);
        this.buffer = new Buffer(proc);
        this.x = 0;
        this.y = 0;
        this._width = 80;
        this._height = 25;

        proc.on('close', (code) => {
            // console.log(`child process exited with code ${code}`);
        });
        proc.stdout.on('data', (data) => {
            this.buffer.addRaw(data);
            this.draw();
        });

        proc.stderr.on('data', (data) => {
            this.buffer.addRaw(data);
            this.draw();
        });
        this.draw();
    }

    get width() {
        return this._width;
    }

    set width(value) {
        this._width = value;
        this.buffer.width = value - 1;
    }

    get height() {
        return this._height;
    }

    set height(value) {
        this._height = value;
        this.buffer.height = value - 1;
    }

    draw() {
        this.drawHeader();
        this.drawBuffer();
    }


    drawHeader() {
        process.stdout.cursorTo(this.x, this.y);
        if (this === currentTask && isInside) {
            process.stdout.write('\x1B[7m');
        }
        let position = 0;
        while (position < (this.width - this.name.length) / 2) {
            process.stdout.write('_');
            position++;
        }
        //process.stdout.write('\x1B[4m');
        if (this === currentTask && !isInside) {
            process.stdout.write('\x1B[7m');
        }
        process.stdout.write(this.name);
        process.stdout.write('\x1B[24m');
        position += this.name.length;
        while (position < this.width) {
            process.stdout.write('_');
            position++;
        }
        process.stdout.write('\x1B[0m');
    }

    drawBuffer() {
        this.buffer.redraw(this.x, this.y + 1);
    }
}

let tasks = process.argv.splice(2).map(x => {
    const parsed = parseCommand(x);
    return new SubTask(parsed.executable, parsed.args)
});
currentTask = tasks[0];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.setRawMode(true);
process.stdin.on('readable', () => {
    let chunk;
    // Use a loop to make sure we read all available data.
    while ((chunk = process.stdin.read()) !== null) {
        if (chunk.charCodeAt(0) === 3)
            process.exit();
        //  console.log(`data: ${chunk}`, chunk.charCodeAt(0));
    }
});

process.stdout.on('resize', () => {
    // console.log('screen size has changed!');
    // console.log(`${process.stdout.columns}x${process.stdout.rows}`);
    setSizes();
});

function setSizes() {
    process.stdout.write('\x1b[2J');
    let x = 0;
    let width = process.stdout.columns;

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        task.x = x;
        task.y = 0;
        task.width = Math.round(width / tasks.length * (i + 1) - x);
        x += task.width;
        task.height = process.stdout.rows;
        task.draw();
    }
}

function parseCommand(command) {
    const splitted = command.split(' ');
    return {executable: splitted[0], args: splitted.slice(1)};
}

setSizes();