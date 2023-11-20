import "dotenv";

const config = {
  prefix: process.env.PREFIX || "!",
  token: process.env.TOKEN || "",
  username: process.env.GES_USERNAME || "",
  password: process.env.GES_PASSWORD || "",
  api: {
    baseUrl: process.env.API_BASE_URL || "https://api.kordis.fr",
    authBaseUrl: (process.env.AUTH_API_BASE_URL =
      "https://authentication.kordis.fr"),
  },
};

export default config;
