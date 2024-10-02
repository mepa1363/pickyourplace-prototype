<template>
  <div>
    <div id="map"></div>
    <v-card
      v-if="showPropertyInfo"
      max-width="450"
      class="property-info mx-left ml-2 mt-2"
    >
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ propertyInfo.address }}</v-list-item-title>
          <v-list-item-subtitle>{{
            propertyInfo.community
          }}</v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action class="flex-row">
          <v-btn
            small
            text
            color="primary"
            @click="
              map.flyTo({
                center: propertyInfo.coordinates,
                padding: { left: 500 },
                zoom: 18,
              })
            "
            >Zoom</v-btn
          >
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
        <safety-accessibility
          v-if="
            factor === 'safety' &&
            (safetyAccessibilityEms || safetyAccessibilityFire)
          "
          :selectedPropertyLocation="propertyInfo.coordinates"
          @layerStatus="layerHandler"
          @accessibility="accessibilityHandler"
        />
        <safety-ems
          v-if="factor === 'safety'"
          :layerId="safetyEmsLayer.layer.id"
          @layerStatus="layerHandler"
        />
        <safety-fire-station
          v-if="factor === 'safety'"
          :layerId="safetyFireStationLayer.layer.id"
          @layerStatus="layerHandler"
        />
        <accessibility
          v-if="factor === 'accessibility'"
          :selectedPropertyLocation="propertyInfo.coordinates"
          @accessibility="accessibilityHandler"
        />
        <accessibility-schools
          v-if="factor === 'accessibility' && accessibilityMode != null"
          :layerId="accessibilitySchoolsLayer.layer.id"
          :accessibilityMode="accessibilityMode"
          @layerStatus="layerHandler"
        />
        <accessibility-parks
          v-if="factor === 'accessibility' && accessibilityMode != null"
          :layerId="accessibilityParksLayer.layer.id"
          :accessibilityMode="accessibilityMode"
          @layerStatus="layerHandler"
        />
        <accessibility-trails
          v-if="factor === 'accessibility' && accessibilityMode != null"
          :layerId="accessibilityTrailsLayer.layer.id"
          :accessibilityMode="accessibilityMode"
          @layerStatus="layerHandler"
        />
        <accessibility-bikeways
          v-if="factor === 'accessibility' && accessibilityMode != null"
          :layerId="accessibilityBikewaysLayer.layer.id"
          :accessibilityMode="accessibilityMode"
          @layerStatus="layerHandler"
        />
      </v-card-text>
    </v-card>
    <map-legend :legends="legends" />
    <feedback />
    <map-layer-control @layerStatus="baseLayerHandler" />
  </div>
</template>

<script>
import mapboxgl from "mapbox-gl";
import { ZoomControl, CompassControl } from "mapbox-gl-controls";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import propertyValueLayer from "./map-layers/property-value/point";
import propertyValueAggregatedLayerH38 from "./map-layers/property-value/polygon-h3-8";
import propertyValueAggregatedLayerH39 from "./map-layers/property-value/polygon-h3-9";
import propertyValueAggregatedLayerH310 from "./map-layers/property-value/polygon-h3-10";
import propertyValueAggregatedLayerH311 from "./map-layers/property-value/polygon-h3-11";
import safetyCrimeLayer from "./map-layers/safety/crime";
import safetyFloodProbabilityLayers from "./map-layers/safety/flood";
import safetyEmsLayer from "./map-layers/safety/ems";
import safetyFireStationLayer from "./map-layers/safety/fire-station";
import accessibilitySchoolsLayer from "./map-layers/accessibility/schools";
import accessibilityParksLayer from "./map-layers/accessibility/parks";
import accessibilityTrailsLayer from "./map-layers/accessibility/trails";
import accessibilityBikewaysLayer from "./map-layers/accessibility/bikeways";
import mapLayerControl from "./map-layers/LayerControl.vue";

import MapLegend from "./map-layers/Legend.vue";
import PropertyAssessment from "./value/PropertyAssessment.vue";
import SafetyAccessibility from "./safety/Accessibility.vue";
import SafetyCrime from "./safety/Crime.vue";
import SafetyFloodProbability from "./safety/Flood.vue";
import SafetyEms from "./safety/EMS.vue";
import SafetyFireStation from "./safety/FireStation.vue";
import Accessibility from "./accessibility/Accessibility.vue";
import AccessibilitySchools from "./accessibility/Schools.vue";
import AccessibilityParks from "./accessibility/Parks.vue";
import AccessibilityTrails from "./accessibility/Trails.vue";
import AccessibilityBikeways from "./accessibility/Bikeways.vue";

