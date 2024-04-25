import { useEffect, useState } from "react";
import "./App.css";
import { fetchActiveURL } from "./utils/api";
import Background from "./images/homebg.png";
import RightArrow from "./images/rightarrow.svg";

function App() {
  const [loading, setLoading] = useState(true);
  const [activeURLs, setActiveURLs] = useState([]);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [splashBackgroundImage, setSplashBackgroundImage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchActiveURL();
        setActiveURLs(data.items);
        console.log(data, "dataaaaaaaa");
        const splashImage = data.splashImage;
        setSplashBackgroundImage(splashImage || "");

        const activeURL = data.items.find((item) => item.isActive);

        // Open only if we haven't redirected yet
        if (activeURL && !hasRedirected) {
          window.open(activeURL.url, "_blank");
          setHasRedirected(true); // Prevent further redirections
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if we haven't redirected
    if (!hasRedirected) {
      fetchData();
    }
  }, [hasRedirected]); // Only run when hasRedirected changes
  const handleButtonClick = () => {
    const activeURL = activeURLs.find((item) => item.isActive);

    if (activeURL && activeURL.url) {
      window.open(activeURL.url, "_blank");
    }
  };

  return (
    <>
      {loading ? (
        <div className="center-wrap">
          <p>Hang tight, we're getting things ready for you.</p>
        </div>
      ) : (
        <div
          className="main-wrap"
          style={{
            backgroundImage: `url(${splashBackgroundImage || Background})`,
          }}
        >
          <div className="bottom-wrap">
            <button className="btn-wrap" onClick={handleButtonClick}>
              Click here to visit the casino
              <img src={RightArrow} alt="right-arrow" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
