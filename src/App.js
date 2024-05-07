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
  const [fcmToken, setFcmToken] = useState("");

  const fcm_server_key =
    "AAAAf1JvBWQ:APA91bH2X1qgtuYr_jb4eRqRAMOPjpp-j-jKgeEaQyByYkjs7T_-6uXTbc8cS4JbYE2PIZHMnIbb9CyCxSStn1wqyGww_7RX0S0tXQBmnQJqgxGJUKBHjSc3UdmYdj6UKjInqBpXL4tb";

  function subscribeTokenToTopic(token, topic) {
    fetch(
      "https://iid.googleapis.com/iid/v1/" + token + "/rel/topics/" + topic,
      {
        method: "POST",
        headers: new Headers({
          Authorization: "key=" + fcm_server_key,
        }),
      }
    )
      .then((response) => {
        if (response.status < 200 || response.status >= 400) {
          throw (
            "Error subscribing to topic: " +
            response.status +
            " - " +
            response.text()
          );
        }
        console.log('Subscribed to "' + topic + '"');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    window.electron?.getFCMToken("getFCMToken", (_, token) => {
      setFcmToken(token);
      subscribeTokenToTopic(token, "Users");
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("heyyyyyyy");
        const data = await fetchActiveURL();
        // ipcRenderer.send("request-fcm-registration");
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
