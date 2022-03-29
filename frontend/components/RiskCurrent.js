import PropTypes from "prop-types";
import Link from "next/link";

import styles from "../styles/RiskCurrent.module.css";
import Risk from "/components/Risk";
import Nowcast from "/components/Nowcast";
import Icon from "/components/Icon";

const RiskCurrent = ({ riskLevel }) => {
  const detailUrl = `/detail/current`;

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
              <span className={styles.detailIcon}>
                <Icon name={"chevron-right"} color="var(--detail-chevron)" size={0.6} />
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
