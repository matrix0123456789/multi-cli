const {spawn} = require('child_process');
let currentTask = null;
let isInside = false;

class SubTask {
    constructor(path, args = []) {
        this.name = path;
        this.buffer = '';
        const ls = spawn(path, args);

        ls.stdout.on('data', (data) => {
            this.buffer += data;
            //console.log(`stdout: ${data}`);
            this.draw();
        });

        ls.stderr.on('data', (data) => {
            this.buffer += data;
            // console.error(`stderr: ${data}`);
            this.draw();
        });

        ls.on('close', (code) => {
            // console.log(`child process exited with code ${code}`);
        });
    }

    draw() {
        this.drawHeader();
        this.drawBuffer();
    }

    drawBuffer() {
        let ix = 0, iy = 0;
        process.stdout.cursorTo(this.x + ix, this.y + 1);
        for (let bufpos = 0; bufpos < this.buffer.length; bufpos++) {
            const char = this.buffer[bufpos];
            if (char == '\n') {
                ix = 0;
                iy++;
                process.stdout.cursorTo(this.x + ix, this.y + iy + 1);
            } else if (char == '\r') {
                ix = 0;
                process.stdout.cursorTo(this.x + ix, this.y + iy + 1);
            } else {
                process.stdout.write(char);
                ix++;
                if (ix >= this.width) {
                    ix = 0;
                    iy++;

                    process.stdout.cursorTo(this.x + ix, this.y + iy + 1);
                }
            }
        }
    }

    drawHeader() {
        process.stdout.cursorTo(this.x, this.y);
        if (this === currentTask&&isInside) {
                process.stdout.write('\x1B[7m');
        }
        let position = 0;
        while (position < (this.width - this.name.length) / 2) {
            process.stdout.write('_');
            position++;
        }
        //process.stdout.write('\x1B[4m');
        if (this === currentTask&&!isInside) {
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
}

let tasks = process.argv.splice(2).map(x => {
    const parsed = parseCommand(x);
    return new SubTask(parsed.executable, parsed.args)
});
currentTask=tasks[0];

const tty = require('tty');
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