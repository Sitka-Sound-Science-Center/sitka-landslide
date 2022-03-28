import PropTypes from "prop-types";
import Icon from "/components/Icon";
import riskDefinitions from "/content/riskDefinitions";

const Risk = ({ riskLevel, hasIcon, hasText, fontSize, fontWeight, iconSize }) => {
  const risk = riskDefinitions[riskLevel];

  return (
    <span
      style={{
        display: "flex",
        gridGap: hasText && risk.text ? "0.3em" : 0,
        alignItems: "center",
        fontSize,
        fontWeight,
      }}
    >
      {hasIcon ? <Icon name={risk.id} size={iconSize} color={risk.color} /> : ""}
      {hasText ? risk.text : ""}
    </span>
  );
};

Risk.defaultProps = {
  hasIcon: true,
  hasText: true,
  fontSize: "inherit",
  fontWeight: "inherit",
  iconSize: 1.2,
};

Risk.propTypes = {
  riskLevel: PropTypes.number.isRequired,
  hasIcon: PropTypes.bool,
  hasText: PropTypes.bool,
  fontSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  iconSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default Risk;
