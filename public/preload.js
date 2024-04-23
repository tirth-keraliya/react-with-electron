// preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openLink: (url) => ipcRenderer.send("open-link", url),
});

// App.js (Renderer Process)
import { useEffect, useState } from "react";
import "../src/App.css";
import { fetchActiveURL } from "../src/utils/api";
import Background from "../src/images/homebg.png";
import RightArrow from "../src/images/rightarrow.svg";

function App() {
  const [loading, setLoading] = useState(true);
  const [activeURLs, setActiveURLs] = useState([]);
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchActiveURL();
        setActiveURLs(data.items);

        const activeURL = data.items.find((item) => item.isActive);

        if (activeURL && !hasRedirected) {
          // Using Electron API to open the link in the default browser
          window.electronAPI.openLink(activeURL.url);
          setHasRedirected(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!hasRedirected) {
      fetchData();
    }
  }, [hasRedirected]);

  const handleButtonClick = () => {
    const activeURL = activeURLs.find((item) => item.isActive);
    if (activeURL) {
      // Using Electron API to open the link in the default browser
      window.electronAPI.openLink(activeURL.url);
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
            backgroundImage: `url(${Background})`,
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
