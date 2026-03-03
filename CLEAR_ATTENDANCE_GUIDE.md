# Clear Attendance Guide

This guide explains how to use the `clear-attendance.ts` script to remove all attendance logs and sessions for the **Lean Startup Methodology (CS-FRELEAN)** class.

## Purpose
Use this script when you want to reset the testing data for the CS-FRELEAN class without affecting other classes or re-seeding the entire database.

## Prerequisites
- Ensure you are in the project root directory (`C:\visitrack`).
- Ensure dependencies are installed (`npm install`).

## How to Run

Run the following command in your terminal:

```bash
npx ts-node clear-attendance.ts
```

## What the Script Does
1.  **Finds the Class:** Locates the class with the code `CS-FRELEAN`.
2.  **Deletes Attendance Records:** Removes all individual student attendance logs linked to that class.
3.  **Deletes Sessions:** Removes the session entries (dates and locations) for that class.

## Verification
After running the script, log in as the instructor (Juan Dela Cruz) or check the Admin dashboard. The attendance logs for the CS-FRELEAN class should be empty.
