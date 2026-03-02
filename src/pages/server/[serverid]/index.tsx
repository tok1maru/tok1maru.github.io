import { useEffect, useRef, useState } from "react";
import React from "react";
import { useRouter } from 'next/router';


import { 
  Button,
  Flex ,
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
const { Text, Link ,Title} = Typography;


export default function Home() {
  const [selectedTab, setSelectedTab] = useState("gamesetting");
  const [status, setStatus] = useState("connecting");
  const socketRef = useRef<WebSocket | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [playerStatus, setPlayerStatus] = useState<{ name: string; skill1type:string; skill2type:string; skill1level:string;skill2level:string;hp: string; maxhp: string; mp: string; maxmp: string; attack:string; defend:string; crit:string; critdmg:string; coins:string; exp:string; maxexp:string; level:string; hpreg:string; mpreg:string; skillpoint:string; } | null>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [connected, setConnected] = useState(false);
  const [porterror, setporterror] = useState(false);
  const [collapsed, setCollapsed] = useState(false);



  const [difficulty,setdifficulty] = useState("normal")
  const [spawninterval,setspawninterval] = useState(5)
  const [spawnamount,setspawnamount] = useState(2)
  const [enemylevel,setenemylevel] = useState(0)

  const [showbossbar,setshowbossbar] = useState(true)
  const [showhp,setshowhp] = useState(false)
  const [showdamagedisplay,setshowdamagedisplay] = useState(true)

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const { Header, Sider, Content } = Layout;
  const [api, contextHolder2] = notification.useNotification();


  const router = useRouter();
  const query = router.query
  const serverport = query.serverid


  const [open, setOpen] = useState(false);
    const [size, setSize] = useState<DrawerProps['size']>();

  const showDrawer = () => {
    setSize('large');
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  const unconnecterror = () => {
    api.error({
      message: `エラー`,
      description:
        'Websocketが接続されていません。',
      placement:"top",
      showProgress: true,
      pauseOnHover: false,
      duration: 3,
    });
  };

  const listupdatecomplate = () => {
    if(connected){
    messageApi.open({
      type: 'success',
      content: 'プレイヤーリストを更新しました。',
      duration:1
    });
    }else{
      unconnecterror()
    }
  };
  const playerupdate = () => {
    if(connected){
    messageApi.open({
      type: 'success',
      content: 'プレイヤー情報を更新しました。',
      duration:1
    });
    }else{
      unconnecterror()
    }
  };
    const changeplayerdata = () => {
    if(connected){
    messageApi.open({
      type: 'success',
      content: 'プレイヤー情報を変更しました。',
      duration:1
    });
    }else{
      unconnecterror()
    }
  };
  const changegamedata = () => {
    if(connected){
    messageApi.open({
      type: 'success',
      content: 'ゲーム設定を変更しました。',
      duration:1
    });
    }else{
      unconnecterror()
    }
  }

  useEffect(() => {

     let reconnectTimeout: NodeJS.Timeout | null = null;

     
  const connectWebSocket = () => {
    if (typeof serverport === 'string') {
      if(1 <= Number(serverport) && Number(serverport) <= 65535 ){
        const socket = new WebSocket(`ws://ypanel.nyahost.com:${serverport}`);
        socketRef.current = socket;

        socket.onopen = () => {
          setStatus("open");
          setConnected(true);
        };
        socket.onclose = () => {
          setStatus("close");
          setConnected(false);
          // 再接続処理
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };
        socket.onerror = () => {
          setStatus("error");
          setConnected(false);
          // 再接続処理
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        };
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log(data)
            if (data.type === "playerList") {
              setPlayers(data.players); // プレイヤー一覧取得
              const list = (data.players) as string[]
              if (list.length === 1) {
                send("getStatus", list[0]);
                setSelectedPlayer(list[0])
              }
              
            } else if (data.type == "playerStatus") {
              const s = data.status;
              const a = JSON.stringify(s)
              console.log(a)
            
              setPlayerStatus({
                name: s.name,
                skill1type: String(s.skill1type),
                skill2type: String(s.skill2type),
                skill1level: String(s.skill1level),
                skill2level: String(s.skill2level),
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
            }else if (data.type == "gamedata"){
              setdifficulty(data.difficulty)
              setspawninterval(data.spawninterval)
              setspawnamount(data.spawnamount)
              setenemylevel(data.enemylevel)
            }
          } catch (e) {
            console.error("不正なデータ形式", e);
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

  const send = (type: string, message: string) => {
    if (!message.trim()) return;
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, message }));
    }
  };

  return (
    
    <main className="min-h-screen bg-gray-300 p-8">
      {contextHolder}
      {contextHolder2}
      <div className="max-w-250 mx-auto bg-white rounded-4xl shadow-2xl flex overflow-hidden">
      <Layout>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical min-h-2"/>
        {/* <div className="text-white text-center text-4xl" >aaaeea</div> */}
        <div className="mt-3 h-10 ml-7 mr-5 mb-3 bg-gray-300 rounded-4xl"/>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['gamesetting']}
          items={[
            {
              key: 'gamesetting',
              icon: <SettingOutlined />,
              label: 'ゲーム設定',
            },
            {
              key: 'playerdata',
              icon: <UserOutlined />,
              label: 'プレイヤー情報編集',
            },
          ]}
          onClick={(value)=>{
            setSelectedTab(value.key)
            }
          }
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Flex>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '22px',
              width: 64,
              height: 64,
            }}
          />
      
          <div className="mt-1 ml-5 text-black text-center text-2xl font-bold" >PvE 操作 パネル
          <Flex align="center"><div className={`text-sm ml-3 mb-6 font-medium ${porterror ? "text-red-400":"text-black"}`}>ServerPort:  {String(serverport)} | Status: <Space size={3}>
                {status === "connecting"&&(<div><Spin indicator={<LoadingOutlined spin />} size="small"/>
              <label>  接続中...</label></div>)}
                {status === "open"&&(<Badge status="success" text="接続中"/>)}
                {status === "close"&&(<Space><Badge status="error" text="未接続"/></Space>)}
                {status === "error"&&(<Space><Badge status="error" text="エラー"/></Space>)}
          </Space></div></Flex></div>
                    
          </Flex>
          {porterror && (
            <Alert
            message="エラー"
            description="ポート番号が無効です。1 ~ 65535 の間で指定してください。"
            type="error"
            showIcon/>
          )}
           
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 48,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 30,
          }}
        >
          <div className="flex-1">
        
          
          {selectedTab === "gamesetting" && (
            <div>
              <Drawer
        title="使い方"
        size="large"
        closable={{ 'aria-label': 'Close Button' }}
        onClose={onClose}
        open={open}
      >
        <p>ここではゲームの設定を変更することができます。</p>
        <br />
        <br />

        <p>ゲーム設定</p>
        <hr />
        <p>難易度選択 ･･･ 敵モブの強さ、挙動が変化します。</p>
        <br />
        <p>画面上部の情報の表示 ･･･ 画面上部の情報を表示するか設定します。</p>
        <p>敵モブの体力の表示 ･･･ 敵モブの名前の部分に体力が表示するか設定します。</p>
        <p>戦闘ダメージの表示 ･･･ 敵モブを攻撃したときに与えたダメージを表示するか設定します。</p>
    <br />
    <br />
    <br />
         <p>敵モブ設定</p>
        <hr />
        <p>自然スポーン間隔 ･･･ 指定された秒数ごとに敵モブがスポーンします。</p>
        <p>自然スポーン数 ･･･ スポーンする敵モブの数を設定します。( 0 にすると自然スポーンを無効化します。)</p>
        <br />
        <br />
        <br />
        <p> 保存を押すと設定が反映されます。</p>
      </Drawer>
        <Flex gap={"small"} align= "right">
            <Title level={4}>ゲーム設定</Title>
            <div className="mx-auto"></div>
          
        <Button color="cyan" variant="solid" shape="round" icon={<QuestionOutlined />} onClick={showDrawer} size="middle">使い方</Button></Flex>
      
            <Flex gap={"small"} align="center">
              
              <label className="text-l">難易度選択:</label>
              <Segmented<string>
                options={[
                        {
                          value: 'easy',
                          label: 'イージー',
                        },
                        {
                          value: 'normal',
                          label: 'ノーマル',
                        },
                        {
                          value: 'hard',
                          label: 'ハード',
                        },
                      ]}
                value= {difficulty}
                onChange={(value) => {
                  setdifficulty(value)
                }}
              />
            </Flex> 
            <label className="p-2"/>
            <Flex gap={"small"} align="left">
              <label className="text-l">画面上部の情報の表示:</label>
              <Switch value={showbossbar} onChange={(value)=>{setshowbossbar(value)}} />
              <label className="text-l">敵モブの体力の表示:</label>
              <Switch value={showhp} onChange={(value)=>{setshowhp(value)}} />
              <label className="text-l">戦闘ダメージの表示:</label>
              <Switch value={showdamagedisplay} onChange={(value)=>{setshowdamagedisplay(value)}} />
            </Flex>
           
              <Divider style={{borderColor:"#000000"}}/>
              <Title level={4}>敵モブ設定</Title>
              <Flex align="center">
                <Space>
                  <label className="w-30 br-3">自然スポーン間隔 : </label>
                  <InputNumber min={1} size="large" changeOnWheel formatter={(value) => `${value} 秒`} parser={(value) => value?.replace('秒', '') as unknown as number} value={Number(spawninterval)} onChange={(value) => setspawninterval(Number(value))} />
                  <div className="w-10"></div>
                  <label className="w-30">自然スポーン数 :</label>
                  <InputNumber min={0} size="large" changeOnWheel formatter={(value) => `${value} 体`} parser={(value) => value?.replace('体', '') as unknown as number} value={Number(spawnamount)} onChange={(value) => setspawnamount(Number(value))} />
                    </Space>
             
              </Flex>
              <Flex align="center">
                <Space>
                  <div className="w-10"></div>
                  <label className="w-30">ステータス強化レベル :</label>
                  <InputNumber min={0} size="large" changeOnWheel value={Number(enemylevel)} onChange={(value) => setenemylevel(Number(value))} />
                </Space>
              </Flex>
              <button
                  onClick={() => {
                    send("setgamesetting", JSON.stringify({
                      difficulty: (difficulty),
                      spawninterval: Number(spawninterval),
                      spawnamount: Number(spawnamount),
                      showbossbar:(showbossbar),
                      showdamagedisplay:(showdamagedisplay),
                      showhp:(showhp),
                      enemylevel:(enemylevel),
                    }));
                    changegamedata()
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  保存
                </button>
            </div>


   
          )}

          {selectedTab === "playerdata" && (
             <div>
                     <Drawer
        title="使い方"
        size="large"
        closable={{ 'aria-label': 'Close Button' }}
        onClose={onClose}
        open={open}
      >
        
        
        <p>ここではプレイヤーの情報を書き換えることができます。</p>
        <br />

        使い方
        <hr />
        <p>プレイヤーリスト更新 ･･･ 現在サーバーにいるプレイヤーを取得します。</p>
        <p>プレイヤーを選択 ･･･ 取得したプレイヤーの中からプレイヤーを選択できます。</p>
       
        <p>プレイヤー情報更新 ･･･ 選択したプレイヤーの現在の情報を取得できます。</p>

        <br />
        <br />
        <br />
        <br />
        <p>プレイヤー情報一覧</p>
        <hr />
        <p>スキル ･･･ プレイヤーのスキルを指定します。</p>
        <p>スキル 1,2 レベル ･･･ スキルのレベルを指定できます。</p>
        <p>HP ･･･ 現在の体力を指定します。</p>
        <p>最大HP ･･･ 最大体力を指定します。</p>
        <p>マナ ･･･ 現在のマナを指定します。 </p>
        <p>最大マナ ･･･ 最大マナを指定します。</p>
        <p>攻撃力 ･･･ 攻撃力を指定します。</p>
        <p>防御力 ･･･ 防御力を指定します。</p>
        <p>会心率 ･･･ 会心率を指定します。</p>
        <p>会心ダメージ ･･･ 会心ダメージを指定します。</p>
        <p>コイン ･･･ 現在所持しているコインの数を指定します。</p>
        <p>レベル ･･･ 現在のレベルを指定します。</p>
        <p>経験値 ･･･ 現在の経験値を指定します。</p>
        <p>必要経験値  ･･･ 次のレベルに必要な経験値を指定します。</p>
        <p>体力回復 ･･･ 1秒ごとに回復する体力の量を指定します。</p>
        <p>マナ回復 ･･･ 1秒ごとに回復するマナの量を指定します。</p>
          <br />
        <p>スキルポイント ･･･ ショップで使用できるスキルポイントを指定します。</p>
      <br />
      <br />
        <hr />
        <p> 保存を押すと設定が反映されます。</p>
      </Drawer>
            <Flex gap={"small"}>
             <h2 className="text-xl font-semibold mb-4 text-black">プレイヤー情報</h2>
             <div className="mx-auto"></div>
                           <Button color="cyan" variant="solid" shape="round" icon={<QuestionOutlined />} onClick={showDrawer} size="middle">使い方</Button>
             </Flex>
             <Flex gap="small" wrap>
              
              <Space>
                
             <label className="block mb-1 text-black">プレイヤーを選択:</label>

      
              <Select
                showSearch
                placeholder="プレイヤーを選択"
                value={ selectedPlayer ? selectedPlayer : null }
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

 <div className="flex items-center mb-2">
              
                  <Space>
                    <label className="w-15">スキル1:</label>
                    <Select
                      showSearch
                      placeholder="スキル1選択"
                      optionFilterProp="label"
                      className="min-w-30"
                      onChange={(value) => setPlayerStatus({ ...playerStatus, skill1type: String(value) }) }
                      value={playerStatus.skill1type}
                      options={[
                        {
                          value: 'Fighter',
                          label: 'Fighter',
                        },
                        {
                          value: 'Magician',
                          label: 'Magician',
                        },
                        {
                          value: 'Pyro',
                          label: 'Pyro',
                        },
                        {
                          value: 'Sand',
                          label: 'Sand',
                        },
                      ]}
                    />
                      <div className="w-20"></div>
                    <label className="w-15">スキル2:</label>
                     <Select
                      showSearch
                      placeholder="スキル2選択"
                      optionFilterProp="label"
                      className="min-w-30"
                      onChange={(value) => setPlayerStatus({ ...playerStatus, skill2type: String(value) }) }
                      value={playerStatus.skill2type}
                      options={[
                        {
                          value: 'Fighter',
                          label: 'Fighter',
                        },
                        {
                          value: 'Magician',
                          label: 'Magician',
                        },
                        {
                          value: 'Pyro',
                          label: 'Pyro',
                        },
                        {
                          value: 'Sand',
                          label: 'Sand',
                        },
                      ]}
                    />
            
                  </Space>
                   </div>
                     <div className="flex items-center mb-2">
                  <Space>
                    <label>スキル1レベル :</label>
                    <InputNumber changeOnWheel min={0} max={10} value={Number(playerStatus.skill1level)} onChange={(value) => setPlayerStatus({ ...playerStatus, skill1level: String(value) }) } />
              
                     <div className="w-20"></div>
                    <label>スキル2レベル :</label>
                    <InputNumber changeOnWheel min={0} max={10} value={Number(playerStatus.skill2level)} onChange={(value) => setPlayerStatus({ ...playerStatus, skill2level: String(value) })} />
            

                  </Space>
             
</div>
                <div className="p-1"></div>
                <div className="border-1"></div>
                <div className="p-1"></div>


              <div className="flex items-center mb-2">
                <label className="w-30">HP : </label>
                <InputNumber size="large" min={0} max={Number(playerStatus.maxhp)} changeOnWheel value={Number(playerStatus.hp)} onChange={(value) => setPlayerStatus({ ...playerStatus, hp: String(value) })} />
          
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
          
                <InputNumber size="large" min={0} changeOnWheel formatter={(value) => `${value}%`} parser={(value) => value?.replace('%', '') as unknown as number} value={Number(playerStatus.crit)} onChange={(value) => setPlayerStatus({ ...playerStatus, crit: String(value) })} />
        
                <div className="w-20"></div>
                <label className="w-30">会心ダメージ :</label>
                <InputNumber size="large" min={0} changeOnWheel formatter={(value) => `${value}%`} parser={(value) => value?.replace('%', '') as unknown as number} value={Number(playerStatus.critdmg)} onChange={(value) => setPlayerStatus({ ...playerStatus, critdmg: String(value) })} />
         
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
                      skill1type: (playerStatus.skill1type),
                      skill2type: (playerStatus.skill2type),
                      skill1level: (playerStatus.skill1level),
                      skill2level: (playerStatus.skill2level),
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
                  changeplayerdata()
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
        </Content>
      </Layout>
    </Layout>
    </div>
    </main>
  );
}
