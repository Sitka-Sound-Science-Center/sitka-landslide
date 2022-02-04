const d3 = require("../_assets/js/d3");

class TfRiskChart {
	data() {
		return {
			layout: "layouts/base.njk",
		};
	}

	render({ blocks, colors }) {
		const width = 1600;
		const height = 160;
		const margin = { top: 1, right: 0, bottom: 1, left: 0 };

		const blocksForTfHours = blocks.map((block, i) => {
			return { ...block, ...{ id: i } };
		});

		const minY = 0;
		const maxY = 1;

		const scaleY = d3
			.scaleLinear()
			.domain([maxY, minY])
			.range([margin.top, height - margin.bottom]);

		const labelsY = [
			{ position: 1 / 6, text: "Low" },
			{ position: 3 / 6, text: "Med" },
			{ position: 5 / 6, text: "High" },
		];

		const ticksY = [0, 0.333, 0.666, 1];

		const numberOfblocksForTfHours = blocksForTfHours.length - 1;

		const scaleX = d3
			.scaleTime()
			.domain([0, numberOfblocksForTfHours])
			.range([margin.left, width - margin.right]);

		const ticksX = blocksForTfHours;

		const createArea = d3
			.area()
			.x((d) => scaleX(d.id))
			.y0(scaleY(0))
			.y1((d) => scaleY(d.riskNumber))
			.curve(d3.curveLinear);

		const createLine = d3
			.line()
			.x((d) => scaleX(d.id))
			.y((d) => scaleY(d.riskNumber))
			.curve(d3.curveLinear);

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
					return colors.low;
					break;
				case "medium":
					return colors.medium;
					break;
				case "high":
					return colors.high;
					break;
				default:
					return colors.fallback;
			}
		}

		return `
		<div class="chart-container">
	    <svg preserveAspectRatio="none" width="${width}" height="${height}" viewBox="${`0 0 ${width} ${height}`}" xmlns="http://www.w3.org/2000/svg">
		    <g class="chart-lines">
			    ${ticksY
						.map((tick, i) => {
							return `
			          <g
			            
			            class="tick"
			            transform="${`translate(${margin.left},${0})`}"
			          >
			            <line
			              class="line-y"
			              x2="${width - margin.right - margin.left}"
			              y1="${Math.floor(scaleY(tick))}"
			              y2="${Math.floor(scaleY(tick))}"
			            />
			          </g>
		      		`;
						})
						.join("")}
				</g>
				<g class="chart-shapes">
		      <g class="chart-line">
		        ${lineSegments
							.map(
								(segment, i) => `
				          <path
				            class="chart-line"
				            stroke="${getRiskColor(blocksForTfHours[i].riskLevel)}"
				            stroke-width="3"
				            fill="transparent"
				            d="${segment}"
				          ></path>
				        `
							)
							.join("")}
		      </g>
		      <g class="chart-area">
		        ${areaSegments
							.map(
								(segment, i) => `
		          <path
		            class="chart-area"
		            fill="${getRiskColor(blocksForTfHours[i].riskLevel)}"
		            d="${segment}"
		          ></path>
		        `
							)
							.join("")}
		      </g>
	      </g>
	    </svg>
	    <div class="chart-labels">
	    	${labelsY
					.map((label, i) => {
						return `
		            <div
		              class="tick-y-html"
		              style="top: ${(scaleY(label.position) / height) * 100}%"
		            >
		              ${label.text}
		            </div>
		        `;
					})
					.join("")}
				${ticksX
					.map((tick, i) => {
						return `
	            <div
	              class="tick-x-html"
	              style="left: ${(scaleX(i) / width) * 100}%"
	            >
	              ${tick.time}
	            </div>
	        `;
					})
					.join("")}
	    </div>
    </div>
  `;
	}
}

module.exports = TfRiskChart;
