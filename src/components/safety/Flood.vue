<template>
  <div>
    <v-checkbox
      v-model="floodLayers"
      label="Flood Probability"
      hide-details
    ></v-checkbox>
    <v-radio-group
      v-if="floodLayers"
      row
      dense
      v-model="floodLayer"
      hide-details
    >
      <v-radio
        v-for="feature in features"
        :key="feature.layer.id"
        :label="feature.label.text"
        :value="feature.layer.id"
      ></v-radio>
    </v-radio-group>
    <div v-if="floodLayer" class="caption mt-2">
      {{ description }}
    </div>
  </div>
</template>

<script>
export default {
  props: ["features"],
  data: () => ({
    floodLayers: false,
    floodLayer: null,
    description: null,
  }),
  watch: {
    floodLayer(value) {
      if (value != null) {
        this.$emit("layerStatus", {
          status: !!value,
          id: value,
        });
      }

      if (value != null) {
        this.description = this.features.filter(
          (feature) => feature.layer.id === value
        )[0].label.description;
      }

      for (const feature of this.features) {
        if (feature.layer.id !== value) {
          this.$emit("layerStatus", {
            status: false,
            id: feature.layer.id,
          });
        }
      }
    },
    floodLayers(value) {
      if (!value) {
        this.floodLayer = null;

        for (const feature of this.features) {
          this.$emit("layerStatus", {
            status: value,
            id: feature.layer.id,
          });
        }
      }
    },
  },
};
</script>
