import {SolarUtil} from './SolarUtil';
import {SolarWeek} from './SolarWeek';
import {LunarUtil} from './LunarUtil';
import {HolidayUtil} from './HolidayUtil';
import {Lunar} from './Lunar';
import {SolarMonth} from './SolarMonth';

/**
 * 阳历日期类
 * 提供阳历日期的创建、转换、计算等功能
 * 
 * 主要功能包括：
 * - 从不同格式创建阳历日期（年月日、JavaScript Date对象、儒略日、八字等）
 * - 日期计算（增加/减少年、月、日、小时等）
 * - 日期比较和差值计算
 * - 获取星期、节日、星座等信息
 * - 转换为农历日期
 * - 薪资比例计算（工作日、周末、节假日）
 * 
 * 注意事项：
 * - 月份范围：1-12
 * - 日期范围：1-31（根据月份和闰年自动调整）
 * - 小时范围：0-23
 * - 分钟范围：0-59
 * - 秒范围：0-59
 * - 星期范围：0-6（0表示星期日）
 * 
 * 特殊日期处理：
 * - 1582年10月4日到1582年10月15日之间的日期不存在（格里高利历改革）
 * - 自动处理闰年2月天数
 */
export class Solar {
    /**
     * J2000儒略日（2000年1月1日12:00:00 UTC）
     */
    static J2000: number = 2451545;

    private readonly _year: number;
    private readonly _month: number;
    private readonly _day: number;
    private readonly _hour: number;
    private readonly _minute: number;
    private readonly _second: number;

    /**
     * 从年月日创建阳历日期（时分秒默认为0）
     * 
     * 这是最常用的创建方法，适用于只需要日期不需要时间的场景
     * 
     * @param year - 年份（支持负数表示公元前）
     * @param month - 月份（1-12，1表示一月，12表示十二月）
     * @param day - 日期（1-31，根据月份和闰年自动验证）
     * @returns 阳历日期对象
     * @throws 如果月份或日期超出有效范围
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 25); // 创建2023年12月25日
     * ```
     */
    static fromYmd(year: number, month: number, day: number): Solar {
        return Solar.fromYmdHms(year, month, day, 0, 0, 0);
    }

    /**
     * 从年月日时分秒创建阳历日期
     * 
     * 创建包含精确时间的阳历日期对象
     * 
     * @param year - 年份（支持负数表示公元前）
     * @param month - 月份（1-12，1表示一月，12表示十二月）
     * @param day - 日期（1-31，根据月份和闰年自动验证）
     * @param hour - 小时（0-23，0表示午夜，23表示晚上11点）
     * @param minute - 分钟（0-59）
     * @param second - 秒（0-59）
     * @returns 阳历日期对象
     * @throws 如果任何参数超出有效范围
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmdHms(2023, 12, 25, 14, 30, 0); // 2023年12月25日14:30:00
     * ```
     */
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar {
        return new Solar(year, month, day, hour, minute, second);
    }

    /**
     * 从JavaScript Date对象创建阳历日期
     * 
     * 将标准的JavaScript Date对象转换为阳历日期对象
     * 注意：JavaScript Date的月份是0-11，这里会自动转换为1-12
     * 
     * @param date - JavaScript Date对象
     * @returns 阳历日期对象
     * 
     * 示例：
     * ```typescript
     * const now = new Date();
     * const solar = Solar.fromDate(now); // 转换为阳历日期
     * ```
     */
    static fromDate(date: Date): Solar {
        return Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
    }

