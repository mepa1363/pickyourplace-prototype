<template>
  <v-row class="app-map-legend">
    <v-list dense class="mx-auto rounded">
      <v-list-item v-for="legend in legends" :key="legend.title">
        <v-subheader>{{ legend.text.title }}</v-subheader>
        <span class="app-map-legend-title">{{ legend.text.lowerBound }}</span>
        <v-list-item-content>
          <v-list-item-title>
            <span
              v-for="color in legend.colors"
              :key="color"
              class="app-map-legend-item"
              :style="`background: ${color}`"
            ></span>
          </v-list-item-title>
        </v-list-item-content>
        <span class="app-map-legend-title">{{ legend.text.higherBound }}</span>
      </v-list-item>
    </v-list>
  </v-row>
</template>

<script>
export default {
  props: ["legends"],
  data: () => ({})
};
</script>
<style>
.app-map-legend {
  position: absolute;
  right: 60px;
  bottom: 42px;
}
.app-map-legend-item {
  width: 20px;
  height: 20px;
  float: left;
}
.app-map-legend-title {
  padding: 10px;
  font-size: 12px;
}
</style>
