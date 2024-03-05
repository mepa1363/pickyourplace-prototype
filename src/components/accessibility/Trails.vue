<template>
  <div>
    <v-checkbox v-model="trailsLayer" label="Trails" hide-details></v-checkbox>
    <div v-if="trailsLayer" class="caption mt-2">
      Shows trails within a 15-min {{ accessibilityMode }}.
    </div>
  </div>
</template>

<script>
export default {
  props: ["layerId", "accessibilityMode"],
  data: () => ({
    trailsLayer: false,
  }),
  watch: {
    trailsLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
      });
    },
  },
};
</script>
