import Link from "next/link";
import styles from "/styles/Resources.module.css";

const data = [
  {
    title: "Oral histories",
    description: "Explore stories of landslides",
    permalink: "/oral-histories/",
  },
  {
    title: "Landslide 101",
    description: "Find out more about the science behind landslides",
    permalink: "/landslide-101/",
  },
  {
    title: "Areas at risk",
    description: "Identify where you live relative to landslide susceptibility in Sitka",
    permalink: "/areas-at-risk/",
  },
  {
    title: "How to prepare for a landslide",
    description: "Learn what to do before a landslide occurs",
    permalink: "/prepare/",
  },
  {
    title: "Published work",
    description: "Access articles published by our research team and related to this work",
    permalink: "/published/",
  },
  {
    title: "Report a landslide",
    description: "Share new observations of landslides to contribute to ongoing research",
    permalink: "/report/",
  },
];

const Resources = ({ more }) => {
  const resources = data.map((resource, index) => (
    <Link key={resource.title} href={resource.permalink} prefetch={false}>
      <a className={styles.resource} style={{ backgroundColor: `var(--resource${index})` }}>
        {more ? (
          <h4 className={styles.title}>{resource.title}</h4>
        ) : (
          <h3 className={styles.title}>{resource.title}</h3>
        )}
        <div className={styles.description}>{resource.description}</div>
      </a>
    </Link>
  ));

  return (
    <div className={!more && styles.section}>
      {more ? (
        <div>
          <hr style={{ margin: "var(--space-600) 0;" }} />
          <h3 className={styles.heading}>More resources</h3>
        </div>
      ) : (
        <h2 className={styles.heading}>Resources</h2>
      )}
      {resources}
    </div>
  );
};

export default Resources;