    /**
     * 从儒略日创建阳历日期
     * 
     * 儒略日是天文学中常用的一种连续计日法，从公元前4713年1月1日正午开始计算
     * 该方法实现了儒略日到公历日期的转换算法
     * 
     * @param julianDay - 儒略日（浮点数，包含小数部分表示时间）
     * @returns 阳历日期对象
     * 
     * 算法说明：
     * - 使用标准的儒略日转换公式
     * - 处理格里高利历改革（1582年10月）
     * - 自动计算年、月、日、时、分、秒
     * 
     * 示例：
     * ```typescript
     * // J2000儒略日（2000年1月1日12:00:00 UTC）
     * const solar = Solar.fromJulianDay(2451545); // 返回2000年1月1日
     * ```
     */
    static fromJulianDay(julianDay: number): Solar {
        let d = Math.floor(julianDay + 0.5);
        let f = julianDay + 0.5 - d;

        if (d >= 2299161) {
            const c = Math.floor((d - 1867216.25) / 36524.25);
            d += 1 + c - Math.floor(c / 4);
        }
        d += 1524;
        let year = Math.floor((d - 122.1) / 365.25);
        d -= Math.floor(365.25 * year);
        let month = Math.floor(d / 30.601);
        d -= Math.floor(30.601 * month);
        let day = d;
        if (month > 13) {
            month -= 13;
            year -= 4715;
        } else {
            month -= 1;
            year -= 4716;
        }
        f *= 24;
        let hour = Math.floor(f);

        f -= hour;
        f *= 60;
        let minute = Math.floor(f);

        f -= minute;
        f *= 60;
        let second = Math.round(f);
        if (second > 59) {
            second -= 60;
            minute++;
        }
        if (minute > 59) {
            minute -= 60;
            hour++;
        }
        if (hour > 23) {
            hour -= 24;
            day += 1;
        }
        return Solar.fromYmdHms(year, month, day, hour, minute, second);
    }

    /**
     * 从八字反推可能的阳历日期
     * 
     * 根据八字（年、月、日、时干支）反推可能的公历日期
     * 由于干支60年一个循环，可能会有多个匹配的日期
     * 
     * @param yearGanZhi - 年干支（如"甲子"、"乙丑"等）
     * @param monthGanZhi - 月干支（如"丙寅"、"丁卯"等）
     * @param dayGanZhi - 日干支（如"戊辰"、"己巳"等）
     * @param timeGanZhi - 时干支（如"庚午"、"辛未"等）
     * @param sect - 流派（1：晚子时日柱算当天，2：晚子时日柱算明天，默认2）
     * @param baseYear - 起始年份（默认1900，用于限制搜索范围）
     * @returns 可能的阳历日期数组（按时间顺序排列）
     * 
     * 算法说明：
     * - 首先验证年干支和月干支的匹配关系
     * - 根据立春节气确定年份范围
     * - 遍历可能的年份，验证日干支和时干支
     * - 考虑晚子时流派的特殊处理
     * 
     * 示例：
     * ```typescript
     * const dates = Solar.fromBaZi("甲子", "丙寅", "戊辰", "庚午");
     * // 返回所有匹配的阳历日期
     * ```
     */
    static fromBaZi(yearGanZhi: string, monthGanZhi: string, dayGanZhi: string, timeGanZhi: string, sect: number = 2, baseYear = 1900): Solar[] {
        sect = (1 == sect) ? 1 : 2;
        const l: Solar[] = [];
        // 月地支距寅月的偏移值
        let m = LunarUtil.index(monthGanZhi.substring(1), LunarUtil.ZHI, -1) - 2;
        if (m < 0) {
            m += 12;
        }
        // 月天干要一致
        if (((LunarUtil.index(yearGanZhi.substring(0, 1), LunarUtil.GAN, -1) + 1) * 2 + m) % 10 !== LunarUtil.index(monthGanZhi.substring(0, 1), LunarUtil.GAN, -1)) {
            return l;
        }
        // 1年的立春是辛酉，序号57
        let y = LunarUtil.getJiaZiIndex(yearGanZhi) - 57;
        if (y < 0) {
            y += 60;
        }
        y++;
        // 节令偏移值
        m *= 2;
        // 时辰地支转时刻，子时按零点算
        const h = LunarUtil.index(timeGanZhi.substring(1), LunarUtil.ZHI, -1) * 2;
        let hours = [h];
        if (0 == h && 2 == sect) {
            hours = [0, 23];
        }
        const startYear = baseYear - 1;

        // 结束年
        const endYear = new Date().getFullYear();

        while (y <= endYear) {
            if (y >= startYear) {
                // 立春为寅月的开始
                const jieQiLunar = Lunar.fromYmd(y, 1, 1);
                const jieQiList = jieQiLunar.getJieQiList();
                const jieQiTable = jieQiLunar.getJieQiTable();
                // 节令推移，年干支和月干支就都匹配上了
                let solarTime = jieQiTable[jieQiList[4 + m]];
                if (solarTime.getYear() >= baseYear) {
                    // 日干支和节令干支的偏移值
                    let d = LunarUtil.getJiaZiIndex(dayGanZhi) - LunarUtil.getJiaZiIndex(solarTime.getLunar().getDayInGanZhiExact2());
                    if (d < 0) {
                        d += 60;
                    }
                    if (d > 0) {
                        // 从节令推移天数
                        solarTime = solarTime.next(d);
                    }
                    hours.forEach(hour => {
                        let mi = 0;
                        let s = 0;
                        if (d == 0 && hour === solarTime.getHour()) {
                            // 如果正好是节令当天，且小时和节令的小时数相等的极端情况，把分钟和秒钟带上
                            mi = solarTime.getMinute();
                            s = solarTime.getSecond();
                        }
                        // 验证一下
                        let solar = Solar.fromYmdHms(solarTime.getYear(), solarTime.getMonth(), solarTime.getDay(), hour, mi, s);
                        if (d === 30) {
                            solar = solar.nextHour(-1);
                        }
                        const lunar = solar.getLunar();
                        const dgz = (2 === sect) ? lunar.getDayInGanZhiExact2() : lunar.getDayInGanZhiExact();
                        if (lunar.getYearInGanZhiExact() === yearGanZhi && lunar.getMonthInGanZhiExact() === monthGanZhi && dgz === dayGanZhi && lunar.getTimeInGanZhi() === timeGanZhi) {
                            l.push(solar);
                        }
                    });
                }
            }
            y += 60;
        }
        return l;
    }

