export class Buffer {
    constructor(width = 80, height = 25, writeToStdOut = true) {
        this.width = width;
        this.height = height;
        this._raw = '';
        this.screen = [];
        this._x = 0;
        this._y = 0;
        this.writeToStdOut = writeToStdOut;
    }

    regenerateScreen() {
        this._x = 0;
        this._y = 0;
        this.screen = Array.from({length: this.height}, () => '');
        for (let pos = 0; pos < this._raw.length; pos++) {
            const char = this._raw[pos];
            if (char == '\n') {
                this.newLine();
            } else if (char == '\r') {
                this._x = 0;
            } else {
                this.newChar(char);
            }
        }
    }

    newLine() {
        this._x = 0;
        if (this._y >= this.height - 1) {
            this.screen.splice(0, 1);
            this.screen.push('')
        } else {
            this._y++;
        }
    }

    newChar(char) {
        this.screen[this._y] += char;
        this._x++;
        if (this._x >= this.width) {
            this.newLine();
        }
    }

    addRaw(data) {
        this._raw += data;
        this.regenerateScreen();
    }

    redraw(x, y) {
        this.regenerateScreen();

        if (this.writeToStdOut)
            for (let i = 0; i < this.screen.length; i++) {
                process.stdout.cursorTo(x, y + i);
                process.stdout.write(this.screen[i]);
            }
    }
}