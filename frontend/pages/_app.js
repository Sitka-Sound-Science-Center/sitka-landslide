<<<<<<< HEAD
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
=======
import Layout from "../components/Layout";

import "../styles/reset.css";
import "../styles/variables.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
>>>>>>> e8dfc37 (Continuing frontend development)
}

export default MyApp;
