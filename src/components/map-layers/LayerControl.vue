<template>
  <v-card class="basemap-layer-control">
    <v-card-title class="body-1"> Layer Control </v-card-title>
    <v-card-text>
      <v-radio-group v-model="selectedBaseMap">
        <v-radio
          v-for="layer in baseMapLayers"
          :key="layer.id"
          :label="layer.name"
          :value="layer.style"
        ></v-radio>
      </v-radio-group>
    </v-card-text>
  </v-card>
</template>
<script>
import {
  streetBaseMapStyle,
  lightBaseMapStyle,
  darkBaseMapStyle,
  satelliteBaseMapStyle,
} from "./base";

export default {
  data() {
    return {
      baseMapLayers: [
        { id: 1, name: "Light", style: lightBaseMapStyle },
        { id: 2, name: "Dark", style: darkBaseMapStyle },
        { id: 3, name: "Street", style: streetBaseMapStyle },
        { id: 4, name: "Satellite", style: satelliteBaseMapStyle },
      ],
      selectedBaseMap: null,
    };
  },
  mounted() {
    this.selectedBaseMap = this.baseMapLayers[0].style;
  },
  watch: {
    selectedBaseMap(layer) {
      this.$emit("layerStatus", layer);
    },
  },
};
</script>
<style>
.basemap-layer-control {
  width: 200px;
  position: absolute !important;
  bottom: 0;
  left: 0;
  margin: 0 0 40px 10px;
}
</style>
