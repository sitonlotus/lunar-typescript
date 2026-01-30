import {Solar} from './Solar';
import {SolarUtil} from './SolarUtil';
import {LunarUtil} from './LunarUtil';
import {JieQi} from './JieQi';
import {EightChar} from './EightChar';
import {NineStar} from './NineStar';
import {ShuJiu} from './ShuJiu';
import {Fu} from './Fu';
import {LunarYear} from './LunarYear';
import {LunarTime} from './LunarTime';
import {Foto} from './Foto';
import {Tao} from './Tao';
import {I18n} from './I18n';

/**
 * 农历信息接口
 */
interface LunarInfo {
    timeGanIndex: number;
    timeZhiIndex: number;
    dayGanIndex: number;
    dayZhiIndex: number;
    dayGanIndexExact: number;
    dayZhiIndexExact: number;
    dayGanIndexExact2: number;
    dayZhiIndexExact2: number;
    monthGanIndex: number;
    monthZhiIndex: number;
    monthGanIndexExact: number;
    monthZhiIndexExact: number;
    yearGanIndex: number;
    yearZhiIndex: number;
    yearGanIndexByLiChun: number;
    yearZhiIndexByLiChun: number;
    yearGanIndexExact: number;
    yearZhiIndexExact: number;
    weekIndex: number;
    jieQi: Record<string, Solar>;
    jieQiList: string[];
}

/**
 * 农历日期类
 * 提供农历日期的创建、转换、计算等功能，支持干支、生肖、节气、节日等传统历法信息
 * 
 * 主要功能包括：
 * - 农历日期的创建与转换（农历转阳历、阳历转农历）
 * - 干支纪年、纪月、纪日、纪时
 * - 生肖信息查询
 * - 节气信息查询
 * - 节日信息查询
 * - 传统文化相关信息（如九九、三伏、纳音、八字等）
 * - 择日相关信息（如宜忌、吉神、凶神、胎神等）
 * - 方位、神煞等信息
 * 
 * 特殊说明：
 * - 农历月份：正数表示平月，负数表示闰月（如-5表示闰五月）
 * - 干支计算：支持以正月初一或立春为界的计算方式
 * - 精确时间：部分计算支持精确到时刻
 */
export class Lunar {
    private _lang: string;
    private readonly _year: number;
    private readonly _month: number;
    private readonly _day: number;
    private readonly _hour: number;
    private readonly _minute: number;
    private readonly _second: number;
    private readonly _timeGanIndex: number;
    private readonly _timeZhiIndex: number;
    private readonly _dayGanIndex: number;
    private readonly _dayZhiIndex: number;
    private readonly _dayGanIndexExact: number;
    private readonly _dayZhiIndexExact: number;
    private readonly _dayGanIndexExact2: number;
    private readonly _dayZhiIndexExact2: number;
    private readonly _monthGanIndex: number;
    private readonly _monthZhiIndex: number;
    private readonly _monthGanIndexExact: number;
    private readonly _monthZhiIndexExact: number;
    private readonly _yearGanIndex: number;
    private readonly _yearZhiIndex: number;
    private readonly _yearGanIndexByLiChun: number;
    private readonly _yearZhiIndexByLiChun: number;
    private readonly _yearGanIndexExact: number;
    private readonly _yearZhiIndexExact: number;
    private readonly _weekIndex: number;
    private _jieQi: Record<string, Solar>;
    private _jieQiList: string[];
    private readonly _solar: Solar;
    private readonly _eightChar: EightChar;

    /**
     * 从农历年月日创建农历日期（时分秒默认为0）
     * 
     * @param lunarYear - 农历年
     * @param lunarMonth - 农历月（正数表示平月，负数表示闰月，如-5表示闰五月）
     * @param lunarDay - 农历日
     * @returns 农历日期对象
     * 
     * 示例：
     * ```typescript
     * // 创建农历2023年1月1日（正月初一）
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * 
     * // 创建农历2023年闰2月1日
     * const leapLunar = Lunar.fromYmd(2023, -2, 1);
     * ```
     */
    static fromYmd(lunarYear: number, lunarMonth: number, lunarDay: number): Lunar {
        return Lunar.fromYmdHms(lunarYear, lunarMonth, lunarDay, 0, 0, 0);
    }

    /**
     * 从农历年月日时分秒创建农历日期
     * 
     * @param lunarYear - 农历年
     * @param lunarMonth - 农历月（正数表示平月，负数表示闰月）
     * @param lunarDay - 农历日
     * @param hour - 小时（0-23）
     * @param minute - 分钟（0-59）
     * @param second - 秒（0-59）
     * @returns 农历日期对象
     * 
     * 示例：
     * ```typescript
     * // 创建农历2023年1月1日12:30:00
     * const lunar = Lunar.fromYmdHms(2023, 1, 1, 12, 30, 0);
     * ```
     */
    static fromYmdHms(lunarYear: number, lunarMonth: number, lunarDay: number, hour: number, minute: number, second: number): Lunar {
        let y = LunarYear.fromYear(lunarYear);
        const m = y.getMonth(lunarMonth);
        if (null == m) {
            throw new Error(`wrong lunar year ${lunarYear} month ${lunarMonth}`);
        }
        if (lunarDay < 1) {
            throw new Error('lunar day must bigger than 0');
        }
        const days = m.getDayCount();
        if (lunarDay > days) {
            throw new Error(`only ${days} days in lunar year ${lunarYear} month ${lunarMonth}`);
        }
        const noon = Solar.fromJulianDay(m.getFirstJulianDay() + lunarDay - 1);
        const solar = Solar.fromYmdHms(noon.getYear(), noon.getMonth(), noon.getDay(), hour, minute, second);
        if (noon.getYear() !== lunarYear) {
            y = LunarYear.fromYear(noon.getYear());
        }
        return new Lunar(lunarYear, lunarMonth, lunarDay, hour, minute, second, solar, y);
    }

    /**
     * 从阳历日期创建农历日期
     * 
     * @param solar - 阳历日期对象
     * @returns 农历日期对象
     * 
     * 示例：
     * ```typescript
     * // 将阳历2023年1月22日转换为农历
     * const solar = Solar.fromYmd(2023, 1, 22);
     * const lunar = Lunar.fromSolar(solar); // 返回农历2023年1月1日
     * ```
     */
    static fromSolar(solar: Solar): Lunar {
        let lunarYear = 0;
        let lunarMonth = 0;
        let lunarDay = 0;
        const ly = LunarYear.fromYear(solar.getYear());
        const lms = ly.getMonths();
        for (let i = 0, j = lms.length; i < j; i++) {
            const m = lms[i];
            const days = solar.subtract(Solar.fromJulianDay(m.getFirstJulianDay()));
            if (days < m.getDayCount()) {
                lunarYear = m.getYear();
                lunarMonth = m.getMonth();
                lunarDay = days + 1;
                break;
            }
        }
        return new Lunar(lunarYear, lunarMonth, lunarDay, solar.getHour(), solar.getMinute(), solar.getSecond(), solar, ly);
    }

    /**
     * 从JavaScript Date对象创建农历日期
     * 
     * @param date - JavaScript Date对象
     * @returns 农历日期对象
     * 
     * 示例：
     * ```typescript
     * // 将当前日期转换为农历
     * const now = new Date();
     * const lunar = Lunar.fromDate(now);
     * ```
     */
    static fromDate(date: Date): Lunar {
        return Lunar.fromSolar(Solar.fromDate(date));
    }

