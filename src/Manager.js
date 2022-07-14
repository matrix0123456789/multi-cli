import {SubTask} from "./SubTask.js";
import {log} from "./debug.js";
import {spawn} from "child_process";

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
            this.subTasks[i] = new SubTask(proceses[i], proceses[i].spawnfile, sizes[i], () => this.subTaskChanges())
        }
        this.isInside = false;
        this.selectedIndex = 0;

        stdout.on('resize', () => {
            this.refreshSize()
            this.draw();
        });
        this.draw();

        stdin.on('readable', () => {
            let chunk;
            // Use a loop to make sure we read all available data.
            while ((chunk = process.stdin.read()) !== null) {
                log(JSON.stringify({
                    interactive: this.interactive,
                    isInside: this.isInside,
                    selectedIndex: this.selectedIndex
                }))
                log('readable: ' + JSON.stringify(Array.from(chunk).map(x => x.charCodeAt(0))));
                if (!this.interactive) {
                    if (chunk.charCodeAt(0) === 3)
                        process.exit();
                } else {
                    if (this.isInside) {
                        if (chunk.charCodeAt(0) === 4)//ctrl+d
                        {
                            this.isInside = false;
                            this.draw();
                        } else if (chunk.charCodeAt(0) === 13)//enter
                        {
                            this.subTasks[this.selectedIndex].proc.stdin.write("\r\n");
                            this.draw();
                        } else {
                            this.subTasks[this.selectedIndex].proc.stdin.write(chunk);

                            this.draw();
                        }
                    } else {
                        if (chunk.charCodeAt(0) === 3)
                            process.exit();
                        else if (chunk.charCodeAt(0) === 13)//enter
                        {
                            this.isInside = true;
                            this.draw();
                        } else if (chunk.charCodeAt(0) === 20)//ctrl+t
                        {
                            let process = spawn('cmd');
                            this.subTasks.push(new SubTask(process, 'cmd', {}))
                            this.refreshSize();
                            this.draw();
                        } else if (chunk.charCodeAt(0) === 24)//ctrl+x
                        {
                            let removed = this.subTasks.splice(this.selectedIndex, 1);
                            this.refreshSize();
                            this.draw();
                        } else if (chunk.charCodeAt(0) === 27) {//escape
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
                        } else {
                            log([`data:`, chunk.charCodeAt(0), chunk.charCodeAt(1), chunk.charCodeAt(2), chunk.charCodeAt(3)]);

                        }
                    }
                }
            }
        });

    }

    refreshSize() {
        const sizes = this._getSizes(this.subTasks.length)
        for (let i = 0; i < this.subTasks.length; i++) {
            this.subTasks[i].output = sizes[i];
        }
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

    subTaskChanges() {
        if (!this.interactive) {
            if (this.subTasks.every(x => x.status == 'closed')) {
                process.exit();
            }
        }
    }
}