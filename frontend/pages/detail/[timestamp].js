import Head from "next/head";
import Link from "next/link";
import styles from "/styles/Detail.module.css";
import articleStyles from "/styles/Article.module.css";
import legendStyles from "/styles/Legend.module.css";
import { useState, useEffect } from "react";
import { ResponsiveScatterPlotCanvas } from "@nivo/scatterplot";

import Risk from "../../components/Risk";
import DetailContent from "../../content/DetailContent.mdx";
import riskDefinitions from "/content/riskDefinitions";
import Page from "/components/Page";

import historicalData from "/data/historical.json";
import rainfallData from "/data/rainfall.json";

const maxRiskPrecipInches = Math.max(...historicalData.map((d) => d.precipInchesMax3hr));

export async function getStaticPaths() {
  return {
    paths: [{ params: { timestamp: "current" } }].concat(
      rainfallData.threeDays.hours.map((hour) => {
        return {
          // Note: the path param is called 'timestamp' but we're using the data field that has a
          // shortened version (so the URLs won't be needlessly cluttered).
          params: { timestamp: hour.shortTimestamp },
        };
      })
    ),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const current = rainfallData.current;
  const hours = rainfallData.threeDays.hours;
  const activeIndex = hours.findIndex((h) => params.timestamp === h.shortTimestamp);
  const activeData =
    params.timestamp === "current" ? current : hours[activeIndex] ? hours[activeIndex] : null;
  const previousSlug =
    activeIndex === 0
      ? "current"
      : hours[activeIndex - 1]
      ? hours[activeIndex - 1].shortTimestamp
      : null;
  const nextSlug = hours[activeIndex + 1] ? hours[activeIndex + 1].shortTimestamp : null;

  return {
    props: { activeData, previousSlug, nextSlug },
  };
}

export default function Detail({ activeData, previousSlug, nextSlug }) {
  const historical = historicalData.map((d) => {
    return {
      x: d.day,
      y: d.precipInchesMax3hr,
      event: d.event,
    };
  });

  const lastHistoricalDate = historical[historical.length - 1].x;

  const chartData = [
    {
      id: "nolandslide",
      data: historical.filter((d) => d.event === 0),
    },
    {
      id: "landslide",
      data: historical.filter((d) => d.event === 1),
    },
    {
      id: "active",
      data: [
        {
          x: lastHistoricalDate,
          y: activeData.precipInches,
          event: 2,
        },
      ],
    },
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const prefersDarkTheme =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const riskColor =
    typeof document !== "undefined" &&
    getComputedStyle(document.documentElement).getPropertyValue(
      `--${riskDefinitions[activeData.riskLevel].id}`
    );

  const colors = {
    noLandslide: prefersDarkTheme ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)",
    landslide: "#f781bf",
    active: riskColor,
  };

  const theme = prefersDarkTheme
    ? {
        background: "transparent",
        textColor: "#cfcfd8",
        fontSize: 14,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        axis: {
          domain: {
            line: {
              stroke: "#454545",
              strokeWidth: 1,
            },
          },
          legend: {
            text: {
              fontSize: 14,
              fontWeight: 600,
              fill: "rgba(255,255, 255,1)",
            },
          },
          ticks: {
            line: {
              strokeWidth: 0,
            },
            text: {
              fontSize: 14,
              fill: "rgba(255,255, 255,0.64)",
            },
          },
        },
        grid: {
          line: {
            stroke: "rgba(255,255, 255,0)",
            strokeWidth: 1,
          },
        },
      }
    : {
        background: "transparent",
        textColor: "#333333",
        fontSize: 14,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif",
        axis: {
          domain: {
            line: {
              stroke: "#999",
              strokeWidth: 1,
            },
          },
          legend: {
            text: {
              fontSize: 14,
              fontWeight: 600,
              fill: "#333333",
            },
          },
          ticks: {
            line: {
              strokeWidth: 0,
            },
            text: {
              fontSize: 14,
              fill: "#333333",
            },
          },
        },
        grid: {
          line: {
            stroke: "transparent",
            strokeWidth: 1,
          },
        },
      };

  return (
    <Page
      title={activeData.dateTimeDetails.label}
      dateAbbr={activeData.dateTimeDetails.dateAbbr}
      dateFull={activeData.dateTimeDetails.dateFull}
      timeStart={activeData.dateTimeDetails.timeStart}
      timeEnd={activeData.dateTimeDetails.timeEnd}
      next={nextSlug}
      previous={previousSlug}
      doNotApplyStyle
      isDetailView
    >
      <div>
        <Head>
          <title>{activeData.dateTimeDetails.label} | Sitka Landslide Risk</title>
          <meta
            name="description"
            content={`Detailed landslide risk for ${activeData.dateTimeDetails.label}`}
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className={styles.content}>
          <div>
            <h3 className={styles.figureHeading}>Risk level</h3>
            <div className={styles.risk}>
              <div className={styles.figureText}>
                <Risk riskLevel={activeData.riskLevel} hasText={true} abbreviated />
              </div>
              <div className={styles.riskBar}>
                <div
                  style={{ left: `${activeData.riskProb * 100}%` }}
                  className={styles.riskBarIcon}
                >
                  <div
                    className={styles.riskBarCircle}
                    style={{ backgroundColor: riskDefinitions[activeData.riskLevel].color }}
                  ></div>
                </div>
                <div className={styles.riskBarLine}></div>
                <div className={styles.riskBarLegend}>
                  <div className={activeData.riskLevel === 0 ? styles.selected : styles.unselected}>
                    {riskDefinitions[0].abbreviated}
                  </div>
                  <div className={activeData.riskLevel === 1 ? styles.selected : styles.unselected}>
                    {riskDefinitions[1].abbreviated}
                  </div>
                  <div className={activeData.riskLevel === 2 ? styles.selected : styles.unselected}>
                    {riskDefinitions[2].abbreviated}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr />
          <h3 className={styles.figureHeading}>3 hour rainfall</h3>
          <div className={styles.figureText} style={{ marginBottom: "var(--space-100)" }}>
            {activeData.precipInches} inches
          </div>
          <p>
            Research in Sitka shows that rainfall measured over a 3-hour interval is the best way to
            predict landslides. Use the following chart to compare this forecast to past conditions.
          </p>
          <div className={styles.chart}>
            <div
              className={`${styles.forecast} ${activeData.precipInches > 1 && styles.arrowUp}`}
              // Position the annotation arrow; set a fixed position for when the current value is
              // higher than all of the historical data
              style={{
                bottom:
                  activeData.precipInches > maxRiskPrecipInches
                    ? "90%"
                    : (activeData.precipInches / maxRiskPrecipInches) * 100 * 0.9 + "%",
              }}
            >
              <span className={styles.forecastText}>{activeData.dateTimeDetails.label}</span>
              <svg
                width="41"
                height="35"
                viewBox="0 0 41 35"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.forecastArrow}
              >
                <path
                  d="M35.5 35L40.0637 24.3931L28.5961 25.7442L35.5 35ZM-4.30478e-08 2C15.0421 2 29.5769 10.5585 33.4764 26.3033L35.4177 25.8225C31.2472 8.98325 15.7355 6.77377e-07 4.30478e-08 0L-4.30478e-08 2Z"
                  fill="black"
                />
              </svg>
            </div>
            {mounted && (
              <ResponsiveScatterPlotCanvas
                isInteractive={false}
                useMesh={false}
                debugMesh={false}
                data={chartData}
                colors={[
                  prefersDarkTheme ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.2)",
                  colors.landslide,
                  colors.active,
                ]}
                margin={{ top: 10, right: 5, bottom: 30, left: 60 }}
                nodeSize={(d) =>
                  d.serieId === "nolandslide" ? 2 : d.serieId === "landslide" ? 8 : 10
                }
                xScale={{ type: "time", format: "%Y-%m-%d", precision: "day" }}
                xFormat=">-.2f"
                yScale={{ type: "linear", min: 0, max: "auto" }}
                yFormat=">-.2f"
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  orient: "bottom",
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  format: "%Y",
                  tickValues: "every 3 years",
                  legendPosition: "middle",
                  legendOffset: 0,
                }}
                axisLeft={{
                  orient: "left",
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "3 hour rainfall (in.)",
                  legendPosition: "middle",
                  legendOffset: -50,
                }}
                theme={theme}
              />
            )}
          </div>
          <div className={legendStyles.legend} style={{ marginBottom: "var(--space-500)" }}>
            <div className={legendStyles.legendItem}>
              <div
                className={legendStyles.legendColor}
                style={{ backgroundColor: colors.landslide }}
              ></div>
              <div className={legendStyles.legendText}>Landslide occurred</div>
            </div>
            <div className={legendStyles.legendItem}>
              <div
                className={legendStyles.legendColor}
                style={{ backgroundColor: colors.noLandslide }}
              ></div>
              <div className={legendStyles.legendText}>No landslide</div>
            </div>
            {riskColor && (
              <div className={legendStyles.legendItem}>
                <div
                  className={legendStyles.legendColor}
                  style={{ backgroundColor: riskColor }}
                ></div>
                <div className={legendStyles.legendText}>{activeData.dateTimeDetails.label}</div>
              </div>
            )}
          </div>
          <hr />
          <div
            className={articleStyles.article}
            style={{ padding: 0, marginTop: "var(--space-500)" }}
          >
            <DetailContent />
          </div>
        </div>
      </div>
    </Page>
  );
}
