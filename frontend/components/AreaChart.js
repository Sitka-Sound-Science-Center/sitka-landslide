import PropTypes from "prop-types";
import { scaleLinear, scaleTime, area, line, curveLinear } from "d3";
import styles from "/styles/AreaChart.module.css";

const AreaChart = ({ data, height, width }) => {
  const margin = { top: 1, right: 0, bottom: 1, left: 0 };

  const blocksForTfHours = data.map((block, i) => {
    return { ...block, ...{ id: i } };
  });

  const minY = 0;
  const maxY = 1;

  const scaleY = scaleLinear()
    .domain([maxY, minY])
    .range([margin.top, height - margin.bottom]);

  const labelsY = [
    { position: 1 / 6, text: "Low" },
    { position: 3 / 6, text: "Med" },
    { position: 5 / 6, text: "High" },
  ];

  const ticksY = [0, 0.333, 0.666, 1];

  const numberOfblocksForTfHours = blocksForTfHours.length - 1;

  const scaleX = scaleTime()
    .domain([0, numberOfblocksForTfHours])
    .range([margin.left, width - margin.right]);

  const ticksX = blocksForTfHours;

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

  for (let i = 0; i < numberOfblocksForTfHours; i++) {
    lineSegments.push(createLine(blocksForTfHours.slice(i, i + 2)));
  }

  const areaSegments = [];

  for (let i = 0; i < numberOfblocksForTfHours; i++) {
    areaSegments.push(createArea(blocksForTfHours.slice(i, i + 2)));
  }

  function getRiskColor(riskLevel) {
    switch (riskLevel) {
      case "low":
        return "#068677";
        break;
      case "medium":
        return "#ECCA51";
        break;
      case "high":
        return "#D3354F";
        break;
      default:
        return "#666";
    }
  }

  return (
<<<<<<< HEAD
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {ticksY.map((tick, i) => {
        return (
          <g key={i} className="tick" transform={`translate(${margin.left},${0})`}>
=======
    <div className={styles.chart}>
      <svg
        preserveAspectRatio="none"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
      >
        {ticksY.map((tick, i) => {
          return (
>>>>>>> fda3315 (Use nivo for detail chart)
            <line
              className={styles.lineY}
              key={i}
              x2={width - margin.right - margin.left}
              y1={Math.floor(scaleY(tick))}
              y2={Math.floor(scaleY(tick))}
            />
<<<<<<< HEAD
          </g>
        );
      })}
      {labelsY.map((label, i) => {
        return (
          <g key={i} className="tick" transform={`translate(${margin.left},${0})`}>
            <text dy="0.2em" className="tick-y" x={-30} y={scaleY(label.position)}>
              {label.text}
            </text>
          </g>
        );
      })}
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
            className="chart-area"
            fill={getRiskColor(data[i].riskLevel)}
            d={segment}
          ></path>
        ))}
      </g>
      {ticksX.map((tick, i) => {
        return (
          <g key={i} className="tick">
            <text dy="2" className="tick-x" x={scaleX(i)} y={height - margin.bottom + 20}>
=======
          );
        })}
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
        <style>{`
        `}</style>
      </svg>
      <div className={styles.labels}>
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
        {ticksX.map((tick, i) => {
          return (
            <div
              className={styles.textX}
              key={i}
              style={{ left: `${(scaleX(i) / width) * 100}%` }}
            >
>>>>>>> fda3315 (Use nivo for detail chart)
              {tick.time}
            </div>
          );
        })}
      </div>
    </div>
  );
};

AreaChart.propTypes = {
  data: PropTypes.array,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default AreaChart;
