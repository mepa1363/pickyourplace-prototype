<template>
  <div>
    <v-checkbox
      v-model="emsLayer"
      label="Hospitals & EMS Stations"
      hide-details
    ></v-checkbox>
    <div v-if="emsLayer" class="caption mt-2">
      Shows the hospitals & EMS stations within a 15-min
      {{ accessibilityMode }}.
    </div>
  </div>
</template>

<script>
export default {
  props: ["layerId", "accessibilityMode"],
  data: () => ({
    emsLayer: false,
  }),
  watch: {
    emsLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
      });
    },
  },
};
</script>
