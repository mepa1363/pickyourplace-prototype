export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.crime_summary/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "safety-crime",
    source: "public.crime_summary",
    color: [
      "interpolate",
      ["linear"],
      ["get", "count_per_1k"],
      0,
      "#1a9641",
      0.01,
      "#a6d96a",
      0.1,
      "#ffffbf",
      0.5,
      "#fdae61",
      1,
      "#d7191c"
    ]
  },
  legend: {
    id: "safety-crime",
    text: { title: "Crime Rate", lowerBound: "Lower", higherBound: "Higher" },
    colors: ["#1a9641", "#a6d96a", "#ffffbf", "#fdae61", "#d7191c"]
  }
};
