const d3 = require("../_assets/js/d3");

class DetailChartContainer {
	data() {
		return {};
	}

	render({ historical, block }) {
		const width = 600;
		const height = 400;
		const margin = { top: 5, right: 5, bottom: 40, left: 40 };

		const extentX = d3.extent(historical.map((d) => d.precip_mm_max3hr));
		const extentY = d3
			.extent(historical.map((d) => d.precip_mm_max3hr))
			.reverse();

		const scaleY = d3
			.scaleLinear()
			.domain(extentY)
			.range([margin.top, height - margin.bottom]);

		const scaleX = d3
			.scaleTime()
			.domain(d3.extent(historical.map((d) => new Date(d.day))))
			.range([margin.left, width - margin.right]);

		const ticksYCount = 4;
		const minY = extentX[0];
		const maxY = extentX[1];
		const gapY = Math.floor((maxY - minY) / ticksYCount);

		const ticksY = [];

		for (let i = 0; i < ticksYCount + 1; i++) {
			ticksY.push(minY + gapY * i);
		}

		const ticksXCount = 4;
		const minX = parseInt(historical[0].day.split("-")[0]);
		const maxX = parseInt(historical[historical.length - 1].day.split("-")[0]);
		const gapX = Math.floor((maxX - minX) / ticksXCount);

		const ticksX = [];

		for (let i = 1; i < ticksXCount + 1; i++) {
			ticksX.push(minX + gapX * i);
		}

		const dataBlock = block;
		const dataLandslide = historical.filter((day) => day.event === 1);
		const dataNoLandslide = historical.filter((day) => day.event === 0);

		const arrowDown = dataBlock.precip_mm_max3hr < maxY / 2;

		return `
	        ${ticksY
						.map((tick, i) => {
							return `
	          <div class="tick-y-html" style="top: ${
							(scaleY(tick) / height) * 100
						}%;">
	            ${tick}
	          </div>
        `;
						})
						.join("")}
      ${ticksX
				.map((tick, i) => {
					return `
						<div class="tick-x-html" style="bottom: 0; left: ${
							(scaleX(new Date(tick + "-01-01")) / width) * 100
						}%"
  
            >
              ${tick}
            </div>`;
				})
				.join("")}
	  `;
	}
}

module.exports = DetailChartContainer;
