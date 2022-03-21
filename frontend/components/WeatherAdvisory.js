import PropTypes from "prop-types";
import Icon from "./Icon";

import styles from "../styles/WeatherAdvisory.module.css";

const LastUpdated = ({ permalink }) => {
  return (
    <a className={styles.banner} href={permalink}>
      <span className={styles.title}>
        <Icon name="circle-info" />
        Weather advisory
      </span>
      <span className={styles.link}>Link</span>
    </a>
  );
};

LastUpdated.propTypes = {
  permalink: PropTypes.string.isRequired,
};

export default LastUpdated;
