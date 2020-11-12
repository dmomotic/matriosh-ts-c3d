<template>
  <div class="q-pa-md row items-start q-gutter-md">
    <q-card class="my-card" v-for="(optimizacion, index) in optimizaciones" :key="index">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">Regla: {{ optimizacion.regla }}</div>
        <div class="text-subtitle2">Linea: {{ optimizacion.linea }} </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        {{ optimizacion.antiguo }}
      </q-card-section>
      <q-card-section>
        {{ optimizacion.nuevo.trim().length == 0 ? 'Código eliminado' : optimizacion.nuevo }}
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
export default {
  props: {
    optimizaciones: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
};
</script>
