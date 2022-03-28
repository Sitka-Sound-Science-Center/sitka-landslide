import PropTypes from "prop-types";

import stylesNowcast from "/styles/Nowcast.module.css";
import stylesArticle from "/styles/Article.module.css";

import Risk from "./Risk";
import NowcastRisk0 from "/content/NowcastRisk0.mdx";
import NowcastRisk1 from "/content/NowcastRisk1.mdx";
import NowcastRisk2 from "/content/NowcastRisk2.mdx";

const styles = { ...stylesNowcast, ...stylesArticle };

const Nowcast = ({ riskLevel }) => {
  return (
    <div className={`${styles.article} ${styles.container}`}>
      {riskLevel === 0 ? "" : riskLevel === 1 ? <NowcastRisk1 /> : <NowcastRisk2 />}
    </div>
  );
};

export default Nowcast;

Risk.propTypes = {
  riskLevel: PropTypes.number.isRequired,
};
