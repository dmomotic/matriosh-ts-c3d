<template>
  <q-page class="constrain q-pa-lg">
    <div class="row">
      <div class="col-12">
        <q-btn-group push spread>
          <q-btn push label="Traducir" icon="transform" @click="traducir" />
          <q-btn push label="Optimizar" icon="3d_rotation" @click="optimizar" v-if="hasC3D" />
          <q-btn push label="Copiar C3D" icon="content_copy" @click="copiar" v-if="showCopyButton"/>
          <q-btn push label="Limpiar" icon="cleaning_services" @click="limpiar" />
        </q-btn-group>
      </div>
    </div>

    <!-- Editor de codigo -->
    <div class="row justify-content-center q-mt-md">
      <div class="col-12">
        <q-card class="my-card">
          <q-tabs v-model="tab" class="text-white bg-deep-orange-5">
            <q-tab label="Editor" name="editor" />
            <q-tab label="Errores" name="errores" v-if="hasErrors" />
            <!-- <q-tab label="Consola" name="consola" /> -->
            <q-tab
              label="Tabla de Símbolos"
              name="tabla_de_simbolos"
              v-if="hasEntornos"
            />
            <q-tab label="AST" name="ast" v-if="hasDot" />
            <q-tab label="Optimizaciones" name="optimizaciones" v-if="hasOptimizaciones" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="editor" class="row">
                <div class="col-6 q-pa-sm">
                  <codemirror v-model="code" :options="cmOptions" @input="codigoEditado" />
                </div>
                <div class="col-6 q-pa-sm">
                  <codemirror v-model="traduccion" :options="cmOptions2" />
                </div>
            </q-tab-panel>

            <q-tab-panel name="errores" v-if="hasErrors">
              <div class="q-pa-md">
                <q-table
                  title="Lista de Errores Obtenidos"
                  :data="errores"
                  :columns="columns"
                  row-key="name"
                  dark
                  color="amber"
                  dense
                  :pagination="{ rowsPerPage: 0 }"
                  rows-per-page-label="Errores por página"
                />
              </div>
            </q-tab-panel>

            <!-- <q-tab-panel name="consola" class="bg-grey-10 text-white">
              <q-list dark bordered separator dense>
                <q-item
                  clickable
                  v-ripple
                  v-for="(item, index) in salida"
                  :key="index"
                >
                  <q-item-section>{{ item }}</q-item-section>
                </q-item>
              </q-list>
            </q-tab-panel> -->

            <q-tab-panel name="tabla_de_simbolos">
              <tabla-simbolos :entornos="entornos" />
            </q-tab-panel>

            <q-tab-panel name="ast" style="height: 500px" >
              <ast :dot="dot" />
            </q-tab-panel>

            <q-tab-panel name="optimizaciones">
              <optimizaciones :optimizaciones="optimizaciones" />
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
//JS-Beautify
var beautify_js = require('js-beautify').js_beautify
// CodeMirror
import { codemirror } from "vue-codemirror";
// import base style
import "codemirror/lib/codemirror.css";
// import theme style
import "codemirror/theme/paraiso-light.css";
// import language js
import "codemirror/mode/javascript/javascript.js";
// import language clike
import "codemirror/mode/clike/clike.js";
// Analizador
import analizador from "../analizador/gramatica";
import analizadorOp from '../analizador/optimizacion';
//Traduccion
import { Traduccion } from "../traduccion/traduccion";
//Optimizacion
import { Optimizador } from "../optimizacion/optimizador";
//Errores
import { Errores } from '../arbol/errores';
//Entornos
import { Entornos } from '../traduccion/generales/entornos';

export default {
  components: {
    codemirror,
    ast: require("../components/Ast").default,
    tablaSimbolos: require("../components/TablaSimbolos").default,
    optimizaciones: require("../components/Optimizaciones").default,
  },
  data() {
    return {
      code: "",
      traduccion: '',
      cmOptions: {
        tabSize: 4,
        matchBrackets: true,
        styleActiveLine: true,
        mode: "text/javascript",
        theme: "paraiso-light",
        lineNumbers: true,
        line: false,
      },
      cmOptions2: {
        tabSize: 4,
        matchBrackets: true,
        styleActiveLine: true,
        mode: "text/x-csrc",
        theme: "paraiso-light",
        lineNumbers: true,
        line: false,
      },
      tab: "editor",
      dot: "",
      salida: [],
      errores: [],
      columns: [
        { name: "tipo", label: "Tipo", field: "tipo", align: "left" },
        { name: "linea", label: "Linea", field: "linea", align: "left" },
        {
          name: "descripcion",
          label: "Descripcion",
          field: "descripcion",
          align: "left",
        },
      ],
      entornos: [],
      optimizaciones: []
    };
  },
  computed: {
    /** @returns {boolean} */
    showCopyButton(){
      return this.traduccion != null && this.traduccion.trim().length > 0;
    },
    /** @returns {boolean} */
    hasErrors(){
      return this.errores != null && this.errores.length > 0;
    },
    /** @returns {boolean} */
    hasEntornos(){
      return this.entornos != null && this.entornos.length > 0;
    },
    /** @returns {boolean} */
    hasC3D(){
      return this.traduccion != null && this.traduccion.trim() != '';
    },
    /** @returns {boolean} */
    hasDot(){
      return this.dot != null && this.dot.trim() != '';
    },
    /** @returns {boolean} */
    hasOptimizaciones(){
      return this.optimizaciones != null && this.optimizaciones.length > 0;
    }
  },
  methods: {
    notificar(variant, message) {
      this.$q.notify({
        message: message,
        color: variant,
        multiLine: true,
        avatar: "https://cdn.quasar.dev/img/boy-avatar.png",
        actions: [
          {
            label: "Aceptar",
            color: "yellow",
            handler: () => {
              /* ... */
            },
          },
        ],
      });
    },
    optimizar(){
      try{
        const instrucciones = analizadorOp.parse(this.traduccion);
        const optimizador = new Optimizador(instrucciones);
        optimizador.optimizar();
        this.traduccion = beautify_js(optimizador.getCodigo(), { indent_size: 2 });;
        this.optimizaciones = optimizador.getOptimizaciones();
        this.notificar('info', 'Optimización realizada');
      } catch (error) {
        this.notificar("negative", error ? JSON.stringify(error) : 'Algo salió mal :(');
      }
    },
    traducir() {
      if (this.code.trim() == "") {
        this.notificar("primary", `Ingrese algo de código, por favor`);
        return;
      }
      try {
        this.traduccion = '';
        const raizTraduccion = analizador.parse(this.code);
        //Validación de raiz
        if (raizTraduccion == null) {
          this.notificar(
            "negative",
            "No fue posible obtener la raíz de la traducción"
          );
          return;
        }
        let traduccion = new Traduccion(raizTraduccion);
        this.dot = traduccion.getDot();
        const codigo = traduccion.traducir() || '';
        this.traduccion = beautify_js(codigo, { indent_size: 2 });
        this.entornos = Entornos.getLista();
        this.notificar("primary", "Traducción realizada con éxito");
      } catch (error) {
        this.notificar("negative", JSON.stringify(error));
      }
      this.errores = Errores.getErrors();
    },
    limpiar(){
      this.code = '';
      this.traduccion = '';
      Errores.clear();
      this.entornos = [];
      this.optimizaciones = [];
    },
    codigoEditado(){},
    copiar(){
      navigator.clipboard.writeText(this.traduccion);
      this.notificar('positive', 'El código 3 direcciones ha sido copiado');
    }
  },
};
</script>

<style lang="css">
.CodeMirror {
  height: 500px;
}
</style>

