import PropTypes from "prop-types";
import Link from "next/link";
import { useState, useEffect } from "react";

import AreaChart from "/components/AreaChart";
import Risk from "/components/Risk";
import styles from "/styles/RiskHours.module.css";
import riskDefinitions from "/content/riskDefinitions";

const RiskHours = ({ hours, riskLevel }) => {
  const [chartVisible, setChartVisible] = useState(false);
  const toggleChart = () => {
    setChartVisible(!chartVisible);
  };

  const generateRiskMessage = (riskLevel) => {
    const riskSlug = riskDefinitions[riskLevel].slug;

    if (riskLevel === 0) {
      return (
        <span>
          {riskDefinitions[riskLevel].text} risk for the next 24 hours.{" "}
          <button onClick={toggleChart} className={styles.showChart}>
            {chartVisible ? "Hide" : "Show"}&nbsp;chart
          </button>
        </span>
      );
    } else {
      return (
        <span>
          Sitka will experience {riskDefinitions[riskLevel].text.toLowerCase()} landslide risk
          within the next 24 hours.{" "}
          <Link prefetch={false} href={`/prepare/#${riskSlug}`}>
            <a className={styles.prepare}> How to prepare</a>
          </Link>
        </span>
      );
    }
  };

  const riskMessage = generateRiskMessage(riskLevel);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>24 hour forecast</h2>
        <p className={styles.message}>
          <Risk riskLevel={riskLevel} hasText={false} />
          {riskMessage}
        </p>
      </div>
      {(chartVisible || riskLevel !== 0) && (
        <div className={styles.chartContainer}>
          <AreaChart data={hours} />
        </div>
      )}
    </section>
  );
};

RiskHours.propTypes = {
  blocks: PropTypes.array,
  riskLevel: PropTypes.number,
};

export default RiskHours;
