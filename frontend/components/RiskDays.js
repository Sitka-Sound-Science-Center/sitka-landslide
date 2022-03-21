import PropTypes from "prop-types";
import Link from "next/link";
import styles from "../styles/RiskDays.module.css";
import { useState, useEffect } from "react";
import Risk from "./Risk";
import Icon from "/components/Icon";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
  resetNextUuid,
} from "react-accessible-accordion";

const RiskDays = ({ days, hours }) => {
  // Reset uuid; this is needed to prevent a warning for the accordion
  resetNextUuid();

  const daysAccordion = (
    <Accordion allowZeroExpanded={true}>
      {days.map((category, i) => {
        const hoursInDay = hours.filter((hour) => hour.dayNumber === category.dayNumber);
        return (
          <AccordionItem key={category.dayNumber}>
            <AccordionItemHeading instanceid={i}>
              <AccordionItemButton className={styles.category}>
                <div className={styles.categoryName}>{category.dayName}</div>
                <div className={styles.categoryRisk}>
                  <Risk riskLevel={category.riskLevel} />
                </div>
                <div className={styles.categoryAction}>
                  <AccordionItemState>
                    {({ expanded }) => (expanded ? <Icon name="minus" /> : <Icon name="plus" />)}
                  </AccordionItemState>
                </div>
              </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel>
              {hoursInDay.map((hour) => (
                <Link
                  href={`/detail/${hour.timestamp}/`}
                  prefetch={false}
                  key={hour.timestamp}
                  className={styles.hour}
                >
                  <a className={styles.hour}>
                    <div className={styles.hourName}>{hour.time}</div>
                    <div className={styles.hourRisk}>
                      <Risk riskLevel={category.riskLevel} />
                    </div>
                    <div className={styles.hourAction}>
                      <Icon name="chevron-right" />
                    </div>
                  </a>
                </Link>
              ))}
            </AccordionItemPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>3 day forecast</h2>
      {daysAccordion}
    </section>
  );
};

RiskDays.propTypes = {};

export default RiskDays;
