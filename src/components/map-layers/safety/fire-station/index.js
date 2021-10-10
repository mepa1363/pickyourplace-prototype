export default {
  source: {
    url: `${process.env.VUE_APP_TILE_SERVER}/public.fire_stations/{z}/{x}/{y}.pbf`
  },
  layer: {
    id: "safety-fire-stations",
    source: "public.fire_stations",
    minZoom: 5,
    maxZoom: 22,
    color: "#FFD600",
    icon: "fire-station-15",
    text: "name"
  }
};
