export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.bikeways/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "accessibility-bikeways",
    source: "public.bikeways",
    minZoom: 5,
    maxZoom: 22,
    color: "#ffffcc"
  }
};
