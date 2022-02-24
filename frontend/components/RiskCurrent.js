import PropTypes from "prop-types";
import styles from "../styles/RiskCurrent.module.css";
import Risk from "./Risk";

const RiskCurrent = ({ riskLevel }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Current risk</h2>
      <p className={styles.risk}>
        <Risk riskLevel={riskLevel} />
      </p>
    </section>
  );
};

RiskCurrent.propTypes = {
  riskLevel: PropTypes.number,
};

export default RiskCurrent;
