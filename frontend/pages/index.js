import fs from "fs";
import path from "path";
import Head from "next/head";
import Link from "next/link";

import styles from "../styles/Index.module.css";
import WeatherAdvisory from "/components/WeatherAdvisory";
import RiskCurrent from "/components/RiskCurrent";
import RiskHours from "/components/RiskHours";
import RiskDays from "/components/RiskDays";
import Understanding from "/components/Understanding";
import Resources from "/components/Resources";
import LastUpdated from "/components/LastUpdated";

export async function getStaticProps() {
  // const res = await fetch("http://localhost:3000/api/today");
  const index = path.join(process.cwd(), "/data/index.json");
  const { twentyfourhour, threeday } = JSON.parse(
    fs.readFileSync(index, "utf8")
  );
  const { weatherAdvisory, lastUpdated, current } = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "/data/rainfall.json"), "utf8")
  );

  return {
    props: { weatherAdvisory, lastUpdated, current, twentyfourhour, threeday },
  };
}

export default function Home({ weatherAdvisory, lastUpdated, current, twentyfourhour, threeday }) {
  return (
    <>
      <Head>
        <title>
          Sitka Landslide Risk — Current and forecasted landslide risk for Sitka, Alaska.
        </title>
        <meta
          name="description"
          content="Current and forecasted landslide risk for Sitka, Alaska."
        />
      </Head>
      <>
        {weatherAdvisory.active && <WeatherAdvisory permalink={weatherAdvisory.permalink} />}
        <div className={styles.risk}>
          <RiskCurrent riskLevel={current.riskLevel} date={current.timestamp} />
          <div className="container">
            <RiskHours
              message={twentyfourhour.message}
              riskLevel={twentyfourhour.riskLevel}
              hours={twentyfourhour.hours}
            />
            <RiskDays days={threeday.days} hours={threeday.hours} />
            <LastUpdated update={lastUpdated} />
          </div>
        </div>
        <div className="container">
          <Understanding />
          <Resources />
        </div>
      </>
    </>
  );
}
