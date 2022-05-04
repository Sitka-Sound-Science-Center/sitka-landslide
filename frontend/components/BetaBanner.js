import PropTypes from "prop-types";
import Icon from "./Icon";
import { useState, useEffect } from "react";

import styles from "../styles/BetaBanner.module.css";

const BetaBanner = ({ permalink }) => {
  const [bannerVisibility, setBannerVisibility] = useState(true);

  function hideBanner() {
    setBannerVisibility(false);
  }

  return (
    bannerVisibility && (
      <a className={styles.banner} href={permalink}>
        <span className={styles.title}>
          <Icon name="circle-exclamation" />
          <span>
            <strong>Private beta:&nbsp;</strong>not for risk assessment use
            (fake&nbsp;data,&nbsp;elevated&nbsp;risk)
          </span>
        </span>
        <button onClick={hideBanner} className={styles.link}>
          Close
        </button>
      </a>
    )
  );
};

export default BetaBanner;
