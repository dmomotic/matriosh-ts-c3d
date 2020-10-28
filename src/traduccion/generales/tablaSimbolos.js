"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablaSimbolos = void 0;
class TablaSimbolos {
    constructor(padre = null) {
        this.variables = new Map();
        this.funciones = new Map();
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
    setFuncion(funcion) {
        const ts = this.getGlobal();
        ts.funciones.set(funcion.id, funcion);
    }
    getFuncion(id) {
        const ts = this.getGlobal();
        return ts.funciones.get(id);
    }
    getGlobal() {
        for (let ts = this; ts != null; ts = ts.padre) {
            if (!ts.padre)
                return ts;
        }
    }
    esGlobal() {
        return this.padre == null;
    }
}
exports.TablaSimbolos = TablaSimbolos;
