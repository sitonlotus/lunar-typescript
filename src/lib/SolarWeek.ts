import {SolarUtil} from './SolarUtil';
import {Solar} from './Solar';

/**
 * 阳历周类
 * 提供阳历周的计算和管理功能
 * 
 * 主要功能包括：
 * - 根据指定起始日创建周对象
 * - 计算周在月份和年份中的索引
 * - 获取周内的所有日期
 * - 周之间的推移计算
 * - 跨月周的特殊处理
 * 
 * 周起始日说明：
 * - 0：星期日
 * - 1：星期一
 * - 2：星期二
 * - 3：星期三
 * - 4：星期四
 * - 5：星期五
 * - 6：星期六
 * 
 * 特殊处理：
 * - 支持跨月周的边界处理
 * - 自动计算周在月份和年份中的位置
 * - 提供分离月份和不分离月份的周推移
 */
export class SolarWeek {

    private readonly _year: number;
    private readonly _month: number;
    private readonly _day: number;
    private readonly _start: number;

    /**
     * 从年月日和起始日创建阳历周对象
     * 
     * 根据指定的日期和周起始日创建周对象
     * 周对象代表包含指定日期的那一周
     * 
     * @param year - 年份
     * @param month - 月份（1-12）
     * @param day - 日期（1-31）
     * @param start - 周起始日（0-6，0=星期日，1=星期一，...，6=星期六）
     * @returns 阳历周对象
     * 
     * 示例：
     * ```typescript
     * // 创建2023年12月25日所在周，周起始日为星期一
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1);
     * ```
     */
    static fromYmd(year: number, month: number, day: number, start: number): SolarWeek {
        return new SolarWeek(year, month, day, start);
    }

