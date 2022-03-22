import PropTypes from "prop-types";
import * as timeago from "timeago.js";
import { useState, useEffect } from "react";

import styles from "../styles/LastUpdated.module.css";

const LastUpdated = ({ update }) => {
  const [time, setTime] = useState();

  useEffect(() => {
    setTime(timeago.format(new Date(update)));
  }, []);

  return (
    <div className={styles.lastupdated}>
      Last updated {time} with data from{" "}
      <a href="https://forecast.weather.gov/MapClick.php?lat=57.0531&lon=-135.33">
        National Weather Service
      </a>
    </div>
  );
};

LastUpdated.propTypes = {
  update: PropTypes.string.isRequired,
};

export default LastUpdated;
