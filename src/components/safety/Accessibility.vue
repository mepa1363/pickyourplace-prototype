<template>
<div></div>
</template>

<script>
import axios from "axios";

export default {
  props: ["selectedPropertyLocation"],
  data: () => ({
    transportation: { mode: "Driving", action: "drive", query: "CAR" },
    isochrone: [],
  }),
  mounted() {
    this.init();
  },
  methods: {
    async init() {
      await this.getIsochrone();
      this.$emit("accessibility", {
        mode: this.transportation.mode,
        action: this.transportation.action,
        isochrone: this.isochrone,
      });
    },
    async getIsochrone() {
      const origin = `${this.selectedPropertyLocation.lat},
        ${this.selectedPropertyLocation.lon}`;
      const duration = 900;

      let url = `${process.env.VUE_APP_ISOCHRONE_SERVER}/otp/routers/calgary/isochrone?fromPlace=${origin}&mode=${this.transportation.query}&cutoffSec=${duration}`;

      try {
        const response = await axios.get(url);
        this.isochrone = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: response.data.features[0].geometry.coordinates[0],
          },
        };
      } catch (error) {
        this.isochrone = [];
        console.log(error);
      }
    },
  },
};
</script>
