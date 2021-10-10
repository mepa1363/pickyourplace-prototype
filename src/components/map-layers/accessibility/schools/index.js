export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.schools/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "accessibility-schools",
    source: "public.schools",
    minZoom: 5,
    maxZoom: 22,
    color: "#edf8b1",
    icon: "school-15",
    text: "name"
  }
};
