export class Buffer {
    constructor(width, height, childProcess) {
        this.width = width;
        this.height = height;
        this._raw = '';
        this._screen = null;
        this._x = 0;
        this._y = 0;
        childProcess.stdout.on('data', (data) => {
            this._raw += data;
        });

        childProcess.stderr.on('data', (data) => {
            this._raw += data;
        });
    }

    regenerateScreen() {
        this._x = 0;
        this._y = 0;
        this._screen = [];
        this._screen.length = this.height;
        this._screen = this._screen.map(x => '');
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
            this._screen.splice(0, 1);
            this._screen.push('')
        } else {
            this._y++;
        }
    }

    newChar(char) {
        this._screen[this._y] += char;
        this._x++;
        if (this._x >= this.width) {
            this.newLine();
        }
    }

    redraw(x, y) {
        if (!this._screen)
            this.regenerateScreen();

        for (let i = 0; i < this._screen.length; i++) {
            process.stdout.cursorTo(x, y + i);
            process.stdout.write(this._screen[i]);
        }
    }
}