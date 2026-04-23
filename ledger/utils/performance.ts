/**
 * 簡易的なパフォーマンス計測ユーティリティ
 * 開発時の体感速度の数値化に使用します。
 */

const startTimeMap = new Map<string, number>();

export const perf = {
  /**
   * 計測を開始します
   */
  start: (label: string) => {
    startTimeMap.set(label, performance.now());
  },

  /**
   * 計測を終了し、経過時間をコンソールに出力します
   */
  end: (label: string) => {
    const start = startTimeMap.get(label);
    if (start) {
      const duration = performance.now() - start;
      console.log(`[Perf] ${label}: ${duration.toFixed(2)} ms`);
      startTimeMap.delete(label);
      return duration;
    }
    return 0;
  },

  /**
   * 単発のログを出力します
   */
  mark: (label: string, extra?: any) => {
    console.log(`[Perf] ${label}`, extra || '');
  }
};
