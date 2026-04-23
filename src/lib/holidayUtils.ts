import * as holidayJp from '@holiday-jp/holiday_jp';

/**
 * 日本の祝日かどうかを判定し、祝日名を返すユーティリティ
 */

/**
 * 指定した日付が日本の祝日かどうかを判定する
 * @param date 判定対象の日付 (Date型 または YYYY-MM-DD 文字列)
 * @returns 祝日名 (祝日でない場合は undefined)
 */
export const getJapaneseHolidayName = (date: Date | string): string | undefined => {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  
  // holiday_jp は Date オブジェクトを受け取り、祝日であればその情報を返す
  const holidays = holidayJp.isHoliday(targetDate);
  if (holidays) {
    const holidayInfo = holidayJp.between(targetDate, targetDate)[0];
    return holidayInfo?.name;
  }
  
  return undefined;
};

/**
 * 指定した日付が日本の祝日かどうかを判定する (boolean)
 */
export const isJapaneseHoliday = (date: Date | string): boolean => {
  return !!getJapaneseHolidayName(date);
};
