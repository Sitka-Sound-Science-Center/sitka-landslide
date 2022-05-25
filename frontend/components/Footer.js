import PropTypes from "prop-types";
import styles from "/styles/Footer.module.css";
import Link from "next/link";

const data = {
  links: [
    {
      permalink: "/about/",
      text: "About",
    },
    {
      permalink: "/contact/",
      text: "Contact",
    },
    {
      permalink: "/disclaimer/",
      text: "Disclaimer",
    },
  ],
  logos: [
    {
      permalink: "https://sitkascience.org/",
      text: "Sitka Sound Science Center",
      filename: "logo-sitkascience",
    },
    {
      permalink: "https://www.sitkatribe.org/",
      text: "Sitka Tribe of Alaska",
      filename: "logo-sitkatribe",
    },
    {
      permalink: "https://www.weather.gov/wrn/ambassadors",
      text: "Weather-Ready Nation",
      filename: "logo-wrn",
    },
  ],
};

const logos = data.logos.map((logo, i) => (
  <a href={logo.permalink} key={i} className={styles.logo}>
    <picture>
      <source
        type="image/avif"
        srcSet={`/images/${logo.filename}.avif, /images/${logo.filename}@2x.avif 2x`}
      />
      <source
        type="image/png"
        srcSet={`/images/${logo.filename}.png, /images/${logo.filename}@2x.png 2x`}
      />
      <img
        className={styles.logoimage}
        src={`/images/${logo.filename}.png`}
        width="82"
        height="85"
        loading="lazy"
        alt=""
        // Using an empty alt tag because this information is repeated in the text below
      />
    </picture>
    <div className={styles.logotext}>{logo.text}</div>
  </a>
));

const links = data.links.map((link, i) => (
  <Link href={link.permalink} key={i} prefetch={false}>
    <a className={styles.link}>
      <div className={styles.linktext}>{link.text}</div>
    </a>
  </Link>
));

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className="container">
        <div className={styles.logos}>{logos}</div>
        <div className={styles.links}>{links}</div>
      </div>
    </div>
  );
};

Footer.propTypes = {};

export default Footer;
