import Link from "next/link";
import styles from "/styles/Resources.module.css";

const data = [
  {
    id: 0,
    title: "How to prepare for a landslide",
    description: "Learn what you and your community can do to be ready for a landslide",
    permalink: "/prepare/",
  },
  {
    id: 1,
    title: "Areas at risk",
    description: "View a map and read more about which parts of Sitka are most vulnerable",
    permalink: "/areas-at-risk/",
  },
  {
    id: 2,
    title: "Landslide 101",
    description: "Learn what you and your community can do to be ready for a landslide",
    permalink: "https://sitkascience.org/",
  },
  {
    id: 3,
    title: "Oral histories",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit; sed ornare leo nulla, a mattis lacus blandit vitae",
    permalink: "https://sitkascience.org/",
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
