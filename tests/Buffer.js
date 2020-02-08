import fc from 'fast-check';
import {expect} from 'chai';
import {Buffer} from '../src/Buffer';

import "babel-core/register";
import "babel-polyfill";

function wait() {
    return new Promise((r) => setTimeout(r, 0));
}

describe('sample buffer read', () => {
    it('1', async () => {
        const obj = new Buffer(10,2, false);
        obj.addRaw("Hello\r\nWorld");
        expect(obj.screen).to.be.deep.equal(["Hello","World"]);
    });
    it('2', async () => {
        const obj = new Buffer(10,2, false);
        obj.addRaw("Hello World");
        expect(obj.screen).to.be.deep.equal(["Hello Worl","d"]);

    });
    it('3', async () => {
        const obj = new Buffer(10,3, false);
        obj.addRaw("Hello World");
        expect(obj.screen).to.be.deep.equal(["Hello Worl","d", ""]);
    });
    it('4', async () => {
        const obj = new Buffer(10,3, false);
        obj.addRaw("Hello");
        expect(obj.screen).to.be.deep.equal(["Hello","", ""]);
        obj.addRaw(" ");
        expect(obj.screen).to.be.deep.equal(["Hello ","", ""]);
        obj.addRaw("World");
        expect(obj.screen).to.be.deep.equal(["Hello Worl","d", ""]);
    });

});