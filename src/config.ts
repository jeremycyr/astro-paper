export const SITE = {
  website: "https://jeremycyr.com", // your future deployed domain
  author: "Jeremy Cyr",
  profile: "https://www.linkedin.com/in/jeremycyr", // or GitHub/your portfolio
  desc: "Enterprise software architecture and selective consulting for system integrations, migrations, replatforms, and greenfield development. Helping medium-sized enterprises modernize their technology stack with proven engineering practices.",
  title: "Jeremy Cyr | Enterprise Integration Architect",
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
