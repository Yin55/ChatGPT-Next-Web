/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { getBuildConfig } from "./config/build";
// import { useAccessStore } from "./store";

const buildConfig = getBuildConfig();

export const metadata = {
  title: "ChatGPT ｜ 教师测评团队",
  description: "Your personal ChatGPT Chat Bot.",
  appleWebApp: {
    title: "ChatGPT Next Web",
    statusBarStyle: "default",
  },
  themeColor: "#fafafa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const accessStore = useAccessStore();
  // accessStore.updateCode("");
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta
          name="theme-color"
          content="#151515"
          media="(prefers-color-scheme: dark)"
        />
        <meta name="version" content={buildConfig.commitId} />
        <link rel="icon" href="/favicon2.ico" />
        <link rel="manifest" href="/site.webmanifest"></link>
        <link rel="preconnect" href="https://fonts.proxy.ustclug.org"></link>
        <link
          href="https://fonts.proxy.ustclug.org/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap"
          rel="stylesheet"
        ></link>
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
