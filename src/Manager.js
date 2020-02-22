import {SubTask} from "./SubTask.js";

export class Manager {
    constructor(stdin, stdout, proceses = [], interactive = false) {
        stdin.resume();
        stdin.setEncoding('utf8');
        stdin.setRawMode(true);

        this.interactive = interactive;
        this._stdin = stdin;
        this._stdout = stdout;
        this.subTasks = [];
        const sizes = this._getSizes(proceses.length)
        for (let i = 0; i < proceses.length; i++) {
            this.subTasks[i] = new SubTask(proceses[i], proceses[i].spawnfile, sizes[i])
        }
        this.isInside = false;
        this.selectedIndex = 0;

        stdout.on('resize', () => {
            const sizes = this._getSizes(this.subTasks.length)
            for (let i = 0; i < this.subTasks.length; i++) {
                this.subTasks[i].output = sizes[i];
            }
            this.draw();
        });
        this.draw();

        stdin.on('readable', () => {
            let chunk;
            // Use a loop to make sure we read all available data.
            while ((chunk = process.stdin.read()) !== null) {
                if (!this.interactive) {
                    if (chunk.charCodeAt(0) === 3)
                        process.exit();
                } else {
                    if (this.isInside) {
                        if (chunk.charCodeAt(0) === 4)//ctrl+d
                            this.isInside = false;
                        else {
                            //this.subTasks[this.selectedIndex].proc.stdin.write("ping google.pl");
                            this.subTasks[this.selectedIndex].proc.stdin.write(chunk);
                            //this.subTasks[this.selectedIndex].proc.stdin.write("\n");
                            //this.subTasks[this.selectedIndex].proc.stdin.write("aaa");
                            //this.subTasks[this.selectedIndex].proc.stdin.flush()

                            this.draw();
                        }
                    } else {
                        if (chunk.charCodeAt(0) === 3)
                            process.exit();
                        else if (chunk.charCodeAt(0) === 13)//enter
                            this.isInside = true;
                        else if (chunk.charCodeAt(0) === 27) {//escape
                            if (chunk.charCodeAt(1) === 91) {
                                if (chunk.charCodeAt(2) === 67) {
                                    this.selectedIndex++;
                                    this.draw();
                                }
                                if (chunk.charCodeAt(2) === 68) {
                                    this.selectedIndex--;
                                    this.draw();
                                }
                            }
                        } else
                            console.log(`data:`, chunk.charCodeAt(0), chunk.charCodeAt(1), chunk.charCodeAt(2), chunk.charCodeAt(3));
                    }
                }
            }
        });

    }

    get selectedIndex() {
        return this._selectedIndex;
    }

    set selectedIndex(value) {
        let max = this.subTasks.length;
        this._selectedIndex = (value + max) % max;
        this._refreshStateOfSubTasks();
    }

    get isInside() {
        return this._isInside;
    }

    set isInside(value) {
        this._isInside = !!value;
        this._refreshStateOfSubTasks();
    }

    _refreshStateOfSubTasks() {
        for (let i = 0; i < this.subTasks.length; i++) {
            this.subTasks[i].isCurrentTask = this.interactive && i === this._selectedIndex;
            this.subTasks[i].isInside = this.isInside && i === this._selectedIndex;
        }
    }

    _getSizes(count) {
        let x = 0;
        let ret = [];
        let width = this._stdout.columns || 80;
        let height = this._stdout.rows || 25;
        for (let i = 0; i < count; i++) {
            const item = {
                x: x,
                y: 0,
                width: Math.round(width / count * (i + 1) - x),
                height: height,
                stream: this._stdout
            };
            ret.push(item);
            x += item.width;
        }
        return ret;
    }

    draw() {
        this._stdout.write('\x1b[2J');
        this.subTasks.forEach(x => x.draw())
    }
}