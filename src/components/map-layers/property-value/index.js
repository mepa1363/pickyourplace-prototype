export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.property_value/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "property-value",
    source: "public.property_value",
    minZoom: 14,
    maxZoom: 22,
    radius: {
      base: 1.75,
      stops: [
        [13, 2],
        [22, 100]
      ]
    },
    color: [
      "interpolate",
      ["linear"],
      ["get", "value"],
      0,
      "#feebe2",
      100000,
      "#fbb4b9",
      500000,
      "#f768a1",
      1000000,
      "#c51b8a",
      10000000,
      "#7a0177"
    ],
    isVisible: true
  },
  legend: {
    id: "property-value",
    text: {
      title: "$$$ Value",
      lowerBound: "Lower",
      higherBound: "Higher"
    },
    colors: ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"]
  }
};
