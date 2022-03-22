import PropTypes from "prop-types";
import Link from "next/link";

import styles from "../styles/RiskCurrent.module.css";
import Risk from "/components/Risk";
import Nowcast from "/components/Nowcast";
import Icon from "/components/Icon";

const RiskCurrent = ({ riskLevel, date }) => {
  const detailUrl = `/detail/${date}`;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Current risk</h2>
      <p className={styles.risk}>
        <Link href={detailUrl}>
          <a className={styles.link}>
            <Risk riskLevel={riskLevel} iconSize={1} />
            <span className={styles.detailIcon}>
              <Icon name={"chevron-right"} color="var(--gray-900)" size={0.6} />
            </span>
            <span className="sr-only"> Details</span>
          </a>
        </Link>
      </p>
      <Nowcast riskLevel={riskLevel} />
    </section>
  );
};

RiskCurrent.propTypes = {
  riskLevel: PropTypes.number,
};

export default RiskCurrent;
