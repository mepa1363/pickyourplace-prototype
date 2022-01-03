<template>
  <div>
    <v-checkbox
      v-model="fireStationLayer"
      label="Fire Stations"
      hide-details
    ></v-checkbox>
    <div v-if="fireStationLayer" class="caption mt-2">
      Shows the fire stations within a 15-min {{ accessibilityMode }}.
    </div>
  </div>
</template>

<script>
export default {
  props: ["layerId", "accessibilityMode"],
  data: () => ({
    fireStationLayer: false,
  }),
  watch: {
    fireStationLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
      });
    },
  },
};
</script>
