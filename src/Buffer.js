export class Buffer {
    constructor(output={}) {
        this.output={x:0,y:0,width:80,height:25, stream:null, ...output};
        this._raw = '';
        this.screen = [];
        this._x = 0;
        this._y = 0;
    }

    regenerateScreen() {
        this._x = 0;
        this._y = 0;
        this.screen = Array.from({length: this.output.height}, () => '');
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
        if (this._y >= this.output.height - 1) {
            this.screen.splice(0, 1);
            this.screen.push('')
        } else {
            this._y++;
        }
    }

    newChar(char) {
        this.screen[this._y] += char;
        this._x++;
        if (this._x >= this.output.width) {
            this.newLine();
        }
    }

    addRaw(data) {
        this._raw += data;
        this.regenerateScreen();
    }

    redraw() {
        this.regenerateScreen();

        if (this.output.stream)
            for (let i = 0; i < this.screen.length; i++) {
                this.output.stream.cursorTo(this.output.x, this.output.y + i);
                this.output.stream.write(this.screen[i]);
            }
    }
}