import fc from 'fast-check';
import {expect} from 'chai';
import {Buffer} from '../src/Buffer';

function wait() {
    return new Promise((r) => setTimeout(r, 0));
}

describe('sample buffer read', () => {
    it('1', async () => {
        const obj = new Buffer({width:10,height:2});
        obj.addRaw("Hello\r\nWorld");
        expect(obj.screen).to.be.deep.equal(["Hello","World"]);
    });
    it('2', async () => {
        const obj = new Buffer({width:10,height:2});
        obj.addRaw("Hello World");
        expect(obj.screen).to.be.deep.equal(["Hello Worl","d"]);

    });
    it('3', async () => {
        const obj = new Buffer({width:10,height:3});
        obj.addRaw("Hello World");
        expect(obj.screen).to.be.deep.equal(["Hello Worl","d", ""]);
    });
    it('4', async () => {
        const obj = new Buffer({width:10,height:3});
        obj.addRaw("Hello");
        expect(obj.screen).to.be.deep.equal(["Hello","", ""]);
        obj.addRaw(" ");
        expect(obj.screen).to.be.deep.equal(["Hello ","", ""]);
        obj.addRaw("World");
        expect(obj.screen).to.be.deep.equal(["Hello Worl","d", ""]);
    });

});