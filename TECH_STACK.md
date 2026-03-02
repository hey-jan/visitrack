# Technical Stack: VisiTrack

This document outlines the core technologies and architectural choices powering the VisiTrack attendance system.

## 1. Core Frameworks
- **[Next.js 16.1.1 (App Router)](https://nextjs.org/)**: The foundation of the application, providing server-side rendering, efficient routing, and a modern developer experience using the App Router architecture.
- **[React 19](https://react.dev/)**: Used for building a highly interactive and responsive user interface.
- **[TypeScript](https://www.typescriptlang.org/)**: Ensures type safety across the entire codebase, reducing runtime errors and improving maintainability.

## 2. UI & Styling
- **[Tailwind CSS v4](https://tailwindcss.com/)**: Employed for utility-first styling. The project adheres to a strict **Modern Monochrome Minimalist** (Swiss-Inspired) aesthetic as defined in `GEMINI.md`.
- **[React Icons](https://react-icons.github.io/react-icons/)**: A comprehensive library for high-quality, scalable icons.
- **[React Webcam](https://www.npmjs.com/package/react-webcam)**: Integrated for real-time video streaming and image capture for facial recognition workflows.

## 3. Data & Persistence
- **[Prisma ORM](https://www.prisma.io/)**: Used as the primary data access layer, providing a type-safe API for database operations.
- **[SQLite](https://www.sqlite.org/)**: A lightweight, file-based relational database used for storing student records, class schedules, and attendance logs.
- **Local File Storage**: Custom storage logic for handling facial snapshots and profile images (located in `public/uploads/`).

## 4. Facial Recognition Service
- **[InsightFace](https://github.com/deepinsight/insightface)**: A high-performance Python-based service (located in `face-recognition/`) that handles face detection and embedding generation.
- **ONNX Runtime**: Utilized for efficient model inference (Buffalo_L model) within the Python backend.
- **FastAPI / Flask (Internal)**: Typically used to expose the facial recognition logic as an internal API endpoint.

## 5. Utilities & Tools
- **[Slugify](https://www.npmjs.com/package/slugify)**: For generating URL-friendly slugs for classes and entities.
- **[Bcrypt](https://www.npmjs.com/package/bcrypt)**: For secure hashing of administrative and instructor credentials.
- **[xlsx](https://www.npmjs.com/package/xlsx)**: For exporting attendance reports and data processing.
- **[jsPDF](https://github.com/parallax/jsPDF)**: For generating professional attendance reports in PDF format.
