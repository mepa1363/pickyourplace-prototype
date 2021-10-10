export default [
  {
    source: {
      url: `${process.env.VUE_APP_TILE_SERVER}/public.flood_probability_1/{z}/{x}/{y}.pbf`
    },
    layer: {
      id: "safety-flood-probability-1",
      source: "public.flood_probability_1",
      color: "#43a2ca"
    },
    label: {
      text: "1%",
      description: "Indicates the event probability of 1 in 100 years."
    }
  },
  {
    source: {
      url: `${process.env.VUE_APP_TILE_SERVER}/public.flood_probability_5/{z}/{x}/{y}.pbf`
    },
    layer: {
      id: "safety-flood-probability-5",
      source: "public.flood_probability_5",
      color: "#43a2ca"
    },
    label: {
      text: "5%",
      description: "Indicates the event probability of 1 in 20 years."
    }
  },
  {
    source: {
      url: `${process.env.VUE_APP_TILE_SERVER}/public.flood_probability_10/{z}/{x}/{y}.pbf`
    },
    layer: {
      id: "safety-flood-probability-10",
      source: "public.flood_probability_10",
      color: "#43a2ca"
    },
    label: {
      text: "10%",
      description: "Indicates the event probability of 1 in 10 years."
    }
  },
  {
    source: {
      url: `${process.env.VUE_APP_TILE_SERVER}/public.flood_probability_20/{z}/{x}/{y}.pbf`
    },
    layer: {
      id: "safety-flood-probability-20",
      source: "public.flood_probability_20",
      color: "#43a2ca"
    },
    label: {
      text: "20%",
      description: "Indicates the event probability of 1 in 5 years."
    }
  }
];
