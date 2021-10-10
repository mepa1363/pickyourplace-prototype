export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.parks/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "accessibility-parks",
    source: "public.parks",
    minZoom: 5,
    maxZoom: 22,
    color: "#005a32"
  }
};
