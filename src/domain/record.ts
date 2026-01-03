export class Record {
  constructor(
    public id: string,
    public title: string,
    public time: number
  ) { }

  // 現状は未使用
  public static newRecord(
    id: string,
    title: string,
    time: number
  ): Record {
    return new Record(id, title, time);
  }
}

/**
 * 全体の枠組み（このクラスは何か）
 *
 * - Record は「1件のデータのまとまり」を表す設計図
 * - React 側では useState<Record[]> の
 *   「配列の1要素の型」として使われる想定
 *
 *   const [data, setData] = useState<Record[]>([])
 *
 * ■ constructor の役割
 * - new Record(...) された瞬間に
 *   1件分のデータが完成する最小単位
 * - id / title / time を必ず持つことを保証
 *
 * ■ static newRecord の意味
 * - Record を作るための「公式な入口」
 * - React 側は生成方法を知らなくてよい
 *
 *   setData(prev => [
 *     ...prev,
 *     Record.newRecord(id, title, time)
 *   ])
 *
 * - new Record(...) を直接ばら撒かないための設計
 * - 生成ルールをクラス側に集約できる
 *
 * ■ React + useState との相性
 * - Record は配列要素として扱いやすい
 * - 状態管理は React、ロジックはクラスに閉じる
 * - 後からメソッド追加も可能
 *
 * ■ 一言で
 * - Record = React state に入る「1要素の型と振る舞い」
 * - newRecord = 安全・統一的な生成入口
 */