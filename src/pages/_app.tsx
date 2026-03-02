import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ConfigProvider } from 'antd';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: 'Bahnschrift, Meirio', // Ant Design の全体フォント
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}