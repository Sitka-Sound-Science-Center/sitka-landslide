import PropTypes from "prop-types";
import { scaleLinear, scaleTime, area, line, curveLinear } from "d3";

const AreaChart = ({ data, height, width }) => {
  const margin = { top: 30, right: 0, bottom: 30, left: 40 };

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

  const numberOfTimes = 7;

  const scaleX = scaleTime()
    .domain([0, numberOfTimes])
    .range([margin.left, width - margin.right]);

  const ticksX = data;

  const createArea = area()
    .x((d) => scaleX(d.id))
    .y0(scaleY(0))
    .y1((d) => scaleY(d.risk))
    .curve(curveLinear);

  const createLine = line()
    .x((d) => scaleX(d.id))
    .y((d) => scaleY(d.risk))
    .curve(curveLinear);

  const lineSegments = [];

  for (let i = 0; i < numberOfTimes; i++) {
    lineSegments.push(createLine(data.slice(i, i + 2)));
  }

  const areaSegments = [];

  for (let i = 0; i < numberOfTimes; i++) {
    areaSegments.push(createArea(data.slice(i, i + 2)));
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
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {ticksY.map((tick, i) => {
        return (
          <g key={i} className="tick" transform={`translate(${margin.left},${0})`}>
            <line
              className="line-y"
              x2={width - margin.right - margin.left}
              y1={Math.floor(scaleY(tick))}
              y2={Math.floor(scaleY(tick))}
            />
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
              {tick.time}
            </text>
          </g>
        );
      })}
      <style>{`
          html {
            font-family: graphik;
          }

          line {
            shape-rendering: crispEdges
          }

          .chart-area {
            fill-opacity: 0.5;
            shape-rendering: crispEdges;
          }

          .tick-x {
            text-anchor: start;
          }

          text {
            font-family: graphik;
            font-size: 12px;
          }

          .line-y {
            stroke: rgb(0 0 0 / 20%);
            stroke-width: 1
          }

          .chart-label {
            text-align: center;
            margin-top: -10px;
            font-weight: 500;
            font-size: 14px;
          }
          strong {
            font-weight: 500;
          }
         
      `}</style>
    </svg>
  );
};

AreaChart.propTypes = {
  data: PropTypes.array,
  height: PropTypes.number,
  width: PropTypes.number,
};

export default AreaChart;
