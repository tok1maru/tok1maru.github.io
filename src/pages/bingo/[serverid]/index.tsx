import { useEffect, useRef, useState } from "react";
import React from "react";
import { useRouter } from 'next/router';
import Image from 'next/image'

import {
  Button,
  Flex,
  message,
  Space,
  Select,
  InputNumber,
  Layout,
  Menu,
  theme,
  notification,
  Segmented,
  Typography,
  Badge,
  Spin,
  Divider,
  Modal,
  Alert,
  Switch,
  ConfigProvider,
  Drawer,
  Tooltip
} from 'antd';
import type { DrawerProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  BorderBottomOutlined,
  BorderTopOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  LoadingOutlined,
  SettingOutlined,
  QuestionOutlined,

} from '@ant-design/icons';
const { Text, Link, Title } = Typography;

// --- BingoCardItem と BingoCardData の型定義はそのまま ---
interface BingoCardItem {
  id: string; // 元のID (例: item.minecraft.golden_shovel)
  name: string; // 表示名 (例: Golden Shovel)
  iconPath: string; // アイコンの相対パス (例: items/minecraft_golden_shovel.png)
}

type BingoCardData = BingoCardItem[][];
// --- 型定義ここまで ---


export default function Home() {
  const [selectedTab, setSelectedTab] = useState("gamesetting");
  const [status, setStatus] = useState("connecting");
  const socketRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [porterror, setporterror] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // --- bingolist と cardsize を状態として管理する ---
  const [bingoList, setBingoList] = useState<BingoCardData>([]);
  const [cardSize, setCardSize] = useState<number>(0); // 初期サイズは0または適切な値に
  // --- 状態管理ここまで ---

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { Header, Sider, Content } = Layout;
  const [api, contextHolder2] = notification.useNotification();


  const router = useRouter();
  const query = router.query
  const serverport = query.serverid

  // --- アイテムIDをパースするヘルパー関数はそのまま ---
  const parseItemId = (fullId: string): BingoCardItem => {
    const parts = fullId.split('.');
    const baseName = parts[parts.length - 1];
    const iconFileName = baseName.toLowerCase();
    const iconPath = `items/minecraft_${iconFileName}.png`;
    const displayName = baseName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    return {
      id: fullId,
      name: displayName,
      iconPath: iconPath,
    };
  };


  useEffect(() => {


         let reconnectTimeout: NodeJS.Timeout | null = null;
  
         
    let intervalId: NodeJS.Timeout | null = null; // setIntervalのIDを保持する変数

      const connectWebSocket = () => {
    if (typeof serverport === 'string') {
      if (1 <= Number(serverport) && Number(serverport) <= 65535) {
        const socket = new WebSocket(`ws://ypanel.nyahost.com:${serverport}`);
        socketRef.current = socket;

        socket.onopen = () => {
          setStatus("open");
          setConnected(true);
          console.log("WebSocket接続が開きました。");

          // 接続が開いたら、5秒ごとに情報を更新するタイマーを開始
          // send関数をラップして、useEffectの依存配列に含めないようにする
          const requestBingoData = () => {
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.send(JSON.stringify({ type: "getbingodata", message: "request" }));
          
            }
          };
          intervalId = setInterval(requestBingoData, 3000); // 5000ms = 5秒
        };

        socket.onclose = () => {
          setStatus("close");
          setConnected(false);
          console.log("WebSocket接続が閉じました。");
          if (intervalId) {
            clearInterval(intervalId); // 接続が閉じたらタイマーを停止
            intervalId = null;
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };
        socket.onerror = (error) => {
          setStatus("error");
          setConnected(false);
          console.error("WebSocketエラー:", error);
          if (intervalId) {
            clearInterval(intervalId); // エラー発生時もタイマーを停止
            intervalId = null;
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log("WebSocket受信データ:", data);

            if (data.type === "bingolist") {
              const receivedRawBingoData: string[][] = data.data;

              const parsedBingoCard: BingoCardData = receivedRawBingoData.map(row =>
                row.map(id => parseItemId(id))
              );

              setBingoList(parsedBingoCard);
              setCardSize(parsedBingoCard.length > 0 ? parsedBingoCard.length : 0);
              console.log("更新されたビンゴリスト:", parsedBingoCard);
            }
          } catch (e) {
            console.error("不正なデータ形式または処理エラー:", e);
          }
        };

        // コンポーネントのアンマウント時にWebSocketとタイマーをクリーンアップ
        return () => {
          if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.close();
          }
          if (intervalId) {
            clearInterval(intervalId);
          }
        };
      }else{
        setporterror(true)
        setStatus("error")
      }
    }
  }
      connectWebSocket();

  return () => {
    if (socketRef.current) socketRef.current.close();
    if (reconnectTimeout) clearTimeout(reconnectTimeout);
  };
  }, [serverport]);

  // send関数は引き続き存在しますが、useEffect内で直接使用しないように調整しました
  const send = (type: string, message: string) => {
    if (!message.trim()) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, message }));
    }
  };

  return (
    <main style={{
      
    }}>
        <Layout style={{
            width: 'fit-content',
            maxWidth: '550px',
            height: 'fit-content',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#B5A68E',
        }}>
                <Content
                    style={{
                        margin: '0px',
                        padding: '0px',
                        minHeight: 0,
                        background: '#B5A68E',
                        borderRadius: '0px',
                    }}
                >
                    <div className="flex-1 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div
                            style={{
                                display: 'grid',
                                gap: '2px',
                                padding: '8px',
                                backgroundColor: '#B5A68E',
                                borderRadius: '0px',
                                boxShadow: '0 0 0px rgba(0, 0, 0, 0)',
                                gridTemplateColumns: `repeat(${cardSize}, 1fr)`,
                                gridTemplateRows: `repeat(${cardSize}, 1fr)`,
                                width: 'fit-content',
                                height: 'fit-content',
                            }}
                        >
                            {bingoList.length === 0 ? (
                                <div style={{
                                    gridColumn: `span ${cardSize > 0 ? cardSize : 1}`,
                                    gridRow: `span ${cardSize > 0 ? cardSize : 1}`,
                                    textAlign: 'center',
                                    padding: '15px',
                                    backgroundColor: '#C5B79F',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: '#4A4A4A',
                                    width: '100%',
                                    height: '100%',
                                    
                                }}>
                                    <p>ビンゴカードデータを受信していません。</p>
                                    <p>更新されるまでしばらくお待ちください。</p>
                                    <div className={`text-sm font-medium ${porterror ? "text-red-400":"text-black"}`}>ServerPort:  {String(serverport)} | Status: <Space size={3}>
                                                    {status === "connecting"&&(<div><Spin indicator={<LoadingOutlined spin />} size="small"/>
                                                  <label>  接続中...</label></div>)}
                                                    {status === "open"&&(<Badge status="success" text="接続済み"/>)}
                                                    {status === "close"&&(<Space><Badge status="error" text="未接続"/></Space>)}
                                                    {status === "error"&&(<Space><Badge status="error" text="エラー"/></Space>)}</Space></div>
                                </div>
                            ) : (
                                bingoList.map((row, rowIndex) => (
                                    row.map((item, colIndex) => (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                borderLeft: colIndex === 0 ? 'none' : '3px solid #9c8f79ff',
                                                borderTop: rowIndex === 0 ? 'none' : '3px solid #9C8F79',
                                                borderRight: colIndex === cardSize -1 ? 'none' : '3px solid #9C8F79',
                                                borderBottom: rowIndex === cardSize - 1 ? 'none' : '3px solid #9C8F79',
                                                boxSizing: 'content-box',
                                                backgroundColor: '#C5B79F',
                                                borderRadius: '0px',
                                                fontSize: '0.9em',
                                                textAlign: 'center',
                                                color: '#4A4A4A'
                                            }}
                                        >
                                            <Image
                                                src={`/${item.iconPath}`}
                                                alt={item.name}
                                                width={85}
                                                height={85}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).onerror = null;
                                                    (e.target as HTMLImageElement).src = '/icons/missing.png';
                                                    console.warn(`Icon not found for: ${item.iconPath}. Using default.`);
                                                }}
                                                style={{ marginBottom: '0px' }}
                                            />
                                            {/* <span>{item.name}</span> */}
                                        </div>
                                    ))
                                ))
                            )}
                        </div>
                    </div>
      
                </Content>
        </Layout>
    </main>
  );
}