export const BaseUrl =
  process.env.NODE_ENV === "production"
    ? "https://chat-final-xx1.onrender.com/api/v1"
    : "http://localhost:5000/api/v1";
