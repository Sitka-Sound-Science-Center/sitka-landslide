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
        center: [-135.32, 57.0531],
        minZoom: 8,
        zoom: 10,
        maxZoom: 15,
        hash: true,
      });

      map.on("load", function () {
        map.addSource("raster-risk", {
          type: "raster",
          tiles: [window.location.origin + "/images/tiles/risk-purple/{z}/{x}/{y}.png"],
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

        map.setPaintProperty("satellite", "raster-saturation", -0.8);

        map.addLayer({
          id: "simple-tiles",
          type: "raster",
          source: "raster-risk",
          minzoom: 0,
          maxzoom: 20,
          paint: {
            "raster-resampling": "nearest",
            "raster-hue-rotate": 50,
            "raster-opacity": ["interpolate", ["exponential", 0.85], ["zoom"], 12, 0.75, 18, 0.65],
          },
        });
      });

      var nav = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
      });

      map.addControl(nav, "bottom-right");
    }
  }, []);

  return <div id="map" style={{ height: "800px", width: "100%" }} className="map"></div>;
};

// Map.defaultProps = {
//   hasIcon: true,
//   hasText: true,
//   fontSize: "inherit",
//   fontWeight: "inherit",
//   iconSize: "1.2em",
// };

// Map.propTypes = {
//   MapLevel: PropTypes.number.isRequired,
//   hasIcon: PropTypes.bool,
//   hasText: PropTypes.bool,
//   fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//   iconSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
// };

export default Map;
