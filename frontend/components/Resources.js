import Link from "next/link";
import styles from "/styles/Resources.module.css";

const data = [
  {
    id: 3,
    title: "Oral histories",
    description: "Explore stories of landslides",
    permalink: "/oral-histories/",
  },
  {
    id: 2,
    title: "Landslide 101",
    description: "Find out more about the science behind landslides",
    permalink: "/landslide-101/",
  },
  {
    id: 1,
    title: "Areas at risk",
    description: "Identify where you live relative to landslide susceptibility in Sitka",
    permalink: "/areas-at-risk/",
  },
  {
    id: 0,
    title: "How to prepare for a landslide",
    description: "Learn what to do before a landslide occurs",
    permalink: "/prepare/",
  },
  {
    id: 4,
    title: "Published work",
    description: "Access articles published by our research team and related to this work",
    permalink: "/published/",
  },
  {
    id: 5,
    title: "Report a landslide",
    description: "Share new observations of landslides to contribute to ongoing research",
    permalink: "/report/",
  },
];

const resources = data.map((resource) => (
  <Link key={resource.id} href={resource.permalink} prefetch={false}>
    <a className={styles.resource} style={{ backgroundColor: `var(--resource${resource.id})` }}>
      <h3 className={styles.title}>{resource.title}</h3>
      <div className={styles.description}>{resource.description}</div>
    </a>
  </Link>
));

const Resources = () => {
  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>Resources</h2>
      {resources}
    </div>
  );
};

export default Resources;
