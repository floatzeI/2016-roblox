import { at } from "lodash";
import { useEffect, useRef, useState } from "react";
import { createUseStyles } from "react-jss";
import request, { getBaseUrl } from "../../lib/request";
import { adTypes } from "./constants";

const useStyles = createUseStyles({
  adWrapper: {

  },
  adImage: {
    width: '100%',
    height: 'auto',
    margin: '0 auto',
    display: 'block',
    '@media(max-width: 800px)': {
      paddingTop: '10px',
      paddingBottom: '10px',
    },
  },
})

/**
 * User advertisement iframe
 * @param {{type: number}} props 
 */
const UserAdvertisement = props => {
  const info = adTypes[props.type];
  const [imageUrl, setImageUrl] = useState(null);
  const [link, setLink] = useState(null);
  const [title, setTitle] = useState(null);
  const s = useStyles();

  // I HATE IFRAMES I HATE IFRAMES I HATE IFRAMES I HATE IFRAMES
  useEffect(() => {
    request('GET', `${getBaseUrl()}/user-sponsorship/${props.type}`).then(adData => {
      const doc = new DOMParser().parseFromString(adData.data, 'text/html');
      const imageElements = doc.getElementsByTagName('img');
      const aTags = doc.getElementsByTagName('a');
      if (!imageElements.length || !aTags.length) {
        console.error('[error] could not get an element from iframe:', imageElements, aTags);
        return;
      }
      const imageUrl = imageElements[0].getAttribute('src');
      const link = aTags[0].getAttribute('href');
      const adTitle = aTags[0].getAttribute('title');
      if (!imageUrl || !link || !adTitle) {
        console.error('[error] could not get an attribute from iframe: ', imageUrl, link, adTitle);
        return;
      }
      setImageUrl(imageUrl);
      setTitle(adTitle);
      setLink(link);
    }).catch(e => {
      console.error('[error] could not load user ad:', e);
    })
  }, []);

  if (!info) throw new Error(`unexpected adType: ${props.type}`);
  if (!imageUrl) {
    return <div style={{ width: '100%', height: info.height }}></div>
  }
  return <div className={s.adWrapper}>
    <a href={link} title={title}>
      <img src={imageUrl} className={s.adImage} style={{ maxWidth: info.width, maxHeight: info.height }}></img>
    </a>
  </div>
}

export default UserAdvertisement;