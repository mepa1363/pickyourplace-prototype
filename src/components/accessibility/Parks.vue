<template>
  <div>
    <v-checkbox v-model="parksLayer" label="Parks" hide-details></v-checkbox>
    <div v-if="parksLayer" class="caption mt-2">
      Shows parks and green spaces within a 15-min {{ accessibility.action }}.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  props: ["layerId", "selectedPropertyLocation", "accessibility"],
  data: () => ({
    parksLayer: false,
    isochrone: null
  }),
  watch: {
    parksLayer(value) {
      this.$emit("layerStatus", {
        status: value,
        id: this.layerId,
        isochrone: this.isochrone
      });
    },
    selectedPropertyLocation(newValue, oldValue) {
      if (this.parksLayer && newValue != oldValue) {
        this.getIsochrone().then(() => {
          this.$emit("layerStatus", {
            status: this.parksLayer,
            id: this.layerId,
            isochrone: this.isochrone
          });
        });
      }
    },
    accessibility(newValue, oldValue) {
      if (this.parksLayer && newValue != oldValue) {
        this.getIsochrone().then(() => {
          this.$emit("layerStatus", {
            status: this.parksLayer,
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
      const mode = this.accessibility.isochrone;
      const duration = 900;

      let url = `${process.env.VUE_APP_ISOCHRONE_SERVER}/otp/routers/calgary/isochrone?fromPlace=${origin}&mode=${mode}&cutoffSec=${duration}`;

      if (this.accessibility.mode === "Walking") {
        url += `&walkSpeed=1.38`;
      }

      if (this.accessibility.mode === "Public Transit") {
        url += `&date=09-20-2021&time=8:00`;
      }
      try {
        const response = await axios.get(url);
        this.isochrone =
          this.accessibility.mode === "Public Transit"
            ? response.data
            : {
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
