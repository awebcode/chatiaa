export const BaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://chatiaa-server.onrender.com/api/v1"
    : "http://localhost:5000/api/v1";
