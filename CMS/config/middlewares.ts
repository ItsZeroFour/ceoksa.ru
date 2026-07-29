export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      origin: ["http://localhost:3000", "https://ceoksa.ru"],
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      headers: ["Content-Type", "Authorization"],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
