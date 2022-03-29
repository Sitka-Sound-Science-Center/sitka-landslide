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
      <div className="container">
        <h2 className={styles.title}>Current risk</h2>
        <p className={styles.risk}>
          <Link href={detailUrl} prefetch={false}>
            <a className={styles.link}>
              <Risk riskLevel={riskLevel} hasText={false} iconSize={1} />
              <span>
                <Risk riskLevel={riskLevel} hasIcon={false} iconSize={1} />
                <span className={styles.desktopText}> risk of landslide now</span>
              </span>
            </a>
          </Link>
        </p>
        <Nowcast riskLevel={riskLevel} />
      </div>
    </section>
  );
};

RiskCurrent.propTypes = {
  riskLevel: PropTypes.number,
};

export default RiskCurrent;
