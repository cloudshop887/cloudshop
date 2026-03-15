import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PushNotificationManager from "@/components/PushNotificationManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CommunityAlert | Real-Time Society Board",
  description: "Live digital notice board for lost and found, jobs, offers, and emergencies.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230EA5E9"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grayscale-0`}
      >
        {children}
        <PushNotificationManager />
      </body>
    </html>
  );
}

