import {SolarMonth} from './SolarMonth';

/**
 * 阳历季度类
 * 提供阳历季度的创建、计算、转换等功能
 * 
 * 季度划分规则：
 * - 第1季度：1月、2月、3月
 * - 第2季度：4月、5月、6月
 * - 第3季度：7月、8月、9月
 * - 第4季度：10月、11月、12月
 * 
 * 主要功能：
 * - 从年份、月份或Date对象创建季度
 * - 获取季度的年份、月份、索引
 * - 推移季度（增加或减少指定季度数）
 * - 获取季度包含的所有月份
 * - 转换为字符串表示
 */
export class SolarSeason {

    private readonly _year: number;
    private readonly _month: number;

    /**
     * 根据年份和月份创建阳历季度
     * 
     * @param year 年份
     * @param month 月份（1-12）
     * @returns 阳历季度对象
     * 
     * @example
     * // 创建2023年第2季度（4-6月）
     * const season = SolarSeason.fromYm(2023, 5);
     */
    static fromYm(year: number, month: number): SolarSeason {
        return new SolarSeason(year, month);
    }

    /**
     * 根据Date对象创建阳历季度
     * 
     * @param date JavaScript Date对象
     * @returns 阳历季度对象
     * 
     * @example
     * // 创建当前日期所在的季度
     * const season = SolarSeason.fromDate(new Date());
     */
    static fromDate(date: Date): SolarSeason {
        return SolarSeason.fromYm(date.getFullYear(), date.getMonth() + 1);
    }

    /**
     * 构造函数
     * 
     * @param year 年份
     * @param month 月份（1-12）
     * 
     * @internal 建议使用静态工厂方法创建实例
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
     * 获取季度索引
     * 
     * @returns 季度索引（1-4，1表示第1季度，4表示第4季度）
     * 
     * @example
     * const season = SolarSeason.fromYm(2023, 5);
     * const index = season.getIndex(); // 返回2（第2季度）
     */
    getIndex(): number {
        return Math.ceil(this._month / 3);
    }

    /**
     * 推移季度
     * 
     * @param seasons 推移的季度数（正数为增加，负数为减少）
     * @returns 推移后的阳历季度对象
     * 
     * @example
     * // 当前季度向后推移1个季度
     * const season = SolarSeason.fromYm(2023, 5);
     * const nextSeason = season.next(1); // 返回2023年第3季度
     * 
     * // 当前季度向前推移2个季度
     * const prevSeason = season.next(-2); // 返回2022年第4季度
     */
    next(seasons: number): SolarSeason {
        const month = SolarMonth.fromYm(this._year, this._month).next(3 * seasons);
        return SolarSeason.fromYm(month.getYear(), month.getMonth());
    }

    /**
     * 获取季度包含的所有月份
     * 
     * @returns 月份数组（按月份顺序排列）
     * 
     * @example
     * const season = SolarSeason.fromYm(2023, 5);
     * const months = season.getMonths();
     * // months包含2023年4月、5月、6月三个SolarMonth对象
     */
    getMonths(): SolarMonth[] {
        const l: SolarMonth[] = [];
        const index = this.getIndex() - 1;
        for (let i = 0; i < 3; i++) {
            l.push(SolarMonth.fromYm(this._year, 3 * index + i + 1));
        }
        return l;
    }

    /**
     * 转换为字符串
     * 
     * @returns 字符串表示（格式：年.季度索引）
     * 
     * @example
     * const season = SolarSeason.fromYm(2023, 5);
     * const str = season.toString(); // 返回"2023.2"
     */
    toString(): string {
        return `${this.getYear()}.${this.getIndex()}`;
    }

    /**
     * 转换为完整字符串
     * 
     * @returns 完整字符串表示（格式：X年第X季度）
     * 
     * @example
     * const season = SolarSeason.fromYm(2023, 5);
     * const fullStr = season.toFullString(); // 返回"2023年2季度"
     */
    toFullString(): string {
        return `${this.getYear()}年${this.getIndex()}季度`;
    }
}