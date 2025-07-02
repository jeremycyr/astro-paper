export const SITE = {
  website: "https://jeremycyr.com", // your future deployed domain
  author: "Jeremy Cyr",
  profile: "https://www.linkedin.com/in/jeremycyr", // or GitHub/your portfolio
  desc: "Architecture-first consulting and development for POCs, modernization, and high-velocity teams.",
  title: "Jeremy Cyr | Software Architecture & Delivery",
  ogImage: "astropaper-og.jpg", // keep or replace with your own Open Graph image
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false, // set to false unless you're encouraging external editing
    text: "Edit page",
    url: "https://github.com/jeremycyr/your-repo/edit/main/", // update if keeping enabled
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "America/Detroit", // EST timezone
} as const;
