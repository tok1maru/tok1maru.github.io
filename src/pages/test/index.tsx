"use client"

import React, { useState, useEffect } from "react";

// Next.js (app router) 用のページコンポーネント。
// a*b のセル（行×列）を作り、編集モードで各要素を変更し、
// [[image1, image2, description], ...] の形でデータを保存できるようにしました。
// 各セルの画像は強制的に正方形になります。

export default function Page() {
  const [cols, setCols] = useState<number>(3); // a
  const [rows, setRows] = useState<number>(2); // b
  const [editMode, setEditMode] = useState<boolean>(false);

  // [[imgLeft, imgRight, text], ...] の形でデータを保持
  const [data, setData] = useState<[string, string, string][]>(
    Array.from({ length: 3 * 2 }).map((_, i) => [
      `https://picsum.photos/seed/left-${i}/400/400`,
      `https://picsum.photos/seed/right-${i}/400/400`,
      `これはセル #${i + 1} の説明文です`,
    ])
  );

  // 行列が変化したらデータも再生成
  useEffect(() => {
    setData((prev) => {
      const total = cols * rows;
      const newData: [string, string, string][] = [];
      for (let i = 0; i < total; i++) {
        newData.push(
          prev[i] || [
            `https://picsum.photos/seed/left-${i}/400/400`,
            `https://picsum.photos/seed/right-${i}/400/400`,
            `これはセル #${i + 1} の説明文です`,
          ]
        );
      }
      return newData;
    });
  }, [cols, rows]);

  const updateItem = (index: number, field: 0 | 1 | 2, value: string) => {
    setData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)) as [string, string, string][]
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">画像2枚付きグリッド (a × b)</h1>

        <section className="mb-6 flex flex-wrap gap-3 items-end">
          <label className="flex flex-col text-sm">
            列 (a)
            <input
              type="number"
              min={1}
              value={cols}
              onChange={(e) => setCols(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-24 p-2 rounded border"
            />
          </label>

          <label className="flex flex-col text-sm">
            行 (b)
            <input
              type="number"
              min={1}
              value={rows}
              onChange={(e) => setRows(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-24 p-2 rounded border"
            />
          </label>

          <div className="text-sm text-gray-600">合計セル: <span className="font-medium">{cols * rows}</span></div>

          <button
            onClick={() => setEditMode(!editMode)}
            className="ml-auto px-4 py-2 rounded bg-blue-500 text-white text-sm shadow hover:bg-blue-600"
          >
            {editMode ? "編集終了" : "編集モード"}
          </button>
        </section>

        {/* グリッド */}
        <section
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {data.map((item, index) => (
            <article key={index} className="bg-white rounded-2xl shadow-sm p-3">
              {/* 画像行 */}
              <div className="flex gap-2 items-stretch">
                <div className="flex-1 overflow-hidden rounded-lg">
                  {editMode ? (
                    <input
                      type="text"
                      value={item[0]}
                      onChange={(e) => updateItem(index, 0, e.target.value)}
                      className="w-full p-1 text-xs border rounded"
                    />
                  ) : (
                    <div className="aspect-square w-full">
                      <img
                        src={item[0]}
                        alt={`left-${index}`}
                        className="w-full h-full object-cover block rounded"
                      />
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-hidden rounded-lg">
                  {editMode ? (
                    <input
                      type="text"
                      value={item[1]}
                      onChange={(e) => updateItem(index, 1, e.target.value)}
                      className="w-full p-1 text-xs border rounded"
                    />
                  ) : (
                    <div className="aspect-square w-full">
                      <img
                        src={item[1]}
                        alt={`right-${index}`}
                        className="w-full h-full object-cover block rounded"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* テキスト */}
              {editMode ? (
                <textarea
                  value={item[2]}
                  onChange={(e) => updateItem(index, 2, e.target.value)}
                  className="mt-3 w-full p-2 text-sm border rounded"
                  rows={2}
                />
              ) : (
                <p className="mt-3 text-sm text-gray-700">{item[2]}</p>
              )}
            </article>
          ))}
        </section>

        <footer className="mt-8 text-xs text-gray-500">
          画像と説明は [[image1, image2, description], ...] の形式で保存されています。
        </footer>
      </div>
    </main>
  );
}
