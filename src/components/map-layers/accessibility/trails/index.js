export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.trails/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "accessibility-trails",
    source: "public.trails",
    minZoom: 5,
    maxZoom: 22,
    color: "#ffffcc"
  }
};
