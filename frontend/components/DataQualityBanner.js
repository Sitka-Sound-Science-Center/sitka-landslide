import Icon from "./Icon";

import styles from "../styles/DataQuality.module.css";

const DataQualityBanner = () => {
  return (
    <div className={styles.banner}>
      <span className={styles.title}>
        <Icon name="circle-exclamation" />
        <span>
          We’re currently experiencing some issues with rainfall data, which might affect risk
          forecasts. Please refer to the{" "}
          <a href="https://forecast.weather.gov/MapClick.php?lat=57.0531&lon=-135.33#.YzIhk3ZKj-g">
            National Weather Service
          </a>{" "}
          for rainfall forecasts and weather alerts.
        </span>
      </span>
    </div>
  );
};

export default DataQualityBanner;
