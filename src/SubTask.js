import {Buffer} from "./Buffer.js";
import {log} from "./debug.js";

export class SubTask {
    constructor(proc, name, output = {}, onchange = null) {
        this._output = {x: 0, y: 0, width: 80, height: 25, stream: null, ...output};
        this.name = name;
        this.proc = proc;
        this.buffer = new Buffer(this._getBufferOutput());
        this.status = 'running';
        this.onchange = onchange ?? (() => {
        });

        proc.stdin.resume();
        proc.stdin.setEncoding('utf8');
        proc.stdout.resume();
        proc.stdout.setEncoding('utf8');

        proc.on('close', (code) => {
            log('closeProc')
            this.status = 'closed';
            this.draw();
            this.onchange();
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

    get output() {
        return this._output;
    }

    set output(value) {
        this._output = value;
        this.buffer.output = this._getBufferOutput();
    }

    _getBufferOutput() {
        return {
            x: this.output.x,
            y: this.output.y + 1,
            width: this.output.width - 1,
            height: this.output.height - 1,
            stream: this.output.stream
        };
    }

    draw() {
        this.drawHeader();
        this.drawBuffer();
    }


    drawHeader() {
        if (!this.output.stream) return;

        let name = this.name;
        if (this.status === 'closed') {
            name = '*' + name + '*';
        }
        this.output.stream.cursorTo(this.output.x, this.output.y);
        if (this.isCurrentTask) {
            if (this.isInside)
                this.output.stream.write('\x1B[7m');
        }
        this.output.stream.write('\x1B[4m');
        let position = 0;

        while (position < (this.output.width - name.length) / 2) {
            this.output.stream.write(' ');
            position++;
        }
        //process.stdout.write('\x1B[4m');
        if (this.isCurrentTask) {
            if (!this.isInside)
                this.output.stream.write('\x1B[7m');
        }
        this.output.stream.write(name);
        if (this.isCurrentTask) {
            if (!this.isInside)
                this.output.stream.write('\x1B[27m');
        }
        position += this.name.length;
        while (position < this.output.width) {
            this.output.stream.write(' ');
            position++;
        }
        this.output.stream.write('\x1B[0m');
    }

    drawBuffer() {
        this.buffer.redraw();
    }
}