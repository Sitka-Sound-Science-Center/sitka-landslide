import PropTypes from "prop-types";
import { scaleLinear, scaleTime, area, line, curveLinear } from "d3";
import styles from "/styles/AreaChart.module.css";
import riskDefinitions from "/content/riskDefinitions";

const AreaChart = ({ data }) => {
  const height = 400;
  const width = 800;
  const margin = { top: 1, right: 0, bottom: 80, left: 80 };

  const hours = data.map((hour, i) => {
    return { ...hour, ...{ id: i } };
  });

  const minY = 0;
  const maxY = 1;

  const scaleY = scaleLinear()
    .domain([maxY, minY])
    .range([margin.top, height - margin.bottom]);

  const labelsY = [
    { position: 1 / 6, text: riskDefinitions[0].abbreviated },
    { position: 3 / 6, text: riskDefinitions[1].abbreviated },
    { position: 5 / 6, text: riskDefinitions[2].abbreviated },
  ];

  const ticksY = [0, 0.333, 0.666, 1];

  const numberOfHours = hours.length - 1;

  const scaleX = scaleTime()
    .domain([0, numberOfHours])
    .range([margin.left, width - margin.right]);

  const ticksX = hours;

  const createArea = area()
    .x((d) => scaleX(d.id))
    .y0(scaleY(0))
    .y1((d) => scaleY(d.riskNumber))
    .curve(curveLinear);

  const createLine = line()
    .x((d) => scaleX(d.id))
    .y((d) => scaleY(d.riskNumber))
    .curve(curveLinear);

  const lineSegments = [];

  for (let i = 0; i < numberOfHours; i++) {
    lineSegments.push(createLine(hours.slice(i, i + 2)));
  }

  const areaSegments = [];

  for (let i = 0; i < numberOfHours; i++) {
    areaSegments.push(createArea(hours.slice(i, i + 2)));
  }

  function getRiskColor(riskLevel) {
    switch (riskLevel) {
      case 0:
        return riskDefinitions[0].color;
        break;
      case 1:
        return riskDefinitions[1].color;
        break;
      case 2:
        return riskDefinitions[2].color;
        break;
      default:
        return "#666";
    }
  }

  return (
    <div className={styles.chart}>
      <svg
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
      >
        <g>
          {ticksY.map((tick, i) => {
            return (
              <line
                className={styles.lineY}
                key={i}
                x2={width}
                y1={Math.floor(scaleY(tick))}
                y2={Math.floor(scaleY(tick))}
              />
            );
          })}
        </g>
        <g>
          {lineSegments.map((segment, i) => (
            <path
              key={i}
              className="chart-line"
              stroke={getRiskColor(data[i].riskLevel)}
              strokeWidth="3"
              fill="transparent"
              d={segment}
            ></path>
          ))}
        </g>
        <g>
          {areaSegments.map((segment, i) => (
            <path
              key={i}
              className={styles.area}
              fill={getRiskColor(data[i].riskLevel)}
              d={segment}
            ></path>
          ))}
        </g>
      </svg>
      <div className={styles.labels}>
        <div className={styles.legendY}>
          {labelsY.map((label, i) => {
            return (
              <div
                className={styles.textY}
                key={i}
                style={{ top: `${(scaleY(label.position) / height) * 100}%` }}
              >
                {label.text}
              </div>
            );
          })}
        </div>
        <div className={styles.legendX}>
          {ticksX.map((tick, i) => {
            return (
              <div
                className={styles.textX}
                key={i}
                style={{ left: `${(scaleX(i) / width) * 100}%` }}
              >
                {tick.time}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

AreaChart.propTypes = {
  data: PropTypes.array,
};

export default AreaChart;
