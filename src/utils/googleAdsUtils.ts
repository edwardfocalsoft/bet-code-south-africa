
import { supabase } from "@/integrations/supabase/client";

export const injectGoogleAdsScript = async () => {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('google_ads_code')
      .maybeSingle();
    
    if (data && data.google_ads_code) {
      // Create a script element
      const scriptElement = document.createElement('script');
      
      // Set the innerHTML to be the Google Ads code
      scriptElement.innerHTML = data.google_ads_code;
      
      // Append to the head of the document
      document.head.appendChild(scriptElement);
      
      console.log('Google Ads code injected');
    }
  } catch (error) {
    console.error('Failed to inject Google Ads code:', error);
  }
};

export const updateFavicon = async () => {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('favicon_url')
      .maybeSingle();
    
    if (data && data.favicon_url) {
      // Find the existing favicon link element or create a new one
      let favicon = document.querySelector("link[rel='icon']");
      
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }
      
      // Update the href attribute
      favicon.setAttribute('href', data.favicon_url);
    }
  } catch (error) {
    console.error('Failed to update favicon:', error);
  }
};

export const updateDocumentTitle = async () => {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('site_name')
      .maybeSingle();
    
    if (data && data.site_name) {
      document.title = data.site_name;
    }
  } catch (error) {
    console.error('Failed to update document title:', error);
  }
};

export const applyGlobalSiteSettings = async () => {
  await updateFavicon();
  await updateDocumentTitle();
  await injectGoogleAdsScript();
};
