(function() {
    // Function to get query parameter value by name
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Function to get the initial referrer
    function getInitialReferrer() {
        return document.referrer;
    }

    // Function to get the referring domain
    function getReferringDomain(referrer) {
        try {
            const url = new URL(referrer);
            return url.hostname;
        } catch {
            return null;
        }
    }

    // Store initial referrer and referring domain to avoid redundant calls
    const initialReferrer = getInitialReferrer();
    const referringDomain = getReferringDomain(initialReferrer);

    // Function to check if the referrer or browser is Facebook
    function isFacebookSource() {
        const userAgent = navigator.userAgent.toLowerCase();
        return (
            (referringDomain && referringDomain.includes('facebook.com')) ||
            userAgent.includes('fb') ||
            userAgent.includes('facebook')
        );
    }

    // Function to check if the referrer is Google
    function isGoogleSource() {
        return (
            referringDomain && referringDomain.includes('google.com')
        );
    }

    // Function to check if the referrer is Bing
    function isBingSource() {
        return (
            referringDomain && referringDomain.includes('bing.com')
        );
    }

    // Function to check if the referrer is LinkedIn
    function isLinkedInSource() {
        return (
            referringDomain && (
                referringDomain.includes('linkedin.com') || 
                referringDomain.includes('lnkd.in')
            )
        );
    }

    // Determine referral source
    let referralSource = 'Direct or Other';

    const fbclid = getQueryParam('fbclid');
    const utmSource = getQueryParam('utm_source');
    const liclid = getQueryParam('liclid'); // LinkedIn click identifier
    const utmPage = getQueryParam('utm_page'); // Capture which page the referral came from
    
    // Additional parameters to capture for Google Ads
    const campaignId = getQueryParam('campaign');
    const adGroupId = getQueryParam('adgroup');
    const keyword = getQueryParam('keyword');
    
    // Store additional data for tracking
    let additionalReferralData = {};

    if (fbclid) {
        referralSource = 'Facebook';
    } else if (liclid) {
        referralSource = 'LinkedIn';
    } else if (utmSource) {
        const normalisedUtmSource = utmSource.toLowerCase();
        if (normalisedUtmSource === 'google_ads') {
            referralSource = 'Google Ads';
            // Capture additional parameters if present
            if (campaignId) additionalReferralData['Campaign ID'] = campaignId;
            if (adGroupId) additionalReferralData['Ad Group ID'] = adGroupId;
            if (keyword) additionalReferralData['Keyword Match'] = keyword;
            
            // New parameters with human-readable names
            const creative = getQueryParam('creative');
            const deviceType = getQueryParam('device');
            const adPosition = getQueryParam('adposition');
            
            if (creative) additionalReferralData['Ad Creative'] = creative;
            if (deviceType) {
                // Convert device code to readable format
                let deviceName = 'Unknown';
                if (deviceType === 'c') deviceName = 'Computer';
                else if (deviceType === 'm') deviceName = 'Mobile';
                else if (deviceType === 't') deviceName = 'Tablet';
                
                additionalReferralData['Device Type'] = deviceName;
            }
            if (adPosition) additionalReferralData['Ad Position'] = adPosition;
        } else if (normalisedUtmSource === 'chatgpt.com') {
            referralSource = 'ChatGPT';
        } else if (normalisedUtmSource === 'perplexity.ai') {
            referralSource = 'Perplexity';
        } else if (normalisedUtmSource === 'deepseek.com') {
            referralSource = 'DeepSeek';
        } else if (normalisedUtmSource === 'brokerbrew') {
            referralSource = 'Broker Brew';
        } else if (normalisedUtmSource === 'trackmytrail.com.au') {
            // Map Track My Trail sources to a custom label for clarity in analytics
            referralSource = 'Track My Trail Root Domain';
        } else if (normalisedUtmSource === 'app.trackmytrail.com.au') {
            // Map Track My Trail App sources to a custom label for clarity in analytics
            referralSource = 'Track My Trail App';
        } else if (normalisedUtmSource === 'linkedin' || normalisedUtmSource === 'linkedin.com') {
            referralSource = 'LinkedIn';
        } else {
            referralSource = normalisedUtmSource;
        }
    } else if (isFacebookSource()) {
        referralSource = 'Facebook';
    } else if (isGoogleSource()) {
        referralSource = 'Google';
    } else if (isBingSource()) {
        referralSource = 'Bing';
    } else if (isLinkedInSource()) {
        referralSource = 'LinkedIn';
    } // No need for an else here as 'Direct or Other' is already set by default

    // Add utm_page to additional referral data if present
    if (utmPage) {
        additionalReferralData['Referral Page'] = utmPage;
    }

    // Document that Mixpanel is initialized synchronously in MixpanelProvider after hydration; use retries only to guard load ordering, not network latency.
    var maxAttempts = 10;
    var attempts = 0;
    var interval = 100; // in milliseconds

    function trackReferralSource() {
        attempts++;
        // Safely check if mixpanel is defined and ready
        if (window.mixpanelLoaded && typeof window.mixpanel !== 'undefined' && typeof window.mixpanel.track === 'function') {
            // Create tracking data object
            const trackingData = {
                'Referral Source': referralSource
            };
            
            // Add additional referral data if available
            if (Object.keys(additionalReferralData).length > 0) {
                Object.assign(trackingData, additionalReferralData);
            }
            
            window.mixpanel.track('Referral Source Identified', trackingData);

            // After emitting the event, set first-touch profile properties and super properties.
            // Ensure the values are immutable (first-touch) by using set_once/register_once.
            try {
                var mp = window.mixpanel;

                // Identify the current anonymous user using their distinct_id so profile ops apply correctly
                var id = (typeof mp.get_distinct_id === 'function') ? mp.get_distinct_id() : null;
                if (id && typeof mp.identify === 'function') {
                    mp.identify(id);
                }

                // Build initial attribution object
                var initial = { 'Initial Referral Source': referralSource };
                if (referringDomain) {
                    initial['Initial Referring Domain'] = referringDomain;
                }
                if (utmPage) {
                    initial['Initial Referral Page'] = utmPage;
                }

                // Persist to profile only if not previously set
                if (mp.people && typeof mp.people.set_once === 'function') {
                    mp.people.set_once(initial);
                }

                // Register as super properties once so future events carry these automatically
                if (typeof mp.register_once === 'function') {
                    mp.register_once(initial);
                }
            } catch {
                // no-op: never block the page or event flow on attribution enrichment
            }
        } else if (attempts < maxAttempts) {
            // Retry after a short delay
            setTimeout(trackReferralSource, interval);
        }
    }

    // Start tracking referral source
    trackReferralSource();
})();
