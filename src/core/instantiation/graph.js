"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: pikun
 * @Date: 2019-12-07 17:43:21
 * @LastEditTime: 2019-12-08 22:51:39
 * @Description: 用于处理实例依赖关系的图
 */
const types_1 = require("../base/common/types");
const collections_1 = require("../base/common/collections");
function newNode(data) {
    return {
        data: data,
        incoming: Object.create(null),
        outgoing: Object.create(null)
    };
}
class Graph {
    constructor(_hashFn) {
        this._hashFn = _hashFn;
        this._nodes = Object.create(null);
    }
    roots() {
        const ret = [];
        // 此处root表示，被依赖的节点，此节点不依赖与其他模块，所以没有outgoing只向。只有incoming指向。
        // 此种节点可有多个
        collections_1.forEach(this._nodes, entry => {
            if (types_1.isEmptyObject(entry.value.outgoing)) {
                ret.push(entry.value);
            }
        });
        return ret;
    }
    insertEdge(from, to) {
        const fromNode = this.lookupOrInsertNode(from), toNode = this.lookupOrInsertNode(to);
        fromNode.outgoing[this._hashFn(to)] = toNode;
        toNode.incoming[this._hashFn(from)] = fromNode;
    }
    removeNode(data) {
        const key = this._hashFn(data);
        delete this._nodes[key];
        collections_1.forEach(this._nodes, entry => {
            delete entry.value.outgoing[key];
            delete entry.value.incoming[key];
        });
    }
    lookupOrInsertNode(data) {
        const key = this._hashFn(data);
        let node = this._nodes[key];
        if (!node) {
            node = newNode(data);
            this._nodes[key] = node;
        }
        return node;
    }
    lookup(data) {
        return this._nodes[this._hashFn(data)];
    }
    isEmpty() {
        for (const _key in this._nodes) {
            return false;
        }
        return true;
    }
    toString() {
        let data = [];
        collections_1.forEach(this._nodes, entry => {
            data.push(`${entry.key}, (incoming)[${Object.keys(entry.value.incoming).join(", ")}], (outgoing)[${Object.keys(entry.value.outgoing).join(",")}]`);
        });
        return data.join("\n");
    }
}
exports.Graph = Graph;
