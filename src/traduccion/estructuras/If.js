"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.If = void 0;
class If {
    constructor(condicion, instrucciones) {
        Object.assign(this, { condicion, instrucciones });
    }
    isElse() {
        return this.condicion == null;
    }
}
exports.If = If;
