<template>
  <div>
    <div class="d-flex flex-row">
      <div class="d-inline">
        <h1>${{ propertyInfo.value.toLocaleString() }}</h1>
      </div>
      <div class="d-inline subtitle-1 ml-4">
        <span v-if="propertyInfo.growth > 0">+</span>
        <span v-if="propertyInfo.growth < 0">-</span>
        <span>{{ Math.abs(propertyInfo.growth) }}%</span>
      </div>
      <v-icon v-if="propertyInfo.growth > 0" color="green"
        >mdi-trending-up</v-icon
      >
      <v-icon v-if="propertyInfo.growth < 0" color="red"
        >mdi-trending-down</v-icon
      >
      <v-icon v-if="propertyInfo.growth === 0" color="primary"
        >mdi-trending-neutral</v-icon
      >
    </div>
    <v-row class="mt-2">
      <v-col cols="5">
        <div>Class</div>
        <div class="font-weight-bold">
          {{ propertyInfo.class }}
        </div></v-col
      >
      <v-col cols="3"
        ><div>Year</div>
        <div class="font-weight-bold">{{ propertyInfo.year }}</div></v-col
      >
      <v-col cols="4"
        ><div>Size</div>
        <div class="font-weight-bold">
          {{ propertyInfo.size_ft.toLocaleString() }} ft<sup>2</sup>
        </div>
      </v-col>
    </v-row>
    <apexchart
      type="line"
      height="200"
      :options="chartOptions"
      :series="series"
    ></apexchart>
  </div>
</template>

<script>
export default {
  props: ["propertyInfo"],
  data: () => ({
    chartOptions: {
      chart: {
        shadow: {
          enabled: true,
          color: "#000",
          top: 18,
          left: 7,
          blur: 10,
          opacity: 1
        },
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        }
      },
      colors: ["#1976d2"],
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return `$${Math.round(val / 1000).toLocaleString()}K`;
        }
      },
      stroke: {
        width: [2, 2, 2, 2, 2, 2],
        curve: "smooth",
        dashArray: [0, 0, 0, 2, 2, 2]
      },
      grid: {
        borderColor: "#f1f1f1"
      },
      xaxis: {
        type: "date"
      },
      yaxis: {
        labels: {
          show: true,
          offsetX: -15,
          formatter: function (value) {
            return `$${Math.round(value / 1000).toLocaleString()}K`;
          }
        }
      }
    }
  }),
  computed: {
    series() {
      return [
        {
          name: "Assessed Value",
          data: this.propertyInfo.trend
        }
      ];
    }
  }
};
</script>
