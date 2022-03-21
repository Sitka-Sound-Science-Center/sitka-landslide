import PropTypes from "prop-types";
import Link from "next/link";

import styles from "../styles/RiskCurrent.module.css";
import Risk from "./Risk";

const RiskCurrent = ({ riskLevel, date }) => {
  const detailUrl = `/detail/${date}`;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Current risk</h2>
      <p className={styles.risk}>
        <Risk riskLevel={riskLevel} />
      </p>
      <Link href={detailUrl}>
        <a className={styles.link}>
          <span className={"sr-only"}>Details</span>
        </a>
      </Link>
    </section>
  );
};

RiskCurrent.propTypes = {
  riskLevel: PropTypes.number,
};

export default RiskCurrent;
