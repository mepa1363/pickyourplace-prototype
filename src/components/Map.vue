<template>
  <div>
    <div id="map"></div>
    <v-card
      v-if="showPropertyInfo"
      max-width="344"
      class="property-info mx-left ml-2 mt-2"
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ propertyInfo.address }}</v-list-item-title>
          <v-list-item-subtitle>{{
            propertyInfo.community
          }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-btn small icon @click="showPropertyInfo = false">
            <v-icon small color="grey lighten-1">mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-card-text>
        <v-btn-toggle
          class="mx-auto"
          v-model="factor"
          mandatory
          tile
          borderless
          color="primary"
        >
          <v-btn factor value="dollar-value">$ Value</v-btn>
          <v-btn factor value="safety">Safety</v-btn>
          <v-btn factor value="accessibility">Accessibility</v-btn>
        </v-btn-toggle>
      </v-card-text>
      <v-card-text>
        <property-assessment
          v-if="factor === 'dollar-value'"
          :propertyInfo="propertyInfo"
        />
        <safety-crime
          v-if="factor === 'safety'"
          :layerId="safetyCrimeLayer.layer.id"
          :legend="safetyCrimeLayer.legend"
          @layerStatus="layerHandler"
        />
        <safety-flood-probability
          v-if="factor === 'safety'"
          :features="safetyFloodProbabilityLayers"
          @layerStatus="layerHandler"
        />
        <safety-ems
          v-if="factor === 'safety'"
          :layerId="safetyEmsLayer.layer.id"
          :selectedPropertyLocation="propertyInfo.coordinates"
          @layerStatus="layerHandler"
        />
        <safety-fire-station
          v-if="factor === 'safety'"
          :layerId="safetyFireStationLayer.layer.id"
          :selectedPropertyLocation="propertyInfo.coordinates"
          @layerStatus="layerHandler"
        />
        <accessibility
          v-if="factor === 'accessibility'"
          @accessibility="accessibilityHandler"
        />
        <accessibility-schools
          v-if="factor === 'accessibility' && accessibility != null"
          :layerId="accessibilitySchoolsLayer.layer.id"
          :selectedPropertyLocation="propertyInfo.coordinates"
          :accessibility="accessibility"
          @layerStatus="layerHandler"
        />
        <accessibility-parks
          v-if="factor === 'accessibility' && accessibility != null"
          :layerId="accessibilityParksLayer.layer.id"
          :selectedPropertyLocation="propertyInfo.coordinates"
          :accessibility="accessibility"
          @layerStatus="layerHandler"
        />
        <accessibility-trails
          v-if="factor === 'accessibility' && accessibility != null"
          :layerId="accessibilityTrailsLayer.layer.id"
          :selectedPropertyLocation="propertyInfo.coordinates"
          :accessibility="accessibility"
          @layerStatus="layerHandler"
        />
        <accessibility-bikeways
          v-if="factor === 'accessibility' && accessibility != null"
          :layerId="accessibilityBikewaysLayer.layer.id"
          :selectedPropertyLocation="propertyInfo.coordinates"
          :accessibility="accessibility"
          @layerStatus="layerHandler"
        />
      </v-card-text>
    </v-card>
    <map-legend :legends="legends" />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { ZoomControl, CompassControl } from "mapbox-gl-controls";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { streetBaseMapStyle } from "./map-layers/base";

import propertyValueLayer from "./map-layers/property-value";
import safetyCrimeLayer from "./map-layers/safety/crime";
import safetyFloodProbabilityLayers from "./map-layers/safety/flood";
import safetyEmsLayer from "./map-layers/safety/ems";
import safetyFireStationLayer from "./map-layers/safety/fire-station";
import accessibilitySchoolsLayer from "./map-layers/accessibility/schools";
import accessibilityParksLayer from "./map-layers/accessibility/parks";
import accessibilityTrailsLayer from "./map-layers/accessibility/trails";
import accessibilityBikewaysLayer from "./map-layers/accessibility/bikeways";

import MapLegend from "./map-layers/Legend.vue";
import PropertyAssessment from "./value/PropertyAssessment.vue";
import SafetyCrime from "./safety/Crime.vue";
import SafetyFloodProbability from "./safety/Flood.vue";
import SafetyEms from "./safety/EMS.vue";
import SafetyFireStation from "./safety/FireStation.vue";
import Accessibility from "./accessibility/Accessibility.vue";
import AccessibilitySchools from "./accessibility/Schools.vue";
import AccessibilityParks from "./accessibility/Parks.vue";
import AccessibilityTrails from "./accessibility/Trails.vue";
import AccessibilityBikeways from "./accessibility/Bikeways.vue";

import BBOX from "@turf/bbox";

export default {
  components: {
    MapLegend,
    PropertyAssessment,
    SafetyCrime,
    SafetyFloodProbability,
    SafetyEms,
    SafetyFireStation,
    Accessibility,
    AccessibilitySchools,
    AccessibilityParks,
    AccessibilityTrails,
    AccessibilityBikeways
  },
  data: () => ({
    map: null,
    popup: null,
    factor: "dollar-value",
    showPropertyInfo: false,
    propertyInfo: {},
    legends: [propertyValueLayer.legend],
    baseMapIndex: "waterway-label",
    safetyCrimeLayer: safetyCrimeLayer,
    safetyFloodProbabilityLayers: safetyFloodProbabilityLayers,
    safetyEmsLayer: safetyEmsLayer,
    safetyFireStationLayer: safetyFireStationLayer,
    accessibility: null,
    accessibilitySchoolsLayer: accessibilitySchoolsLayer,
    accessibilityParksLayer: accessibilityParksLayer,
    accessibilityTrailsLayer: accessibilityTrailsLayer,
    accessibilityBikewaysLayer: accessibilityBikewaysLayer
  }),
  watch: {
    showPropertyInfo(value) {
      if (!value) {
        this.map.setFilter("selected-property", ["==", "id", ""]);
        this.factor = "dollar-value";
      }
    },
    factor(value) {
      const layers = this.map.getStyle().layers;
      if (value === "safety") {
        for (const layer of layers) {
          if (layer.id.includes("accessibility")) {
            this.map.setLayoutProperty(layer.id, "visibility", "none");
            this.removeIsochroneLayer();
          }
        }
      }
      if (value === "dollar-value") {
        this.legends = [propertyValueLayer.legend];

        for (const layer of layers) {
          if (
            layer.id.includes("accessibility") ||
            layer.id.includes("safety")
          ) {
            this.map.setLayoutProperty(layer.id, "visibility", "none");
            this.removeIsochroneLayer();
          }
        }
      }
      if (value === "accessibility") {
        this.legends = [propertyValueLayer.legend];

        for (const layer of layers) {
          if (layer.id.includes("crime")) {
            this.map.setLayoutProperty(layer.id, "visibility", "none");
            this.removeIsochroneLayer();
          }
        }
      }
    }
  },
  mounted() {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_API_KEY;

    const map = new mapboxgl.Map({
      container: "map",
      style: streetBaseMapStyle,
      zoom: 14,
      maxZoom: 22,
      center: [-114.07432, 51.05373],
      hash: true,
      attributionControl: false
    });

    map.addControl(
      new mapboxgl.AttributionControl({
        customAttribution:
          "<a href='https://data.calgary.ca/'>&copy; City of Calgary</a>"
      })
    );
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
      })
    );
    map.addControl(new ZoomControl(), "bottom-right");
    map.addControl(new CompassControl(), "bottom-right");

    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

    map.on("load", () => {
      const layers = map.getStyle().layers;
      let firstSymbolId;
      for (let layer of layers) {
        if (layer.type === "symbol") {
          firstSymbolId = layer.id;
          break;
        }
      }
      map.addLayer(
        {
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 19,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "height"]
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"]
            ],
            "fill-extrusion-opacity": 0.6
          }
        },
        firstSymbolId
      );

      this.addCrimeSummaryLayer(
        safetyCrimeLayer.layer.id,
        safetyCrimeLayer.source.url,
        safetyCrimeLayer.layer.source,
        safetyCrimeLayer.layer.color,
        2021,
        false
      );

      for (const safetyFloodProbabilityLayer of safetyFloodProbabilityLayers) {
        this.addFloodProbabilityLayer(
          safetyFloodProbabilityLayer.layer.id,
          safetyFloodProbabilityLayer.source.url,
          safetyFloodProbabilityLayer.layer.source,
          safetyFloodProbabilityLayer.layer.color,
          false
        );
      }

      this.addEmsStationsLayer(
        safetyEmsLayer.layer.id,
        safetyEmsLayer.source.url,
        safetyEmsLayer.layer.source,
        safetyEmsLayer.layer.minZoom,
        safetyEmsLayer.layer.maxZoom,
        safetyEmsLayer.layer.color,
        safetyEmsLayer.layer.icon,
        safetyEmsLayer.layer.text,
        false
      );

      this.addFireStationsLayer(
        safetyFireStationLayer.layer.id,
        safetyFireStationLayer.source.url,
        safetyFireStationLayer.layer.source,
        safetyFireStationLayer.layer.minZoom,
        safetyFireStationLayer.layer.maxZoom,
        safetyFireStationLayer.layer.color,
        safetyFireStationLayer.layer.icon,
        safetyFireStationLayer.layer.text,
        false
      );

      this.addSchoolsLayer(
        accessibilitySchoolsLayer.layer.id,
        accessibilitySchoolsLayer.source.url,
        accessibilitySchoolsLayer.layer.source,
        accessibilitySchoolsLayer.layer.minZoom,
        accessibilitySchoolsLayer.layer.maxZoom,
        accessibilitySchoolsLayer.layer.color,
        accessibilitySchoolsLayer.layer.icon,
        accessibilitySchoolsLayer.layer.text,
        false
      );

      this.addParksLayer(
        accessibilityParksLayer.layer.id,
        accessibilityParksLayer.source.url,
        accessibilityParksLayer.layer.source,
        accessibilityParksLayer.layer.minZoom,
        accessibilityParksLayer.layer.maxZoom,
        accessibilityParksLayer.layer.color,
        false
      );

      this.addTrailsLayer(
        accessibilityTrailsLayer.layer.id,
        accessibilityTrailsLayer.source.url,
        accessibilityTrailsLayer.layer.source,
        accessibilityTrailsLayer.layer.minZoom,
        accessibilityTrailsLayer.layer.maxZoom,
        accessibilityTrailsLayer.layer.color,
        false
      );

      this.addBikewaysLayer(
        accessibilityBikewaysLayer.layer.id,
        accessibilityBikewaysLayer.source.url,
        accessibilityBikewaysLayer.layer.source,
        accessibilityBikewaysLayer.layer.minZoom,
        accessibilityBikewaysLayer.layer.maxZoom,
        accessibilityBikewaysLayer.layer.color,
        false
      );

      this.addPropertyValueLayer(
        propertyValueLayer.layer.id,
        propertyValueLayer.source.url,
        propertyValueLayer.layer.source,
        propertyValueLayer.layer.minZoom,
        propertyValueLayer.layer.maxZoom,
        propertyValueLayer.layer.radius,
        propertyValueLayer.layer.color,
        propertyValueLayer.layer.isVisible
      );
    });

    this.map = map;
  },
  methods: {
    addPropertyValueLayer(
      id,
      url,
      sourceLayer,
      minZoom,
      maxZoom,
      radius,
      color,
      isVisible
    ) {
      this.map.addLayer(
        {
          id: id,
          type: "circle",
          source: {
            type: "vector",
            url: url
          },
          "source-layer": sourceLayer,
          minzoom: minZoom,
          maxzoom: maxZoom,
          paint: {
            "circle-radius": radius,
            "circle-color": color,
            "circle-stroke-color": "transparent",
            "circle-opacity": 0.8
          },
          layout: {
            visibility: isVisible ? "visible" : "none"
          }
        },
        this.baseMapIndex
      );

      this.map.addLayer(
        {
          id: "selected-property",
          type: "circle",
          source: { type: "vector", url: url },
          "source-layer": sourceLayer,
          minzoom: 8,
          maxzoom: maxZoom,
          paint: {
            "circle-radius": {
              base: 1.75,
              stops: [
                [8, 8],
                [22, 120]
              ]
            },
            "circle-color": "#fff",
            "circle-stroke-color": "transparent",
            "circle-opacity": 0.8
          },
          filter: ["==", "gid", ""]
        },
        id
      );

      this.map.on("mouseenter", id, e => {
        this.map.getCanvas().style.cursor = "pointer";

        const coordinates = e.features[0].geometry.coordinates.slice();
        const propertyValue = e.features[0].properties.value;
        const propertyAddress = e.features[0].properties.address;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        this.popup
          .setLngLat(coordinates)
          .setHTML(
            `<span style="font-size: 12px;">${propertyAddress}</span><br/><h2 style="">$${propertyValue.toLocaleString()}</h2>`
          )
          .addTo(this.map);
      });

      this.map.on("mouseleave", id, () => {
        this.map.getCanvas().style.cursor = "";
        this.popup.remove();
      });

      this.map.on("click", id, e => {
        const id = e.features[0].properties.gid;
        const address = e.features[0].properties.address;
        const community = e.features[0].properties.community;
        const coordinates = e.features[0].geometry.coordinates;
        const assessedValue = e.features[0].properties.value;
        const previousAssessedValue = e.features[0].properties.value_2020;
        const growthValue =
          previousAssessedValue != null && previousAssessedValue > 0
            ? Math.round(
                ((assessedValue - previousAssessedValue) * 100) /
                  previousAssessedValue
              )
            : null;
        const oldAssessedValue = e.features[0].properties.value_2019;
        const assessedValueTrend = [
          { x: 2019, y: oldAssessedValue },
          { x: 2020, y: previousAssessedValue },
          { x: 2021, y: assessedValue }
        ];
        const propertyClass = e.features[0].properties.property_class;
        const yearOfConstruction =
          e.features[0].properties.year_of_construction;
        const landUse = e.features[0].properties.land_use_designation;
        const landSizeM = e.features[0].properties.land_size_m;
        const landSizeFt = e.features[0].properties.land_size_ft;

        this.loadPropertyInfo(
          id,
          coordinates,
          address,
          community,
          assessedValue,
          growthValue,
          assessedValueTrend,
          propertyClass,
          yearOfConstruction,
          landUse,
          landSizeM,
          landSizeFt
        );

        this.map.setFilter("selected-property", ["==", "gid", id]);

        this.map.flyTo({
          center: coordinates,
          zoom: 20,
          bearing: this.map.getBearing() + 45,
          pitch: 60
        });
      });
    },
    loadPropertyInfo(
      id,
      coordinates,
      address,
      community,
      assessedValue,
      growthValue,
      assessedValueTrend,
      propertyClass,
      yearOfConstruction,
      landUse,
      landSizeM,
      landSizeFt
    ) {
      this.propertyInfo = {
        id: id,
        coordinates: { lon: coordinates[0], lat: coordinates[1] },
        address: address,
        community: community,
        value: assessedValue,
        growth: growthValue,
        trend: assessedValueTrend,
        class: propertyClass,
        year: yearOfConstruction,
        landuse: landUse,
        size_m: landSizeM,
        size_ft: landSizeFt
      };
      this.showPropertyInfo = true;
    },
    addCrimeSummaryLayer(id, url, sourceLayer, color, year, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "fill",
          source: {
            type: "vector",
            url: url
          },
          "source-layer": sourceLayer,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.8
          },
          layout: {
            visibility: isVisible ? "visible" : "none"
          },
          filter: ["==", "year", year]
        },
        "waterway"
      );
    },
    layerHandler(layer) {
      if (layer.status) {
        this.map.setLayoutProperty(layer.id, "visibility", "visible");
        layer.legend && this.legends.push(layer.legend);

        layer.isochrone && this.addIsochroneLayer(layer.isochrone);

        if (layer.id.includes("crime")) {
          this.map.flyTo({
            center: this.propertyInfo.coordinates,
            zoom: 13.5,
            bearing: 0,
            pitch: 0
          });
        }
        if (layer.id.includes("flood")) {
          this.map.flyTo({
            center: this.propertyInfo.coordinates,
            zoom: 16,
            bearing: 0,
            pitch: 0
          });
        }
      } else {
        this.map.setLayoutProperty(layer.id, "visibility", "none");
        layer.legend &&
          this.legends.splice(
            this.legends.findIndex(legend => legend.id === layer.id),
            1
          );
        layer.isochrone && this.removeIsochroneLayer();
      }
    },
    accessibilityHandler(accessibility) {
      this.accessibility = accessibility;
    },
    addFloodProbabilityLayer(id, url, sourceLayer, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "fill",
          source: {
            type: "vector",
            url: url
          },
          "source-layer": sourceLayer,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.4
          },
          layout: {
            visibility: isVisible ? "visible" : "none"
          }
        },
        this.baseMapIndex
      );
    },
    addEmsStationsLayer(
      id,
      url,
      sourceLayer,
      minZoom,
      maxZoom,
      color,
      icon,
      text,
      isVisible
    ) {
      this.map.addLayer({
        id: id,
        type: "symbol",
        source: {
          type: "vector",
          url: url
        },
        "source-layer": sourceLayer,
        minzoom: minZoom,
        maxzoom: maxZoom,
        paint: {
          "text-color": color,
          "text-halo-color": "#333",
          "text-halo-blur": 1,
          "text-halo-width": 1
        },
        layout: {
          visibility: isVisible ? "visible" : "none",
          "icon-image": icon,
          "icon-allow-overlap": true,
          "text-field": ["get", text],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.5]
        }
      });
    },
    removeIsochroneLayer() {
      if (this.map.getLayer("isochrone")) {
        this.map.removeLayer("isochrone");
        this.map.removeSource("isochrone");
      }
    },
    addIsochroneLayer(isochrone) {
      this.removeIsochroneLayer();

      this.map.addSource("isochrone", {
        type: "geojson",
        data: isochrone
      });

      this.map.addLayer(
        {
          id: "isochrone",
          type: "fill",
          source: "isochrone",
          paint: {
            "fill-color": "#034e7b",
            "fill-opacity": 0.4
          }
        },
        "accessibility-parks"
      );

      this.map.fitBounds(BBOX(isochrone), {
        bearing: 0,
        pitch: 0,
        padding: { top: 20, bottom: 20, left: 350, right: 20 }
      });
    },
    addFireStationsLayer(
      id,
      url,
      sourceLayer,
      minZoom,
      maxZoom,
      color,
      icon,
      text,
      isVisible
    ) {
      this.map.addLayer({
        id: id,
        type: "symbol",
        source: {
          type: "vector",
          url: url
        },
        "source-layer": sourceLayer,
        minzoom: minZoom,
        maxzoom: maxZoom,
        paint: {
          "text-color": color,
          "text-halo-color": "#333",
          "text-halo-blur": 1,
          "text-halo-width": 1
        },
        layout: {
          visibility: isVisible ? "visible" : "none",
          "icon-image": icon,
          "icon-allow-overlap": true,
          "text-field": ["get", text],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.5]
        }
      });
    },
    addSchoolsLayer(
      id,
      url,
      sourceLayer,
      minZoom,
      maxZoom,
      color,
      icon,
      text,
      isVisible
    ) {
      this.map.addLayer({
        id: id,
        type: "symbol",
        source: {
          type: "vector",
          url: url
        },
        "source-layer": sourceLayer,
        minzoom: minZoom,
        maxzoom: maxZoom,
        paint: {
          "text-color": color,
          "text-halo-color": "#333",
          "text-halo-blur": 1,
          "text-halo-width": 1
        },
        layout: {
          visibility: isVisible ? "visible" : "none",
          "icon-image": icon,
          "icon-allow-overlap": true,
          "text-field": ["get", text],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.5]
        }
      });
    },
    addParksLayer(id, url, sourceLayer, minZoom, maxZoom, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "fill",
          source: {
            type: "vector",
            url: url
          },
          "source-layer": sourceLayer,
          minzoom: minZoom,
          maxzoom: maxZoom,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.8
          },
          layout: {
            visibility: isVisible ? "visible" : "none"
          }
        },
        "waterway"
      );
    },
    addTrailsLayer(id, url, sourceLayer, minZoom, maxZoom, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "line",
          source: {
            type: "vector",
            url: url
          },
          "source-layer": sourceLayer,
          minzoom: minZoom,
          maxzoom: maxZoom,
          paint: {
            "line-color": color,
            "line-width": 1,
            "line-dasharray": [0, 2]
          },
          layout: {
            visibility: isVisible ? "visible" : "none",
            "line-join": "round",
            "line-cap": "round"
          }
        },
        "waterway"
      );
    },
    addBikewaysLayer(id, url, sourceLayer, minZoom, maxZoom, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "line",
          source: {
            type: "vector",
            url: url
          },
          "source-layer": sourceLayer,
          minzoom: minZoom,
          maxzoom: maxZoom,
          paint: {
            "line-color": color,
            "line-width": 1,
            "line-dasharray": [0, 2]
          },
          layout: {
            visibility: isVisible ? "visible" : "none",
            "line-join": "round",
            "line-cap": "round"
          }
        },
        "road-label"
      );
    }
  }
};
</script>
<style>
@import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
@import "../../node_modules/@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
@import "../../node_modules/mapbox-gl-controls/lib/controls.css";

body {
  margin: 0;
  padding: 0;
}
#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
.property-info {
  z-index: 2 !important;
}
.app-property-value-legend {
  position: absolute;
  right: 60px;
  bottom: 42px;
}
</style>
