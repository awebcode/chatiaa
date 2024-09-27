## Scheduled User Activity Status Check

This code defines a scheduled task to periodically check user activity status and update their status to "offline" if they haven't been active for a certain time.

**Table of Contents**

| Section | Description |
|---|---|
| **1. Code Overview** |  Provides a general description of the code's purpose.  |
| **2. Function Breakdown** |  Explains the functionality of the `checkUserActivityStatus` function. |
| **3. Scheduling the Task** |  Details how the task is scheduled to run periodically. |

**1. Code Overview**

This code implements a mechanism to automatically manage user activity status. The core functionality is encapsulated within the `checkUserActivityStatus` function, which is scheduled to run periodically. 

**2. Function Breakdown**

The `checkUserActivityStatus` function performs the following steps:

1. **Get Current Time:** 
   - The current time is retrieved using `new Date()`.
   - This time will be used as a reference point for determining which users are considered inactive.

2. **Define Offline Threshold:** 
   - A `offlineThreshold` is calculated based on the current time minus a predefined time interval. 
   - In this code, the interval is set to 5 minutes (5 * 60 * 1000 milliseconds).

3. **Query Database:**
   - The code uses the `onlineUsersModel` to query the database for users whose last activity time is older than the `offlineThreshold`. This effectively identifies inactive users.

4. **Update User Status:**
   - For each inactive user found, the code updates their `status` field to "offline" using the `updateMany` function.
   - The `$set` operator is used to modify the `status` field.

5. **Handle Errors and Results:**
   - The code includes error handling to log any issues encountered during the database update process.
   -  Success messages are logged indicating the number of users marked as offline.

**3. Scheduling the Task**

The `setInterval` function is used to schedule the `checkUserActivityStatus` function to run repeatedly. In this case, the task is scheduled to run every minute (60 * 1000 milliseconds). This ensures that user activity status is regularly updated based on the defined offline threshold. 