    /**
     * 从JavaScript Date对象和起始日创建阳历周对象
     * 
     * 将标准的JavaScript Date对象转换为阳历周对象
     * 自动处理JavaScript Date的月份转换（0-11转1-12）
     * 
     * @param date - JavaScript Date对象
     * @param start - 周起始日（0-6，0=星期日，1=星期一，...，6=星期六）
     * @returns 阳历周对象
     * 
     * 示例：
     * ```typescript
     * const now = new Date();
     * // 创建当前日期所在周，周起始日为星期日
     * const week = SolarWeek.fromDate(now, 0);
     * ```
     */
    static fromDate(date: Date, start: number): SolarWeek {
        return SolarWeek.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate(), start);
    }

    /**
     * 构造函数
     * 
     * 创建阳历周对象，基于指定的日期和周起始日
     * 
     * @param year - 年份
     * @param month - 月份（1-12）
     * @param day - 日期（1-31）
     * @param start - 周起始日（0-6，0=星期日，1=星期一，...，6=星期六）
     */
    constructor(year: number, month: number, day: number, start: number) {
        this._year = year;
        this._month = month;
        this._day = day;
        this._start = start;
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
     * 获取日期
     * 
     * @returns 创建周对象时使用的日期
     */
    getDay(): number {
        return this._day;
    }

    /**
     * 获取周起始日
     * 
     * @returns 周起始日（0-6，0=星期日，1=星期一，...，6=星期六）
     */
    getStart(): number {
        return this._start;
    }

    /**
     * 获取当前周在月份中的索引
     * 
     * 计算当前周在所属月份中是第几周
     * 索引从1开始计数
     * 
     * @returns 周在月份中的索引（1表示第1周）
     * 
     * 算法说明：
     * - 计算月份第一天的星期与周起始日的偏移
     * - 根据偏移和当前日期计算周索引
     * - 跨月周会根据起始日重新计算
     * 
     * 示例：
     * ```typescript
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1); // 星期一为起始
     * const index = week.getIndex(); // 返回4（12月第4周）
     * ```
     */
    getIndex(): number {
        let offset = Solar.fromYmd(this._year,this._month,1).getWeek() - this._start;
        if(offset < 0) {
            offset += 7;
        }
        return Math.ceil((this._day + offset) / 7);
    }

    /**
     * 获取当前周在年份中的索引
     * 
     * 计算当前周在所属年份中是第几周
     * 索引从1开始计数
     * 
     * @returns 周在年份中的索引（1表示第1周）
     * 
     * 算法说明：
     * - 计算年份第一天的星期与周起始日的偏移
     * - 根据偏移和当前日期在年份中的天数计算周索引
     * - 考虑闰年对天数的影响
     * 
     * 示例：
     * ```typescript
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1); // 星期一为起始
     * const index = week.getIndexInYear(); // 返回52（2023年第52周）
     * ```
     */
    getIndexInYear(): number {
        let offset = Solar.fromYmd(this._year,1,1).getWeek() - this._start;
        if(offset < 0) {
            offset += 7;
        }
        return Math.ceil((SolarUtil.getDaysInYear(this._year, this._month, this._day) + offset) / 7);
    }

    /**
     * 增加或减少周数
     * 
     * 在当前周的基础上增加或减少指定的周数
     * 可选择是否分离月份处理跨月周
     * 
     * @param weeks - 周数（正数为增加，负数为减少）
     * @param separateMonth - 是否分离月份处理（true：跨月时调整到目标月的第一周或最后一周）
     * @returns 新的阳历周对象
     * 
     * 分离月份模式说明：
     * - 当separateMonth为true时：
     *   - 增加周数：如果跨月，调整到目标月的第一周
     *   - 减少周数：如果跨月，调整到目标月的最后一周
     * - 当separateMonth为false时：
     *   - 直接按7天为单位推移，不考虑月份边界
     * 
     * 示例：
     * ```typescript
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1);
     * 
     * // 分离月份模式：推移到2024年1月第一周
     * const nextMonth = week.next(1, true);
     * 
     * // 不分离月份模式：直接推移7天
     * const nextWeek = week.next(1, false);
     * ```
     */
    next(weeks: number, separateMonth: boolean): SolarWeek {
        const start = this._start;
        if (0 === weeks) {
            return SolarWeek.fromYmd(this._year, this._month, this._day, start);
        }
        let solar = Solar.fromYmd(this._year, this._month, this._day);
        if (separateMonth) {
            let n = weeks;
            let week = SolarWeek.fromYmd(this._year, this._month, this._day, start);
            let month = this._month;
            const plus = n > 0;
            while (0 !== n) {
                solar = solar.next(plus ? 7 : -7);
                week = SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
                let weekMonth = week.getMonth();
                if (month !== weekMonth) {
                    const index = week.getIndex();
                    if (plus) {
                        if (1 === index) {
                            const firstDay = week.getFirstDay();
                            week = SolarWeek.fromYmd(firstDay.getYear(), firstDay.getMonth(), firstDay.getDay(), start);
                            weekMonth = week.getMonth();
                        } else {
                            solar = Solar.fromYmd(week.getYear(), week.getMonth(), 1);
                            week = SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
                        }
                    } else {
                        if (SolarUtil.getWeeksOfMonth(week.getYear(), week.getMonth(), start) === index) {
                            const lastDay = week.getFirstDay().next(6);
                            week = SolarWeek.fromYmd(lastDay.getYear(), lastDay.getMonth(), lastDay.getDay(), start);
                            weekMonth = week.getMonth();
                        } else {
                            solar = Solar.fromYmd(week.getYear(), week.getMonth(), SolarUtil.getDaysOfMonth(week.getYear(), week.getMonth()));
                            week = SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
                        }
                    }
                    month = weekMonth;
                }
                n -= plus ? 1 : -1;
            }
            return week;
        } else {
            solar = solar.next(weeks * 7);
            return SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
        }
    }

    /**
     * 获取周的第一天
     * 
     * 根据周起始日计算当前周的第一天（周起始日对应的日期）
     * 
     * @returns 周的第一天（Solar对象）
     * 
     * 算法说明：
     * - 计算当前日期与周起始日的偏移天数
     * - 向前推移偏移天数得到周的第一天
     * 
     * 示例：
     * ```typescript
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1); // 星期一为起始
     * const firstDay = week.getFirstDay(); // 返回2023年12月25日所在周的第一天（12月25日）
     * ```
     */
    getFirstDay(): Solar {
        const solar = Solar.fromYmd(this._year, this._month, this._day);
        let prev = solar.getWeek() - this._start;
        if (prev < 0) {
            prev += 7;
        }
        return solar.next(-prev);
    }

    /**
     * 获取周在当前月份的第一天
     * 
     * 对于跨月周，返回属于当前月份的第一天
     * 如果周完全在当前月份内，则返回周的第一天
     * 
     * @returns 周在当前月份的第一天（Solar对象）
     * 
     * 示例：
     * ```typescript
     * // 跨月周：2023年12月31日所在周（包含2024年1月的日期）
     * const week = SolarWeek.fromYmd(2023, 12, 31, 1);
     * const firstDayInMonth = week.getFirstDayInMonth(); // 返回2023年12月25日
     * ```
     */
    getFirstDayInMonth(): Solar {
        let index = 0;
        const days = this.getDays();
        for (let i = 0; i < days.length; i++) {
            if (this._month === days[i].getMonth()) {
                index = i;
                break;
            }
        }
        return days[index];
    }

    /**
     * 获取周内的所有日期
     * 
     * 返回当前周从起始日开始的所有7天日期
     * 对于跨月周，会包含属于其他月份的日期
     * 
     * @returns 周内所有日期的数组（7个Solar对象）
     * 
     * 数组顺序：
     * - 索引0：周起始日对应的日期
     * - 索引1：起始日后第1天
     * - ...
     * - 索引6：起始日后第6天
     * 
     * 示例：
     * ```typescript
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1); // 星期一为起始
     * const days = week.getDays(); // 返回12月25日-12月31日的7天日期
     * ```
     */
    getDays(): Solar[] {
        const firstDay = this.getFirstDay();
        const l: Solar[] = [];
        l.push(firstDay);
        for (let i = 1; i < 7; i++) {
            l.push(firstDay.next(i));
        }
        return l;
    }

    /**
     * 获取周内属于当前月份的日期
     * 
     * 对于跨月周，只返回属于创建周对象时指定月份的日期
     * 过滤掉属于其他月份的日期
     * 
     * @returns 周内属于当前月份的日期数组（Solar对象数组）
     * 
     * 示例：
     * ```typescript
     * // 跨月周：2023年12月31日所在周（包含2024年1月的日期）
     * const week = SolarWeek.fromYmd(2023, 12, 31, 1);
     * const daysInMonth = week.getDaysInMonth(); // 只返回2023年12月的日期
     * ```
     */
    getDaysInMonth(): Solar[] {
        const days = this.getDays();
        const l: Solar[] = [];
        for (let i = 0; i < days.length; i++) {
            const day = days[i];
            if (this._month !== day.getMonth()) {
                continue;
            }
            l.push(day);
        }
        return l;
    }

    /**
     * 转换为字符串
     * 
     * 重写Object.prototype.toString()方法
     * 返回简洁的周标识字符串
     * 
     * @returns 周标识字符串（格式：年.月.周索引）
     * 
     * 示例：
     * ```typescript
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1);
     * const str = week.toString(); // 返回"2023.12.4"
     * console.log(`周：${week}`); // 自动调用toString()
     * ```
     */
    toString(): string {
        return `${this.getYear()}.${this.getMonth()}.${this.getIndex()}`;
    }

    /**
     * 转换为完整字符串
     * 
     * 返回包含完整中文信息的周描述字符串
     * 
     * @returns 完整周描述字符串（格式：X年X月第X周）
     * 
     * 示例：
     * ```typescript
     * const week = SolarWeek.fromYmd(2023, 12, 25, 1);
     * const fullStr = week.toFullString(); // 返回"2023年12月第4周"
     * ```
     */
    toFullString(): string {
        return `${this.getYear()}年${this.getMonth()}月第${this.getIndex()}周`;
    }
}