import PropTypes from "prop-types";
import Link from "next/link";

import AreaChart from "/components/AreaChart";
import Risk from "/components/Risk";
import styles from "/styles/RiskHours.module.css";
import riskDefinitions from "/content/riskDefinitions";

const RiskHours = ({ message, hours, riskLevel }) => {
  const riskSlug = riskDefinitions[riskLevel].slug;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>24 hour forecast</h2>
        <p className={styles.message}>
          <Risk riskLevel={riskLevel} hasText={false} />
          <span>
            {message}
            {riskLevel !== 0 && (
              <span>
                <Link href={`/prepare/#${riskSlug}`}>
                  <a className={styles.prepare}> Learn how to prepare</a>
                </Link>
                .
              </span>
            )}
          </span>
        </p>
      </div>
      <AreaChart data={hours} />
    </section>
  );
};

RiskHours.propTypes = {
  blocks: PropTypes.array,
  riskLevel: PropTypes.number,
};

export default RiskHours;
