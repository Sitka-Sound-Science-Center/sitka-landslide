import Head from "next/head";

import stylesPage from "../styles/Page.module.css";
import stylesArticle from "/styles/Article.module.css";

const styles = { ...stylesPage, ...stylesArticle };

const Page = ({ children, title, description }) => {
  return (
    <>
      <Head>
        <title>{title} | Sitka Landslide Risk</title>
        <meta name="description" content={description} />
      </Head>
      <header className={styles.header}>
        <div className="container">
          <h2>
            <span className={styles.title}>{title}</span>
          </h2>
          <p className={styles.description}>{description}</p>
        </div>
      </header>
      <article className={styles.article}>
        <div className="container">{children}</div>
      </article>
    </>
  );
};

export default Page;
