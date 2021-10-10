<template>
  <div>
    <v-checkbox
      v-model="crimeLayer"
      label="Local Crime"
      hide-details
    ></v-checkbox>
    <div v-if="crimeLayer" class="caption mt-2">
      Population adjusted and aggregated based on different types of crime
      including assault, break and enter, robbery, theft from vehicle, theft of
      vehicle, and violence.
    </div>
  </div>
</template>

<script>
export default {
  props: ["layerId", "legend"],
  data: () => ({
    crimeLayer: false
  }),
  watch: {
    crimeLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
        legend: this.legend
      });
    }
  }
};
</script>
