"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablaSimbolos = void 0;
class TablaSimbolos {
    constructor(padre = null) {
        this.variables = new Map();
        this.padre = padre;
    }
    setVariable(variable) {
        if (this.esGlobal()) {
            variable.setAsGlobal();
        }
        this.variables.set(variable.id, variable);
    }
    getVariable(id) {
        for (let ts = this; ts != null; ts = ts.padre) {
            const variable = ts.variables.get(id);
            if (variable)
                return variable;
        }
        return null;
    }
    esGlobal() {
        return this.padre == null;
    }
}
exports.TablaSimbolos = TablaSimbolos;