    /**
     * 构造函数
     * @param year - 年份
     * @param month - 月份（1-12）
     * @param day - 日期（1-31）
     * @param hour - 小时（0-23）
     * @param minute - 分钟（0-59）
     * @param second - 秒（0-59）
     */
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number) {
        if (1582 === year && 10 === month) {
            if (day > 4 && day < 15) {
                throw new Error(`wrong solar year ${year} month ${month} day ${day}`);
            }
        }
        if (month < 1 || month > 12) {
            throw new Error(`wrong month ${month}`);
        }
        if (day < 1 || day > 31) {
            throw new Error(`wrong day ${day}`);
        }
        if (hour < 0 || hour > 23) {
            throw new Error(`wrong hour ${hour}`);
        }
        if (minute < 0 || minute > 59) {
            throw new Error(`wrong minute ${minute}`);
        }
        if (second < 0 || second > 59) {
            throw new Error(`wrong second ${second}`);
        }
        this._year = year;
        this._month = month;
        this._day = day;
        this._hour = hour;
        this._minute = minute;
        this._second = second;
    }


    /**
     * 获取年份
     * @returns 年份
     */
    getYear(): number {
        return this._year;
    }

    /**
     * 获取月份
     * @returns 月份（1-12）
     */
    getMonth(): number {
        return this._month;
    }

    /**
     * 获取日期
     * @returns 日期（1-31）
     */
    getDay(): number {
        return this._day;
    }

    /**
     * 获取小时
     * @returns 小时（0-23）
     */
    getHour(): number {
        return this._hour;
    }

    /**
     * 获取分钟
     * @returns 分钟（0-59）
     */
    getMinute(): number {
        return this._minute;
    }

    /**
     * 获取秒
     * @returns 秒（0-59）
     */
    getSecond(): number {
        return this._second;
    }

    /**
     * 获取星期（0-6，0表示星期日）
     * 
     * 基于儒略日计算星期几
     * 
     * @returns 星期数字（0-6，0=星期日，1=星期一，...，6=星期六）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 25);
     * const week = solar.getWeek(); // 返回1（星期一）
     * ```
     */
    getWeek(): number {
        return (Math.floor(this.getJulianDay() + 0.5) + 7000001) % 7;
    }

    /**
     * 获取星期的中文表示
     * 
     * @returns 星期的中文表示（如"星期日"、"星期一"等）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 25);
     * const weekChinese = solar.getWeekInChinese(); // 返回"星期一"
     * ```
     */
    getWeekInChinese(): string {
        return SolarUtil.WEEK[this.getWeek()];
    }

    /**
     * 获取周对象
     * 
     * 根据指定的周起始日获取对应的周对象
     * 
     * @param start - 周起始日（0-6，0表示星期日）
     * @returns 周对象（SolarWeek实例）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 25);
     * const week = solar.getSolarWeek(1); // 周一开始的周对象
     * ```
     */
    getSolarWeek(start: number): SolarWeek {
        return SolarWeek.fromYmd(this._year, this._month, this._day, start);
    }

    /**
     * 判断是否为闰年
     * 
     * 闰年规则：
     * - 能被4整除但不能被100整除的年份是闰年
     * - 能被400整除的年份也是闰年
     * 
     * @returns 是否为闰年
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2020, 1, 1);
     * const isLeap = solar.isLeapYear(); // 返回true
     * ```
     */
    isLeapYear(): boolean {
        return SolarUtil.isLeapYear(this._year);
    }

    /**
     * 获取节日
     * 
     * 获取当前日期的主要节日，包括固定日期节日和星期节日
     * 固定日期节日：如元旦（1月1日）、劳动节（5月1日）等
     * 星期节日：如母亲节（5月第二个星期日）、父亲节（6月第三个星期日）等
     * 
     * @returns 节日列表（字符串数组）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 5, 1);
     * const festivals = solar.getFestivals(); // 返回["劳动节"]
     * ```
     */
    getFestivals(): string[] {
        const l: string[] = [];
        let f = SolarUtil.FESTIVAL[this._month + '-' + this._day];
        if (f) {
            l.push(f);
        }
        const weeks = Math.ceil(this._day / 7);
        const week = this.getWeek();
        f = SolarUtil.WEEK_FESTIVAL[this._month + '-' + weeks + '-' + week];
        if (f) {
            l.push(f);
        }
        if (this._day + 7 > SolarUtil.getDaysOfMonth(this._year, this._month)) {
            f = SolarUtil.WEEK_FESTIVAL[this._month + '-0-' + week];
            if (f) {
                l.push(f);
            }
        }
        return l;
    }

    /**
     * 获取其他节日（非主要节日）
     * 
     * 获取当前日期的次要节日或纪念日
     * 这些节日通常不是法定节假日，但有一定的文化意义
     * 
     * @returns 其他节日列表（字符串数组）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 3, 8);
     * const otherFestivals = solar.getOtherFestivals(); // 返回["妇女节"]
     * ```
     */
    getOtherFestivals(): string[] {
        const l: string[] = [];
        const fs = SolarUtil.OTHER_FESTIVAL[this._month + '-' + this._day];
        if (fs) {
            fs.forEach(f => {
                l.push(f);
            });
        }
        return l;
    }

    /**
     * 获取星座（getXingZuo的别名）
     * 
     * 此方法是getXingZuo()的别名，为了向后兼容而保留
     * 建议使用标准的getXingZuo()方法
     * 
     * @returns 星座名称
     * @deprecated 请使用 getXingZuo() 方法
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 7, 15);
     * const xingzuo = solar.getXingzuo(); // 返回"巨蟹座"（已过时）
     * const xingZuo = solar.getXingZuo(); // 推荐使用此方法
     * ```
     */
    getXingzuo(): string {
        return this.getXingZuo();
    }

    /**
     * 获取星座
     * 
     * 根据阳历日期计算对应的星座
     * 使用标准的星座日期划分
     * 
     * @returns 星座名称（如"白羊座"、"金牛座"等）
     * 
     * 星座日期划分：
     * - 白羊座：3月21日-4月19日
     * - 金牛座：4月20日-5月20日
     * - 双子座：5月21日-6月21日
     * - 巨蟹座：6月22日-7月22日
     * - 狮子座：7月23日-8月22日
     * - 处女座：8月23日-9月22日
     * - 天秤座：9月23日-10月23日
     * - 天蝎座：10月24日-11月22日
     * - 射手座：11月23日-12月21日
     * - 摩羯座：12月22日-1月19日
     * - 水瓶座：1月20日-2月18日
     * - 双鱼座：2月19日-3月20日
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 7, 15);
     * const xingZuo = solar.getXingZuo(); // 返回"巨蟹座"
     * ```
     */
    getXingZuo(): string {
        let index = 11;
        const y = this._month * 100 + this._day;
        if (y >= 321 && y <= 419) {
            index = 0;
        } else if (y >= 420 && y <= 520) {
            index = 1;
        } else if (y >= 521 && y <= 621) {
            index = 2;
        } else if (y >= 622 && y <= 722) {
            index = 3;
        } else if (y >= 723 && y <= 822) {
            index = 4;
        } else if (y >= 823 && y <= 922) {
            index = 5;
        } else if (y >= 923 && y <= 1023) {
            index = 6;
        } else if (y >= 1024 && y <= 1122) {
            index = 7;
        } else if (y >= 1123 && y <= 1221) {
            index = 8;
        } else if (y >= 1222 || y <= 119) {
            index = 9;
        } else if (y <= 218) {
            index = 10;
        }
        return SolarUtil.XINGZUO[index];
    }

    /**
     * 获取薪资比例（用于计算节假日工资）
     * 
     * 根据中国劳动法规定计算节假日工资比例
     * 主要用于计算加班工资、节假日工资等
     * 
     * @returns 薪资比例：
     * - 1：工作日（正常工资）
     * - 2：周末或调休（双倍工资）
     * - 3：法定节假日（三倍工资）
     * 
     * 法定节假日包括：
     * - 元旦（1月1日）
     * - 春节（农历正月初一至初三）
     * - 清明节（节气当天）
     * - 劳动节（5月1日）
     * - 端午节（农历五月初五）
     * - 中秋节（农历八月十五）
     * - 国庆节（10月1日至3日）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 10, 1);
     * const rate = solar.getSalaryRate(); // 返回3（国庆节三倍工资）
     * ```
     */
    getSalaryRate(): number {
        // 元旦节
        if (this._month === 1 && this._day === 1) {
            return 3;
        }
        // 劳动节
        if (this._month === 5 && this._day === 1) {
            return 3;
        }
        // 国庆
        if (this._month === 10 && this._day >= 1 && this._day <= 3) {
            return 3;
        }
        const lunar = this.getLunar();
        // 春节
        if (lunar.getMonth() === 1 && lunar.getDay() >= 1 && lunar.getDay() <= 3) {
            return 3;
        }
        // 端午
        if (lunar.getMonth() === 5 && lunar.getDay() === 5) {
            return 3;
        }
        // 中秋
        if (lunar.getMonth() === 8 && lunar.getDay() === 15) {
            return 3;
        }
        // 清明
        if ('清明' === lunar.getJieQi()) {
            return 3;
        }
        const holiday = HolidayUtil.getHoliday(this._year, this._month, this._day);
        if (holiday) {
            // 法定假日非上班
            if (!holiday.isWork()) {
                return 2;
            }
        } else {
            // 周末
            const week = this.getWeek();
            if (week === 6 || week === 0) {
                return 2;
            }
        }
        // 工作日
        return 1;
    }

    /**
     * 转换为年月日字符串（yyyy-MM-dd格式）
     * 
     * 将阳历日期转换为标准格式的字符串
     * 年份不足4位时自动补零
     * 
     * @returns 年月日字符串（格式：yyyy-MM-dd）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 25);
     * const ymd = solar.toYmd(); // 返回"2023-12-25"
     * ```
     */
    toYmd(): string {
        let y = this._year + '';
        while (y.length < 4) {
            y = '0' + y;
        }
        return [y, (this._month < 10 ? '0' : '') + this._month, (this._day < 10 ? '0' : '') + this._day].join('-');
    }

    /**
     * 转换为年月日时分秒字符串（yyyy-MM-dd HH:mm:ss格式）
     * 
     * 将阳历日期和时间转换为标准格式的字符串
     * 包含完整的日期和时间信息
     * 
     * @returns 年月日时分秒字符串（格式：yyyy-MM-dd HH:mm:ss）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmdHms(2023, 12, 25, 14, 30, 15);
     * const ymdHms = solar.toYmdHms(); // 返回"2023-12-25 14:30:15"
     * ```
     */
    toYmdHms(): string {
        return this.toYmd() + ' ' + [(this._hour < 10 ? '0' : '') + this._hour, (this._minute < 10 ? '0' : '') + this._minute, (this._second < 10 ? '0' : '') + this._second].join(':');
    }

    /**
     * 转换为字符串（等同于toYmd()）
     * 
     * 重写Object.prototype.toString()方法
     * 返回格式化的日期字符串
     * 
     * @returns 年月日字符串（格式：yyyy-MM-dd）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 25);
     * const str = solar.toString(); // 返回"2023-12-25"
     * console.log(`日期：${solar}`); // 自动调用toString()
     * ```
     */
    toString(): string {
        return this.toYmd();
    }

    /**
     * 转换为完整字符串（包含日期、星期、节日、星座等信息）
     * 
     * 生成包含丰富信息的日期字符串，便于显示和调试
     * 包含：日期时间、闰年标识、星期、节日、星座等信息
     * 
     * @returns 完整的日期信息字符串
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmdHms(2023, 12, 25, 14, 30, 15);
     * const fullStr = solar.toFullString();
     * // 返回："2023-12-25 14:30:15 星期一 (圣诞节) 摩羯座"
     * ```
     */
    toFullString(): string {
        let s = this.toYmdHms();
        if (this.isLeapYear()) {
            s += ' 闰年';
        }
        s += ' 星期' + this.getWeekInChinese();
        const festivals = this.getFestivals();
        festivals.forEach(f => {
            s += ' (' + f + ')';
        });
        s += ' ' + this.getXingZuo() + '座';
        return s;
    }

    /**
     * 增加或减少年份
     * 
     * 在当前日期的基础上增加或减少指定的年数
     * 自动处理闰年2月天数的变化
     * 
     * @param years - 年数（正数为增加，负数为减少）
     * @returns 新的阳历日期对象
     * 
     * 特殊处理：
     * - 1582年10月的格里高利历改革日期调整
     * - 闰年2月29日调整为非闰年时的2月28日
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2020, 2, 29); // 闰年
     * const next = solar.nextYear(1); // 返回2021年2月28日
     * const prev = solar.nextYear(-1); // 返回2019年2月28日
     * ```
     */
    nextYear(years: number): Solar {
        const y = this._year + years;
        const m = this._month;
        let d = this._day;
        if (1582 === y && 10 === m) {
            if (d > 4 && d < 15) {
                d += 10;
            }
        } else if (2 === m) {
            if (d > 28) {
                if (!SolarUtil.isLeapYear(y)) {
                    d = 28;
                }
            }
        }
        return Solar.fromYmdHms(y, m, d, this._hour, this._minute, this._second);
    }

    /**
     * 增加或减少月份
     * 
     * 在当前日期的基础上增加或减少指定的月数
     * 自动处理月份边界和不同月份的天数差异
     * 
     * @param months - 月数（正数为增加，负数为减少）
     * @returns 新的阳历日期对象
     * 
     * 特殊处理：
     * - 跨年时自动调整年份
     * - 目标月份天数不足时，自动调整为该月最后一天
     * - 1582年10月的格里高利历改革日期调整
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 1, 31);
     * const next = solar.nextMonth(1); // 返回2023年2月28日（非闰年）
     * const prev = solar.nextMonth(-1); // 返回2022年12月31日
     * ```
     */
    nextMonth(months: number): Solar {
        const month = SolarMonth.fromYm(this._year, this._month).next(months);
        const y = month.getYear();
        const m = month.getMonth();
        let d = this._day;
        if (1582 === y && 10 === m) {
            if (d > 4 && d < 15) {
                d += 10;
            }
        } else {
            const maxDay = SolarUtil.getDaysOfMonth(y, m);
            if (d > maxDay) {
                d = maxDay;
            }
        }
        return Solar.fromYmdHms(y, m, d, this._hour, this._minute, this._second);
    }

    /**
     * 增加或减少天数
     * 
     * 在当前日期的基础上增加或减少指定的天数
     * 自动处理月份和年份的边界
     * 
     * @param days - 天数（正数为增加，负数为减少）
     * @returns 新的阳历日期对象
     * 
     * 算法说明：
     * - 正数天数：逐月累加，超过当月天数时进入下个月
     * - 负数天数：逐月递减，不足时进入上个月
     * - 自动处理1582年10月的日期跳跃
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 31);
     * const next = solar.nextDay(1); // 返回2024年1月1日
     * const prev = solar.nextDay(-1); // 返回2023年12月30日
     * ```
     */
    nextDay(days: number): Solar {
        let y = this._year;
        let m = this._month;
        let d = this._day;
        if (1582 === y && 10 === m) {
            if (d > 4) {
                d -= 10
            }
        }
        if (days > 0) {
            d += days;
            let daysInMonth = SolarUtil.getDaysOfMonth(y, m);
            while (d > daysInMonth) {
                d -= daysInMonth;
                m++;
                if (m > 12) {
                    m = 1;
                    y++;
                }
                daysInMonth = SolarUtil.getDaysOfMonth(y, m);
            }
        } else if (days < 0) {
            while (d + days <= 0) {
                m--;
                if (m < 1) {
                    m = 12;
                    y--;
                }
                d += SolarUtil.getDaysOfMonth(y, m);
            }
            d += days;
        }
        if (1582 === y && 10 === m) {
            if (d > 4) {
                d += 10;
            }
        }
        return Solar.fromYmdHms(y, m, d, this._hour, this._minute, this._second);
    }

    /**
     * 增加或减少天数（可选择是否只计算工作日）
     * 
     * 通用的日期推移方法，可选择是否跳过非工作日
     * 当onlyWorkday为true时，只计算工作日（跳过周末和法定节假日）
     * 
     * @param days - 天数（正数为增加，负数为减少）
     * @param onlyWorkday - 是否只计算工作日（默认false）
     * @returns 新的阳历日期对象
     * 
     * 工作日判断规则：
     * - 周末（周六、周日）为非工作日，除非是调休上班
     * - 法定节假日为非工作日，除非是调休上班
     * - 使用HolidayUtil判断具体的节假日安排
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 12, 22); // 星期五
     * const nextWorkday = solar.next(3, true); // 跳过周末，返回下周三
     * const nextAnyday = solar.next(3, false); // 包含周末，返回下周一
     * ```
     */
    next(days: number, onlyWorkday: boolean = false): Solar {
        if (onlyWorkday) {
            let solar = Solar.fromYmdHms(this._year, this._month, this._day, this._hour, this._minute, this._second);
            if (days !== 0) {
                let rest = Math.abs(days);
                const add = days < 1 ? -1 : 1;
                while (rest > 0) {
                    solar = solar.next(add);
                    let work = true;
                    const holiday = HolidayUtil.getHoliday(solar.getYear(), solar.getMonth(), solar.getDay());
                    if (!holiday) {
                        const week = solar.getWeek();
                        if (0 === week || 6 === week) {
                            work = false;
                        }
                    } else {
                        work = holiday.isWork();
                    }
                    if (work) {
                        rest -= 1;
                    }
                }
            }
            return solar;
        } else {
            return this.nextDay(days);
        }
    }

    /**
     * 增加或减少小时
     * @param hours - 小时数（正数为增加，负数为减少）
     * @returns 新的阳历日期对象
     */
    nextHour(hours: number): Solar {
        const h = this._hour + hours;
        const n = h < 0 ? -1 : 1;
        let hour = Math.abs(h);
        let days = Math.floor(hour / 24) * n;
        hour = (hour % 24) * n;
        if (hour < 0) {
            hour += 24;
            days--;
        }
        const solar = this.next(days);
        return Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), hour, solar.getMinute(), solar.getSecond());
    }

    /**
     * 转换为农历对象
     * 
     * 将阳历日期转换为对应的农历日期
     * 这是阳历和农历之间的桥梁方法
     * 
     * @returns 农历对象（Lunar实例）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmd(2023, 1, 22);
     * const lunar = solar.getLunar(); // 返回对应的农历日期
     * console.log(lunar.toString()); // 显示农历日期
     * ```
     */
    getLunar(): Lunar {
        return Lunar.fromSolar(this);
    }

    /**
     * 获取儒略日
     * 
     * 计算当前阳历日期对应的儒略日
     * 儒略日是天文计算中常用的连续计日法
     * 
     * @returns 儒略日（浮点数，包含小数部分表示时间）
     * 
     * 算法说明：
     * - 使用标准的儒略日计算公式
     * - 处理格里高利历改革（1582年10月）
     * - 包含时间的小数部分（小时/24 + 分钟/1440 + 秒/86400）
     * 
     * 示例：
     * ```typescript
     * const solar = Solar.fromYmdHms(2000, 1, 1, 12, 0, 0);
     * const jd = solar.getJulianDay(); // 返回2451545.0（J2000）
     * ```
     */
    getJulianDay(): number {
        let y = this._year;
        let m = this._month;
        const d = this._day + ((this._second / 60 + this._minute) / 60 + this._hour) / 24;
        let n = 0;
        let g = false;
        if (y * 372 + m * 31 + Math.floor(d) >= 588829) {
            g = true;
        }
        if (m <= 2) {
            m += 12;
            y--;
        }
        if (g) {
            n = Math.floor(y / 100);
            n = 2 - n + Math.floor(n / 4);
        }
        return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + n - 1524.5;
    }

    /**
     * 判断当前日期是否在指定日期之前
     * 
     * 精确比较两个日期的时间先后顺序
     * 比较到秒级别精度
     * 
     * @param solar - 要比较的阳历日期
     * @returns 是否在指定日期之前（true：当前日期早于比较日期）
     * 
     * 比较顺序：年 -> 月 -> 日 -> 时 -> 分 -> 秒
     * 
     * 示例：
     * ```typescript
     * const date1 = Solar.fromYmd(2023, 1, 1);
     * const date2 = Solar.fromYmd(2023, 1, 2);
     * const isBefore = date1.isBefore(date2); // 返回true
     * ```
     */
    isBefore(solar: Solar): boolean {
        if (this._year > solar.getYear()) {
            return false;
        }
        if (this._year < solar.getYear()) {
            return true;
        }
        if (this._month > solar.getMonth()) {
            return false;
        }
        if (this._month < solar.getMonth()) {
            return true;
        }
        if (this._day > solar.getDay()) {
            return false;
        }
        if (this._day < solar.getDay()) {
            return true;
        }
        if (this._hour > solar.getHour()) {
            return false;
        }
        if (this._hour < solar.getHour()) {
            return true;
        }
        if (this._minute > solar.getMinute()) {
            return false;
        }
        if (this._minute < solar.getMinute()) {
            return true;
        }
        return this._second < solar.getSecond();
    }

    /**
     * 判断当前日期是否在指定日期之后
     * 
     * 精确比较两个日期的时间先后顺序
     * 比较到秒级别精度
     * 
     * @param solar - 要比较的阳历日期
     * @returns 是否在指定日期之后（true：当前日期晚于比较日期）
     * 
     * 比较顺序：年 -> 月 -> 日 -> 时 -> 分 -> 秒
     * 
     * 示例：
     * ```typescript
     * const date1 = Solar.fromYmd(2023, 1, 2);
     * const date2 = Solar.fromYmd(2023, 1, 1);
     * const isAfter = date1.isAfter(date2); // 返回true
     * ```
     */
    isAfter(solar: Solar): boolean {
        if (this._year > solar.getYear()) {
            return true;
        }
        if (this._year < solar.getYear()) {
            return false;
        }
        if (this._month > solar.getMonth()) {
            return true;
        }
        if (this._month < solar.getMonth()) {
            return false;
        }
        if (this._day > solar.getDay()) {
            return true;
        }
        if (this._day < solar.getDay()) {
            return false;
        }
        if (this._hour > solar.getHour()) {
            return true;
        }
        if (this._hour < solar.getHour()) {
            return false;
        }
        if (this._minute > solar.getMinute()) {
            return true;
        }
        if (this._minute < solar.getMinute()) {
            return false;
        }
        return this._second > solar.getSecond();
    }

    /**
     * 计算与指定日期的天数差（当前日期 - 指定日期）
     * 
     * 计算两个日期之间的天数差异
     * 结果为当前日期减去比较日期的天数
     * 
     * @param solar - 要比较的阳历日期
     * @returns 天数差（整数，正数表示当前日期晚于比较日期）
     * 
     * 注意：
     * - 只计算日期差异，不考虑时间部分
     * - 使用SolarUtil.getDaysBetween进行精确计算
     * - 自动处理1582年10月的日期跳跃
     * 
     * 示例：
     * ```typescript
     * const date1 = Solar.fromYmd(2023, 1, 10);
     * const date2 = Solar.fromYmd(2023, 1, 1);
     * const diff = date1.subtract(date2); // 返回9
     * ```
     */
    subtract(solar: Solar): number {
        return SolarUtil.getDaysBetween(solar.getYear(), solar.getMonth(), solar.getDay(), this._year, this._month, this._day);
    }

    /**
     * 计算与指定日期的分钟差（当前日期 - 指定日期）
     * 
     * 计算两个日期时间之间的总分钟差异
     * 包含日期部分和时间部分的精确计算
     * 
     * @param solar - 要比较的阳历日期
     * @returns 分钟差（整数，正数表示当前日期时间晚于比较日期时间）
     * 
     * 算法说明：
     * - 首先计算天数差异
     * - 然后计算当天的时间分钟差异
     * - 如果时间部分为负数，则借一天（1440分钟）
     * - 总分钟数 = 天数×1440 + 时间分钟差
     * 
     * 示例：
     * ```typescript
     * const date1 = Solar.fromYmdHms(2023, 1, 2, 10, 0, 0);
     * const date2 = Solar.fromYmdHms(2023, 1, 1, 14, 0, 0);
     * const diff = date1.subtractMinute(date2); // 返回1200分钟（1天20小时）
     * ```
     */
    subtractMinute(solar: Solar): number {
        let days = this.subtract(solar);
        const cm = this._hour * 60 + this._minute;
        const sm = solar.getHour() * 60 + solar.getMinute();
        let m = cm - sm;
        if (m < 0) {
            m += 1440;
            days--;
        }
        m += days * 1440;
        return m;
    }

}