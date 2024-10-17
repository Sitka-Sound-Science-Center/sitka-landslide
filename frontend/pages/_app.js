import { GoogleAnalytics } from "nextjs-google-analytics";

import Layout from "../components/Layout";

import "../styles/reset.css";
import "../styles/variables.css";
import "../styles/globals.css";

// Note: The Google Analytics ID can be supplied either by parameter or by environment
// variable, with the env var taking precedence over the parameter if both are given.
// Since the site is built statically and has no environment in production, it's simplest
// to hard-code the ID here, then override it in the dev server with a fake value given
// via the environment variable.
function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <GoogleAnalytics trackPageViews gaMeasurementId="G-BWNTN301KS" />
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
