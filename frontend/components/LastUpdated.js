import PropTypes from "prop-types";
import * as timeago from "timeago.js";
import { useState, useEffect } from "react";

const LastUpdated = ({ update }) => {
  const [time, setTime] = useState();

  useEffect(() => {
    setTime(timeago.format(new Date(update)));
  }, []);

  return (
    <div style={{ textAlign: "center", marginBottom: "var(--space-300)" }}>
      Last updated: {time}
    </div>
  );
};

LastUpdated.propTypes = {
  update: PropTypes.string.isRequired,
};

export default LastUpdated;
