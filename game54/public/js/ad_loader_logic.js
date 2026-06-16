// public/js/ad_loader_logic.js

import 'https://cdn.jsdelivr.net/npm/crypto-js@4.2.0/crypto-js.min.js';

export function loadAdsScript(pageType) {
    const domain = window.location.hostname;
    const value = domain;
    const md5 = CryptoJS.MD5(value).toString();
    const scriptName = `./${md5.slice(-8)}_ads.js`;

    import(scriptName)
        .then(module => {
            window.ad_code_identifier = module.ad_code_identifier; // Make it globally available
            const ad_code_identifier = module.ad_code_identifier;

            let scriptToLoad = '';
            let fallbackScript = '';

            switch (pageType) {
                case 'home':
                    scriptToLoad = './homegg.js';
                    fallbackScript = './homegg_ads.js';
                    break;
                case 'detail':
                    scriptToLoad = './detailgg.js';
                    fallbackScript = './detailgg_ads.js';
                    break;
                case 'category':
                    scriptToLoad = '../categorygg.js'; // Adjust path for category page
                    fallbackScript = '../categorygg_ads.js'; // Adjust path for category page
                    break;
                default:
                    console.error('Unknown page type:', pageType);
                    return;
            }

            if (ad_code_identifier.cate === "adx" && ad_code_identifier.status === 1) {
                const script = document.createElement("script");
                script.type = "module";
                script.src = scriptToLoad;
                document.body.appendChild(script);
            } else {
                const script = document.createElement("script");
                script.type = "module";
                script.src = fallbackScript;
                document.body.appendChild(script);
            }
        })
        .catch(error => {
            console.error('Error loading ads module:', error);
            // Fallback to a default behavior if the dynamic import fails
            let fallbackScript = '';
            switch (pageType) {
                case 'home':
                    fallbackScript = './homegg_ads.js';
                    break;
                case 'detail':
                    fallbackScript = './detailgg_ads.js';
                    break;
                case 'category':
                    fallbackScript = '../categorygg_ads.js'; // Adjust path for category page
                    break;
                default:
                    console.error('Unknown page type for fallback:', pageType);
                    return;
            }
            const script = document.createElement("script");
            script.type = "module";
            script.src = fallbackScript;
            document.body.appendChild(script);
        });
}