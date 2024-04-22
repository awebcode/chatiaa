"use strict";
// // Scheduled task to check user activity status periodically
// const checkUserActivityStatus = () => {
//   // Get the current time
//   const currentTime = new Date();
//   // Define the threshold for considering a user offline (e.g., 5 minutes)
//   const offlineThreshold = new Date(currentTime - 5 * 60 * 1000); // 5 minutes ago
//   // Query the database for users whose last activity time is older than the offline threshold
//   onlineUsersModel.updateMany(
//     { lastActivityTime: { $lt: offlineThreshold } },
//     { $set: { status: "offline" } },
//     (err, result) => {
//       if (err) {
//         console.error("Error updating user activity status:", err);
//       } else {
//         console.log(
//           "User activity status updated:",
//           result.nModified,
//           "users marked as offline"
//         );
//       }
//     }
//   );
// };
// // Schedule the task to run periodically (e.g., every minute)
// setInterval(checkUserActivityStatus, 60 * 1000); // Run every minute
