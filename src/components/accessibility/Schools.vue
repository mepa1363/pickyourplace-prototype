<template>
  <div>
    <v-checkbox
      v-model="schoolsLayer"
      label="Schools & Universities"
      hide-details
    ></v-checkbox>
    <div v-if="schoolsLayer" class="caption mt-2">
      Shows elementary, junior & senior high, and post secondary schools within
      a 15-min {{ accessibilityMode }}.
    </div>
  </div>
</template>

<script>
export default {
  props: ["layerId", "accessibilityMode"],
  data: () => ({
    schoolsLayer: false,
  }),
  watch: {
    schoolsLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
      });
    },
  },
};
</script>
