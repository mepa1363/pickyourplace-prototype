<template>
  <div>
    <v-checkbox
      v-model="fireStationLayer"
      label="Fire Stations"
      hide-details
    ></v-checkbox>
    <div v-if="fireStationLayer" class="caption mt-2">
      Shows the fire stations within a 15-min drive.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["layerId", "selectedPropertyLocation"],
  data: () => ({
    fireStationLayer: false,
    isochrone: null
  }),
  watch: {
    fireStationLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
        isochrone: this.isochrone
      });
    },
    selectedPropertyLocation(newValue, oldValue) {
      if (this.fireStationLayer && newValue != oldValue) {
        this.getIsochrone().then(() => {
          this.$emit("layerStatus", {
            status: this.fireStationLayer,
            id: this.layerId,
            isochrone: this.isochrone
          });
        });
      }
    }
  },
  mounted() {
    this.getIsochrone();
  },
  methods: {
    async getIsochrone() {
      const origin = `${this.selectedPropertyLocation.lat},
        ${this.selectedPropertyLocation.lon}`;
      const mode = "CAR";
      const duration = 900;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_ISOCHRONE_SERVER}/otp/routers/calgary/isochrone?fromPlace=${origin}&mode=${mode}&cutoffSec=${duration}`
        );
        this.isochrone = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: response.data.features[0].geometry.coordinates[0]
          }
        };
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
