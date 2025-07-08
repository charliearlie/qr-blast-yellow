import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// Enhanced HTML parser to find meta tags, links, and CSS colors
function parseHtml(html: string) {
  // Meta tag patterns
  const themeColorRegex = /<meta\s+name=["']theme-color["']\s+content=["'](#?[a-fA-F0-9]{3,6})["']/i;
  const msapplicationTileColorRegex = /<meta\s+name=["']msapplication-TileColor["']\s+content=["'](#?[a-fA-F0-9]{3,6})["']/i;
  
  // Icon patterns
  const appleIconRegex = /<link\s+rel=["']apple-touch-icon["'](?:.*?)href=["'](.*?)["']/i;
  const shortcutIconRegex = /<link\s+rel=["']shortcut icon["'](?:.*?)href=["'](.*?)["']/i;
  const iconRegex = /<link\s+rel=["']icon["'](?:.*?)href=["'](.*?)["']/i;
  
  // CSS color patterns (look for common brand color variables)
  const cssColorRegex = /(?:--primary-color|--brand-color|--main-color|--accent-color):\s*(#[a-fA-F0-9]{3,6})/i;
  const cssBackgroundRegex = /background-color:\s*(#[a-fA-F0-9]{3,6})/i;

  // Extract values
  const themeColorMatch = html.match(themeColorRegex);
  const tileColorMatch = html.match(msapplicationTileColorRegex);
  const cssColorMatch = html.match(cssColorRegex);
  const cssBackgroundMatch = html.match(cssBackgroundRegex);
  
  const appleIconMatch = html.match(appleIconRegex);
  const shortcutIconMatch = html.match(shortcutIconRegex);
  const iconMatch = html.match(iconRegex);

  // Priority order for colors: theme-color > tile-color > CSS variables > CSS background
  let themeColor = null;
  if (themeColorMatch) themeColor = themeColorMatch[1];
  else if (tileColorMatch) themeColor = tileColorMatch[1];
  else if (cssColorMatch) themeColor = cssColorMatch[1];
  else if (cssBackgroundMatch) themeColor = cssBackgroundMatch[1];

  return {
    themeColor,
    faviconUrl: appleIconMatch ? appleIconMatch[1] : shortcutIconMatch ? shortcutIconMatch[1] : iconMatch ? iconMatch[1] : null
  };
}

// Note: Removed unreliable favicon color extraction 
// Only keeping HTML-based color detection for reliability

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    let fetchUrl = url;
    if (!fetchUrl.startsWith('http')) {
      fetchUrl = `https://${fetchUrl}`;
    }

    const response = await fetch(fetchUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    const html = await response.text();

    let { themeColor, faviconUrl } = parseHtml(html);
    
    // If faviconUrl is a relative path, make it absolute
    if (faviconUrl && !faviconUrl.startsWith('http')) {
      const baseUrl = new URL(fetchUrl);
      faviconUrl = new URL(faviconUrl, baseUrl.origin).href;
    }

    // Fallback: try common favicon paths if no favicon found
    if (!faviconUrl) {
      const baseUrl = new URL(fetchUrl);
      const commonPaths = ['/favicon.ico', '/favicon.png', '/apple-touch-icon.png'];
      
      for (const path of commonPaths) {
        try {
          const testUrl = `${baseUrl.origin}${path}`;
          const testResponse = await fetch(testUrl, { method: 'HEAD' });
          if (testResponse.ok) {
            faviconUrl = testUrl;
            break;
          }
        } catch {
          // Continue to next path
        }
      }
    }

    return new Response(JSON.stringify({ 
      themeColor, 
      faviconUrl,
      extractionMethod: themeColor ? 'html' : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});