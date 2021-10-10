export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.ems_stations/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "safety-ems-stations",
    source: "public.ems_stations",
    minZoom: 5,
    maxZoom: 22,
    color: "#F44336",
    icon: "hospital-15",
    text: "name"
  }
};
