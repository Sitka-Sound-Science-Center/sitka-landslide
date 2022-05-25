import Head from "next/head";
import Link from "next/link";

import Icon from "./Icon";
import stylesPage from "../styles/Page.module.css";
import stylesArticle from "/styles/Article.module.css";

const styles = { ...stylesPage, ...stylesArticle };

const Page = ({
  children,
  title,
  dateAbbr,
  dateFull,
  timeStart,
  timeEnd,
  previous,
  next,
  description,
  doNotApplyStyle,
  isDetailView,
}) => {
  return (
    <>
      <Head>
        <title>{title} | Sitka Landslide Risk</title>
        <meta name="description" content={description} />
      </Head>
      <header className={styles.header}>
        <div className="container">
          {isDetailView ? (
            <div className={styles.navheader}>
              {previous ? (
                <Link href={`/detail/${previous}`}>
                  <a className={styles.arrowLeft}>
                    <Icon name="arrow-left" />
                  </a>
                </Link>
              ) : (
                <div className={styles.arrowLeft} style={{ opacity: 0.1 }}>
                  <Icon name="arrow-left" />
                </div>
              )}
              {dateAbbr ? (
                <div className={styles.datetime}>
                  <h2>
                    <span className={styles.dateAbbr}>{dateAbbr}</span>
                    <span className={styles.dateFull}>{dateFull}</span>
                  </h2>
                  <p className={styles.time}>
                    {timeStart} to {timeEnd}
                  </p>
                </div>
              ) : (
                <div className={styles.datetime}>
                  <h2>
                    <div className={styles.title}>{title}</div>
                  </h2>
                </div>
              )}
              {next ? (
                <Link href={`/detail/${next}`}>
                  <a className={styles.arrowRight}>
                    <Icon name="arrow-right" />
                  </a>
                </Link>
              ) : (
                <div className={styles.arrowRight} style={{ opacity: 0.1 }}>
                  <Icon name="arrow-right" />
                </div>
              )}
            </div>
          ) : (
            <h2>
              <span className={styles.title}>{title}</span>
            </h2>
          )}
        </div>
      </header>
      <article className={doNotApplyStyle ? "" : styles.article}>
        <div className="container">{children}</div>
      </article>
    </>
  );
};

export default Page;
