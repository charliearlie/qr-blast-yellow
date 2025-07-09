export const featureData = {
  landingPage: {
    hero: {
      title: "Blast QR: Intelligent & Dynamic QR Codes",
      subtitle:
        "Go beyond static images. Create dynamic, intelligent QR codes that adapt to time, location, and your changing needs. Free and secure.",
    },
    features: [
      {
        category: "Core Generator Features",
        icon: "QrCode",
        items: [
          {
            title: "Deep Customisation",
            description:
              "Control every aspect of your QR code's appearance. Match your brand with custom colours, styles, and shapes for the code's body and corners.",
            "sub-features": [
              "Custom QR and background colors with a contrast checker to ensure scannability.",
              "Multiple styles for data patterns, from classic squares to rounded dots.",
              "Unique styling options for corner squares and corner dots.",
            ],
          },
          {
            title: "Logo Integration",
            description:
              "Seamlessly embed your company logo or any image directly into the center of your QR code to increase brand recognition and scan rates.",
            "sub-features": [],
          },
          {
            title: "Custom Borders",
            description:
              "Frame your QR codes with customisable borders, including simple, thick, rounded, double, or dashed styles to make them stand out.",
            "sub-features": [],
          },
          {
            title: "High-Resolution Downloads",
            description:
              "Export your final QR code as a high-quality PNG, perfect for both digital use and print materials.",
            "sub-features": [],
          },
        ],
      },
      {
        category: "Analytics & Tracking",
        icon: "BarChart3",
        items: [
          {
            title: "Comprehensive Scan Analytics",
            description:
              "Unlock powerful insights for every QR code you create. Understand your audience and measure campaign effectiveness with a detailed analytics dashboard.",
            "sub-features": [
              "Total scan count tracking.",
              "Scans by day, week, and month.",
              "Top countries and devices.",
              "Daily scan activity charts.",
            ],
          },
          {
            title: "User Management Dashboard",
            description:
              "A centralised dashboard for authenticated users to view, manage, and track the performance of all their saved QR codes in one place.",
            "sub-features": [],
          },
        ],
      },
      {
        category: "Dynamic & Intelligent QR Codes",
        icon: "BrainCircuit",
        items: [
          {
            title: "Living QR Codes (URL Editing)",
            description:
              "The ultimate flexibility. Update the destination URL of your QR code at any time without ever needing to reprint it. Perfect for changing promotions, updating links, or fixing errors on the fly.",
            "sub-features": [],
          },
          {
            title: "Time-aware Redirects",
            description:
              "A single QR code with multiple destinations. Automatically redirect users to different URLs based on the time of day they scan the code. Ideal for restaurant menus, daily specials, or time-sensitive events.",
            "sub-features": [
              "Set unlimited time-based rules.",
              "Uses UTC for universal consistency.",
              "Includes a default fallback URL.",
            ],
          },
          {
            title: "Geo-fenced Redirects",
            description:
              "Make your QR codes location-aware. Redirect users to different websites based on their geographic location, from country-level down to a specific radius in kilometers.",
            "sub-features": [
              "Target users by country or city.",
              "Create location-based promotions with radius fencing.",
              "Provide localised content automatically.",
            ],
          },
          {
            title: "Scan-Limited QR Codes",
            description:
              "Create scarcity and control access. Set a maximum number of scans for a QR code, after which it can disable or redirect to a different URL. Perfect for tickets, limited-time offers, or single-use access.",
            "sub-features": [
              "Set a custom scan limit.",
              "Provide an optional 'expired' URL as a fallback.",
              "Ideal for promotions and ticketing.",
            ],
          },
          {
            title: "A/B Testing Redirects",
            description:
              "Optimise your campaigns with data. Assign two different destination URLs to a single QR code and automatically split the traffic between them to see which one performs better.",
            "sub-features": [
              "50/50 traffic split between two URLs.",
              "Track performance in your analytics dashboard.",
              "Make data-driven decisions for your marketing.",
            ],
          },
          {
            title: "Password Protection",
            description:
              "Secure your content. Add a password to your QR code to restrict access to authorised users. Scanners will be prompted to enter the password before being redirected.",
            "sub-features": [
              "Protect private documents or exclusive content.",
              "Simple password entry page for users.",
              "Securely managed on the backend.",
            ],
          },
        ],
      },
      {
        category: "Security & Trust",
        icon: "Shield",
        items: [
          {
            title: "Built-in Security Scanning",
            description:
              "Protect your users. Every redirect passes through our security checkpoint, which scans the destination URL for potential threats before the user lands on the page.",
            "sub-features": [
              "Real-time malware and phishing detection.",
              "Blocks known malicious links automatically.",
              "Provides clear warnings for suspicious sites.",
            ],
          },
          {
            title: "User Authentication",
            description:
              "Securely manage your QR codes and analytics with a robust authentication system powered by Supabase Auth, including options for email/password and Google sign-in.",
            "sub-features": [],
          },
        ],
      },
    ],
  },
};
