<template>
  <div class="bg-grey-10 text-white">
    <q-list dark bordered separator dense v-if="entornos != null">
      <q-item
        v-ripple
        v-for="(entorno, index) in entornos"
        :key="index"
      >
        <q-item-section class="q-pb-md">
          <!-- Banner que identifica el entorno -->
          <q-banner class="bg-grey text-white row">
            Entorno {{ index + 1 }}
          </q-banner>
          <!-- Variables -->
          <q-item-label class="q-pt-md">*** VARIABLES ***</q-item-label>
          <q-item-label
            caption
            v-for="(variable, index) in entorno['variables']"
            :key="`var-${index}`"
            >{{ variable[1].toString() }}</q-item-label
          >
          <!-- Funciones -->
          <q-item-label class="q-pt-md">*** FUNCIONES ***</q-item-label>
          <q-item-label
            caption
            v-for="(funcion, indexFuncion) in entorno['funciones']"
            :key="`fn-${indexFuncion}`"
            >{{ funcion[1].toString() }}</q-item-label
          >
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
export default {
  props: {
    entornos: {
      required: true,
      type: Array,
      default: [],
    },
  },
};
</script>
