"use client";

import { useState, useRef, useEffect } from "react";





import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Button,
  Flex,
  message,
  Space,
  Select,
  InputNumber,
  Input,
  Layout,
  Menu,
  theme,
  notification,
  Typography,
  Alert,
  Upload
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  SettingOutlined,
  DeleteFilled,

} from '@ant-design/icons';
import React from "react";

import Head from 'next/head'


export default function Home() {
  // 設定値

  const [width, setwidth] = useState(140);
  const [height, setheight] = useState(92);
  const [rows, setRows] = useState(7);
  const [cols, setCols] = useState(6);
  const [intervalMs, setIntervalMs] = useState(100);

  // ゲームデータ
  const [stringList, setStringList] = useState<string[]>(["example"]);
  const [newString, setNewString] = useState("");

  const [grid, setGrid] = useState<(string | null)[]>([]);
  const [banned, setBanned] = useState<boolean[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0); // list の現在のインデックス

  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);



  const [mode, setMode] = useState<string>("game");


  const [messageApi, contextHolder] = message.useMessage();
  const [api, contextHolder2] = notification.useNotification();

  const { Header, Sider, Content } = Layout;
  const [collapsed, setCollapsed] = useState(true);
  const { Title } = Typography;


  const [confirmedIndex, setConfirmedIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(40);
  const [rangeOrder, setRangeOrder] = useState<"asc" | "desc">("asc");



  const {
    token: { colorBgContainer },
  } = theme.useToken();


  const isRestoringRef = useRef(false);

  // --- Audio プレイヤー ---
  const drumAudio = React.useRef<HTMLAudioElement | null>(null);
  const cymbalAudio = React.useRef<HTMLAudioElement | null>(null);

  // 初期化
  useEffect(() => {
    drumAudio.current = new Audio("/sounds/drumroll.mp3");
    drumAudio.current.loop = true;

    cymbalAudio.current = new Audio("/sounds/cymbal.mp3");
  }, []);






  // ---- localStorage から復元 ----
  useEffect(() => {
    const raw = localStorage.getItem("my-game-data");
    if (!raw) return;

    try {
      const data = JSON.parse(raw);

      // mark restoring so other effects won't clobber restored grid/banned
      isRestoringRef.current = true;

      if (typeof data.rows === "number") setRows(data.rows);
      if (typeof data.cols === "number") setCols(data.cols);
      if (typeof data.width === "number") setwidth(data.width);    // あなたの変数名に合わせて
      if (typeof data.height === "number") setheight(data.height);
      if (typeof data.intervalMs === "number") setIntervalMs(data.intervalMs);
      if (Array.isArray(data.stringList)) setStringList(data.stringList);
      if (typeof data.currentIndex === "number") setCurrentIndex(data.currentIndex);

      // restore grid and banned only if lengths match expected size,
      // otherwise fill to expected size using provided values where possible
      const expected = (typeof data.rows === "number" ? data.rows : rows) * (typeof data.cols === "number" ? data.cols : cols);

      if (Array.isArray(data.grid) && data.grid.length === expected) {
        setGrid(data.grid);
      } else {
        // try to adapt: copy existing values into new sized grid if available
        const g = Array(expected).fill(null);
        if (Array.isArray(data.grid)) {
          for (let i = 0; i < Math.min(data.grid.length, g.length); i++) {
            g[i] = data.grid[i];
          }
        }
        setGrid(g);
      }

      if (Array.isArray(data.banned) && data.banned.length === expected) {
        setBanned(data.banned);
      } else {
        const b = Array(expected).fill(false);
        if (Array.isArray(data.banned)) {
          for (let i = 0; i < Math.min(data.banned.length, b.length); i++) {
            b[i] = !!data.banned[i];
          }
        }
        setBanned(b);
      }

      // allow the rows/cols effect to finish, then clear the flag.
      // use setTimeout(...,0) to let React process the state updates first
      setTimeout(() => {
        isRestoringRef.current = false;
      }, 0);

      messageApi?.open?.({ type: 'success', content: '状態を復元しました（localStorage）', duration: 2 });
    } catch (e) {
      console.error("復元エラー", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  // ---- 状態を localStorage に保存 ----
  useEffect(() => {
    const saveData = {
      rows,
      cols,
      width,
      height,
      intervalMs,
      stringList,
      grid,
      banned,
      currentIndex,
    };
    localStorage.setItem("my-game-data", JSON.stringify(saveData));
  }, [rows, cols, width, height, intervalMs, stringList, grid, banned, currentIndex]);









  // ページ離脱・リロード時に確認
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Chrome向けに必須
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  // rows / cols 変更時に grid と blocked をリセット
  useEffect(() => {
    const newSize = rows * cols;

    // 復元中は上書きしない（復元側で grid/banned を設定している）
    if (isRestoringRef.current) {
      // それでも長さが違う場合はサイズ合わせだけ行う（安全処理）
      setGrid((prev) => {
        if (prev.length === newSize) return prev;
        const next = Array(newSize).fill(null);
        for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i];
        return next;
      });
      setBanned((prev) => {
        if (prev.length === newSize) return prev;
        const next = Array(newSize).fill(false);
        for (let i = 0; i < Math.min(prev.length, next.length); i++) next[i] = prev[i];
        return next;
      });
      // 復元中は isRunning を止めない（復元後の状態に任せる）
      return;
    }

    // 通常のリセット（復元中でなければ動かす）
    setGrid(Array(newSize).fill(null));
    setBanned(Array(newSize).fill(false));

    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  }, [rows, cols]);


  // ランダムな空きセル（禁止マス除外）
  // NOTE: not currently used; kept for future reference
  /*
  const getRandomAvailableIndex = () => {
    const validIndexes = grid
      .map((v, i) => (v === null && !banned[i] ? i : -1))
      .filter((v) => v !== -1);

    if (validIndexes.length === 0) return -1;
    return validIndexes[Math.floor(Math.random() * validIndexes.length)];
  };
  */

  const getRandomEmptyCell = () => {
    const emptyCells = grid
      .map((v, i) => ({ v, i }))
      .filter((c) => c.v === null && !banned[c.i]);

    if (emptyCells.length === 0) return null;

    const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    return target.i;
  };


  const addUniqueItems = (items: string[]) => {
    setStringList((prev) => {
      const set = new Set(prev);
      items.forEach((i) => set.add(i));
      return Array.from(set);
    });
  };



  // 文字数に応じてフォントサイズを決める
  const getAutoFontSize = (text: string, cellWidth: number, cellHeight: number) => {
    if (!text) return 0;

    const len = text.length;

    // 文字数に応じて基本係数調整 (好みで変更OK)
    const sizeFromWidth = cellWidth * (0.85 / (len * 0.9));
    const sizeFromHeight = cellHeight * 0.7;

    // どちらか小さい方を適用
    return Math.min(sizeFromWidth, sizeFromHeight);
  };





  const start = () => {
    if (isRunning) return;
    if (stringList.length === 0) {
      api.error({
        message: `エラー`,
        description:
          'Listが空です。文字列を追加してください。',
        placement: "top",
        showProgress: true,
        pauseOnHover: false,
        duration: 3,
      });
      return
    }
    if (currentIndex >= stringList.length) {
      api.error({
        message: `エラー`,
        description:
          'Listの要素をすべて配置しました。',
        placement: "top",
        showProgress: true,
        pauseOnHover: false,
        duration: 3,
      });
      return
    }

    setActiveIndex(-1);
    setConfirmedIndex(-1);

    setIsRunning(true);


    if (drumAudio.current) {
      drumAudio.current.currentTime = 0;
      drumAudio.current.play();
    }

    intervalRef.current = setInterval(() => {
      const index = getRandomEmptyCell();
      if (index === null) return;

      setGrid((prev) => {
        const newGrid = [...prev];

        // 前回の表示を消す
        const current = stringList[currentIndex];


        setActiveIndex(index);


        const oldIndex = newGrid.findIndex((x) => x === current);
        if (oldIndex !== -1) newGrid[oldIndex] = null;


        // 今回の位置に配置
        newGrid[index] = current;

        return newGrid;
      });

      // 次の index を循環

    }, intervalMs);
  };

  const stop = () => {
    setIsRunning(false);


    // ドラムロール停止
    if (drumAudio.current) {
      drumAudio.current.pause();
      drumAudio.current.currentTime = 0;
    }

    // シンバル音再生
    if (cymbalAudio.current) {
      cymbalAudio.current.currentTime = 0;
      cymbalAudio.current.playbackRate = 1.8;
      cymbalAudio.current.play();
    }




    // 最後に置かれた文字（= 現在の stringList[currentIndex]）が入っているセルを特定
    const lastValue = stringList[currentIndex];
    const indexInGrid = grid.indexOf(lastValue);


    // index を保存 → このセルだけ濃い色で表示される
    setConfirmedIndex(indexInGrid);






    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;

    // 次の index をローカル変数で処理
    let nextIndex = currentIndex + 1;

    // すでに grid にある場合はスキップ
    while (nextIndex < stringList.length && grid.includes(stringList[nextIndex])) {
      nextIndex++;
    }

    // 更新
    setCurrentIndex(nextIndex);






  };


  // 設定画面：禁止マス切り替え
  const toggleBan = (i: number) => {
    if (isRunning) {
      stop();
    }
    setBanned((prev) => {
      const updated = [...prev];
      updated[i] = !updated[i];
      return updated;
    });
    setGrid((prev) => {
      const updated = [...prev];
      if (updated[i] !== null) updated[i] = null;
      return updated;
    });
  };

  // 設定画面：セル内の数字変更
  const changeCellValue = (index: number, value: string) => {
    const str = value === "" ? null : value;
    setGrid((prev) => {
      const copy = [...prev];
      if (!banned[index]) copy[index] = str;
      return copy;
    });
  };








  const importList = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (Array.isArray(json)) {
          setStringList(json);
        } else {
          alert("JSON の形式が不正です（配列ではありません）");
        }
      } catch {
        alert("JSON の読み込みに失敗しました");
      }
    };
    reader.readAsText(file);




    api.info({
      message: ``,
      description:
        'Importしました。',
      placement: "top",
      showProgress: true,
      pauseOnHover: false,
      duration: 3,
    });
  };




  const exportList = () => {
    const data = JSON.stringify(stringList, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "stringList.json";
    a.click();
    URL.revokeObjectURL(url);
  };









  return (

    <main className="min-h-screen bg-gray-300 p-2" >
      {contextHolder}
      {contextHolder2}




      <div className=" max-h-screen bg-white rounded-4xl shadow-2xl flex overflow-hidden" style={{ fontFamily: "str, sans-serif" }}>
          <Head>
    <title>Seat Roulette</title>
    <meta name="description" content="席替えルーレット" />
  </Head>
        <Layout>
          <Sider trigger={null} collapsible collapsed={collapsed}>
            <div className="demo-logo-vertical min-h-2" />
            {/* <div className="text-white text-center text-4xl" >aaaeea</div> */}
            <div className="mt-2 h-10 ml-7 mr-5 mb-3 bg-gray-300 rounded-4xl">  </div>
            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={['game']}
              items={[
                {
                  key: 'game',
                  icon: <UserOutlined />,
                  label: 'Main',
                },
                {
                  key: 'setting',
                  icon: <SettingOutlined />,
                  label: 'Setting',
                },

                {
                  key: 'list',
                  icon: <SettingOutlined />,
                  label: 'List',
                },
              ]}
              onClick={(value) => {
                setMode(value.key.toString());
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

                <div className="mt-3 ml-5 text-black text-center text-4xl font-bold" >     {` ${stringList[currentIndex] ? `${stringList[currentIndex]}` : ""}  ${stringList[currentIndex + 1] ? `→ ${stringList[currentIndex + 1]}` : ""}  ${stringList[currentIndex + 2] ? `→ ${stringList[currentIndex + 2]}` : ""}`} </div>

              </Flex>




            </Header>
            <Content
              style={{
                margin: '12px 8px',
                padding: 12,
                background: colorBgContainer,
                borderRadius: 30,
              }}
            >
              <div className="flex-1">

                {stringList.length != (rows * cols) - banned.filter((value) => value == true).length && (
                  <Alert
                    message="エラー"
                    description={`Listの要素数(${stringList.length})とマスの数(${(rows * cols) - banned.filter((value) => value == true).length})が一致していません。`}
                    type="warning"
                    showIcon />
                )}



                {/* 
                  Setting
                  */}



                {mode === "setting" && (
                  <div>

                    <Flex gap={"small"} align="right">
                      <Title level={4}>設定</Title>
                      <div className="mx-auto"></div>

                    </Flex>


                    <div>


                      <div style={{ marginBottom: 20 }}>
                        <Flex gap={"middle"} align="right">
                          <label>
                            行数 :
                            <InputNumber min={1} size="small" changeOnWheel value={Number(rows)} onChange={(value) => setRows(Number(value))} />
                          </label>

                          <label>
                            列数 :
                            <InputNumber min={1} size="small" changeOnWheel value={Number(cols)} onChange={(value) => setCols(Number(value))} />
                          </label>

                          <label>
                            更新間隔 (ms):
                            <InputNumber min={1} size="middle" changeOnWheel value={Number(intervalMs)} onChange={(value) => setIntervalMs(Number(value))} />
                          </label>

                          <label>
                            次の文字列 :
                            <Select onChange={(e) => {
                              setCurrentIndex(Number(e))
                              console.log(e);
                            }}
                              options={
                                stringList.map((a, b) => ({
                                  value: b,
                                  label: `ID:${b + 1} - ${a}`
                                }))
                              }

                              value={`ID:${currentIndex + 1} - ${stringList[currentIndex]}`}
                              style={{
                                fontSize: 12,
                                width: `200px`,
                                padding: 0,
                                marginTop: 0,
                                cursor: "pointer",
                              }} />

                          </label>

                        </Flex>
                        <Flex gap={"middle"} align="right">
                          <label>
                            w :
                            <InputNumber min={1} size="small" changeOnWheel value={Number(width)} onChange={(value) => setwidth(Number(value))} />
                          </label>

                          <label>
                            h :
                            <InputNumber min={1} size="small" changeOnWheel value={Number(height)} onChange={(value) => setheight(Number(value))} />
                          </label>


                        </Flex>
                      </div>
                      <h3>セル番号設定 / 禁止マス（クリックで切替）</h3>



                      <Button
                        danger
                        style={{ width: 120, height: 50 }}
                        onClick={() => {
                          if (!window.confirm("リセットしますか？")) return;

                          // 実際のリセット
                          setGrid(Array(rows * cols).fill(null));
                          setActiveIndex(-1)
                          setConfirmedIndex(-1)
                          setCurrentIndex(0);

                          // 動作中なら停止
                          if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                          }
                          setIsRunning(false);

                          // currentIndex を最初に戻す場合（任意）
                          // setCurrentIndex(0);
                        }}
                      >
                        リセット
                      </Button>






                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: `repeat(${cols}, ${width}px)`,
                          gap: 5,
                          marginBottom: 20,
                        }}
                      >
                        {grid.map((v, i) => (
                          <div
                            key={i}
                            style={{
                              width: width,
                              height: height,
                              border: "1px solid #333",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              background: banned[i] ? "#ff8f8f" : "#fafafa",
                              cursor: "pointer",
                              fontSize: 18,
                              flexDirection: "column",
                            }}
                          >
                            {/* 禁止マス */}
                            {banned[i] ? (
                              <span>×</span>
                            ) : (
                              <Select onChange={(e) => changeCellValue(i, e)}
                                options={
                                  stringList.map((a) => ({
                                    value: a,
                                    label: `${a}`
                                  })).concat([{ value: "", label: "null" }])

                                }
                                value={v === null ? undefined : v}
                                style={{
                                  fontSize: 12,
                                  width: `${width - 10}px`,
                                  padding: 0,
                                  marginTop: 0,
                                  cursor: "pointer",
                                }} />

                            )}
                            <Button color={banned[i] ? "green" : "red"} variant="outlined" onClick={() => toggleBan(i)} style={{
                              fontSize: 12,
                              width: `${width / 2}px`,
                              padding: 0,
                              marginTop: 0,
                              cursor: "pointer",
                            }} >
                              {banned[i] ? "解除" : "禁止"}
                            </Button>

                          </div>
                        ))}
                      </div>

                    </div>












                  </div>
                )}

                {/* game */}
                {mode === "game" && (
                  <div>







                    <div>

                      <Flex gap={"large"} align="center">

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${cols}, ${width}px)`,
                            gap: 5,
                            marginBottom: 10,
                          }}
                        >
                          {grid.map((v, i) => (
                            <div
                              key={i}
                              style={{
                                width: width,
                                height: height,
                                border: "1px solid #333",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: v ? getAutoFontSize(v, width, height) : "30px",

                                background: banned[i]
                                  ? "#474747ff"
                                  : confirmedIndex === i || activeIndex === i
                                    ? "#ffbd2fff"
                                    : v
                                      ? "#ffe489ff"
                                      : "#fafafa",

                              }}
                            >
                              {banned[i] ? "" : v}
                            </div>

                          ))}
                        </div>


                        {isRunning ? (
                          <Button color="red" variant="solid" shape="circle" size="large" onClick={stop} style={{
                            width: 180,
                            height: 90,
                            fontSize: 30,
                            fontWeight: "bold",
                            borderRadius: 12,
                          }}>Stop</Button>
                        ) : (
                          <Button color="cyan" variant="solid" shape="circle" size="large" onClick={start} style={{
                            width: 180,
                            height: 90,
                            fontSize: 30,
                            fontWeight: "bold",
                            borderRadius: 12,
                          }}>Start</Button>
                        )}
                      </Flex>


                    </div>




                  </div>
                )}



                {/* 
                List
                */}

                {mode === "list" && (
                  <div>
                    <Flex gap={"small"} align="right">
                      <h2 style={{ marginBottom: 20 }}>String List (並び替え & 編集)</h2>
                      要素数 : {stringList.length}


                      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
                        {/* エクスポート */}
                        <Button type="primary" onClick={exportList}>
                          Export JSON
                        </Button>

                        {/* インポート */}
                        <Upload
                          accept="application/json"
                          showUploadList={false}
                          beforeUpload={(file) => {
                            importList(file);
                            return false; // 自動アップロードを防止
                          }}
                        >
                          <Button>Import JSON</Button>
                        </Upload>
                      </div>


                      <Button
                        danger
                        onClick={() => {
                          if (window.confirm("リストをすべて削除しますか？")) {
                            setStringList([]);
                          }
                        }}
                        style={{ marginBottom: 20 }}
                      >
                        すべて削除
                      </Button>

                    </Flex>


                    {/* 連番 追加フォーム */}
                    <h3 style={{ marginTop: 20 }}>連番を追加（a ～ b）</h3>

                    <Space style={{ marginBottom: 20 }}>
                      <Input
                        type="number"
                        placeholder="開始 a"
                        value={rangeStart}
                        onChange={(e) => setRangeStart(Number(e.target.value))}
                        style={{ width: 120 }}
                      />
                      〜
                      <Input
                        type="number"
                        placeholder="終了 b"
                        value={rangeEnd}
                        onChange={(e) => setRangeEnd(Number(e.target.value))}
                        style={{ width: 120 }}
                      />

                      <select
                        value={rangeOrder}
                        onChange={(e) => setRangeOrder(e.target.value as "asc" | "desc")}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #aaa",
                        }}
                      >
                        <option value="asc">昇順</option>
                        <option value="desc">降順</option>
                      </select>

                      <Button
                        type="primary"
                        onClick={() => {
                          if (isNaN(rangeStart) || isNaN(rangeEnd)) return;

                          const newItems: string[] = [];

                          if (rangeOrder === "asc") {
                            for (let i = rangeStart; i <= rangeEnd; i++) newItems.push(String(i));
                          } else {
                            for (let i = rangeStart; i >= rangeEnd; i--) newItems.push(String(i));
                          }

                          // ★ 重複を除外して追加
                          addUniqueItems(newItems);
                        }}
                      >
                        連番追加
                      </Button>
                    </Space>





                    {/* 追加フォーム */}
                    <Space style={{ marginLeft: 20 }}>
                      <Input
                        placeholder="追加する文字列"
                        value={newString}
                        onChange={(e) => setNewString(e.target.value)}
                        style={{ width: 200 }}

                      />
                      <Button
                        color="green" variant="solid"
                        onClick={() => {
                          if (!newString.trim()) return;
                          setStringList((prev) => [...prev, newString]);
                          setNewString("");
                        }}
                      >
                        追加
                      </Button>
                    </Space>



                    {/* ───────────────────────────────
        ここからドラッグ & 編集可能なリスト
        ─────────────────────────────── */}
                    <DragDropContext
                      onDragEnd={(result) => {
                        if (!result.destination) return;

                        const newOrder = Array.from(stringList);
                        const [moved] = newOrder.splice(result.source.index, 1);
                        newOrder.splice(result.destination.index, 0, moved);
                        setStringList(newOrder);
                      }}
                    >
                      <Droppable droppableId="droppable-strings">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{
                              width: "100%",
                              maxHeight: "500px",      // ★ 固定高さ
                              overflowY: "auto",        // ★ スクロール有効化
                              paddingRight: 10,         // ★ スクロールバーで内容が隠れないよう余白
                            }}
                          >
                            {stringList.map((item, index) => (
                              <Draggable
                                key={index}
                                draggableId={`string-${index}`}
                                index={index}
                              >
                                {(p) => (
                                  <div
                                    ref={p.innerRef}
                                    {...p.draggableProps}
                                    {...p.dragHandleProps}
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      background: "#fff",
                                      padding: "10px 15px",
                                      marginBottom: 8,
                                      border: "1px solid #ddd",
                                      borderRadius: 8,
                                      ...p.draggableProps.style,
                                    }}
                                  >
                                    {`ID : ${index + 1}`}

                                    <Input
                                      value={item}
                                      onChange={(e) => {
                                        const newList = [...stringList];
                                        newList[index] = e.target.value;
                                        setStringList(newList);
                                      }}
                                      style={{
                                        width: "70%",
                                        fontSize: 16,
                                      }}
                                    />

                                    <Button
                                      danger
                                      size="small"
                                      icon={<DeleteFilled />}
                                      onClick={() =>
                                        setStringList(stringList.filter((_, i) => i !== index))
                                      }
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>

                    </DragDropContext>
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
