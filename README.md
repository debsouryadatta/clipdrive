# ClipDrive

<div align="center">
<a href="https://github.com/debsouryadatta/clipdrive">
    <img src="https://res.cloudinary.com/diyxwdtjd/image/upload/v1747302557/projects/clipdrive2.png" alt="Logo" width="800" height="500">
  </a>
</div>

<div align="center">
  <h3>Your videos. Anywhere. Anytime.</h3>

  <p align="center">
    An elegant platform for uploading, storing, and sharing your videos with complete control over privacy and access.
    <br />
    <a href="https://clipdrive.vercel.app">View Live Site</a>
    ·
    <a href="https://github.com/debsouryadatta/clipdrive/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/debsouryadatta/clipdrive/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

## About The Project

ClipDrive is a modern video management platform that allows users to upload, store, and share videos with granular privacy controls. Built with a focus on user experience and performance, ClipDrive makes it easy to manage and share your video content from anywhere, at any time.

## Features

- **Easy Upload**: Drag and drop your videos for quick and simple uploading
- **Instant Sharing**: Generate shareable links with just one click
- **Privacy Controls**: Choose between public and private sharing options
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes for comfortable viewing
- **Secure Authentication**: User account protection with Clerk authentication
- **Video Storage**: Reliable storage for your video content
- **Dashboard Interface**: User-friendly dashboard to manage all your videos
- **Real-time Updates**: Immediate feedback on upload progress and sharing status

### Built With

- [Next.js](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Programming Language
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Shadcn UI](https://ui.shadcn.com/) - UI Components
- [Clerk](https://clerk.com/) - Authentication
- [Prisma](https://www.prisma.io/) - Database ORM
- [React Dropzone](https://react-dropzone.js.org/) - File Upload
- [ImageKit](https://imagekit.io/) - Media Management
- [Tanstack React Query](https://tanstack.com/query/latest) - Data Fetching
- [Sonner](https://sonner.emilkowal.ski/) - Toast Notifications
- [Lucide React](https://lucide.dev/) - Icon Library
- [Next Themes](https://github.com/pacocoursey/next-themes) - Theme Management

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Git
* Node.js (v18 or higher)
* npm or pnpm (Node Package Manager)

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/debsouryadatta/clipdrive.git
   ```
2. Install NPM packages
   ```sh
   npm install
   # or
   pnpm install
   ```
3. Create a `.env.local` file and add your API keys
   ```sh
   DATABASE_URL=your_database_url
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Start the development server
   ```sh
   npm run dev
   # or
   pnpm dev
   ```

## Usage

1. Sign up for a ClipDrive account
2. Navigate to your dashboard
3. Upload videos using the upload button
4. Manage your videos in the videos tab
5. Share videos with others using the share option
6. Track shared links in the shared links tab
7. Toggle between light and dark modes for comfortable viewing

## Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Contact

Debsourya Datta - Twitter [@debsourya005](https://twitter.com/debsourya005) | Email [debsouryadatta@gmail.com](mailto:debsouryadatta@gmail.com)

Project Link: [https://github.com/debsouryadatta/clipdrive](https://github.com/debsouryadatta/clipdrive)
