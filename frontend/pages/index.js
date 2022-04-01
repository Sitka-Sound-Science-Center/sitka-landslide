import Head from "next/head";

import styles from "../styles/Index.module.css";
import WeatherAdvisory from "/components/WeatherAdvisory";
import RiskCurrent from "/components/RiskCurrent";
import RiskHours from "/components/RiskHours";
import RiskDays from "/components/RiskDays";
import Understanding from "/components/Understanding";
import Resources from "/components/Resources";
import LastUpdated from "/components/LastUpdated";
import rainfall from "/data/rainfall";

export async function getStaticProps() {
  const { weatherAdvisory, lastUpdated, current, twentyFourHours, threeDays } = await rainfall();

  return {
    props: { weatherAdvisory, lastUpdated, current, twentyFourHours, threeDays },
  };
}

export default function Home({
  weatherAdvisory,
  lastUpdated,
  current,
  twentyFourHours,
  threeDays,
}) {
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
            <RiskHours riskLevel={twentyFourHours.riskLevel} hours={twentyFourHours.hours} />
            <RiskDays days={threeDays.days} hours={threeDays.hours} />
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
