import Link from "next/link";
import styles from "/styles/Understanding.module.css";
import Risk from "./Risk";

const data = [
  {
    riskLevel: 2,
    description:
      "Multiple landslides are very likely to occur in the Sitka area. There have been three storms in the last 20 years with conditions like these, and all of them initiated multiple landslides.",
  },
  {
    riskLevel: 1,
    description:
      "Landslides are possible but not certain. Isolated landslides have occurred in Sitka at this level in the past.Landslides are possible but not certain. Isolated landslides have occurred in Sitka at this level in the past.",
  },
  {
    riskLevel: 0,
    description:
      "Landslides are extremely unlikely based on the rainfall conditions. In the last 20 years, rainfall-induced landslides have never happened in these conditions before.",
  },
];

const resources = data.map((resource, i) => (
  <div key={resource.riskLevel} className={styles.resource}>
    <h3 className={styles.title}>
      <Risk riskLevel={resource.riskLevel} />
    </h3>
    <div className={styles.description}>{resource.description}</div>
  </div>
));

const Resources = () => {
  return (
    <div className={styles.understanding}>
      <h2 className={styles.section}>Understanding risk</h2>
      {resources}
    </div>
  );
};

export default Resources;
