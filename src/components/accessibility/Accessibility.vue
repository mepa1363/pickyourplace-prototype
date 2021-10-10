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
export default {
  data: () => ({
    transportationModes: ["Walking", "Biking", "Public Transit", "Driving"],
    transportationMode: "Walking"
  }),
  mounted() {
    this.$emit("accessibility", {
      mode: "Walking",
      action: "walk",
      isochrone: "WALK"
    });
  },
  watch: {
    transportationMode(value) {
      let action = null;
      let isochrone = null;

      if (value === "Walking") {
        isochrone = "WALK";
        action = "walk";
      } else if (value === "Biking") {
        isochrone = "BICYCLE";
        action = "bike";
      } else if (value === "Public Transit") {
        isochrone = "WALK,TRANSIT";
        action = "ride";
      } else {
        isochrone = "CAR";
        action = "drive";
      }

      this.$emit("accessibility", {
        mode: value,
        action: action,
        isochrone: isochrone
      });
    }
  }
};
</script>
