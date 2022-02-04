import { select, selectAll } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent } from "d3-array";

fetch("/assets/data/historical.json")
	.then((response) => response.json())
	.then((historical) => {
		function addChart() {
			const elChart = document.getElementById("chart");
			const width = elChart.offsetWidth;
			const height = 500;
			const margin = { top: 30, right: 10, bottom: 30, left: 30 };

			const extentX = extent(historical.map((d) => d.precip_mm_max3hr));
			const extentY = extent(
				historical.map((d) => d.precip_mm_max3hr)
			).reverse();

			const scaleY = scaleLinear()
				.domain(extentY)
				.range([margin.top, height - margin.bottom]);

			const scaleX = scaleTime()
				.domain(extent(historical.map((d) => new Date(d.day))))
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
			const maxX = parseInt(
				historical[historical.length - 1].day.split("-")[0]
			);
			const gapX = Math.floor((maxX - minX) / ticksXCount);

			const ticksX = [];

			for (let i = 1; i < ticksXCount + 1; i++) {
				ticksX.push(minX + gapX * i);
			}

			const dataBlock = block;
			const dataLandslide = historical.filter((day) => day.event === 1);
			const dataNoLandslide = historical.filter((day) => day.event === 0);

			const arrowDown = dataBlock.precip_mm_max3hr < maxY / 2;

			const html = `
		    <svg width="${width}" height="${height}" viewBox="${`0 0 ${width} ${height}`}" xmlns="http://www.w3.org/2000/svg">
		      <g transform="${`translate(0,1)`}">
		        <line
			        y1="${height - margin.bottom}"
		          y2="${height - margin.bottom}"
		          stroke-width="2"
		          stroke="black"
		          x1="${margin.left}"
		          x2="${width - margin.right}"
		        />
		        ${ticksY
							.map((tick, i) => {
								return `
						<g
		          class="tick"
		          transform="${`translate(${margin.left},${0})`}"
		        >
		          <text style="font-family: helvetica" dy="0.2em" class="tick-y" x="${-30}" y="${scaleY(
									tick
								)}">
		            ${tick}
		          </text>
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
		          ${ticksX
								.map((tick, i) => {
									return `
									<g class="tick">
		                <text style="font-family: helvetica"
		                  dy="0.3em"
		                  class="tick-x"
		                  x="${Math.floor(scaleX(new Date(tick + "-01-01")))}"
		                  y="${height - margin.bottom + 20}"
		                >
		                  ${tick}
		                </text>
		              </g>`;
								})
								.join("")}
		        </g>
		        <g>
		          ${dataNoLandslide
								.map((d) => {
									return `
		              <circle
		                cx="${Math.floor(scaleX(new Date(d.day)))}"
		                cy="${Math.floor(scaleY(d.precip_mm_max3hr))}"
		                r="1"
		                class="noevent"
		              ></circle>
		              `;
								})
								.join("")}
		          ${dataLandslide
								.map((d, i) => {
									return `
		              <circle
		                cx="${Math.floor(scaleX(new Date(d.day)))}"
		                cy="${Math.floor(scaleY(d.precip_mm_max3hr))}"
		                r="3"
		                class="event"
		              ></circle>
		            `;
								})
								.join("")}
		          <g>
		          	<text
		              class="${
										arrowDown
											? "annotation annotation-down"
											: "annotation annotation-up"
									}"
		              transform="${`
			              translate(
			                ${
												scaleX(new Date(dataBlock.timestamp)) -
												(arrowDown ? 49 : 49)
											}, 
			                ${scaleY(dataBlock.precip_mm_max3hr) - (arrowDown ? 48 : -15)}
			              ) 
			            `}"
		            >
		              Right now
		            </text>
		            <path
		              class="${arrowDown ? "arrow-down" : "arrow-up"}"
		              transform="translate(
		                      ${
														scaleX(new Date(dataBlock.timestamp)) -
														(arrowDown ? 49 : 49)
													}, 
		                      ${
														scaleY(dataBlock.precip_mm_max3hr) -
														(arrowDown ? 48 : -15)
													}
		                    ) 
									"
		              d="${
										arrowDown
											? "M47 37.0004L51.2507 26.2642L39.8276 27.9511L47 37.0004ZM15 2.49306L14.7896 3.47068L15 2.49306ZM0 2C5.4836 2 10.401 2.52631 14.7896 3.47068L15.2104 1.51544C10.6707 0.538563 5.61134 0 0 0V2ZM14.7896 3.47068C32.4111 7.26262 41.5863 17.8071 44.7264 28.3801L46.6436 27.8107C43.2861 16.5055 33.5138 5.45412 15.2104 1.51544L14.7896 3.47068Z"
											: "M47 4.80884e-07L51.2507 10.7362L39.8275 9.04927L47 4.80884e-07ZM15 34.507L14.7896 33.5293L15 34.507ZM0 35C5.4836 35 10.401 34.4737 14.7896 33.5293L15.2104 35.4846C10.6707 36.4614 5.61134 37 0 37V35ZM14.7896 33.5293C32.4112 29.7374 41.5863 19.1931 44.7264 8.62016L46.6436 9.18955C43.2861 20.4947 33.5138 31.5459 15.2104 35.4846L14.7896 33.5293Z"
									}"
		            ></path>

		            <g
		              transform="${`translate(${Math.floor(
										scaleX(new Date(dataBlock.timestamp))
									)}, ${Math.floor(scaleY(dataBlock.precip_mm_max3hr))})`}"
		            >
		              <circle cx="0" cy="0" r="5" fill="#fff" />
		              ${
										dataBlock.riskLevel === "low"
											? `
										<path
		                  transform="translate(-9, -7)"
		                  d="M9 0C4.00781 0 0 4.04297 0 9C0 13.9922 4.00781 18 9 18C13.957 18 18 13.9922 18 9C18 4.04297 13.957 0 9 0ZM13.043 7.45312L8.54297 11.9531C8.36719 12.1641 8.12109 12.2344 7.875 12.2344C7.59375 12.2344 7.34766 12.1641 7.17188 11.9531L4.92188 9.70312C4.53516 9.31641 4.53516 8.71875 4.92188 8.33203C5.30859 7.94531 5.90625 7.94531 6.29297 8.33203L7.875 9.87891L11.6719 6.08203C12.0586 5.69531 12.6562 5.69531 13.043 6.08203C13.4297 6.46875 13.4297 7.06641 13.043 7.45312Z"
		                  fill="#068677"
		                />
		                `
											: dataBlock.riskLevel === "medium"
											? `
		                <path
		                  transform="translate(-9, -7)"
		                  d="M17.8108 14.6602L10.3225 1.86328C9.72482 0.878906 8.28342 0.878906 7.72092 1.86328L0.19748 14.6602C-0.36502 15.6445 0.338105 16.875 1.49826 16.875H16.51C17.6701 16.875 18.3733 15.6445 17.8108 14.6602ZM8.17795 5.90625C8.17795 5.44922 8.52951 5.0625 9.0217 5.0625C9.47873 5.0625 9.86545 5.44922 9.86545 5.90625V10.4062C9.86545 10.8984 9.47873 11.25 9.0217 11.25C8.59982 11.25 8.17795 10.8984 8.17795 10.4062V5.90625ZM9.0217 14.625C8.38888 14.625 7.8967 14.1328 7.8967 13.5352C7.8967 12.9375 8.38888 12.4453 9.0217 12.4453C9.61935 12.4453 10.1115 12.9375 10.1115 13.5352C10.1115 14.1328 9.61935 14.625 9.0217 14.625Z"
		                  fill="#ECCA51"
		                />
		              	`
											: `
		                <path
		                  transform="translate(-9, -7)"
		                  d="M17.7803 8.22656L14.0889 1.93359C13.8076 1.44141 13.2803 1.125 12.7178 1.125H5.2998C4.7373 1.125 4.20996 1.44141 3.92871 1.93359L0.237305 8.22656C-0.0791016 8.71875 -0.0791016 9.31641 0.237305 9.80859L3.92871 16.1016C4.20996 16.5938 4.7373 16.875 5.2998 16.875H12.7178C13.2803 16.875 13.8076 16.5938 14.0889 16.1016L17.7803 9.80859C18.0967 9.31641 18.0967 8.71875 17.7803 8.22656ZM8.18262 5.34375C8.18262 4.88672 8.53418 4.5 9.02637 4.5C9.4834 4.5 9.87012 4.88672 9.87012 5.34375V9.84375C9.87012 10.3359 9.4834 10.6875 9.02637 10.6875C8.53418 10.6875 8.18262 10.3359 8.18262 9.84375V5.34375ZM9.02637 14.0625C8.39355 14.0625 7.90137 13.5703 7.90137 12.9727C7.90137 12.375 8.39355 11.8828 9.02637 11.8828C9.62402 11.8828 10.1162 12.375 10.1162 12.9727C10.1162 13.5703 9.62402 14.0625 9.02637 14.0625Z"
		                  fill="#D3354F"
		                />
	              		`
									}
		            </g>
		          </g>
		        </g>
		    </svg>
		  `;
			document.getElementById("chart").innerHTML = html;
		}
		addChart();
		window.addEventListener("resize", addChart);
	});
