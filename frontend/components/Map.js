import mapboxgl from "!mapbox-gl";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "mapbox-gl/src/css/mapbox-gl.css";

const Map = ({}) => {
  mapboxgl.accessToken = "pk.eyJ1IjoibGtuYXJmIiwiYSI6IjhjbGg4RUkifQ.-lS6mAkmR3SVh-W4XwQElg";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!mounted) {
      const map = new mapboxgl.Map({
        cooperativeGestures: true,
        container: "map",
        style: "mapbox://styles/lknarf/cl0pf3asg000114nt5jepzs6s",
        minZoom: 8,
        pitch: 60,
        bearing: 0,
        maxZoom: 18,
        bounds: [
          [-135.40821075439453, 57.031763208858415],
          [-135.19054412841797, 57.12282315984669],
        ],
      });

      map.on("load", function () {
        map.addSource("raster-risk", {
          type: "raster",
          tiles: [window.location.origin + "/images/tiles/rose/{z}/{x}/{y}.png"],
          minzoom: 8,
          maxzoom: 15,
          tileSize: 512,
        });

        map.addLayer({
          id: "sky",
          type: "sky",
          paint: {
            "sky-type": "atmosphere",
            "sky-atmosphere-sun": [0.0, 0.0],
            "sky-atmosphere-sun-intensity": 20,
          },
        });

        map.setPaintProperty("satellite", "raster-saturation", -0.9);

        map.addLayer({
          id: "simple-tiles",
          type: "raster",
          source: "raster-risk",
          minzoom: 0,
          maxzoom: 20,
          paint: {
            "raster-resampling": "nearest",
            "raster-opacity": 0.7,
          },
        });
      });

      var nav = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
      });

      map.addControl(nav, "bottom-right");
    }
  }, [mounted]);

  return (
    <div id="map" className="map">
      <style global jsx>{`
        .map {
          width: 100%;
          height: 100vh;
        }

        @media screen and (min-width: 1000px) {
          .map {
            width: auto;
            margin: 0 -100px;
          }
        }

        .mapboxgl-ctrl button.mapboxgl-ctrl-zoom-out .mapboxgl-ctrl-icon {
          background-image: url("/images/svg/mapboxgl-ctrl-zoom-out.svg");
        }

        .mapboxgl-ctrl button.mapboxgl-ctrl-compass .mapboxgl-ctrl-icon {
          background-image: url("/images/svg/mapboxgl-ctrl-compass.svg");
        }

        .mapboxgl-ctrl button.mapboxgl-ctrl-zoom-in .mapboxgl-ctrl-icon {
          background-image: url("/images/svg/mapboxgl-ctrl-zoom-in.svg");
        }

        a.mapboxgl-ctrl-logo {
          background-image: url("/images/svg/mapboxgl-ctrl-logo.svg");
        }

        .mapboxgl-ctrl-attrib-button {
          background-image: url("/images/svg/mapboxgl-ctrl-attrib.svg");
        }

        .mapboxgl-ctrl-attrib.mapboxgl-compact {
          min-height: 24px;
        }
      `}</style>
    </div>
  );
};

export default Map;
