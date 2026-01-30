import {Lunar} from './Lunar';
import {LunarUtil} from './LunarUtil';
import {FotoUtil} from './FotoUtil';
import {LunarMonth} from './LunarMonth';
import {FotoFestival} from './FotoFestival';

/**
 * 佛历类
 *
 * 佛历，又称泰国历，是泰国、柬埔寨、老挝、缅甸、斯里兰卡和印度尼西亚等国使用的历法，
 * 以释迦牟尼佛涅槃的年份为元年，比格里高利历晚543年（佛历元年 = 公历纪元前543年）。
 *
 * 使用说明：
 * - 从阴历创建：Foto.fromLunar(lunar)
 * - 从佛历年月日创建：Foto.fromYmd(佛历年, 农历月, 农历日)，佛历年 = 公历年 + 543（如 2023 年对应佛历 2566 年）
 * - 月日与农历一致，正月为 1，闰月用负数表示（如闰二月传 -2）
 * - getFestivals() 为因果犯忌等节日，getOtherFestivals() 为纪念日
 * - isMonthZhai()、isDayZhaiTen()、isDayZhaiSix()、isDayZhaiShuoWang()、isDayZhaiGuanYin() 判断各类斋日
 * - isDayYangGong() 判断是否为杨公忌日
 */
export class Foto {
    private readonly _lunar: Lunar;

    /**
     * 佛历元年与公历的差值（佛历元年 = 公历纪元前543年）
     */
    static DEAD_YEAR: number = -543;

    /**
     * 构造函数
     * 
     * @param lunar 农历日期对象
     * 
     * @internal 建议使用静态工厂方法创建实例
     */
    constructor(lunar: Lunar) {
        this._lunar = lunar;
    }

    /**
     * 从农历日期创建佛历日期
     * 
     * @param lunar 农历日期对象
     * @returns 佛历日期对象
     * 
     * @example
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 10, 1);
     * const foto = Foto.fromLunar(lunar);
     * ```
     */
    static fromLunar(lunar: Lunar): Foto {
        return new Foto(lunar);
    }

    /**
     * 从年月日时分秒创建佛历日期
     * 
     * @param lunarYear 佛历年
     * @param lunarMonth 农历月（正数表示平月，负数表示闰月）
     * @param lunarDay 农历日
     * @param hour 时
     * @param minute 分
     * @param second 秒
     * @returns 佛历日期对象
     * 
     * @example
     * ```typescript
     * const foto = Foto.fromYmdHms(2566, 10, 1, 12, 0, 0);
     * ```
     */
    static fromYmdHms(lunarYear: number, lunarMonth: number, lunarDay: number, hour: number, minute: number, second: number): Foto {
        return Foto.fromLunar(Lunar.fromYmdHms(lunarYear + Foto.DEAD_YEAR - 1, lunarMonth, lunarDay, hour, minute, second));
    }

    /**
     * 从年月日创建佛历日期
     * 
     * @param lunarYear 佛历年
     * @param lunarMonth 农历月（正数表示平月，负数表示闰月）
     * @param lunarDay 农历日
     * @returns 佛历日期对象
     * 
     * @example
     * ```typescript
     * const foto = Foto.fromYmd(2566, 10, 1);
     * ```
     */
    static fromYmd(lunarYear: number, lunarMonth: number, lunarDay: number): Foto {
        return Foto.fromYmdHms(lunarYear, lunarMonth, lunarDay, 0, 0, 0);
    }

    /**
     * 获取农历日期对象
     * 
     * @returns 农历日期对象
     */
    getLunar(): Lunar {
        return this._lunar;
    }

    /**
     * 获取佛历年
     * 
     * @returns 佛历年
     */
    getYear(): number {
        const sy = this._lunar.getSolar().getYear();
        let y = sy - Foto.DEAD_YEAR;
        if (sy === this._lunar.getYear()) {
            y++;
        }
        return y;
    }

    /**
     * 获取农历月
     * 
     * @returns 农历月（正数表示平月，负数表示闰月）
     */
    getMonth(): number {
        return this._lunar.getMonth();
    }

    /**
     * 获取农历日
     * 
     * @returns 农历日
     */
    getDay(): number {
        return this._lunar.getDay();
    }

    /**
     * 获取中文表示的佛历年
     * 
     * @returns 中文表示的佛历年，如"二五六六年"
     */
    getYearInChinese(): string {
        const y = this.getYear() + '';
        let s = '';
        const zero = '0'.charCodeAt(0);
        for (let i = 0, j = y.length; i < j; i++) {
            s += LunarUtil.NUMBER[y.charCodeAt(i) - zero];
        }
        return s;
    }

    /**
     * 获取中文表示的农历月
     * 
     * @returns 中文表示的农历月，如"十月"
     */
    getMonthInChinese(): string {
        return this._lunar.getMonthInChinese();
    }

    /**
     * 获取中文表示的农历日
     * 
     * @returns 中文表示的农历日，如"初一"
     */
    getDayInChinese(): string {
        return this._lunar.getDayInChinese();
    }

