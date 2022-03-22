import Link from "next/link";
import styles from "/styles/Resources.module.css";

const data = [
  {
    title: "How to prepare for a landslide",
    description: "Learn what you and your community can do to be ready for a landslide",
    permalink: "/prepare/",
    backgroundColor: "#E0EBFD",
  },
  {
    title: "Areas at risk",
    description: "View a map and read more about which parts of Sitka are most vulnerable",
    permalink: "/areas-at-risk/",
    backgroundColor: "#F5F3F0",
  },
  {
    title: "Landslide 101",
    description: "Learn what you and your community can do to be ready for a landslide",
    permalink: "https://sitkascience.org/",
    backgroundColor: "#DEECE5",
  },
  {
    title: "Oral histories",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit; sed ornare leo nulla, a mattis lacus blandit vitae",
    permalink: "https://sitkascience.org/",
    backgroundColor: "#F3F3F3",
  },
];

const resources = data.map((resource, i) => (
  <Link key={i} href={resource.permalink} prefetch={false}>
    <a className={styles.resource} style={{ backgroundColor: resource.backgroundColor }}>
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
