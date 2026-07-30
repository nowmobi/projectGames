
import { ad_code_identifier } from "./ads.js";

console.log("Loading detailgg_ads.js...");
console.log("Ad Code Identifier:", ad_code_identifier);


const clientId = ad_code_identifier.client;
const gtagId = ad_code_identifier.gtag;


const adsenseScript = document.createElement("script");
adsenseScript.async = true;
adsenseScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
adsenseScript.crossOrigin = "anonymous";
document.head.appendChild(adsenseScript);

console.log(`✅ AdSense script injected with client: ${clientId}`);


const gtagScript = document.createElement("script");
gtagScript.async = true;
gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${gtagId}`;
document.head.appendChild(gtagScript);

console.log(`✅ Google Analytics script injected with gtag: ${gtagId}`);


const gtagConfigScript = document.createElement("script");
gtagConfigScript.textContent = `
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "${gtagId}");
`;
document.head.appendChild(gtagConfigScript);

console.log("✅ Google Analytics configuration injected");


const urlParams = new URLSearchParams(window.location.search);
const urlChannel = urlParams.get("channel");
const storedChannel = sessionStorage.getItem("channel");


if (urlChannel) {
  sessionStorage.setItem("channel", urlChannel);
}


const channelParam = storedChannel || urlChannel;


const adunits = ad_code_identifier.adunit;
let selectedAdunit = null;


if (channelParam && adunits[channelParam]) {
  selectedAdunit = adunits[channelParam];
  console.log(`✅ Found matching channel: ${channelParam}`);
} else {
  
  const firstKey = Object.keys(adunits)[0];
  selectedAdunit = adunits[firstKey];
  console.log(`⚠️ No matching channel, using first adunit: ${firstKey}`);
}


function insertAdsToContainers() {
  
  const adsContainers = document.querySelectorAll(".ads");
  console.log(`Found ${adsContainers.length} ad containers with class "ads"`);

  if (!selectedAdunit || !selectedAdunit.detail) {
    console.warn("⚠️ No detail ads found in selected adunit");
    return;
  }

  let detailAds = [...selectedAdunit.detail]; 
  console.log(`Found ${detailAds.length} detail ads in configuration`);

  
  const randadParam = ad_code_identifier.randad;
  if (randadParam == 1 || randadParam == 3) {
    console.log("🎲 Randad is 1 or 3, shuffling detail ads...");

    
    for (let i = detailAds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [detailAds[i], detailAds[j]] = [detailAds[j], detailAds[i]];
    }

    console.log("✅ Detail ads shuffled:", detailAds);
  }

  
  adsContainers.forEach((container, index) => {
    
    if (container.className.trim() !== "ads") {
      console.log(
        `⏭️ Skipping container ${index + 1}: has additional classes (${
          container.className
        })`
      );
      return;
    }

    
    container.innerHTML = "";
    console.log(`🧹 Cleared content of ads container ${index + 1}`);

    
    detailAds.forEach((ad, adIndex) => {
      // 用 div 包裹 ins，使 .ads > div 的宽度规则(width:100%;max-width:300px)生效，
      // 否则空的 <ins> 作为 flex 子元素会塌缩成宽度 0，导致 AdSense 报 availableWidth=0
      const wrapper = document.createElement("div");

      const insElement = document.createElement("ins");
      insElement.className = "adsbygoogle";
      insElement.style.display = "block";
      insElement.style.width = "100%";
      insElement.setAttribute("data-ad-client", clientId);
      insElement.setAttribute("data-ad-slot", ad.slot);
      insElement.setAttribute("data-ad-format", "auto");
      insElement.setAttribute("data-full-width-responsive", "true");

      wrapper.appendChild(insElement);
      container.appendChild(wrapper);

      // 等待浏览器完成布局后再 push，确保 AdSense 能量到非零宽度
      requestAnimationFrame(() => {
        const script = document.createElement("script");
        script.textContent = "(adsbygoogle = window.adsbygoogle || []).push({});";
        container.appendChild(script);
      });

      console.log(
        `✅ Inserted ad ${adIndex + 1} into container ${index + 1} with slot: ${
          ad.slot
        }`
      );
    });
  });

  console.log("✅ All ads inserted successfully");
}


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    
    setTimeout(insertAdsToContainers, 500);
  });
} else {
  setTimeout(insertAdsToContainers, 500);
}

console.log("✅ detailgg_ads.js loaded successfully");
