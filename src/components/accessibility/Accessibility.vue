<template>
  <div>
    <v-combobox
      outlined
      hide-details
      label="Transportation Mode"
      v-model="transportationMode"
      :items="transportationModes"
    ></v-combobox>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["selectedPropertyLocation"],
  data: () => ({
    transportation: [
      { mode: "Walking", action: "walk", query: "WALK" },
      { mode: "Biking", action: "bike", query: "BICYCLE" },
      { mode: "Public Transit", action: "ride", query: "WALK,TRANSIT" },
      { mode: "Driving", action: "drive", query: "CAR" },
    ],
    transportationMode: "Walking",
    isochrone: [],
  }),
  mounted() {
    this.init();
  },
  computed: {
    transportationModes() {
      return this.transportation.map((item) => {
        return item.mode;
      });
    },
    selectedTransportationMode() {
      const mode = this.transportation.filter(
        (item) => item.mode === this.transportationMode
      );
      return mode[0];
    },
  },
  watch: {
    async transportationMode() {
      await this.init();
    },
  },
  methods: {
    async init() {
      await this.getIsochrone();
      this.$emit("accessibility", {
        mode: this.selectedTransportationMode.mode,
        action: this.selectedTransportationMode.action,
        isochrone: this.isochrone,
      });
    },
    async getIsochrone() {
      const origin = `${this.selectedPropertyLocation.lat},
        ${this.selectedPropertyLocation.lon}`;
      const duration = 900;

      let url = `${process.env.VUE_APP_ISOCHRONE_SERVER}/otp/routers/calgary/isochrone?fromPlace=${origin}&mode=${this.selectedTransportationMode.query}&cutoffSec=${duration}`;

      if (this.transportationMode === "Walking") {
        url += `&walkSpeed=1.38`;
      }

      if (this.transportationMode === "Public Transit") {
        url += `&date=09-20-2021&time=8:00`;
      }
      try {
        const response = await axios.get(url);
        this.isochrone =
          this.transportationMode === "Public Transit"
            ? response.data
            : {
                type: "Feature",
                geometry: {
                  type: "Polygon",
                  coordinates:
                    response.data.features[0].geometry.coordinates[0],
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
