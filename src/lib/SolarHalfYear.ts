import {SolarMonth} from './SolarMonth';

/**
 * 阳历半年类
 * 提供阳历半年的创建、计算、转换等功能
 * 
 * 半年划分规则：
 * - 上半年：1月、2月、3月、4月、5月、6月
 * - 下半年：7月、8月、9月、10月、11月、12月
 * 
 * 主要功能：
 * - 从年份、月份或Date对象创建半年
 * - 获取半年的年份、月份、索引
 * - 推移半年（增加或减少指定半年数）
 * - 获取半年包含的所有月份
 * - 转换为字符串表示
 */
export class SolarHalfYear {

    private readonly _year: number;
    private readonly _month: number;

    /**
     * 根据年份和月份创建阳历年半
     * 
     * @param year 年份
     * @param month 月份（1-12）
     * @returns 阳历年半对象
     * 
     * @example
     * // 创建2023年上半年（1-6月）
     * const halfYear = SolarHalfYear.fromYm(2023, 3);
     * 
     * // 创建2023年下半年（7-12月）
     * const halfYear2 = SolarHalfYear.fromYm(2023, 9);
     */
    static fromYm(year: number, month: number): SolarHalfYear {
        return new SolarHalfYear(year, month);
    }

    /**
     * 根据Date对象创建阳历年半
     * 
     * @param date JavaScript Date对象
     * @returns 阳历年半对象
     * 
     * @example
     * // 创建当前日期所在的半年
     * const halfYear = SolarHalfYear.fromDate(new Date());
     */
    static fromDate(date: Date): SolarHalfYear {
        return SolarHalfYear.fromYm(date.getFullYear(), date.getMonth() + 1);
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
     * 获取半年索引
     * 
     * @returns 半年索引（1表示上半年，2表示下半年）
     * 
     * @example
     * const halfYear = SolarHalfYear.fromYm(2023, 3);
     * const index = halfYear.getIndex(); // 返回1（上半年）
     * 
     * const halfYear2 = SolarHalfYear.fromYm(2023, 9);
     * const index2 = halfYear2.getIndex(); // 返回2（下半年）
     */
    getIndex(): number {
        return Math.ceil(this._month / 6);
    }

    /**
     * 推移半年
     * 
     * @param halfYears 推移的半年数（正数为增加，负数为减少）
     * @returns 推移后的阳历年半对象
     * 
     * @example
     * // 当前半年向后推移1个半年
     * const halfYear = SolarHalfYear.fromYm(2023, 3); // 2023年上半年
     * const nextHalfYear = halfYear.next(1); // 返回2023年下半年
     * 
     * // 当前半年向前推移2个半年
     * const prevHalfYear = halfYear.next(-2); // 返回2022年下半年
     */
    next(halfYears: number): SolarHalfYear {
        const month = SolarMonth.fromYm(this._year, this._month).next(6 * halfYears);
        return SolarHalfYear.fromYm(month.getYear(), month.getMonth());
    }

    /**
     * 获取半年包含的所有月份
     * 
     * @returns 月份数组（按月份顺序排列）
     * 
     * @example
     * const halfYear = SolarHalfYear.fromYm(2023, 3); // 2023年上半年
     * const months = halfYear.getMonths();
     * // months包含2023年1月到6月的6个SolarMonth对象
     */
    getMonths(): SolarMonth[] {
        const l: SolarMonth[] = [];
        const index = this.getIndex() - 1;
        for (let i = 0; i < 6; i++) {
            l.push(SolarMonth.fromYm(this._year, 6 * index + i + 1));
        }
        return l;
    }

    /**
     * 转换为字符串
     * 
     * @returns 字符串表示（格式：年.半年索引）
     * 
     * @example
     * const halfYear = SolarHalfYear.fromYm(2023, 3);
     * const str = halfYear.toString(); // 返回"2023.1"
     * 
     * const halfYear2 = SolarHalfYear.fromYm(2023, 9);
     * const str2 = halfYear2.toString(); // 返回"2023.2"
     */
    toString(): string {
        return `${this.getYear()}.${this.getIndex()}`;
    }

    /**
     * 转换为完整字符串
     * 
     * @returns 完整字符串表示（格式：X年上半年或X年下半年）
     * 
     * @example
     * const halfYear = SolarHalfYear.fromYm(2023, 3);
     * const fullStr = halfYear.toFullString(); // 返回"2023年上半年"
     * 
     * const halfYear2 = SolarHalfYear.fromYm(2023, 9);
     * const fullStr2 = halfYear2.toFullString(); // 返回"2023年下半年"
     */
    toFullString(): string {
        const name = ['上', '下'][this.getIndex() - 1];
        return `${this.getYear()}年${name}半年`;
    }
}