import Feedback from "./Feedback.vue";

// import BBOX from "@turf/bbox";
import Centroid from "@turf/centroid";

export default {
  components: {
    MapLegend,
    PropertyAssessment,
    SafetyAccessibility,
    SafetyCrime,
    SafetyFloodProbability,
    SafetyEms,
    SafetyFireStation,
    Accessibility,
    AccessibilitySchools,
    AccessibilityParks,
    AccessibilityTrails,
    AccessibilityBikeways,
    Feedback,
    MapLayerControl: mapLayerControl,
  },
  data: () => ({
    map: null,
    popup: null,
    factor: "dollar-value",
    showPropertyInfo: false,
    propertyInfo: {},
    legends: [propertyValueLayer.legend],
    defaultMapStyle: null,
    baseMapIndex: "waterway-label",
    layerIndex: "waterway",
    safetyCrimeLayer: safetyCrimeLayer,
    safetyFloodProbabilityLayers: safetyFloodProbabilityLayers,
    safetyAccessibilityEms: false,
    safetyAccessibilityFire: false,
    safetyEmsLayer: safetyEmsLayer,
    safetyFireStationLayer: safetyFireStationLayer,
    accessibilityMode: null,
    accessibilitySchoolsLayer: accessibilitySchoolsLayer,
    accessibilityParksLayer: accessibilityParksLayer,
    accessibilityTrailsLayer: accessibilityTrailsLayer,
    accessibilityBikewaysLayer: accessibilityBikewaysLayer,
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
    },
    safetyAccessibilityEms(value) {
      if (!value && !this.safetyAccessibilityFire) {
        this.removeIsochroneLayer();
      }
    },
    safetyAccessibilityFire(value) {
      if (!value && !this.safetyAccessibilityEms) {
        this.removeIsochroneLayer();
      }
    },
  },
  mounted() {
    mapboxgl.accessToken = process.env.VUE_APP_MAPBOX_API_KEY;

    const map = new mapboxgl.Map({
      container: "map",
      style: null,
      zoom: 14,
      maxZoom: 22,
      center: [-114.07432, 51.05373],
      hash: true,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.AttributionControl({
        customAttribution:
          "<a href='https://data.calgary.ca/'>&copy; City of Calgary</a>",
      })
    );
    map.addControl(
      new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        zoom: 18,
        getItemValue: (e) => {
          console.log(e);
          if (e.place_type.includes("address")) {
            const a = e.text.toUpperCase().split(",")[0].split(" ")[0];
            const b = `${e.address} ${a}`;
            console.log(b);
            this.map.setFilter("selected-property", [
              "in",
              b,
              ["string", ["get", "address"]],
            ]);
          }
          return e.place_name;
        },
      })
    );

    map.addControl(new ZoomControl(), "bottom-right");
    map.addControl(new CompassControl(), "bottom-right");

    this.popup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
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
              ["get", "height"],
            ],
            "fill-extrusion-base": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              15.05,
              ["get", "min_height"],
            ],
            "fill-extrusion-opacity": 0.6,
          },
        },
        firstSymbolId
      );
    });

    map.on("style.load", () => {
      this.addMapLayers();
    });

    this.map = map;
  },
  methods: {
    baseLayerHandler(layer) {
      this.map.setStyle(layer);
      this.layerIndex = layer.includes("satellite") ? "" : "waterway";
    },
    addMapLayers() {
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

      this.addPropertyValueLayer(propertyValueLayer);

      this.addPropertyValueAggregatedLayer(propertyValueAggregatedLayerH38);

      this.addPropertyValueAggregatedLayer(propertyValueAggregatedLayerH39);

      this.addPropertyValueAggregatedLayer(propertyValueAggregatedLayerH310);

      this.addPropertyValueAggregatedLayer(propertyValueAggregatedLayerH311);
    },
    addPropertyValueAggregatedLayer(propertyValueAggregatedLayer) {
      this.map.addLayer(
        {
          id: propertyValueAggregatedLayer.layer.id,
          type: "fill",
          source: {
            type: "vector",
            tiles: [propertyValueAggregatedLayer.source.url],
            minzoom: propertyValueAggregatedLayer.source.minZoom,
            maxzoom: propertyValueAggregatedLayer.source.maxZoom,
          },
          "source-layer": propertyValueAggregatedLayer.layer.source,
          minzoom: propertyValueAggregatedLayer.layer.minZoom,
          maxzoom: propertyValueAggregatedLayer.layer.maxZoom,
          paint: {
            "fill-color": propertyValueAggregatedLayer.layer.color,
            "fill-opacity": 0.6,
          },
          layout: {
            visibility: propertyValueAggregatedLayer.layer.isVisible
              ? "visible"
              : "none",
          },
        },
        this.baseMapIndex
      );

      this.map.on("mousemove", propertyValueAggregatedLayer.layer.id, (e) => {
        this.map.getCanvas().style.cursor = "pointer";

        const coordinates = Centroid(
          e.features[0].geometry
        ).geometry.coordinates.slice();
        const propertyValue = e.features[0].properties.assessed_value;
        const numberOfProperties = e.features[0].properties.count;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        this.popup
          .setLngLat(coordinates)
          .setHTML(
            `<span style="font-size: 12px;"><strong>${numberOfProperties} properties</strong> with average value of</span><br/><h2>$${propertyValue.toLocaleString()}</h2>`
          )
          .addTo(this.map);
      });

      this.map.on("mouseleave", propertyValueAggregatedLayer.layer.id, () => {
        this.map.getCanvas().style.cursor = "";
        this.popup.remove();
      });
    },
    addPropertyValueLayer(propertyValueLayer) {
      this.map.addLayer(
        {
          id: propertyValueLayer.layer.id,
          type: "circle",
          source: {
            type: "vector",
            tiles: [propertyValueLayer.source.url],
            minzoom: propertyValueLayer.source.minZoom,
            maxzoom: propertyValueLayer.source.maxZoom,
          },
          "source-layer": propertyValueLayer.layer.source,
          minzoom: propertyValueLayer.layer.minZoom,
          maxzoom: propertyValueLayer.layer.maxZoom,
          paint: {
            "circle-radius": propertyValueLayer.layer.radius,
            "circle-color": propertyValueLayer.layer.color,
            "circle-stroke-color": "transparent",
            "circle-opacity": 0.8,
          },
          layout: {
            visibility: propertyValueLayer.layer.isVisible ? "visible" : "none",
          },
          filter: ["!=", "clustered", true],
        },
        this.baseMapIndex
      );

      this.map.addLayer(
        {
          id: "selected-property",
          type: "circle",
          source: {
            type: "vector",
            tiles: [propertyValueLayer.source.url],
            minzoom: propertyValueLayer.source.minZoom,
            maxzoom: propertyValueLayer.source.maxZoom,
          },
          "source-layer": propertyValueLayer.layer.source,
          minzoom: propertyValueLayer.layer.minZoom,
          maxzoom: propertyValueLayer.layer.maxZoom,
          paint: {
            "circle-radius": {
              base: 1.75,
              stops: [
                [8, 8],
                [22, 160],
              ],
            },
            "circle-color": "#fff",
            "circle-stroke-color": "#C0C0C0",
            "circle-stroke-width": 0.5,
            "circle-opacity": 0.8,
          },
          filter: ["==", "id", ""],
        },
        propertyValueLayer.layer.id
      );

      this.map.on("mousemove", propertyValueLayer.layer.id, (e) => {
        this.map.getCanvas().style.cursor = "pointer";

        const coordinates = e.features[0].geometry.coordinates.slice();
        const propertyValue = e.features[0].properties.assessed_value;
        const propertyAddress = e.features[0].properties.address;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        this.popup
          .setLngLat(coordinates)
          .setHTML(
            `<span style="font-size: 12px;">${propertyAddress}</span><br/><h2 style="">$${Math.round(
              propertyValue
            ).toLocaleString()}</h2>`
          )
          .addTo(this.map);
      });

      this.map.on("mouseleave", propertyValueLayer.layer.id, () => {
        this.map.getCanvas().style.cursor = "";
        this.popup.remove();
      });

      this.map.on("click", propertyValueLayer.layer.id, (e) => {
        const id = e.features[0].properties.id;
        const address = e.features[0].properties.address;
        const community = e.features[0].properties.community;
        const coordinates = e.features[0].geometry.coordinates;
        const assessedValue = e.features[0].properties.assessed_value;
        const currentYear = e.features[0].properties.roll_year;
        const historicalAssessedValues = JSON.parse(
          e.features[0].properties.historical_assessed_values
        );
        const previousAssessedValue = historicalAssessedValues.find(
          (assessedValue) => assessedValue.year === currentYear - 1
        )?.value;
        const growthValueYoY =
          previousAssessedValue != null && previousAssessedValue > 0
            ? Math.round(
                ((assessedValue - previousAssessedValue) * 100) /
                  previousAssessedValue
              )
            : null;

        const assessedValueTrend = historicalAssessedValues
          .map((assessedValue) => {
            return { x: assessedValue.year, y: assessedValue.value };
          })
          .sort((a, b) => a.x - b.x);
        assessedValueTrend.push({ x: currentYear, y: assessedValue });

        const yearOfConstruction =
          e.features[0].properties.year_of_construction;
        const landUse = e.features[0].properties.land_use_designation;
        const proertyType =
          e.features[0].properties.sub_property_use_description;
        const landSizeM = e.features[0].properties.land_size_m2;
        const landSizeFt = Math.round(
          e.features[0].properties.land_size_m2 * 10.76391042
        );

        this.loadPropertyInfo(
          id,
          coordinates,
          address,
          community,
          assessedValue,
          growthValueYoY,
          assessedValueTrend,
          yearOfConstruction,
          landUse,
          proertyType,
          landSizeM,
          landSizeFt
        );

        this.map.setFilter("selected-property", ["==", "id", id]);

        // this.map.setFilter(propertyValueLayer.layer.id, ["==", "id", id]);
      });

      this.map.addLayer(
        {
          id: `${propertyValueLayer.layer.id}-cluster`,
          type: "circle",
          source: {
            type: "vector",
            tiles: [propertyValueLayer.source.url],
            minzoom: propertyValueLayer.source.minZoom,
            maxzoom: propertyValueLayer.source.maxZoom,
          },
          "source-layer": propertyValueLayer.layer.source,
          minzoom: propertyValueLayer.layer.minZoom,
          maxzoom: propertyValueLayer.layer.maxZoom,
          paint: {
            "circle-radius": propertyValueLayer.layer.radius,
            "circle-color": propertyValueLayer.layer.color,
            "circle-stroke-color": "transparent",
            "circle-opacity": 0.8,
          },
          layout: {
            visibility: propertyValueLayer.layer.isVisible ? "visible" : "none",
          },
          filter: ["==", "clustered", true],
        },
        this.baseMapIndex
      );

      this.map.on(
        "mousemove",
        `${propertyValueLayer.layer.id}-cluster`,
        (e) => {
          this.map.getCanvas().style.cursor = "pointer";

          const coordinates = e.features[0].geometry.coordinates.slice();
          const propertyValue = e.features[0].properties.assessed_value;
          const propertyAddress = `<strong>${e.features[0].properties.point_count} properties</strong> with average value of`;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          this.popup
            .setLngLat(coordinates)
            .setHTML(
              `<span style="font-size: 12px;">${propertyAddress}</span><br/><h2 style="">$${Math.round(
                propertyValue
              ).toLocaleString()}</h2>`
            )
            .addTo(this.map);
        }
      );

      this.map.on(
        "mouseleave",
        `${propertyValueLayer.layer.id}-cluster`,
        () => {
          this.map.getCanvas().style.cursor = "";
          this.popup.remove();
        }
      );

      this.map.on("click", `${propertyValueLayer.layer.id}-cluster`, (e) => {
        console.log(e.features[0].properties);
      });
    },
    loadPropertyInfo(
      id,
      coordinates,
      address,
      community,
      assessedValue,
      growthValueYoY,
      assessedValueTrend,
      yearOfConstruction,
      landUse,
      proertyType,
      landSizeM,
      landSizeFt
    ) {
      this.propertyInfo = {
        id: id,
        coordinates: { lon: coordinates[0], lat: coordinates[1] },
        address: address,
        community: community,
        value: assessedValue,
        growth: growthValueYoY,
        trend: assessedValueTrend,
        year: yearOfConstruction,
        landuse: landUse,
        type: proertyType,
        size_m: landSizeM,
        size_ft: landSizeFt,
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
            url: url,
          },
          "source-layer": sourceLayer,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.8,
          },
          layout: {
            visibility: isVisible ? "visible" : "none",
          },
          filter: ["==", "year", year],
        },
        this.layerIndex
      );
    },
    layerHandler(layer) {
      if (layer.status) {
        this.map.setLayoutProperty(layer.id, "visibility", "visible");
        layer.legend && this.legends.push(layer.legend);

        // if (layer.id.includes("crime")) {
        //   this.map.flyTo({
        //     center: this.propertyInfo.coordinates,
        //     zoom: 13.5,
        //     bearing: 0,
        //     pitch: 0,
        //   });
        // }
        // if (layer.id.includes("flood")) {
        //   this.map.flyTo({
        //     center: this.propertyInfo.coordinates,
        //     zoom: 16,
        //     bearing: 0,
        //     pitch: 0,
        //   });
        // }
        if (layer.id.includes("safety-ems")) {
          this.safetyAccessibilityEms = true;
        }
        if (layer.id.includes("safety-fire")) {
          this.safetyAccessibilityFire = true;
        }
      } else {
        this.map.setLayoutProperty(layer.id, "visibility", "none");
        layer.legend &&
          this.legends.splice(
            this.legends.findIndex((legend) => legend.id === layer.id),
            1
          );
        if (layer.id.includes("safety-ems")) {
          this.safetyAccessibilityEms = false;
        }
        if (layer.id.includes("safety-fire")) {
          this.safetyAccessibilityFire = false;
        }
      }
    },
    accessibilityHandler(accessibility) {
      this.addIsochroneLayer(accessibility.isochrone);
      this.accessibilityMode = accessibility.action;
    },
    addFloodProbabilityLayer(id, url, sourceLayer, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "fill",
          source: {
            type: "vector",
            url: url,
          },
          "source-layer": sourceLayer,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.4,
          },
          layout: {
            visibility: isVisible ? "visible" : "none",
          },
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
          url: url,
        },
        "source-layer": sourceLayer,
        minzoom: minZoom,
        maxzoom: maxZoom,
        paint: {
          "text-color": color,
          "text-halo-color": "#333",
          "text-halo-blur": 1,
          "text-halo-width": 1,
        },
        layout: {
          visibility: isVisible ? "visible" : "none",
          "icon-image": icon,
          "icon-allow-overlap": true,
          "text-field": ["get", text],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.5],
        },
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
        data: isochrone,
      });

      this.map.addLayer(
        {
          id: "isochrone",
          type: "fill",
          source: "isochrone",
          paint: {
            "fill-color": "#034e7b",
            "fill-opacity": 0.4,
          },
        },
        "accessibility-parks"
      );

      // this.map.fitBounds(BBOX(isochrone), {
      //   bearing: 0,
      //   pitch: 0,
      //   padding: { top: 20, bottom: 20, left: 350, right: 20 },
      // });
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
          url: url,
        },
        "source-layer": sourceLayer,
        minzoom: minZoom,
        maxzoom: maxZoom,
        paint: {
          "text-color": color,
          "text-halo-color": "#333",
          "text-halo-blur": 1,
          "text-halo-width": 1,
        },
        layout: {
          visibility: isVisible ? "visible" : "none",
          "icon-image": icon,
          "icon-allow-overlap": true,
          "text-field": ["get", text],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.5],
        },
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
          url: url,
        },
        "source-layer": sourceLayer,
        minzoom: minZoom,
        maxzoom: maxZoom,
        paint: {
          "text-color": color,
          "text-halo-color": "#333",
          "text-halo-blur": 1,
          "text-halo-width": 1,
        },
        layout: {
          visibility: isVisible ? "visible" : "none",
          "icon-image": icon,
          "icon-allow-overlap": true,
          "text-field": ["get", text],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.5],
        },
      });
    },
    addParksLayer(id, url, sourceLayer, minZoom, maxZoom, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "fill",
          source: {
            type: "vector",
            url: url,
          },
          "source-layer": sourceLayer,
          minzoom: minZoom,
          maxzoom: maxZoom,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.8,
          },
          layout: {
            visibility: isVisible ? "visible" : "none",
          },
        },
        this.layerIndex
      );
    },
    addTrailsLayer(id, url, sourceLayer, minZoom, maxZoom, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "line",
          source: {
            type: "vector",
            url: url,
          },
          "source-layer": sourceLayer,
          minzoom: minZoom,
          maxzoom: maxZoom,
          paint: {
            "line-color": color,
            "line-width": 1,
            "line-dasharray": [0, 2],
          },
          layout: {
            visibility: isVisible ? "visible" : "none",
            "line-join": "round",
            "line-cap": "round",
          },
        },
        this.layerIndex
      );
    },
    addBikewaysLayer(id, url, sourceLayer, minZoom, maxZoom, color, isVisible) {
      this.map.addLayer(
        {
          id: id,
          type: "line",
          source: {
            type: "vector",
            url: url,
          },
          "source-layer": sourceLayer,
          minzoom: minZoom,
          maxzoom: maxZoom,
          paint: {
            "line-color": color,
            "line-width": 1,
            "line-dasharray": [0, 2],
          },
          layout: {
            visibility: isVisible ? "visible" : "none",
            "line-join": "round",
            "line-cap": "round",
          },
        },
        this.baseMapIndex
      );
    },
  },
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