    private static _computeJieQi(o: LunarInfo, ly: LunarYear) {
        const julianDays = ly.getJieQiJulianDays();
        for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i++) {
            const key = LunarUtil.JIE_QI_IN_USE[i];
            o.jieQiList.push(key);
            o.jieQi[key] = Solar.fromJulianDay(julianDays[i]);
        }
    }

    private static _computeYear(o: LunarInfo, solar: Solar, year: number) {
        //以正月初一开始
        const offset = year - 4;
        let yearGanIndex = offset % 10;
        let yearZhiIndex = offset % 12;

        if (yearGanIndex < 0) {
            yearGanIndex += 10;
        }

        if (yearZhiIndex < 0) {
            yearZhiIndex += 12;
        }

        //以立春作为新一年的开始的干支纪年
        let g = yearGanIndex;
        let z = yearZhiIndex;

        //精确的干支纪年，以立春交接时刻为准
        let gExact = yearGanIndex;
        let zExact = yearZhiIndex;

        const solarYear = solar.getYear();
        const solarYmd = solar.toYmd();
        const solarYmdHms = solar.toYmdHms();

        //获取立春的阳历时刻
        let liChun = o.jieQi[I18n.getMessage('jq.liChun')];
        if (liChun.getYear() != solarYear) {
            liChun = o.jieQi['LI_CHUN'];
        }
        const liChunYmd = liChun.toYmd();
        const liChunYmdHms = liChun.toYmdHms();

        //阳历和阴历年份相同代表正月初一及以后
        if (year === solarYear) {
            //立春日期判断
            if (solarYmd < liChunYmd) {
                g--;
                z--;
            }
            //立春交接时刻判断
            if (solarYmdHms < liChunYmdHms) {
                gExact--;
                zExact--;
            }
        } else if (year < solarYear) {
            if (solarYmd >= liChunYmd) {
                g++;
                z++;
            }
            if (solarYmdHms >= liChunYmdHms) {
                gExact++;
                zExact++;
            }
        }

        o.yearGanIndex = yearGanIndex;
        o.yearZhiIndex = yearZhiIndex;
        o.yearGanIndexByLiChun = (g < 0 ? g + 10 : g) % 10;
        o.yearZhiIndexByLiChun = (z < 0 ? z + 12 : z) % 12;
        o.yearGanIndexExact = (gExact < 0 ? gExact + 10 : gExact) % 10;
        o.yearZhiIndexExact = (zExact < 0 ? zExact + 12 : zExact) % 12;
    }

    private static _computeMonth(o: LunarInfo, solar: Solar) {
        let start: Solar | null = null;
        let end: Solar | null = null;
        const ymd = solar.toYmd();
        const time = solar.toYmdHms();
        const size = LunarUtil.JIE_QI_IN_USE.length;

        //序号：大雪以前-3，大雪到小寒之间-2，小寒到立春之间-1，立春之后0
        let index = -3;
        for (let i = 0; i < size; i += 2) {
            end = o.jieQi[LunarUtil.JIE_QI_IN_USE[i]];
            const symd = null == start ? ymd : start.toYmd();
            if (ymd >= symd && ymd < end.toYmd()) {
                break;
            }
            start = end;
            index++;
        }
        let offset = (((o.yearGanIndexByLiChun + (index < 0 ? 1 : 0)) % 5 + 1) * 2) % 10;
        o.monthGanIndex = ((index < 0 ? index + 10 : index) + offset) % 10;
        o.monthZhiIndex = ((index < 0 ? index + 12 : index) + LunarUtil.BASE_MONTH_ZHI_INDEX) % 12;

        start = null;
        index = -3;
        for (let i = 0; i < size; i += 2) {
            end = o.jieQi[LunarUtil.JIE_QI_IN_USE[i]];
            const stime = null == start ? time : start.toYmdHms();
            if (time >= stime && time < end.toYmdHms()) {
                break;
            }
            start = end;
            index++;
        }
        offset = (((o.yearGanIndexExact + (index < 0 ? 1 : 0)) % 5 + 1) * 2) % 10;
        o.monthGanIndexExact = ((index < 0 ? index + 10 : index) + offset) % 10;
        o.monthZhiIndexExact = ((index < 0 ? index + 12 : index) + LunarUtil.BASE_MONTH_ZHI_INDEX) % 12;
    }

    private static _computeDay(o: LunarInfo, solar: Solar, hour: number, minute: number) {
        const noon = Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), 12, 0, 0);
        const offset = Math.floor(noon.getJulianDay()) - 11;
        const dayGanIndex = offset % 10;
        const dayZhiIndex = offset % 12;
        o.dayGanIndex = dayGanIndex;
        o.dayZhiIndex = dayZhiIndex;
        let dayGanExact = dayGanIndex;
        let dayZhiExact = dayZhiIndex;
        o.dayGanIndexExact2 = dayGanExact;
        o.dayZhiIndexExact2 = dayZhiExact;
        const hm = (hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute;
        if (hm >= '23:00' && hm <= '23:59') {
            dayGanExact++;
            if (dayGanExact >= 10) {
                dayGanExact -= 10;
            }
            dayZhiExact++;
            if (dayZhiExact >= 12) {
                dayZhiExact -= 12;
            }
        }
        o.dayGanIndexExact = dayGanExact;
        o.dayZhiIndexExact = dayZhiExact;
    }

    private static _computeTime(o: LunarInfo, hour: number, minute: number) {
        const timeZhiIndex = LunarUtil.getTimeZhiIndex((hour < 10 ? '0' : '') + hour + ':' + (minute < 10 ? '0' : '') + minute);
        o.timeZhiIndex = timeZhiIndex;
        o.timeGanIndex = (o.dayGanIndexExact % 5 * 2 + timeZhiIndex) % 10;
    }

    private static _computeWeek(o: LunarInfo, solar: Solar) {
        o.weekIndex = solar.getWeek();
    }

    private static _compute(year: number, hour: number, minute: number, solar: Solar, ly: LunarYear): LunarInfo {
        const o: LunarInfo = {
            timeGanIndex: 0,
            timeZhiIndex: 0,
            dayGanIndex: 0,
            dayZhiIndex: 0,
            dayGanIndexExact: 0,
            dayZhiIndexExact: 0,
            dayGanIndexExact2: 0,
            dayZhiIndexExact2: 0,
            monthGanIndex: 0,
            monthZhiIndex: 0,
            monthGanIndexExact: 0,
            monthZhiIndexExact: 0,
            yearGanIndex: 0,
            yearZhiIndex: 0,
            yearGanIndexByLiChun: 0,
            yearZhiIndexByLiChun: 0,
            yearGanIndexExact: 0,
            yearZhiIndexExact: 0,
            weekIndex: 0,
            jieQi: {},
            jieQiList: []
        };
        Lunar._computeJieQi(o, ly);
        Lunar._computeYear(o, solar, year);
        Lunar._computeMonth(o, solar);
        Lunar._computeDay(o, solar, hour, minute);
        Lunar._computeTime(o, hour, minute);
        Lunar._computeWeek(o, solar);
        return o;
    }

    /**
     * 构造函数
     * 
     * @param year - 农历年
     * @param month - 农历月（正数表示平月，负数表示闰月）
     * @param day - 农历日
     * @param hour - 小时（0-23）
     * @param minute - 分钟（0-59）
     * @param second - 秒（0-59）
     * @param solar - 对应的阳历日期对象
     * @param ly - 对应的农历年对象
     * 
     * @internal 建议使用静态工厂方法创建实例
     */
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number, solar: Solar, ly: LunarYear) {
        const info = Lunar._compute(year, hour, minute, solar, ly);

        this._year = year;
        this._month = month;
        this._day = day;
        this._hour = hour;
        this._minute = minute;
        this._second = second;

        this._timeGanIndex = info.timeGanIndex;
        this._timeZhiIndex = info.timeZhiIndex;
        this._dayGanIndex = info.dayGanIndex;
        this._dayZhiIndex = info.dayZhiIndex;
        this._dayGanIndexExact = info.dayGanIndexExact;
        this._dayZhiIndexExact = info.dayZhiIndexExact;
        this._dayGanIndexExact2 = info.dayGanIndexExact2;
        this._dayZhiIndexExact2 = info.dayZhiIndexExact2;
        this._monthGanIndex = info.monthGanIndex;
        this._monthZhiIndex = info.monthZhiIndex;
        this._monthGanIndexExact = info.monthGanIndexExact;
        this._monthZhiIndexExact = info.monthZhiIndexExact;
        this._yearGanIndex = info.yearGanIndex;
        this._yearZhiIndex = info.yearZhiIndex;
        this._yearGanIndexByLiChun = info.yearGanIndexByLiChun;
        this._yearZhiIndexByLiChun = info.yearZhiIndexByLiChun;
        this._yearGanIndexExact = info.yearGanIndexExact;
        this._yearZhiIndexExact = info.yearZhiIndexExact;
        this._weekIndex = info.weekIndex;
        this._jieQi = info.jieQi;
        this._jieQiList = info.jieQiList;
        this._solar = solar;
        this._eightChar = new EightChar(this);
        this._lang = I18n.getLanguage();
    }

    /**
     * 获取农历年
     * 
     * @returns 农历年
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const year = lunar.getYear(); // 返回2023
     * ```
     */
    getYear(): number {
        return this._year;
    }

    /**
     * 获取农历月
     * 
     * @returns 农历月（正数表示平月，负数表示闰月）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const month = lunar.getMonth(); // 返回1（正月）
     * 
     * const leapLunar = Lunar.fromYmd(2023, -2, 1);
     * const leapMonth = leapLunar.getMonth(); // 返回-2（闰二月）
     * ```
     */
    getMonth(): number {
        return this._month;
    }

    /**
     * 获取农历日
     * 
     * @returns 农历日
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const day = lunar.getDay(); // 返回1（初一）
     * ```
     */
    getDay(): number {
        return this._day;
    }

    /**
     * 获取小时
     * 
     * @returns 小时（0-23）
     */
    getHour(): number {
        return this._hour;
    }

    /**
     * 获取分钟
     * 
     * @returns 分钟（0-59）
     */
    getMinute(): number {
        return this._minute;
    }

    /**
     * 获取秒
     * 
     * @returns 秒（0-59）
     */
    getSecond(): number {
        return this._second;
    }

    /**
     * 获取时天干索引
     * 
     * @returns 时天干索引
     */
    getTimeGanIndex(): number {
        return this._timeGanIndex;
    }

    /**
     * 获取时地支索引
     * 
     * @returns 时地支索引
     */
    getTimeZhiIndex(): number {
        return this._timeZhiIndex;
    }

    /**
     * 获取日天干索引
     * 
     * @returns 日天干索引
     */
    getDayGanIndex(): number {
        return this._dayGanIndex;
    }

    /**
     * 获取日地支索引
     * 
     * @returns 日地支索引
     */
    getDayZhiIndex(): number {
        return this._dayZhiIndex;
    }


    getMonthGanIndex(): number {
        return this._monthGanIndex;
    }

    getMonthZhiIndex(): number {
        return this._monthZhiIndex;
    }

    getYearGanIndex(): number {
        return this._yearGanIndex;
    }

    getYearZhiIndex(): number {
        return this._yearZhiIndex;
    }

    getYearGanIndexByLiChun(): number {
        return this._yearGanIndexByLiChun;
    }

    getYearZhiIndexByLiChun(): number {
        return this._yearZhiIndexByLiChun;
    }

    getDayGanIndexExact(): number {
        return this._dayGanIndexExact;
    }

    getDayZhiIndexExact(): number {
        return this._dayZhiIndexExact;
    }

    getDayGanIndexExact2(): number {
        return this._dayGanIndexExact2;
    }

    getDayZhiIndexExact2(): number {
        return this._dayZhiIndexExact2;
    }

    getMonthGanIndexExact(): number {
        return this._monthGanIndexExact;
    }

    getMonthZhiIndexExact(): number {
        return this._monthZhiIndexExact;
    }

    getYearGanIndexExact(): number {
        return this._yearGanIndexExact;
    }

    getYearZhiIndexExact(): number {
        return this._yearZhiIndexExact;
    }

    getGan(): string {
        return this.getYearGan();
    }

    getZhi(): string {
        return this.getYearZhi();
    }

    /**
     * 获取年天干（以正月初一为界）
     * 
     * 传统农历纪年以正月初一为新年的开始
     * 
     * @returns 年天干（如"甲"、"乙"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const yearGan = lunar.getYearGan(); // 返回"癸"
     * ```
     */
    getYearGan(): string {
        return LunarUtil.GAN[this._yearGanIndex + 1];
    }

    /**
     * 获取年天干（以立春为界）
     * 
     * 部分传统计算方式以立春为新年的开始
     * 
     * @returns 年天干（如"甲"、"乙"等）
     */
    getYearGanByLiChun(): string {
        return LunarUtil.GAN[this._yearGanIndexByLiChun + 1];
    }

    /**
     * 获取年天干（精确到立春时刻）
     * 
     * 更精确的计算方式，以立春交接的精确时刻为界
     * 
     * @returns 年天干（如"甲"、"乙"等）
     */
    getYearGanExact(): string {
        return LunarUtil.GAN[this._yearGanIndexExact + 1];
    }

    /**
     * 获取年地支（以正月初一为界）
     * 
     * 传统农历纪年以正月初一为新年的开始
     * 
     * @returns 年地支（如"子"、"丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const yearZhi = lunar.getYearZhi(); // 返回"卯"
     * ```
     */
    getYearZhi(): string {
        return LunarUtil.ZHI[this._yearZhiIndex + 1];
    }

    /**
     * 获取年地支（以立春为界）
     * 
     * 部分传统计算方式以立春为新年的开始
     * 
     * @returns 年地支（如"子"、"丑"等）
     */
    getYearZhiByLiChun(): string {
        return LunarUtil.ZHI[this._yearZhiIndexByLiChun + 1];
    }

    /**
     * 获取年地支（精确到立春时刻）
     * 
     * 更精确的计算方式，以立春交接的精确时刻为界
     * 
     * @returns 年地支（如"子"、"丑"等）
     */
    getYearZhiExact(): string {
        return LunarUtil.ZHI[this._yearZhiIndexExact + 1];
    }

    /**
     * 获取年干支（以正月初一为界）
     * 
     * 传统农历纪年以正月初一为新年的开始
     * 
     * @returns 年干支（如"甲子"、"乙丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const yearGanZhi = lunar.getYearInGanZhi(); // 返回"癸卯"
     * ```
     */
    getYearInGanZhi(): string {
        return this.getYearGan() + this.getYearZhi();
    }

    /**
     * 获取年干支（以立春为界）
     * 
     * 部分传统计算方式以立春为新年的开始
     * 
     * @returns 年干支（如"甲子"、"乙丑"等）
     */
    getYearInGanZhiByLiChun(): string {
        return this.getYearGanByLiChun() + this.getYearZhiByLiChun();
    }

    /**
     * 获取年干支（精确到立春时刻）
     * 
     * 更精确的计算方式，以立春交接的精确时刻为界
     * 
     * @returns 年干支（如"甲子"、"乙丑"等）
     */
    getYearInGanZhiExact(): string {
        return this.getYearGanExact() + this.getYearZhiExact();
    }

    /**
     * 获取月天干（以节气交接日为准）
     * 
     * 农历月份以节气交接日为界，如立春后为寅月
     * 
     * @returns 月天干（如"甲"、"乙"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const monthGan = lunar.getMonthGan(); // 返回"癸"
     * ```
     */
    getMonthGan(): string {
        return LunarUtil.GAN[this._monthGanIndex + 1];
    }

    /**
     * 获取月天干（精确到节气交接时刻）
     * 
     * @returns 月天干（如"甲"、"乙"等）
     */
    getMonthGanExact(): string {
        return LunarUtil.GAN[this._monthGanIndexExact + 1];
    }

    /**
     * 获取月地支（以节气交接日为准）
     * 
     * 农历月份以节气交接日为界，如立春后为寅月
     * 
     * @returns 月地支（如"子"、"丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const monthZhi = lunar.getMonthZhi(); // 返回"丑"
     * ```
     */
    getMonthZhi(): string {
        return LunarUtil.ZHI[this._monthZhiIndex + 1];
    }

    /**
     * 获取月地支（精确到节气交接时刻）
     * 
     * @returns 月地支（如"子"、"丑"等）
     */
    getMonthZhiExact(): string {
        return LunarUtil.ZHI[this._monthZhiIndexExact + 1];
    }

    /**
     * 获取月干支（以节气交接日为准）
     * 
     * 农历月份以节气交接日为界，如立春后为寅月
     * 
     * @returns 月干支（如"甲子"、"乙丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const monthGanZhi = lunar.getMonthInGanZhi(); // 返回"癸丑"
     * ```
     */
    getMonthInGanZhi(): string {
        return this.getMonthGan() + this.getMonthZhi();
    }

    /**
     * 获取月干支（精确到节气交接时刻）
     * 
     * @returns 月干支（如"甲子"、"乙丑"等）
     */
    getMonthInGanZhiExact(): string {
        return this.getMonthGanExact() + this.getMonthZhiExact();
    }

    /**
     * 获取日天干（以当日0点为准）
     * 
     * @returns 日天干（如"甲"、"乙"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const dayGan = lunar.getDayGan(); // 返回"癸"
     * ```
     */
    /**
     * 获取日天干（以当日0点为准）
     * 
     * @returns 日天干（如"甲"、"乙"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const dayGan = lunar.getDayGan(); // 返回"癸"
     * ```
     */
    getDayGan(): string {
        return LunarUtil.GAN[this._dayGanIndex + 1];
    }

    /**
     * 获取日天干（精确到当日23点）
     * 
     * @returns 日天干（如"甲"、"乙"等）
     */
    getDayGanExact(): string {
        return LunarUtil.GAN[this._dayGanIndexExact + 1];
    }

    /**
     * 获取日天干（精确版本2）
     * 
     * @returns 日天干（如"甲"、"乙"等）
     */
    getDayGanExact2(): string {
        return LunarUtil.GAN[this._dayGanIndexExact2 + 1];
    }

    /**
     * 获取日地支（以当日0点为准）
     * 
     * @returns 日地支（如"子"、"丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const dayZhi = lunar.getDayZhi(); // 返回"卯"
     * ```
     */
    getDayZhi(): string {
        return LunarUtil.ZHI[this._dayZhiIndex + 1];
    }

    /**
     * 获取日地支（精确到当日23点）
     * 
     * @returns 日地支（如"子"、"丑"等）
     */
    getDayZhiExact(): string {
        return LunarUtil.ZHI[this._dayZhiIndexExact + 1];
    }

    /**
     * 获取日地支（精确版本2）
     * 
     * @returns 日地支（如"子"、"丑"等）
     */
    getDayZhiExact2(): string {
        return LunarUtil.ZHI[this._dayZhiIndexExact2 + 1];
    }

    /**
     * 获取日干支（以当日0点为准）
     * 
     * @returns 日干支（如"甲子"、"乙丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const dayGanZhi = lunar.getDayInGanZhi(); // 返回"癸卯"
     * ```
     */
    getDayInGanZhi(): string {
        return this.getDayGan() + this.getDayZhi();
    }

    /**
     * 获取日干支（精确到当日23点）
     * 
     * @returns 日干支（如"甲子"、"乙丑"等）
     */
    getDayInGanZhiExact(): string {
        return this.getDayGanExact() + this.getDayZhiExact();
    }

    /**
     * 获取日干支（精确版本2）
     * 
     * @returns 日干支（如"甲子"、"乙丑"等）
     */
    getDayInGanZhiExact2(): string {
        return this.getDayGanExact2() + this.getDayZhiExact2();
    }

    /**
     * 获取时天干
     * 
     * 时天干根据日天干推导得出
     * 
     * @returns 时天干（如"甲"、"乙"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmdHms(2023, 1, 1, 12, 0, 0);
     * const timeGan = lunar.getTimeGan(); // 返回"戊"
     * ```
     */
    getTimeGan(): string {
        return LunarUtil.GAN[this._timeGanIndex + 1];
    }

    /**
     * 获取时地支
     * 
     * 传统中国计时法将一天分为12个时辰，每个时辰对应一个地支
     * 
     * @returns 时地支（如"子"、"丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmdHms(2023, 1, 1, 12, 0, 0);
     * const timeZhi = lunar.getTimeZhi(); // 返回"午"
     * ```
     */
    getTimeZhi(): string {
        return LunarUtil.ZHI[this._timeZhiIndex + 1];
    }

    /**
     * 获取时干支
     * 
     * @returns 时干支（如"甲子"、"乙丑"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmdHms(2023, 1, 1, 12, 0, 0);
     * const timeGanZhi = lunar.getTimeInGanZhi(); // 返回"戊午"
     * ```
     */
    getTimeInGanZhi(): string {
        return this.getTimeGan() + this.getTimeZhi();
    }

    /**
     * 获取年生肖（以正月初一为界）
     * 
     * 传统农历以正月初一为新年的开始
     * 
     * @returns 年生肖（如"鼠"、"牛"等）
     * 
     * 示例：
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 1, 1);
     * const yearShengXiao = lunar.getYearShengXiao(); // 返回"兔"
     * ```
     */
    getYearShengXiao(): string {
        return LunarUtil.SHENGXIAO[this._yearZhiIndex + 1];
    }

    /**
     * 获取年生肖（以立春为界）
     * 
     * 部分传统计算方式以立春为新年的开始
     * 
     * @returns 年生肖（如"鼠"、"牛"等）
     */
    getYearShengXiaoByLiChun(): string {
        return LunarUtil.SHENGXIAO[this._yearZhiIndexByLiChun + 1];
    }

    /**
     * 获取年生肖（精确到立春时刻）
     * 
     * @returns 年生肖（如"鼠"、"牛"等）
     */
    getYearShengXiaoExact(): string {
        return LunarUtil.SHENGXIAO[this._yearZhiIndexExact + 1];
    }

    /**
     * 获取月生肖
     * 
     * @returns 月生肖（如"鼠"、"牛"等）
     */
    getMonthShengXiao(): string {
        return LunarUtil.SHENGXIAO[this._monthZhiIndex + 1];
    }

    /**
     * 获取月生肖（精确到节气时刻）
     * 
     * @returns 月生肖（如"鼠"、"牛"等）
     */
    getMonthShengXiaoExact(): string {
        return LunarUtil.SHENGXIAO[this._monthZhiIndexExact + 1];
    }

    /**
     * 获取日生肖
     * 
     * @returns 日生肖（如"鼠"、"牛"等）
     */
    getDayShengXiao(): string {
        return LunarUtil.SHENGXIAO[this._dayZhiIndex + 1];
    }

    /**
     * 获取时生肖
     * 
     * @returns 时生肖（如"鼠"、"牛"等）
     */
    getTimeShengXiao(): string {
        return LunarUtil.SHENGXIAO[this._timeZhiIndex + 1];
    }

    /**
     * 获取年份的中文表示
     * @returns 年份的中文表示（如"一九八六"）
     */
    getYearInChinese(): string {
        const y = this._year + '';
        let s = '';
        const zero: number = '0'.charCodeAt(0);
        for (let i = 0, j = y.length; i < j; i++) {
            const n: number = y.charCodeAt(i);
            s += LunarUtil.NUMBER[n - zero];
        }
        return s;
    }

    /**
     * 获取月份的中文表示
     * @returns 月份的中文表示（包含闰月信息，如"闰四月"）
     */
    getMonthInChinese(): string {
        return (this._month < 0 ? '闰' : '') + LunarUtil.MONTH[Math.abs(this._month)];
    }

    /**
     * 获取日期的中文表示
     * @returns 日期的中文表示（如"廿一"）
     */
    getDayInChinese(): string {
        return LunarUtil.DAY[this._day];
    }

    getPengZuGan(): string {
        return LunarUtil.PENGZU_GAN[this._dayGanIndex + 1];
    }

    getPengZuZhi(): string {
        return LunarUtil.PENGZU_ZHI[this._dayZhiIndex + 1];
    }

    getPositionXi(): string {
        return this.getDayPositionXi();
    }

    getPositionXiDesc(): string {
        return this.getDayPositionXiDesc();
    }

    getPositionYangGui(): string {
        return this.getDayPositionYangGui();
    }

    getPositionYangGuiDesc(): string {
        return this.getDayPositionYangGuiDesc();
    }

    getPositionYinGui(): string {
        return this.getDayPositionYinGui();
    }

    getPositionYinGuiDesc(): string {
        return this.getDayPositionYinGuiDesc();
    }

    getPositionFu(): string {
        return this.getDayPositionFu();
    }

    getPositionFuDesc(): string {
        return this.getDayPositionFuDesc();
    }

    getPositionCai(): string {
        return this.getDayPositionCai();
    }

    getPositionCaiDesc(): string {
        return this.getDayPositionCaiDesc();
    }

    /**
     * 获取日喜神方位
     * 
     * 喜神是传统命理中的吉神之一
     * 
     * @returns 日喜神方位（如"西北"、"东北"等）
     */
    /**
     * 获取日喜神方位
     * 
     * 喜神是传统命理中的吉神之一
     * 
     * @returns 日喜神方位（如"西北"、"东北"等）
     */
    /**
     * 获取日喜神方位
     * 
     * 喜神是传统命理中的吉神之一
     * 
     * @returns 日喜神方位（如"西北"、"东北"等）
     */
    getDayPositionXi(): string {
        return LunarUtil.POSITION_XI[this._dayGanIndex + 1];
    }

    getDayPositionXiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getDayPositionXi()];
        return v ? v : '';
    }

    getDayPositionYangGui(): string {
        return LunarUtil.POSITION_YANG_GUI[this._dayGanIndex + 1];
    }

    getDayPositionYangGuiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getDayPositionYangGui()];
        return v ? v : '';
    }

    getDayPositionYinGui(): string {
        return LunarUtil.POSITION_YIN_GUI[this._dayGanIndex + 1];
    }

    getDayPositionYinGuiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getDayPositionYinGui()];
        return v ? v : '';
    }

    getDayPositionFu(sect: number = 2): string {
        return (1 === sect ? LunarUtil.POSITION_FU : LunarUtil.POSITION_FU_2)[this._dayGanIndex + 1];
    }

    getDayPositionFuDesc(sect: number = 2): string {
        const v = LunarUtil.POSITION_DESC[this.getDayPositionFu(sect)];
        return v ? v : '';
    }

    getDayPositionCai(): string {
        return LunarUtil.POSITION_CAI[this._dayGanIndex + 1];
    }

    getDayPositionCaiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getDayPositionCai()];
        return v ? v : '';
    }

    getTimePositionXi(): string {
        return LunarUtil.POSITION_XI[this._timeGanIndex + 1];
    }

    getTimePositionXiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getTimePositionXi()];
        return v ? v : '';
    }

    getTimePositionYangGui(): string {
        return LunarUtil.POSITION_YANG_GUI[this._timeGanIndex + 1];
    }

    getTimePositionYangGuiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getTimePositionYangGui()];
        return v ? v : '';
    }

    getTimePositionYinGui(): string {
        return LunarUtil.POSITION_YIN_GUI[this._timeGanIndex + 1];
    }

    getTimePositionYinGuiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getTimePositionYinGui()];
        return v ? v : '';
    }

    getTimePositionFu(sect: number = 2): string {
        return (1 === sect ? LunarUtil.POSITION_FU : LunarUtil.POSITION_FU_2)[this._timeGanIndex + 1];
    }

    getTimePositionFuDesc(sect: number = 2): string {
        const v = LunarUtil.POSITION_DESC[this.getTimePositionFu(sect)];
        return v ? v : '';
    }

    getTimePositionCai(): string {
        return LunarUtil.POSITION_CAI[this._timeGanIndex + 1];
    }

    getTimePositionCaiDesc(): string {
        const v = LunarUtil.POSITION_DESC[this.getTimePositionCai()];
        return v ? v : '';
    }

    getYearPositionTaiSui(sect: number = 2): string {
        let yearZhiIndex = this._yearZhiIndexByLiChun;
        switch (sect) {
            case 1:
                yearZhiIndex = this._yearZhiIndex;
                break;
            case 3:
                yearZhiIndex = this._yearZhiIndexExact;
                break;
        }
        return LunarUtil.POSITION_TAI_SUI_YEAR[yearZhiIndex];
    }

    getYearPositionTaiSuiDesc(sect: number = 2): string {
        return LunarUtil.POSITION_DESC[this.getYearPositionTaiSui(sect)];
    }

    getMonthPositionTaiSui(sect: number = 2): string {
        let monthZhiIndex = this._monthZhiIndex;
        let monthGanIndex = this._monthGanIndex;
        if (3 === sect) {
            monthZhiIndex = this._monthZhiIndexExact;
            monthGanIndex = this._monthGanIndexExact;
        }
        let m = monthZhiIndex - LunarUtil.BASE_MONTH_ZHI_INDEX;
        if (m < 0) {
            m += 12;
        }
        return [I18n.getMessage('bg.gen'), LunarUtil.POSITION_GAN[monthGanIndex], I18n.getMessage('bg.kun'), I18n.getMessage('bg.xun')][m % 4];
    }

    getMonthPositionTaiSuiDesc(sect: number = 2): string {
        return LunarUtil.POSITION_DESC[this.getMonthPositionTaiSui(sect)];
    }

    getDayPositionTaiSui(sect: number = 2): string {
        let dayInGanZhi = this.getDayInGanZhiExact2();
        let yearZhiIndex = this._yearZhiIndexByLiChun;
        switch (sect) {
            case 1:
                dayInGanZhi = this.getDayInGanZhi();
                yearZhiIndex = this._yearZhiIndex;
                break;
            case 3:
                dayInGanZhi = this.getDayInGanZhi();
                yearZhiIndex = this._yearZhiIndexExact;
                break;
        }
        if ([I18n.getMessage('jz.jiaZi'), I18n.getMessage('jz.yiChou'), I18n.getMessage('jz.bingYin'), I18n.getMessage('jz.dingMao'), I18n.getMessage('jz.wuChen'), I18n.getMessage('jz.jiSi')].join(',').indexOf(dayInGanZhi) > -1) {
            return I18n.getMessage('bg.zhen');
        } else if ([I18n.getMessage('jz.bingZi'), I18n.getMessage('jz.dingChou'), I18n.getMessage('jz.wuYin'), I18n.getMessage('jz.jiMao'), I18n.getMessage('jz.gengChen'), I18n.getMessage('jz.xinSi')].join(',').indexOf(dayInGanZhi) > -1) {
            return I18n.getMessage('bg.li');
        } else if ([I18n.getMessage('jz.wuZi'), I18n.getMessage('jz.jiChou'), I18n.getMessage('jz.gengYin'), I18n.getMessage('jz.xinMao'), I18n.getMessage('jz.renChen'), I18n.getMessage('jz.guiSi')].join(',').indexOf(dayInGanZhi) > -1) {
            return I18n.getMessage('ps.center');
        } else if ([I18n.getMessage('jz.gengZi'), I18n.getMessage('jz.xinChou'), I18n.getMessage('jz.renYin'), I18n.getMessage('jz.guiMao'), I18n.getMessage('jz.jiaChen'), I18n.getMessage('jz.yiSi')].join(',').indexOf(dayInGanZhi) > -1) {
            return I18n.getMessage('bg.dui');
        } else if ([I18n.getMessage('jz.renZi'), I18n.getMessage('jz.guiChou'), I18n.getMessage('jz.jiaYin'), I18n.getMessage('jz.yiMao'), I18n.getMessage('jz.bingChen'), I18n.getMessage('jz.dingSi')].join(',').indexOf(dayInGanZhi) > -1) {
            return I18n.getMessage('bg.kan');
        }
        return LunarUtil.POSITION_TAI_SUI_YEAR[yearZhiIndex];
    }

    getDayPositionTaiSuiDesc(sect: number = 2): string {
        return LunarUtil.POSITION_DESC[this.getDayPositionTaiSui(sect)];
    }

    getChong(): string {
        return this.getDayChong();
    }

    getChongGan(): string {
        return this.getDayChongGan();
    }

    getChongGanTie(): string {
        return this.getDayChongGanTie();
    }

    getChongShengXiao(): string {
        return this.getDayChongShengXiao();
    }

    getChongDesc(): string {
        return this.getDayChongDesc();
    }

    getSha(): string {
        return this.getDaySha();
    }

    getDayChong(): string {
        return LunarUtil.CHONG[this._dayZhiIndex];
    }

    getDayChongGan(): string {
        return LunarUtil.CHONG_GAN[this._dayGanIndex];
    }

    getDayChongGanTie(): string {
        return LunarUtil.CHONG_GAN_TIE[this._dayGanIndex];
    }

    getDayChongShengXiao(): string {
        const chong = this.getChong();
        for (let i = 0, j = LunarUtil.ZHI.length; i < j; i++) {
            if (LunarUtil.ZHI[i] === chong) {
                return LunarUtil.SHENGXIAO[i];
            }
        }
        return '';
    }

    getDayChongDesc(): string {
        return '(' + this.getDayChongGan() + this.getDayChong() + ')' + this.getDayChongShengXiao();
    }

    getDaySha(): string {
        const v = LunarUtil.SHA[this.getDayZhi()];
        return v ? v : '';
    }

    getTimeChong(): string {
        return LunarUtil.CHONG[this._timeZhiIndex];
    }

    getTimeChongGan(): string {
        return LunarUtil.CHONG_GAN[this._timeGanIndex];
    }

    getTimeChongGanTie(): string {
        return LunarUtil.CHONG_GAN_TIE[this._timeGanIndex];
    }

    getTimeChongShengXiao(): string {
        const chong = this.getTimeChong();
        for (let i = 0, j = LunarUtil.ZHI.length; i < j; i++) {
            if (LunarUtil.ZHI[i] === chong) {
                return LunarUtil.SHENGXIAO[i];
            }
        }
        return '';
    }

    getTimeChongDesc(): string {
        return '(' + this.getTimeChongGan() + this.getTimeChong() + ')' + this.getTimeChongShengXiao();
    }

    getTimeSha(): string {
        const v = LunarUtil.SHA[this.getTimeZhi()];
        return v ? v : '';
    }

    getYearNaYin(): string {
        const v = LunarUtil.NAYIN[this.getYearInGanZhi()];
        return v ? v : '';
    }

    getMonthNaYin(): string {
        const v = LunarUtil.NAYIN[this.getMonthInGanZhi()];
        return v ? v : '';
    }

    getDayNaYin(): string {
        const v = LunarUtil.NAYIN[this.getDayInGanZhi()];
        return v ? v : '';
    }

    getTimeNaYin(): string {
        const v = LunarUtil.NAYIN[this.getTimeInGanZhi()];
        return v ? v : '';
    }

    getSeason(): string {
        return LunarUtil.SEASON[Math.abs(this._month)];
    }

    private static _convertJieQi(name: string): string {
        let jq = name;
        if ('DONG_ZHI' === jq) {
            jq = I18n.getMessage('jq.dongZhi');
        } else if ('DA_HAN' === jq) {
            jq = I18n.getMessage('jq.daHan');
        } else if ('XIAO_HAN' === jq) {
            jq = I18n.getMessage('jq.xiaoHan');
        } else if ('LI_CHUN' === jq) {
            jq = I18n.getMessage('jq.liChun');
        } else if ('DA_XUE' === jq) {
            jq = I18n.getMessage('jq.daXue');
        } else if ('YU_SHUI' === jq) {
            jq = I18n.getMessage('jq.yuShui');
        } else if ('JING_ZHE' === jq) {
            jq = I18n.getMessage('jq.jingZhe');
        }
        return jq;
    }

    private checkLang() {
        const lang = I18n.getLanguage();
        if (this._lang != lang) {
            for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i++) {
                const newKey = LunarUtil.JIE_QI_IN_USE[i];
                const oldKey = this._jieQiList[i];
                const value = this._jieQi[oldKey];
                this._jieQiList[i] = newKey;
                this._jieQi[newKey] = value;
            }
            this._lang = lang;
        }
    }

    getJie(): string {
        for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
            const key = LunarUtil.JIE_QI_IN_USE[i];
            const d = this.getJieQiSolar(key);
            if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
                return Lunar._convertJieQi(key);
            }
        }
        return '';
    }

    getQi(): string {
        for (let i = 1, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
            const key = LunarUtil.JIE_QI_IN_USE[i];
            const d = this.getJieQiSolar(key);
            if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
                return Lunar._convertJieQi(key);
            }
        }
        return '';
    }

    /**
     * 获取节气（如果当天是节气）
     * @returns 节气名称，空字符串表示不是节气
     */
    getJieQi(): string {
        let name = '';
        const keys = Object.keys(this._jieQi);
        for (let i = 0, j = keys.length; i < j; i++) {
            const k = keys[i];
            const d = this._jieQi[k];
            if (d.getYear() == this._solar.getYear() && d.getMonth() == this._solar.getMonth() && d.getDay() == this._solar.getDay()) {
                name = k;
                break;
            }
        }
        return Lunar._convertJieQi(name);
    }

    getWeek(): number {
        return this._weekIndex;
    }

    getWeekInChinese(): string {
        return SolarUtil.WEEK[this.getWeek()];
    }

    getXiu(): string {
        const v = LunarUtil.XIU[this.getDayZhi() + this.getWeek()];
        return v ? v : '';
    }

    getXiuLuck(): string {
        const v = LunarUtil.XIU_LUCK[this.getXiu()];
        return v ? v : '';
    }

    getXiuSong(): string {
        const v = LunarUtil.XIU_SONG[this.getXiu()];
        return v ? v : '';
    }

    getZheng(): string {
        const v = LunarUtil.ZHENG[this.getXiu()];
        return v ? v : '';
    }

    getAnimal(): string {
        const v = LunarUtil.ANIMAL[this.getXiu()];
        return v ? v : '';
    }

    getGong(): string {
        const v = LunarUtil.GONG[this.getXiu()];
        return v ? v : '';
    }

    getShou(): string {
        const v = LunarUtil.SHOU[this.getGong()];
        return v ? v : '';
    }

    /**
     * 获取农历节日
     * @returns 农历节日列表
     */
    getFestivals(): string[] {
        const l: string[] = [];
        const f = LunarUtil.FESTIVAL[this._month + '-' + this._day];
        if (f) {
            l.push(f);
        }
        if (Math.abs(this._month) == 12 && this._day >= 29 && this._year != this.next(1).getYear()) {
            l.push(I18n.getMessage('jr.chuXi'));
        }
        return l;
    }

    getOtherFestivals(): string[] {
        const l: string[] = [];
        const fs = LunarUtil.OTHER_FESTIVAL[this._month + '-' + this._day];
        if (fs) {
            fs.forEach(f => {
                l.push(f);
            });
        }
        let jq = this.getJieQiSolar(I18n.getMessage('jq.qingMing'));
        const solarYmd = this._solar.toYmd();
        if (solarYmd === jq.next(-1).toYmd()) {
            l.push('寒食节');
        }

        jq = this.getJieQiSolar(I18n.getMessage('jq.liChun'));
        let offset = 4 - jq.getLunar().getDayGanIndex();
        if (offset < 0) {
            offset += 10;
        }
        if (solarYmd === jq.next(offset + 40).toYmd()) {
            l.push('春社');
        }

        jq = this.getJieQiSolar(I18n.getMessage('jq.liQiu'));
        offset = 4 - jq.getLunar().getDayGanIndex();
        if (offset < 0) {
            offset += 10;
        }
        if (solarYmd === jq.next(offset + 40).toYmd()) {
            l.push('秋社');
        }
        return l;
    }

    /**
     * 获取八字（年、月、日、时干支）
     * @returns 八字数组 [年干支, 月干支, 日干支, 时干支]
     */
    getBaZi(): string[] {
        const bz = this.getEightChar();
        const l: string[] = [];
        l.push(bz.getYear());
        l.push(bz.getMonth());
        l.push(bz.getDay());
        l.push(bz.getTime());
        return l;
    }

    getBaZiWuXing(): string[] {
        const bz = this.getEightChar();
        const l: string[] = [];
        l.push(bz.getYearWuXing());
        l.push(bz.getMonthWuXing());
        l.push(bz.getDayWuXing());
        l.push(bz.getTimeWuXing());
        return l;
    }

    getBaZiNaYin(): string[] {
        const bz = this.getEightChar();
        const l: string[] = [];
        l.push(bz.getYearNaYin());
        l.push(bz.getMonthNaYin());
        l.push(bz.getDayNaYin());
        l.push(bz.getTimeNaYin());
        return l;
    }

    getBaZiShiShenGan(): string[] {
        const bz = this.getEightChar();
        const l: string[] = [];
        l.push(bz.getYearShiShenGan());
        l.push(bz.getMonthShiShenGan());
        l.push(bz.getDayShiShenGan());
        l.push(bz.getTimeShiShenGan());
        return l;
    }

    getBaZiShiShenZhi(): string[] {
        const bz = this.getEightChar();
        const l: string[] = [];
        l.push(bz.getYearShiShenZhi()[0]);
        l.push(bz.getMonthShiShenZhi()[0]);
        l.push(bz.getDayShiShenZhi()[0]);
        l.push(bz.getTimeShiShenZhi()[0]);
        return l;
    }

    getBaZiShiShenYearZhi(): string[] {
        return this.getEightChar().getYearShiShenZhi();
    }

    getBaZiShiShenMonthZhi(): string[] {
        return this.getEightChar().getMonthShiShenZhi();
    }

    getBaZiShiShenDayZhi(): string[] {
        return this.getEightChar().getDayShiShenZhi();
    }

    getBaZiShiShenTimeZhi(): string[] {
        return this.getEightChar().getTimeShiShenZhi();
    }

    getZhiXing(): string {
        let offset = this._dayZhiIndex - this._monthZhiIndex;
        if (offset < 0) {
            offset += 12;
        }
        return LunarUtil.ZHI_XING[offset + 1];
    }

    getDayTianShen(): string {
        const monthZhi = this.getMonthZhi();
        const offset = LunarUtil.ZHI_TIAN_SHEN_OFFSET[monthZhi];
        if (offset == undefined) {
            return '';
        }
        return LunarUtil.TIAN_SHEN[(this._dayZhiIndex + offset) % 12 + 1];
    }

    getTimeTianShen(): string {
        const dayZhi = this.getDayZhiExact();
        const offset = LunarUtil.ZHI_TIAN_SHEN_OFFSET[dayZhi];
        if (offset == undefined) {
            return '';
        }
        return LunarUtil.TIAN_SHEN[(this._timeZhiIndex + offset) % 12 + 1];
    }

    getDayTianShenType(): string {
        const v = LunarUtil.TIAN_SHEN_TYPE[this.getDayTianShen()];
        return v ? v : '';
    }

    getTimeTianShenType(): string {
        const v = LunarUtil.TIAN_SHEN_TYPE[this.getTimeTianShen()];
        return v ? v : '';
    }

    getDayTianShenLuck(): string {
        const v = LunarUtil.TIAN_SHEN_TYPE_LUCK[this.getDayTianShenType()];
        return v ? v : '';
    }

    getTimeTianShenLuck(): string {
        const v = LunarUtil.TIAN_SHEN_TYPE_LUCK[this.getTimeTianShenType()];
        return v ? v : '';
    }

    getDayPositionTai(): string {
        return LunarUtil.POSITION_TAI_DAY[LunarUtil.getJiaZiIndex(this.getDayInGanZhi())];
    }

    getMonthPositionTai(): string {
        const m = this._month;
        if (m < 0) {
            return '';
        }
        return LunarUtil.POSITION_TAI_MONTH[m - 1];
    }

    getDayYi(sect: number = 1): string[] {
        return LunarUtil.getDayYi(2 == sect ? this.getMonthInGanZhiExact() : this.getMonthInGanZhi(), this.getDayInGanZhi());
    }

    getDayJi(sect: number = 1): string[] {
        return LunarUtil.getDayJi(2 == sect ? this.getMonthInGanZhiExact() : this.getMonthInGanZhi(), this.getDayInGanZhi());
    }

    getDayJiShen(): string[] {
        return LunarUtil.getDayJiShen(this.getMonthZhiIndex(), this.getDayInGanZhi());
    }

    getDayXiongSha(): string[] {
        return LunarUtil.getDayXiongSha(this.getMonthZhiIndex(), this.getDayInGanZhi());
    }

    getTimeYi(): string[] {
        return LunarUtil.getTimeYi(this.getDayInGanZhiExact(), this.getTimeInGanZhi());
    }

    getTimeJi(): string[] {
        return LunarUtil.getTimeJi(this.getDayInGanZhiExact(), this.getTimeInGanZhi());
    }

    getYueXiang(): string {
        return LunarUtil.YUE_XIANG[this._day];
    }

    private _getYearNineStar(yearInGanZhi: string): NineStar {
        const indexExact = LunarUtil.getJiaZiIndex(yearInGanZhi) + 1;
        const index = LunarUtil.getJiaZiIndex(this.getYearInGanZhi()) + 1;
        let yearOffset = indexExact - index;
        if (yearOffset > 1) {
            yearOffset -= 60;
        } else if (yearOffset < -1) {
            yearOffset += 60;
        }
        const yuan = Math.floor((this._year + yearOffset + 2696) / 60) % 3;
        let offset = (62 + yuan * 3 - indexExact) % 9;
        if (0 === offset) {
            offset = 9;
        }
        return NineStar.fromIndex(offset - 1);
    }

    getYearNineStar(sect: number = 2): NineStar {
        switch (sect) {
            case 1:
                return this._getYearNineStar(this.getYearInGanZhi());
            case 3:
                return this._getYearNineStar(this.getYearInGanZhiExact());
        }
        return this._getYearNineStar(this.getYearInGanZhiByLiChun());
    }

    getMonthNineStar(sect: number = 2): NineStar {
        let yearZhiIndex = this._yearZhiIndexByLiChun;
        let monthZhiIndex = this._monthZhiIndex;
        switch (sect) {
            case 1:
                yearZhiIndex = this._yearZhiIndex;
                monthZhiIndex = this._monthZhiIndex;
                break;
            case 3:
                yearZhiIndex = this._yearZhiIndexExact;
                monthZhiIndex = this._monthZhiIndexExact;
                break;
        }
        let n = 27 - (yearZhiIndex % 3 * 3);
        if (monthZhiIndex < LunarUtil.BASE_MONTH_ZHI_INDEX) {
            n -= 3;
        }
        return NineStar.fromIndex((n - monthZhiIndex) % 9);
    }

    private getJieQiSolar(name: string): Solar {
        this.checkLang();
        return this._jieQi[name];
    }

    getDayNineStar(): NineStar {
        const solarYmd = this._solar.toYmd();
        const dongZhi = this.getJieQiSolar(I18n.getMessage('jq.dongZhi'));
        const dongZhi2 = this.getJieQiSolar('DONG_ZHI');
        const xiaZhi = this.getJieQiSolar(I18n.getMessage('jq.xiaZhi'));
        const dongZhiIndex = LunarUtil.getJiaZiIndex(dongZhi.getLunar().getDayInGanZhi());
        const dongZhiIndex2 = LunarUtil.getJiaZiIndex(dongZhi2.getLunar().getDayInGanZhi());
        const xiaZhiIndex = LunarUtil.getJiaZiIndex(xiaZhi.getLunar().getDayInGanZhi());
        const solarShunBai = dongZhi.next(dongZhiIndex > 29 ? 60 - dongZhiIndex : -dongZhiIndex);
        const solarShunBai2 = dongZhi2.next(dongZhiIndex2 > 29 ? 60 - dongZhiIndex2 : -dongZhiIndex2);
        const solarNiZi = xiaZhi.next(xiaZhiIndex > 29 ? 60 - xiaZhiIndex : -xiaZhiIndex);

        const solarShunBaiYmd = solarShunBai.toYmd();
        const solarShunBaiYmd2 = solarShunBai2.toYmd();
        const solarNiZiYmd = solarNiZi.toYmd();
        let offset = 0;
        if (solarYmd >= solarShunBaiYmd && solarYmd < solarNiZiYmd) {
            offset = this._solar.subtract(solarShunBai) % 9;
        } else if (solarYmd >= solarNiZiYmd && solarYmd < solarShunBaiYmd2) {
            offset = 8 - (this._solar.subtract(solarNiZi) % 9);
        } else if (solarYmd >= solarShunBaiYmd2) {
            offset = this._solar.subtract(solarShunBai2) % 9;
        } else if (solarYmd < solarShunBaiYmd) {
            offset = (8 + solarShunBai.subtract(this._solar)) % 9;
        }
        return NineStar.fromIndex(offset);
    }

    getTimeNineStar(): NineStar {
        const solarYmd = this._solar.toYmd();
        let asc = false;
        if (solarYmd >= this.getJieQiSolar(I18n.getMessage('jq.dongZhi')).toYmd() && solarYmd < this.getJieQiSolar(I18n.getMessage('jq.xiaZhi')).toYmd()) {
            asc = true;
        } else if (solarYmd >= this.getJieQiSolar('DONG_ZHI').toYmd()) {
            asc = true;
        }
        const offset = asc ? [0, 3, 6] : [8, 5, 2];
        const start = offset[this.getDayZhiIndex() % 3];
        const index = asc ? (start + this._timeZhiIndex) : (start + 9 - this._timeZhiIndex);
        return NineStar.fromIndex(index % 9);
    }

    getSolar(): Solar {
        return this._solar;
    }

    getJieQiTable(): Record<string, Solar> {
        this.checkLang();
        return this._jieQi;
    }

    getJieQiList(): string[] {
        return this._jieQiList;
    }

    getNextJie(wholeDay: boolean = false): JieQi {
        const conditions: string[] = [];
        for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
            conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2]);
        }
        return this.getNearJieQi(true, conditions, wholeDay);
    }

    getPrevJie(wholeDay: boolean = false): JieQi {
        const conditions: string[] = [];
        for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
            conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2]);
        }
        return this.getNearJieQi(false, conditions, wholeDay);
    }

    getNextQi(wholeDay: boolean = false): JieQi {
        const conditions: string[] = [];
        for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
            conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2 + 1]);
        }
        return this.getNearJieQi(true, conditions, wholeDay);
    }

    getPrevQi(wholeDay: boolean = false): JieQi {
        const conditions: string[] = [];
        for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
            conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2 + 1]);
        }
        return this.getNearJieQi(false, conditions, wholeDay);
    }

    getNextJieQi(wholeDay: boolean = false): JieQi {
        return this.getNearJieQi(true, [], wholeDay);
    }

    getPrevJieQi(wholeDay: boolean = false): JieQi {
        return this.getNearJieQi(false, [], wholeDay);
    }

    private getNearJieQi(forward: boolean, conditions: string[], wholeDay: boolean): JieQi {
        let name: string = '';
        let near: null | Solar = null;
        const filters: Record<string, boolean> = {};
        let filter = false;
        if (conditions) {
            for (let i = 0, j = conditions.length; i < j; i++) {
                filters[conditions[i]] = true;
                filter = true;
            }
        }
        const today = wholeDay ? this._solar.toYmd() : this._solar.toYmdHms();
        const keys = Object.keys(this._jieQi);
        for (let i = 0, j = keys.length; i < j; i++) {
            const key = keys[i];
            const solar = this._jieQi[key];
            const jq = Lunar._convertJieQi(key);
            if (filter) {
                if (!filters[jq]) {
                    continue;
                }
            }
            const day = wholeDay ? solar.toYmd() : solar.toYmdHms();
            if (forward) {
                if (day <= today) {
                    continue;
                }
                if (null == near) {
                    name = jq;
                    near = solar;
                } else {
                    const nearDay = wholeDay ? near.toYmd() : near.toYmdHms();
                    if (day < nearDay) {
                        name = jq;
                        near = solar;
                    }
                }
            } else {
                if (day > today) {
                    continue;
                }
                if (null == near) {
                    name = jq;
                    near = solar;
                } else {
                    const nearDay = wholeDay ? near.toYmd() : near.toYmdHms();
                    if (day > nearDay) {
                        name = jq;
                        near = solar;
                    }
                }
            }
        }
        return new JieQi(name, near as Solar);
    }

    getCurrentJieQi(): JieQi | null {
        const keys = Object.keys(this._jieQi);
        for (let i = 0, j = keys.length; i < j; i++) {
            const k = keys[i];
            const d = this._jieQi[k];
            if (d.getYear() == this._solar.getYear() && d.getMonth() == this._solar.getMonth() && d.getDay() == this._solar.getDay()) {
                return new JieQi(Lunar._convertJieQi(k), d);
            }
        }
        return null;
    }

    getCurrentJie(): JieQi | null {
        for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
            const key = LunarUtil.JIE_QI_IN_USE[i];
            const d = this.getJieQiSolar(key);
            if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
                return new JieQi(Lunar._convertJieQi(key), d);
            }
        }
        return null;
    }

    getCurrentQi(): JieQi | null {
        for (let i = 1, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
            const key = LunarUtil.JIE_QI_IN_USE[i];
            const d = this.getJieQiSolar(key);
            if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
                return new JieQi(Lunar._convertJieQi(key), d);
            }
        }
        return null;
    }

    getEightChar(): EightChar {
        return this._eightChar;
    }

    next(days: number): Lunar {
        return this._solar.next(days).getLunar();
    }

    getYearXun(): string {
        return LunarUtil.getXun(this.getYearInGanZhi());
    }

    getMonthXun(): string {
        return LunarUtil.getXun(this.getMonthInGanZhi());
    }

    getDayXun(): string {
        return LunarUtil.getXun(this.getDayInGanZhi());
    }

    getTimeXun(): string {
        return LunarUtil.getXun(this.getTimeInGanZhi());
    }

    getYearXunByLiChun(): string {
        return LunarUtil.getXun(this.getYearInGanZhiByLiChun());
    }

    getYearXunExact(): string {
        return LunarUtil.getXun(this.getYearInGanZhiExact());
    }

    getMonthXunExact(): string {
        return LunarUtil.getXun(this.getMonthInGanZhiExact());
    }

    getDayXunExact(): string {
        return LunarUtil.getXun(this.getDayInGanZhiExact());
    }

    getDayXunExact2(): string {
        return LunarUtil.getXun(this.getDayInGanZhiExact2());
    }

    getYearXunKong(): string {
        return LunarUtil.getXunKong(this.getYearInGanZhi());
    }

    getMonthXunKong(): string {
        return LunarUtil.getXunKong(this.getMonthInGanZhi());
    }

    getDayXunKong(): string {
        return LunarUtil.getXunKong(this.getDayInGanZhi());
    }

    getTimeXunKong(): string {
        return LunarUtil.getXunKong(this.getTimeInGanZhi());
    }

    getYearXunKongByLiChun(): string {
        return LunarUtil.getXunKong(this.getYearInGanZhiByLiChun());
    }

    getYearXunKongExact(): string {
        return LunarUtil.getXunKong(this.getYearInGanZhiExact());
    }

    getMonthXunKongExact(): string {
        return LunarUtil.getXunKong(this.getMonthInGanZhiExact());
    }

    getDayXunKongExact(): string {
        return LunarUtil.getXunKong(this.getDayInGanZhiExact());
    }

    getDayXunKongExact2(): string {
        return LunarUtil.getXunKong(this.getDayInGanZhiExact2());
    }

    toString(): string {
        return this.getYearInChinese() + '年' + this.getMonthInChinese() + '月' + this.getDayInChinese();
    }

    toFullString(): string {
        let s = this.toString();
        s += ' ' + this.getYearInGanZhi() + '(' + this.getYearShengXiao() + ')年';
        s += ' ' + this.getMonthInGanZhi() + '(' + this.getMonthShengXiao() + ')月';
        s += ' ' + this.getDayInGanZhi() + '(' + this.getDayShengXiao() + ')日';
        s += ' ' + this.getTimeZhi() + '(' + this.getTimeShengXiao() + ')时';
        s += ' 纳音[' + this.getYearNaYin() + ' ' + this.getMonthNaYin() + ' ' + this.getDayNaYin() + ' ' + this.getTimeNaYin() + ']';
        s += ' 星期' + this.getWeekInChinese();
        this.getFestivals().forEach(f => {
            s += ' (' + f + ')';
        });
        this.getOtherFestivals().forEach(f => {
            s += ' (' + f + ')';
        });
        const jq = this.getJieQi();
        if (jq.length > 0) {
            s += ' [' + jq + ']';
        }
        s += ' ' + this.getGong() + '方' + this.getShou();
        s += ' 星宿[' + this.getXiu() + this.getZheng() + this.getAnimal() + '](' + this.getXiuLuck() + ')';
        s += ' 彭祖百忌[' + this.getPengZuGan() + ' ' + this.getPengZuZhi() + ']';
        s += ' 喜神方位[' + this.getDayPositionXi() + '](' + this.getDayPositionXiDesc() + ')';
        s += ' 阳贵神方位[' + this.getDayPositionYangGui() + '](' + this.getDayPositionYangGuiDesc() + ')';
        s += ' 阴贵神方位[' + this.getDayPositionYinGui() + '](' + this.getDayPositionYinGuiDesc() + ')';
        s += ' 福神方位[' + this.getDayPositionFu() + '](' + this.getDayPositionFuDesc() + ')';
        s += ' 财神方位[' + this.getDayPositionCai() + '](' + this.getDayPositionCaiDesc() + ')';
        s += ' 冲[' + this.getDayChongDesc() + ']';
        s += ' 煞[' + this.getDaySha() + ']';
        return s;
    }

    getShuJiu(): ShuJiu | null {
        const currentDay = Solar.fromYmd(this._solar.getYear(), this._solar.getMonth(), this._solar.getDay());
        let start = this.getJieQiSolar('DONG_ZHI');
        let startDay = Solar.fromYmd(start.getYear(), start.getMonth(), start.getDay());
        if (currentDay.isBefore(startDay)) {
            start = this.getJieQiSolar(I18n.getMessage('jq.dongZhi'));
            startDay = Solar.fromYmd(start.getYear(), start.getMonth(), start.getDay());
        }
        const endDay = Solar.fromYmd(start.getYear(), start.getMonth(), start.getDay()).next(81);
        if (currentDay.isBefore(startDay) || (!currentDay.isBefore(endDay))) {
            return null;
        }
        const days = currentDay.subtract(startDay);
        return new ShuJiu(LunarUtil.NUMBER[Math.floor(days / 9) + 1] + '九', days % 9 + 1);
    }

    getFu(): Fu | null {
        const currentDay = Solar.fromYmd(this._solar.getYear(), this._solar.getMonth(), this._solar.getDay());
        const xiaZhi = this.getJieQiSolar(I18n.getMessage('jq.xiaZhi'));
        const liQiu = this.getJieQiSolar(I18n.getMessage('jq.liQiu'));
        let startDay = Solar.fromYmd(xiaZhi.getYear(), xiaZhi.getMonth(), xiaZhi.getDay());

        // 第1个庚日
        let add = 6 - xiaZhi.getLunar().getDayGanIndex();
        if (add < 0) {
            add += 10;
        }
        // 第3个庚日，即初伏第1天
        add += 20;
        startDay = startDay.next(add);

        // 初伏以前
        if (currentDay.isBefore(startDay)) {
            return null;
        }

        let days = currentDay.subtract(startDay);
        if (days < 10) {
            return new Fu('初伏', days + 1);
        }

        // 第4个庚日，中伏第1天
        startDay = startDay.next(10);

        days = currentDay.subtract(startDay);
        if (days < 10) {
            return new Fu('中伏', days + 1);
        }

        // 第5个庚日，中伏第11天或末伏第1天
        startDay = startDay.next(10);

        const liQiuDay = Solar.fromYmd(liQiu.getYear(), liQiu.getMonth(), liQiu.getDay());

        days = currentDay.subtract(startDay);
        // 末伏
        if (liQiuDay.isAfter(startDay)) {
            // 中伏
            if (days < 10) {
                return new Fu('中伏', days + 11);
            }
            // 末伏第1天
            startDay = startDay.next(10);
            days = currentDay.subtract(startDay);
        }
        if (days < 10) {
            return new Fu('末伏', days + 1);
        }
        return null;
    }

    getLiuYao(): string {
        return LunarUtil.LIU_YAO[(Math.abs(this._month) + this._day - 2) % 6];
    }

    getWuHou(): string {
        const jieQi = this.getPrevJieQi(true);
        const jq = LunarUtil.find(jieQi.getName(), LunarUtil.JIE_QI)!;
        let index = Math.floor(this._solar.subtract(jieQi.getSolar()) / 5);
        if (index > 2) {
            index = 2;
        }
        return LunarUtil.WU_HOU[(jq.index * 3 + index) % LunarUtil.WU_HOU.length];
    }

    getHou(): string {
        const jieQi = this.getPrevJieQi(true);
        const days = this._solar.subtract(jieQi.getSolar());
        const max = LunarUtil.HOU.length - 1;
        let offset = Math.floor(days / 5);
        if (offset > max) {
            offset = max;
        }
        return jieQi.getName() + ' ' + LunarUtil.HOU[offset];
    }

    getDayLu(): string {
        const gan = LunarUtil.LU[this.getDayGan()];
        const zhi = LunarUtil.LU[this.getDayZhi()];
        let lu = gan + '命互禄';
        if (zhi) {
            lu += ' ' + zhi + '命进禄';
        }
        return lu;
    }

    getTime(): LunarTime {
        return LunarTime.fromYmdHms(this._year, this._month, this._day, this._hour, this._minute, this._second);
    }

    getTimes(): LunarTime[] {
        const l: LunarTime[] = [];
        l.push(LunarTime.fromYmdHms(this._year, this._month, this._day, 0, 0, 0));
        for (let i = 0; i < 12; i++) {
            l.push(LunarTime.fromYmdHms(this._year, this._month, this._day, (i + 1) * 2 - 1, 0, 0));
        }
        return l;
    }

    getFoto(): Foto {
        return Foto.fromLunar(this);
    }

    getTao(): Tao {
        return Tao.fromLunar(this);
    }
}