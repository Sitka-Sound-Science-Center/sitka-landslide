import PropTypes from "prop-types";
import styles from "/styles/Footer.module.css";

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
      permalink: "https://google.com",
      text: "Sitka Sound Science Center",
      filename: "logo-sitkascience",
    },
    {
      permalink: "https://google.com",
      text: "Sitka Tribe of Alaska",
      filename: "logo-sitkatribe",
    },
    {
      permalink: "https://google.com",
      text: "Sitka Fire Department",
      filename: "logo-sitkafiredepartment",
    },
  ],
};

const logos = data.logos.map((logo, i) => (
  <a href={logo.permalink} key={i} className={styles.logo}>
    <picture>
      <source
        srcSet={`/images/${logo.filename}.avif, /images/${logo.filename}@2x.avif 2x`}
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
  <a href={link.permalink} key={i} className={styles.link}>
    <div className={styles.linktext}>{link.text}</div>
  </a>
));

const Footer = () => {
  return (
    <div className={styles.footer}>
      <div className={styles.logos}>{logos}</div>
      <div className={styles.links}>{links}</div>
    </div>
  );
};

Footer.propTypes = {};

export default Footer;
