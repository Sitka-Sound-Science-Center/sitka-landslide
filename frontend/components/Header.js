import PropTypes from "prop-types";
import styles from "/styles/Header.module.css";
import Icon from "/components/Icon";
import Link from "next/link";

import { useState } from "react";
import useDropdownMenu from "react-accessible-dropdown-menu-hook";

const links = [
  {
    text: "Homepage",
    permalink: "/",
  },
  {
    text: "About",
    permalink: "/about/",
  },
  {
    text: "Areas at risk",
    permalink: "/areas-at-risk/",
  },
  {
    text: "Report landslide",
    permalink: "/report/",
  },
  {
    text: "Contact us",
    permalink: "/contacgt/",
  },
];

const Header = () => {
  const { buttonProps, itemProps, isOpen, setIsOpen } = useDropdownMenu(links.length);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <Link prefetch={false} href={`/`}>
          <a className={styles.brand}>
            Sitka Landslide Risk<sup>BETA</sup>
          </a>
        </Link>
      </div>
      <div className={styles.right}>
        <div className={styles.menucontainer}>
          <button
            className={`${styles.button} ${isOpen ? styles.buttonopen : ""}`}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            {...buttonProps}
          >
            <Icon name="bars" />
          </button>
          <div className={`${styles.menu} ${isOpen ? styles.menuopen : ""}`} role="menu">
            {links.map((link, i) => (
              <Link key={link.permalink} prefetch={false} href={link.permalink}>
                <a onClick={closeMenu}>{link.text}</a>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Header.propTypes = {};

export default Header;
