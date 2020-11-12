"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Funcion = void 0;
const asignacion_dos_direcciones_1 = require("./asignacion_dos_direcciones");
const goto_1 = require("./goto");
const inst_if_1 = require("./inst_if");
const instruccion_con_optimizacion_1 = require("./instruccion_con_optimizacion");
const optimizacion_1 = require("./optimizacion");
const optimizaciones_1 = require("./optimizaciones");
class Funcion extends instruccion_con_optimizacion_1.InstruccionConOptimizacion {
    constructor(linea, codigo, id, instrucciones) {
        super(linea, codigo);
        Object.assign(this, { id, instrucciones });
    }
    optimizar() {
        let salida = `void ${this.id}(){\n`;
        const length = this.instrucciones.length;
        for (let i = 0; i < length; i++) {
            const inst = this.instrucciones[i];
            //Validaciones para optimizacion REGLA 5
            if (inst instanceof asignacion_dos_direcciones_1.AsignacionDosDirecciones && i + 1 < length) {
                const sig = this.instrucciones[i + 1];
                if (sig instanceof asignacion_dos_direcciones_1.AsignacionDosDirecciones) {
                    //t10 = b;
                    //b = t10; //elimino esta
                    if (inst.dir1 == sig.dir2 && inst.dir2 == sig.dir1) {
                        i++; //Para que no se tome en cuenta la sig instruccion
                        const cod1 = inst.optimizar();
                        const cod2 = sig.optimizar();
                        optimizaciones_1.Optimizaciones.add(new optimizacion_1.Optimizacion(inst.linea, cod1 + cod2, cod1, '5'));
                    }
                }
            }
            //Validaciones para REGLA 3 y REGLA 4
            if (inst instanceof inst_if_1.InstIf && i + 1 < length) {
                const sig = this.instrucciones[i + 1];
                if (sig instanceof goto_1.Goto) {
                    //REGLA 3
                    //if(1 == 1) goto L1; goto L2; ---> if(1 == 1) goto L1;
                    if (inst.op == '==' && inst.canOptimize()) {
                        i++;
                        const cod1 = inst.optimizar();
                        const cod2 = sig.optimizar();
                        optimizaciones_1.Optimizaciones.add(new optimizacion_1.Optimizacion(inst.linea, cod1 + cod2, cod1, '3'));
                    }
                    //REGLA 4
                    //if(5 != 1) goto L1; goto L2; ---> goto L2;
                    if (inst.op == '!=' && inst.canOptimize()) {
                        const cod1 = inst.optimizar();
                        const cod2 = sig.optimizar();
                        optimizaciones_1.Optimizaciones.add(new optimizacion_1.Optimizacion(inst.linea, cod1 + cod2, cod2, '4'));
                        continue;
                    }
                }
            }
            salida += inst.optimizar();
        }
        salida += '\n}\n';
        return salida;
    }
}
exports.Funcion = Funcion;
