export function showNotification(name: string, image: string, content: string): void {
  // Check if the browser supports Notification API
  if ("Notification" in window) {
    // Check if permission is granted
    if (Notification.permission === "granted") {
      new Notification(name, {
        body: content,
        icon: "/favicon.ico",
        image,
        tag: "notification",

      });
    } else if (Notification.permission !== "denied") {
      // Request permission from the user
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
          new Notification(name, { body: content, icon: "/favicon.ico",image,tag:"notification" });
        }
      });
    }
  } else if ("webkitNotification" in window) {
    // For WebKit browsers
    new (window as any).webkitNotification(name, {
      body: content,
      icon: "/favicon.ico",
      image: image,
      tag: "notification",
    }).show();
  }
}
