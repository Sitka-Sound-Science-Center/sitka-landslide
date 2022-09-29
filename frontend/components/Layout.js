import DataQualityBanner from "./DataQualityBanner";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <DataQualityBanner />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
