import {SolarMonth} from './SolarMonth';

/**
 * 阳历年类
 * 提供阳历年的创建、计算、转换等功能
 * 
 * 主要功能：
 * - 从年份或Date对象创建阳历年
 * - 获取阳历年的年份
 * - 推移年份（增加或减少指定年数）
 * - 获取阳历年包含的所有月份
 * - 转换为字符串表示
 */
export class SolarYear {

    private readonly _year: number;

    /**
     * 根据年份创建阳历年
     * 
     * @param year 年份
     * @returns 阳历年对象
     * 
     * @example
     * // 创建2023年的阳历年
     * const year = SolarYear.fromYear(2023);
     */
    static fromYear(year: number): SolarYear {
        return new SolarYear(year);
    }

    /**
     * 根据Date对象创建阳历年
     * 
     * @param date JavaScript Date对象
     * @returns 阳历年对象
     * 
     * @example
     * // 创建当前日期所在的阳历年
     * const year = SolarYear.fromDate(new Date());
     */
    static fromDate(date: Date): SolarYear {
        return SolarYear.fromYear(date.getFullYear());
    }

    /**
     * 构造函数
     * 
     * @param year 年份
     * 
     * @internal 建议使用静态工厂方法创建实例
     */
    constructor(year: number) {
        this._year = year;
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
     * 推移年份
     * 
     * @param years 推移的年数（正数为增加，负数为减少）
     * @returns 推移后的阳历年对象
     * 
     * @example
     * // 当前年份向后推移1年
     * const year = SolarYear.fromYear(2023);
     * const nextYear = year.next(1); // 返回2024年
     * 
     * // 当前年份向前推移2年
     * const prevYear = year.next(-2); // 返回2021年
     */
    next(years: number): SolarYear {
        return SolarYear.fromYear(this._year + years);
    }

    /**
     * 获取阳历年包含的所有月份
     * 
     * @returns 月份数组（按月份顺序排列，从1月到12月）
     * 
     * @example
     * const year = SolarYear.fromYear(2023);
     * const months = year.getMonths();
     * // months包含2023年1月到12月的12个SolarMonth对象
     */
    getMonths(): SolarMonth[] {
        const l: SolarMonth[] = [];
        const m = SolarMonth.fromYm(this._year, 1);
        l.push(m);
        for (let i = 1; i < 12; i++) {
            l.push(m.next(i));
        }
        return l;
    }

    /**
     * 转换为字符串
     * 
     * @returns 字符串表示（仅年份）
     * 
     * @example
     * const year = SolarYear.fromYear(2023);
     * const str = year.toString(); // 返回"2023"
     */
    toString(): string {
        return `${this.getYear()}`;
    }

    /**
     * 转换为完整字符串
     * 
     * @returns 完整字符串表示（格式：X年）
     * 
     * @example
     * const year = SolarYear.fromYear(2023);
     * const fullStr = year.toFullString(); // 返回"2023年"
     */
    toFullString(): string {
        return `${this.getYear()}年`;
    }
}