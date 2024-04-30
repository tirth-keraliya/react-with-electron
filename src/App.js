import { useEffect, useState } from "react";
import "./App.css";
import { fetchActiveURL } from "./utils/api";
import Background from "./images/homebg.png";
import RightArrow from "./images/rightarrow.svg";
import { ClipLoader } from "react-spinners";

function App() {
  const [loading, setLoading] = useState(true);
  const [activeURLs, setActiveURLs] = useState([]);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [splashBackgroundImage, setSplashBackgroundImage] =
    useState(Background);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchActiveURL();
        setActiveURLs(data.items);
        const splashImage = data.splashImage;
        console.log(splashImage, "splashImageeeee");
        if (splashImage) {
          setSplashBackgroundImage(`https:${splashImage}`);
        }

        const activeURL = data.items.find((item) => item.isActive);

        // Open only if we haven't redirected yet
        if (activeURL && !hasRedirected.current) {
          window.open(activeURL.url, "_blank");
          hasRedirected.current = true; // Prevent further redirections
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data only once when component mounts
    fetchData();
  }, []);
  // Only run when hasRedirected changes
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
          <ClipLoader size={35} color={"#123abc"} />
          <p>Hang tight, we're getting things ready for you.</p>
        </div>
      ) : (
        <div
          className="main-wrap"
          style={{
            backgroundImage: `url(${
              splashBackgroundImage ? splashBackgroundImage : Background
            })`,
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
