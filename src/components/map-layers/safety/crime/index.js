export default {
  source: {
    url: "mapbox://mepa1363.8wimpwk3"
  },
  layer: {
    id: "safety-crime",
    source: "pickyourplace_crime",
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
