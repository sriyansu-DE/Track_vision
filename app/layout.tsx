import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Track Vision | Live Robotics Racing', description: 'Live robotics competition monitoring and timing platform' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
