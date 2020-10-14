<template>
  <q-page class="constrain q-pa-lg">
    <div class="row">
      <div class="col-12">
        <q-btn-group push spread>
          <q-btn push label="Traducir" icon="transform" @click="traducir" />
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
            <q-tab label="Errores" name="errores" v-if="errores != null && errores.length > 0" />
            <q-tab label="Consola" name="consola" />
            <q-tab label="AST" name="ast" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="editor">
              <codemirror v-model="code" :options="cmOptions" @input="codigoEditado" />
            </q-tab-panel>

            <q-tab-panel name="errores" v-if="errores != null && errores.length > 0">
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

            <q-tab-panel name="consola" class="bg-grey-10 text-white">
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
            </q-tab-panel>

            <q-tab-panel name="ast" style="height: 500px">
              <ast :dot="dot" />
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
// Analizador
import analizador from "../analizador/gramatica";
//Traduccion
import { Traduccion } from "../traduccion/traduccion";

export default {
  components: {
    codemirror,
    ast: require("../components/Ast").default,
    tablaSimbolos: require("../components/TablaSimbolos").default,
  },
  data() {
    return {
      code: "",
      cmOptions: {
        tabSize: 4,
        matchBrackets: true,
        styleActiveLine: true,
        mode: "text/javascript",
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
    };
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
    traducir() {
      if (this.code.trim() == "") {
        this.notificar("primary", `Ingrese algo de código, por favor`);
        return;
      }
      try {
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
        this.notificar("primary", "Traducción realizada con éxito");
      } catch (error) {
        this.notificar("negative", JSON.stringify(error));
      }
    },
    limpiar(){
      this.code = '';
    },
    codigoEditado(){}
  },
};
</script>

<style lang="css">
.CodeMirror {
  height: 500px;
}
</style>

