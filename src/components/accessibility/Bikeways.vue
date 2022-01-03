<template>
  <div>
    <v-checkbox
      v-model="bikewaysLayer"
      label="Bikeways"
      hide-details
    ></v-checkbox>
    <div v-if="bikewaysLayer" class="caption mt-2">
      Shows bikeways within a 15-min {{ accessibilityMode }}.
    </div>
  </div>
</template>

<script>
export default {
  props: ["layerId", "accessibilityMode"],
  data: () => ({
    bikewaysLayer: false,
  }),
  watch: {
    bikewaysLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
      });
    },
  },
};
</script>
