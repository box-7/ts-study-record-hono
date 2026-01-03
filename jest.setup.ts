// jest.setup.ts
// Jest テストランナーのセットアップファイルで、各テストファイルの実行前に実行されるスクリプトを定義するために使用される

// @testing-library/jest-dom パッケージをインポートして、Jest のカスタムマッチャを追加する
import '@testing-library/jest-dom';

import * as dotenv from 'dotenv';
dotenv.config();

window.alert = jest.fn();

/**
 * JavaScript 標準の `structuredClone` が使えない環境向けの簡易ポリフィル。
 *
 * - global.structuredClone を定義する
 * - 渡された値を「深いコピー（deep copy）」する
 *   → 元オブジェクトとコピー後は完全に独立する
 *
 * 実装内容:
 * - 引数が undefined の場合は、そのまま undefined を返す
 * - それ以外は JSON.stringify → JSON.parse を使って複製する
 *
 * 注意点:
 * - 関数、Date、Map、Set、undefined、循環参照などはコピー不可
 * - 本来の structuredClone より対応範囲は狭い
 *
 * 主な用途:
 * - テスト環境（Jest / Node.js など）で structuredClone が存在しない場合の代替
 */
global.structuredClone = (obj) => {
  if (obj === undefined) return undefined;
  return JSON.parse(JSON.stringify(obj));
};

import fetch from 'node-fetch';
// @ts-expect-error: node-fetchに型定義がないためfetchをグローバル定義
global.fetch = fetch;
