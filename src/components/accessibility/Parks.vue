<template>
  <div>
    <v-checkbox v-model="parksLayer" label="Parks" hide-details></v-checkbox>
    <div v-if="parksLayer" class="caption mt-2">
      Shows parks and green spaces within a 15-min {{ accessibilityMode }}.
    </div>
  </div>
</template>

<script>
export default {
  props: ["layerId", "accessibilityMode"],
  data: () => ({
    parksLayer: false,
  }),
  watch: {
    parksLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
      });
    },
  },
};
</script>
