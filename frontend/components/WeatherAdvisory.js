import PropTypes from "prop-types";
import Icon from "./Icon";

import styles from "../styles/WeatherAdvisory.module.css";

const WeatherAdvisory = ({ permalink }) => {
  return (
    <a className={styles.banner} href={permalink}>
      <span className={styles.title}>
        <Icon name="circle-info" />
        Weather alert from NWS
      </span>
      <span className={styles.link}>Link</span>
    </a>
  );
};

WeatherAdvisory.propTypes = {
  permalink: PropTypes.string.isRequired,
};

export default WeatherAdvisory;
