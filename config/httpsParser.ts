// Function to modify URLs to start with "https"
export const ensureHttps = (url: string): string => {
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  return url;
};