    /**
     * 获取佛历节日列表
     * 
     * @returns 佛历节日列表
     */
    getFestivals(): FotoFestival[] {
        const l = FotoUtil.FESTIVAL[this.getMonth() + '-' + this.getDay()];
        return l ? l : [];
    }

    /**
     * 获取其他节日列表
     * 
     * @returns 其他节日列表
     */
    getOtherFestivals(): string[] {
        const l: string[] = [];
        const fs = FotoUtil.OTHER_FESTIVAL[this.getMonth() + '-' + this.getDay()];
        if (fs) {
            fs.forEach(f => {
                l.push(f);
            });
        }
        return l;
    }

    /**
     * 是否是斋月
     * 
     * 佛历中，每年的正月、五月和九月为斋月。
     * 
     * @returns 是否是斋月
     */
    isMonthZhai(): boolean {
        const m = this.getMonth();
        return 1 === m || 5 === m || 9 === m;
    }

    /**
     * 是否是杨公忌日
     * 
     * 杨公忌日是中国传统历法中的十三个不吉利的日子。
     * 
     * @returns 是否是杨公忌日
     */
    isDayYangGong(): boolean {
        const l = this.getFestivals();
        for (let i = 0, j = l.length; i < j; i++) {
            if ('杨公忌' === l[i].getName()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否是朔望斋日
     * 
     * 朔望斋日是每月的初一和十五。
     * 
     * @returns 是否是朔望斋日
     */
    isDayZhaiShuoWang(): boolean {
        const d = this.getDay();
        return 1 === d || 15 === d;
    }

    /**
     * 是否是六斋日
     * 
     * 六斋日是每月的初八、十四、十五、二十三、二十九（小月为二十八）和三十日。
     * 
     * @returns 是否是六斋日
     */
    isDayZhaiSix(): boolean {
        const d = this.getDay();
        if (8 === d || 14 === d || 15 === d || 23 === d || 29 === d || 30 === d) {
            return true;
        } else if (28 === d) {
            const m = LunarMonth.fromYm(this._lunar.getYear(), this.getMonth());
            if (null != m && 30 !== m.getDayCount()) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否是十斋日
     * 
     * 十斋日是每月的初一、初八、十四、十五、十八、二十三、二十四、二十八、二十九（小月为二十八）和三十日。
     * 
     * @returns 是否是十斋日
     */
    isDayZhaiTen(): boolean {
        const d = this.getDay();
        return 1 === d || 8 === d || 14 === d || 15 === d || 18 === d || 23 === d || 24 === d || 28 === d || 29 === d || 30 === d;
    }

    /**
     * 是否是观音斋日
     * 
     * 观音斋日是佛教中专门用于供奉观音菩萨的斋日。
     * 
     * @returns 是否是观音斋日
     */
    isDayZhaiGuanYin(): boolean {
        const k = this.getMonth() + '-' + this.getDay();
        for (let i = 0, j = FotoUtil.DAY_ZHAI_GUAN_YIN.length; i < j; i++) {
            if (k === FotoUtil.DAY_ZHAI_GUAN_YIN[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取宿
     * 
     * 宿是中国传统天文学中的二十八宿之一。
     * 
     * @returns 宿
     */
    getXiu(): string {
        return FotoUtil.getXiu(this.getMonth(), this.getDay());
    }

    /**
     * 获取宿的吉凶
     * 
     * @returns 宿的吉凶
     */
    getXiuLuck(): string {
        return LunarUtil.XIU_LUCK[this.getXiu()];
    }

    /**
     * 获取宿的歌诀
     * 
     * @returns 宿的歌诀
     */
    getXiuSong(): string {
        return LunarUtil.XIU_SONG[this.getXiu()];
    }

    /**
     * 获取政
     * 
     * @returns 政
     */
    getZheng(): string {
        return LunarUtil.ZHENG[this.getXiu()];
    }

    /**
     * 获取动物
     * 
     * @returns 动物
     */
    getAnimal(): string {
        return LunarUtil.ANIMAL[this.getXiu()];
    }

    /**
     * 获取宫
     * 
     * @returns 宫
     */
    getGong(): string {
        return LunarUtil.GONG[this.getXiu()];
    }

    /**
     * 获取守
     * 
     * @returns 守
     */
    getShou(): string {
        return LunarUtil.SHOU[this.getGong()];
    }

    /**
     * 获取字符串表示
     * 
     * @returns 字符串表示，如"二五六六年十月初一"
     */
    toString(): string {
        return this.getYearInChinese() + '年' + this.getMonthInChinese() + '月' + this.getDayInChinese();
    }

    /**
     * 获取完整字符串表示
     * 
     * @returns 完整字符串表示，包含节日信息
     */
    toFullString(): string {
        let s = this.toString();
        const festivals = this.getFestivals();
        for (let i = 0, j = festivals.length; i < j; i++) {
            s += ' (' + festivals[i] + ')';
        }
        return s;
    }
}