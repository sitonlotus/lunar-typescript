import {SolarUtil} from './SolarUtil';
import {Solar} from './Solar';
import {SolarWeek} from './SolarWeek';

/**
 * 阳历月份类
 * 提供阳历月份的计算和管理功能
 * 
 * 主要功能包括：
 * - 从年份和月份创建月份对象
 * - 月份之间的推移计算
 * - 获取月份内的所有日期
 * - 获取月份内的所有周
 * - 月份信息的字符串表示
 * 
 * 特殊处理：
 * - 自动处理跨年的月份推移
 * - 考虑不同月份的天数差异
 * - 支持闰年2月的天数计算
 * - 处理月份边界和循环
 * 
 * 月份范围：1-12（1表示一月，12表示十二月）
 */
export class SolarMonth {

    private readonly _year: number;
    private readonly _month: number;

    /**
     * 从年份和月份创建阳历月份对象
     * 
     * 根据指定的年份和月份创建月份对象
     * 这是最常用的创建方法
     * 
     * @param year - 年份
     * @param month - 月份（1-12，1表示一月，12表示十二月）
     * @returns 阳历月份对象
     * 
     * 示例：
     * ```typescript
     * // 创建2023年12月的月份对象
     * const month = SolarMonth.fromYm(2023, 12);
     * ```
     */
    static fromYm(year: number, month: number): SolarMonth {
        return new SolarMonth(year, month);
    }

    /**
     * 从JavaScript Date对象创建阳历月份对象
     * 
     * 将标准的JavaScript Date对象转换为阳历月份对象
     * 自动处理JavaScript Date的月份转换（0-11转1-12）
     * 
     * @param date - JavaScript Date对象
     * @returns 阳历月份对象
     * 
     * 示例：
     * ```typescript
     * const now = new Date();
     * // 创建当前日期所在月份的月份对象
     * const month = SolarMonth.fromDate(now);
     * ```
     */
    static fromDate(date: Date): SolarMonth {
        return SolarMonth.fromYm(date.getFullYear(), date.getMonth() + 1);
    }

    /**
     * 构造函数
     * 
     * 创建阳历月份对象，基于指定的年份和月份
     * 
     * @param year - 年份
     * @param month - 月份（1-12，1表示一月，12表示十二月）
     */
    constructor(year: number, month: number) {
        this._year = year;
        this._month = month;
    }

    /**
     * 获取年份
     * 
     * @returns 年份
     */
    getYear(): number {
        return this._year;
    }

    /**
     * 获取月份
     * 
     * @returns 月份（1-12）
     */
    getMonth(): number {
        return this._month;
    }

    /**
     * 增加或减少月份
     * 
     * 在当前月份的基础上增加或减少指定的月数
     * 自动处理跨年的月份推移
     * 
     * @param months - 月数（正数为增加，负数为减少）
     * @returns 新的阳历月份对象
     * 
     * 算法说明：
     * - 首先计算年份的增量（每12个月增加1年）
     * - 然后计算月份的增量（取模12）
     * - 处理月份边界：超过12月进入下一年，小于1月进入上一年
     * 
     * 示例：
     * ```typescript
     * const month = SolarMonth.fromYm(2023, 12);
     * 
     * // 增加1个月：进入2024年1月
     * const nextMonth = month.next(1);
     * 
     * // 减少1个月：回到2023年11月
     * const prevMonth = month.next(-1);
     * 
     * // 增加13个月：进入2025年1月（12+1）
     * const nextYearMonth = month.next(13);
     * ```
     */
    next(months: number): SolarMonth {
        const n = months < 0 ? -1 : 1;
        let m = Math.abs(months);
        let y = this._year + Math.floor(m / 12) * n;
        m = this._month + m % 12 * n;
        if (m > 12) {
            m -= 12;
            y++;
        } else if (m < 1) {
            m += 12;
            y--;
        }
        return SolarMonth.fromYm(y, m);
    }

    /**
     * 获取月份内的所有日期
     * 
     * 返回当前月份从1日开始的所有日期
     * 自动处理不同月份的天数差异，包括闰年2月
     * 
     * @returns 月份内所有日期的数组（Solar对象数组）
     * 
     * 数组特点：
     * - 索引0：月份的第1天
     * - 索引1：月份的第2天
     * - ...
     * - 最后索引：月份的最后一天
     * - 数组长度等于月份的天数
     * 
     * 示例：
     * ```typescript
     * const month = SolarMonth.fromYm(2023, 2); // 非闰年2月
     * const days = month.getDays(); // 返回28个日期对象
     * 
     * const leapMonth = SolarMonth.fromYm(2020, 2); // 闰年2月
     * const leapDays = leapMonth.getDays(); // 返回29个日期对象
     * ```
     */
    getDays(): Solar[] {
        const l: Solar[] = [];
        const d = Solar.fromYmd(this._year, this._month, 1);
        l.push(d);
        const days = SolarUtil.getDaysOfMonth(this._year, this._month);
        for (let i = 1; i < days; i++) {
            l.push(d.next(i));
        }
        return l;
    }

    /**
     * 获取月份内的所有周
     * 
     * 根据指定的周起始日，返回当前月份包含的所有周对象
     * 自动处理跨月周，只返回属于当前月份的周
     * 
     * @param start - 周起始日（0-6，0=星期日，1=星期一，...，6=星期六）
     * @returns 月份内所有周的数组（SolarWeek对象数组）
     * 
     * 算法说明：
     * - 从月份的第1天开始创建第一个周对象
     * - 逐周推移，直到周的起始日进入下个月份
     * - 过滤掉完全属于其他月份的周
     * 
     * 示例：
     * ```typescript
     * const month = SolarMonth.fromYm(2023, 12);
     * 
     * // 获取以星期一为起始的周
     * const weeksMondayStart = month.getWeeks(1);
     * 
     * // 获取以星期日为起始的周
     * const weeksSundayStart = month.getWeeks(0);
     * 
     * // 12月通常包含4-5周，取决于起始日和月份天数
     * console.log(weeksMondayStart.length); // 可能返回4或5
     * ```
     */
    getWeeks(start: number): SolarWeek[] {
        const l: SolarWeek[] = [];
        let week = SolarWeek.fromYmd(this._year, this._month, 1, start);
        while (true) {
            l.push(week);
            week = week.next(1, false);
            const firstDay = week.getFirstDay();
            if (firstDay.getYear() > this._year || firstDay.getMonth() > this._month) {
                break;
            }
        }
        return l;
    }

    /**
     * 转换为字符串
     * 
     * 重写Object.prototype.toString()方法
     * 返回简洁的月份标识字符串
     * 
     * @returns 月份标识字符串（格式：年-月）
     * 
     * 示例：
     * ```typescript
     * const month = SolarMonth.fromYm(2023, 12);
     * const str = month.toString(); // 返回"2023-12"
     * console.log(`月份：${month}`); // 自动调用toString()
     * ```
     */
    toString(): string {
        return `${this.getYear()}-${this.getMonth()}`;
    }

    /**
     * 转换为完整字符串
     * 
     * 返回包含完整中文信息的月份描述字符串
     * 
     * @returns 完整月份描述字符串（格式：X年X月）
     * 
     * 示例：
     * ```typescript
     * const month = SolarMonth.fromYm(2023, 12);
     * const fullStr = month.toFullString(); // 返回"2023年12月"
     * ```
     */
    toFullString(): string {
        return `${this.getYear()}年${this.getMonth()}月`;
    }
}