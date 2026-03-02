import { useEffect, useRef, useState } from "react";


import React from "react";
import { Button, Flex ,message, Space,Select,InputNumber  } from 'antd';

export default function Home() {
  const [selectedTab, setSelectedTab] = useState<"chat" | "notify" | "playerdata">("chat");
  const [chatMessage, setChatMessage] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [status, setStatus] = useState("接続中...");
  const socketRef = useRef<WebSocket | null>(null);
  const [showChatError, setShowChatError] = useState(false);
  const [showNotifyError, setShowNotifyError] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [playerStatus, setPlayerStatus] = useState<{ name: string; skill:string; skill1:string; skill2:string;hp: string; maxhp: string; mp: string; maxmp: string; attack:string; defend:string; crit:string; critdmg:string; coins:string; exp:string; maxexp:string; level:string; hpreg:string; mpreg:string; skillpoint:string; } | null>(null);
  const [messageApi, contextHolder,] = message.useMessage();

  const listupdatecomplate = () => {
    messageApi.open({
      type: 'success',
      content: 'プレイヤーリストを更新しました。',
      duration:1
    });
  };
  const playerupdate = () => {
    messageApi.open({
      type: 'success',
      content: 'プレイヤー情報を更新しました。',
      duration:1
    });
  };
  const unconnecterror = () => {
    messageApi.open({
      type: 'error',
      content: 'WebSocketが接続されていません。',
      duration:3
    });
  };

  const send = (type: string, message: string) => {
    if (!message.trim()) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, message }));
    } else {
   
      unconnecterror()
    }
  };

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => setStatus("🟢 接続済み");
    socket.onclose = () => setStatus("🔴 未接続");
    socket.onerror = () => setStatus("🔴 エラー");

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "preset") {
          setChatMessage(data.message); // ← 初期値として反映
        }else if (data.type === "playerList") {
          setPlayers(data.players); // プレイヤー一覧取得
          const list = (data.players) as string[]
          if (list.length === 1) {
            send("getStatus", list[0]);
          }
          
        } else if (data.type == "playerStatus") {
          const s = data.status;
          const a = JSON.stringify(s)
          console.log(a)
        
          setPlayerStatus({
            name: s.name,
            skill: String(s.skill),
            skill1: String(s.skill1),
            skill2: String(s.skill2),
            hp: String(s.hp),
            maxhp: String(s.maxhp),
            mp: String(s.mp),
            maxmp: String(s.maxmp),
            attack: String(s.attack),
            defend: String(s.defend),
            crit: String(s.crit),
            critdmg: String(s.critdmg),
            coins: String(s.coins),
            exp: String(s.exp),
            maxexp: String(s.maxexp),
            level: String(s.level),
            hpreg: String(s.hpreg),
            mpreg: String(s.mpreg),
            skillpoint: String(s.skillpoint),
          });
        }
      } catch (e) {
        console.error("不正なデータ形式", e);
      }
    };

    return () => socket.close();
  }, [send]);

  return (

    
    <main className="min-h-screen bg-gray-100 p-8">
      {contextHolder}
      <div className="max-w-4xl mx-auto bg-white rounded-r-xl shadow-2xl flex overflow-hidden">
        {/* タブ */}
        <div className="min-h-100 w-48 rounded-l-md bg-gray-300 border-5 border-gray-500 border-rounded-l-md">

          <div className="p-2 text-center font-bold bg-sky-200  text-black border-b-4 border-gray-400">メニュー</div>
          <div
            className={`p-4 text-center cursor-pointer text-black border-b-2 ${selectedTab === "chat" ? "" : "transition hover:bg-gray-300"} ${
              selectedTab === "chat" ? "bg-white font-semibold " : ""
            }`}
            onClick={() => setSelectedTab("chat")}
          >チャット送信</div>
          <div
            className={`p-4 text-center cursor-pointer text-black border-b-2 ${selectedTab === "notify" ? "" : "transition hover:bg-gray-300"}  ${
              selectedTab === "notify" ? "bg-white font-semibold" : ""
            }`}
            onClick={() => setSelectedTab("notify")}
          >通知送信</div>

           <div
            className={`p-4 text-center cursor-pointer text-black border-b-2 ${selectedTab === "playerdata" ? "" : "transition hover:bg-gray-300"}  ${
              selectedTab === "playerdata" ? "bg-white font-semibold" : ""
            }`}
            onClick={() => {
              setSelectedTab("playerdata")
              send("getPlayerList", "")
              }}
          >プレイヤー情報編集</div>
        </div>

        {/* フォーム */}
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4 text-black">Minecraft WebSocket パネル</h1>
          <p className="text-sm mb-6 text-black">ステータス: {status}</p>

          {selectedTab === "chat" && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-black">チャットメッセージ送信</h2>
              <label className="block mb-1 text-black">チャット内容:</label>
              <input
                value={chatMessage}
                onChange={(e) => {
                  setChatMessage(e.target.value);
                  if (e.target.value.trim()) setShowChatError(false);
                }}
                className="w-full p-2 border rounded mb-1 text-black"
                placeholder="プレイヤーに表示されるメッセージ"
              />
              {showChatError && (
                <p className="text-red-500 text-sm mb-2">文字が入力されていません</p>
              )}
              <button
                className="transition bg-blue-500 hover:bg-blue-700 hover:cursor-pointer text-white px-4 py-2 rounded"
                onClick={() => {
                  if (!chatMessage.trim()) {
                    setShowChatError(true);
                    return;
                  }
                  send("chat", chatMessage);
                  setShowChatError(false);
                }}
              >
                チャット送信
              </button>
            </div>
          )}

          {selectedTab === "notify" && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-black">通知送信</h2>
              <label className="block mb-1 text-black">通知内容:</label>
              <input
                value={notificationMessage}
                onChange={(e) => {
                  setNotificationMessage(e.target.value);
                  if (e.target.value.trim()) setShowNotifyError(false);
                }}
                className="w-full p-2 border rounded mb-1 text-black"
                placeholder="タイトルバーやボスバーに表示"
              />
              {showNotifyError && (
                <p className="text-red-500 text-sm mb-2">文字が入力されていません</p>
              )}
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  if (!notificationMessage.trim()) {
                    setShowNotifyError(true);
                    return;
                  }
                  send("notify", notificationMessage);
                  setShowNotifyError(false);
                }}
              >
                通知送信
              </button>
            </div>
          )}

          {selectedTab === "playerdata" && (
             <div>
             <h2 className="text-xl font-semibold mb-4 text-black">プレイヤー情報</h2>
         
             
             <Flex gap="small" wrap>
              <Space>
             <label className="block mb-1 text-black">プレイヤーを選択:</label>
              <Select
                showSearch
                placeholder="プレイヤーを選択"
                optionFilterProp="label"
                onChange={ (value) => {
                  const playerName = value;
                  setSelectedPlayer(playerName);
                 
                  if (playerName) {
                    send("getStatus", playerName);
                    playerupdate()
                  }
                }}
                options={
                  players.map((name) => ({
                    value: name,
                    label: name
                  }))}
              />
              <Button 
                type="primary"
                onClick={() => {
              
                   send("getPlayerList", "hoge");
                   listupdatecomplate()
                }}>プレイヤーリスト更新
              </Button>
              </Space>
            </Flex>


         
            {playerStatus && (
              
              <div className="mt-4 text-black">
                <div className="flex items-center mb-2">
                <label className="block mb-1 p-1 w-40">名前 : {playerStatus.name}</label>
           

                  <Button type="primary" onClick={() => {
                  if (!selectedPlayer) return;
                  send("getStatus", selectedPlayer);
                  playerupdate()
               }}>プレイヤー情報更新</Button>
              </div>

                <div className="border-1"></div>
                <div className="p-1"></div>


                <Flex gap="small" wrap>
                  <Space>
                    <label className="w-15">スキル:</label>
                    <Select
                      showSearch
                      placeholder="スキル選択"
                      optionFilterProp="label"
                      className="min-w-30"
                      onChange={(value) => setPlayerStatus({ ...playerStatus, skill: String(value) }) }
                      value={playerStatus.skill}
                      options={[
                        {
                          value: 'FIGHTER',
                          label: 'Fighter',
                        },
                        {
                          value: 'MAGICIAN',
                          label: 'Magician',
                        },
                        {
                          value: 'PYRO',
                          label: 'Pyro',
                        },
                      ]}
                    />
                    <label>スキル1レベル :</label>
                    <InputNumber changeOnWheel min={0} max={10} value={Number(playerStatus.skill1)} onChange={(value) => setPlayerStatus({ ...playerStatus, skill1: String(value) }) } />
              
                  
                    <label>スキル2レベル :</label>
                    <InputNumber changeOnWheel min={0} max={10} value={Number(playerStatus.skill2)} onChange={(value) => setPlayerStatus({ ...playerStatus, skill2: String(value) })} />
            

                  </Space>
                </Flex>

                <div className="p-1"></div>
                <div className="border-1"></div>
                <div className="p-1"></div>


              <div className="flex items-center mb-2">
                <label className="w-30">HP : </label>
                <InputNumber size="large" max={Number(playerStatus.maxhp)} changeOnWheel value={Number(playerStatus.hp)} onChange={(value) => setPlayerStatus({ ...playerStatus, hp: String(value) })} />
          
                <div className="w-20"></div>
                <label className="w-30">最大HP :</label>
                <InputNumber size="large" changeOnWheel value={Number(playerStatus.maxhp)} onChange={(value) => setPlayerStatus({ ...playerStatus, maxhp: String(value) })} />
              </div>

              <div className="flex items-center mb-2">
                <label className="w-30">マナ : </label>
                <InputNumber size="large" changeOnWheel value={Number(playerStatus.mp)} onChange={(value) => setPlayerStatus({ ...playerStatus, mp: String(value) })} />
        
                <div className="w-20"></div>

                <label className="w-30">最大マナ :</label>
                <InputNumber size="large" changeOnWheel value={Number(playerStatus.maxmp)} onChange={(value) => setPlayerStatus({ ...playerStatus, maxmp: String(value) })} />
        
              </div>

              <div className="flex items-center mb-2">
                <label className="w-30">攻撃力 : </label>
                <InputNumber size="large" changeOnWheel value={Number(playerStatus.attack)} onChange={(value) => setPlayerStatus({ ...playerStatus, attack: String(value) })} />
      
                <div className="w-20"></div>
                <label className="w-30">防御力 :</label>
                <InputNumber size="large" changeOnWheel value={Number(playerStatus.defend)} onChange={(value) => setPlayerStatus({ ...playerStatus, defend: String(value) })} />
       
              </div>

              <div className="flex items-center mb-2">
                <label className="w-30">会心率 : </label>
          
                <InputNumber size="large" changeOnWheel formatter={(value) => `${value}%`} parser={(value) => value?.replace('%', '') as unknown as number} value={Number(playerStatus.crit)} onChange={(value) => setPlayerStatus({ ...playerStatus, crit: String(value) })} />
        
                <div className="w-20"></div>
                <label className="w-30">会心ダメージ :</label>
                <InputNumber size="large" changeOnWheel formatter={(value) => `${value}%`} parser={(value) => value?.replace('%', '') as unknown as number} value={Number(playerStatus.critdmg)} onChange={(value) => setPlayerStatus({ ...playerStatus, critdmg: String(value) })} />
         
              </div>

              <div className="flex items-center mb-2">
                <label className="w-30">コイン : </label>
                <InputNumber size="large" changeOnWheel value={Number(playerStatus.coins)} onChange={(value) => setPlayerStatus({ ...playerStatus, coins: String(value) })} />
  
                <div className="w-20"></div>
                <label className="w-30">レベル :</label>
                <InputNumber size="large" changeOnWheel value={Number(playerStatus.level)} onChange={(value) => setPlayerStatus({ ...playerStatus, level: String(value) })} />
              </div>

              
              <div className="flex items-center mb-2">
                <label className="w-30">経験値 : </label>
                <InputNumber size="large" min={0}  changeOnWheel  value={Number(playerStatus.exp)} onChange={(value) => setPlayerStatus({ ...playerStatus, exp: String(value) })} />
                <div className="w-20"></div>

                <label className="w-30">必要経験値 :</label>
                <InputNumber size="large" min={0}  changeOnWheel  value={Number(playerStatus.maxexp)} onChange={(value) => setPlayerStatus({ ...playerStatus, maxexp: String(value) })} />
       
              </div>

              
              <div className="flex items-center mb-2">
                <label className="w-30">体力回復 : </label>
                <InputNumber size="large" min={0} changeOnWheel formatter={(value) => `${value} HP/s`} parser={(value) => value?.replace('HP/s', '') as unknown as number}  value={Number(playerStatus.hpreg)} onChange={(value) => setPlayerStatus({ ...playerStatus, hpreg: String(value) })} />
                <div className="w-20"></div>

                <label className="w-30">マナ回復 :</label>
                <InputNumber size="large" min={0} changeOnWheel formatter={(value) => `${value} Pt/s`} parser={(value) => value?.replace('Pt/s', '') as unknown as number} value={Number(playerStatus.mpreg)} onChange={(value) => setPlayerStatus({ ...playerStatus, mpreg: String(value) })} />
        
              </div>
              <div className="p-2"></div>
              <div className="border-1"></div>
              <div className="p-2"></div>
              <div className="flex items-center mb-2">
                <label className="w-40">スキルポイント : </label>
                <InputNumber size="large" min={0}  changeOnWheel  value={Number(playerStatus.skillpoint)} onChange={(value) => setPlayerStatus({ ...playerStatus, skillpoint: String(value) })} />
              </div>

        

                <button
                  onClick={() => {
                    send("setStatus", JSON.stringify({
                      name: playerStatus.name,
                      skill: (playerStatus.skill),
                      skill1: (playerStatus.skill1),
                      skill2: (playerStatus.skill2),
                      hp: Number(playerStatus.hp),
                      maxhp: Number(playerStatus.maxhp),
                      mp: Number(playerStatus.mp),
                      maxmp: Number(playerStatus.maxmp),
                      attack: Number(playerStatus.attack),
                      defend: Number(playerStatus.defend),
                      crit: Number(playerStatus.crit),
                      critdmg: Number(playerStatus.critdmg),
                      coins: Number(playerStatus.coins),
                      exp: Number(playerStatus.exp),
                      maxexp: Number(playerStatus.maxexp),
                      level: Number(playerStatus.level),
                      hpreg: Number(playerStatus.hpreg),
                      mpreg: Number(playerStatus.mpreg),
                      skillpoint: Number(playerStatus.skillpoint),
                    }));
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  保存
                </button>
              </div>
            )}
           </div>
          )}
        </div>
      </div>
    </main>
  );
}
