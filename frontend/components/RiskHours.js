import PropTypes from "prop-types";
import AreaChart from "/components/AreaChart";
import styles from "../styles/RiskHours.module.css";

const RiskHours = ({ hours, message }) => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>24 hour forecast</h2>
        <p>{message}</p>
      </div>
      <AreaChart data={hours} />
    </section>
  );
};

RiskHours.propTypes = {
  blocks: PropTypes.array,
  message: PropTypes.string,
};

export default RiskHours;
