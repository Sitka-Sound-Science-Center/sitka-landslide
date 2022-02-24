import PropTypes from "prop-types";
import Icon from "/components/Icon";

const riskTexts = {
  0: "Low",
  1: "Medium",
  2: "High",
};

const riskIcons = {
  0: { name: "risk0", color: "var(--risk0)" },
  1: { name: "risk1", color: "var(--risk1)" },
  2: { name: "risk2", color: "var(--risk2)" },
};

const Risk = ({
  riskLevel,
  hasIcon,
  hasText,
  fontSize,
  fontWeight,
  iconSize,
}) => {
  const riskText = riskTexts[riskLevel];
  const riskIcon = riskIcons[riskLevel];
  return (
    <span
      style={{
        display: "flex",
        gridGap: hasText && riskText ? "0.3em" : 0,
        alignItems: "center",
        fontSize,
        fontWeight,
      }}
    >
      {hasIcon ? (
        <Icon name={riskIcon.name} size={1.2} color={riskIcon.color} />
      ) : (
        ""
      )}
      {hasText ? riskText : ""}
    </span>
  );
};

Risk.defaultProps = {
  hasIcon: true,
  hasText: true,
  fontSize: "inherit",
  fontWeight: "inherit",
  iconSize: "1.2em",
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
