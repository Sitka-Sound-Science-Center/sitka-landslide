import BetaBanner from "./BetaBanner";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  return (
    <>
      <BetaBanner />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
