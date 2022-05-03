import PropTypes from "prop-types";
import Icon from "/components/Icon";
import riskDefinitions from "/content/riskDefinitions";

const Risk = ({ riskLevel, hasIcon, hasText, fontSize, fontWeight, iconSize, abbreviated }) => {
  const risk = riskDefinitions[riskLevel];

  return (
    <span
      style={{
        display: "inline-flex",
        gridGap: hasText && risk.text ? "0.5em" : 0,
        alignItems: "center",
        fontSize,
        fontWeight,
      }}
    >
      {hasIcon ? <Icon name={risk.id} size={iconSize} color={risk.color} /> : ""}
      {hasText ? (abbreviated ? risk.abbreviated : risk.text) : ""}
    </span>
  );
};

Risk.defaultProps = {
  hasIcon: true,
  hasText: true,
  fontSize: "inherit",
  fontWeight: "inherit",
  iconSize: 1.2,
  abbreviated: false,
};

Risk.propTypes = {
  abbreviated: PropTypes.bool,
  riskLevel: PropTypes.number.isRequired,
  hasIcon: PropTypes.bool,
  hasText: PropTypes.bool,
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  iconSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Risk;
