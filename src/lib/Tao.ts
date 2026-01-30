import {Lunar} from './Lunar';
import {LunarUtil} from './LunarUtil';
import {TaoUtil} from './TaoUtil';
import {TaoFestival} from './TaoFestival';
import {I18n} from './I18n';

/**
 * 道历类
 *
 * 道历是道教使用的历法，以黄帝纪元为元年，比公历早2697年（道历元年 = 公历纪元前2697年）。
 *
 * 使用说明：
 * - 从阴历创建：Tao.fromLunar(lunar)
 * - 从道历年月日创建：Tao.fromYmd(道历年, 农历月, 农历日)，道历年 = 公历年 + 2697（如 2023 年对应道历 4720 年）
 * - 月日与农历一致，正月为 1，闰月用负数表示
 * - getFestivals() 为道历节日
 * - isDaySanHui()、isDaySanYuan()、isDayBaJie()、isDayWuLa()、isDayBaHui() 判断三会日、三元日、八节、五腊、八会
 * - isDayWu()、isDayMingWu()、isDayAnWu() 判断戊日（明戊、暗戊），isDayTianShe() 判断天赦日
 */
export class Tao {
    private readonly _lunar: Lunar;

    /**
     * 黄帝纪元与公历的差值（道历元年 = 公历纪元前2697年）
     */
    static BIRTH_YEAR: number = -2697;

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
     * 从农历日期创建道历日期
     * 
     * @param lunar 农历日期对象
     * @returns 道历日期对象
     * 
     * @example
     * ```typescript
     * const lunar = Lunar.fromYmd(2023, 10, 1);
     * const tao = Tao.fromLunar(lunar);
     * ```
     */
    static fromLunar(lunar: Lunar): Tao {
        return new Tao(lunar);
    }

    /**
     * 从年月日时分秒创建道历日期
     * 
     * @param lunarYear 道历年
     * @param lunarMonth 农历月（正数表示平月，负数表示闰月）
     * @param lunarDay 农历日
     * @param hour 时
     * @param minute 分
     * @param second 秒
     * @returns 道历日期对象
     * 
     * @example
     * ```typescript
     * const tao = Tao.fromYmdHms(4726, 10, 1, 12, 0, 0);
     * ```
     */
    static fromYmdHms(lunarYear: number, lunarMonth: number, lunarDay: number, hour: number, minute: number, second: number): Tao {
        return Tao.fromLunar(Lunar.fromYmdHms(lunarYear + Tao.BIRTH_YEAR, lunarMonth, lunarDay, hour, minute, second));
    }

    /**
     * 从年月日创建道历日期
     * 
     * @param lunarYear 道历年
     * @param lunarMonth 农历月（正数表示平月，负数表示闰月）
     * @param lunarDay 农历日
     * @returns 道历日期对象
     * 
     * @example
     * ```typescript
     * const tao = Tao.fromYmd(4726, 10, 1);
     * ```
     */
    static fromYmd(lunarYear: number, lunarMonth: number, lunarDay: number): Tao {
        return Tao.fromYmdHms(lunarYear, lunarMonth, lunarDay, 0, 0, 0);
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
     * 获取道历年
     * 
     * @returns 道历年
     */
    getYear(): number {
        return this._lunar.getYear() - Tao.BIRTH_YEAR;
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
     * 获取中文表示的道历年
     * 
     * @returns 中文表示的道历年，如"四七二六年"
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
     * 获取道历节日列表
     * 
     * @returns 道历节日列表
     */
    getFestivals(): TaoFestival[] {
        const l: TaoFestival[] = [];
        const fs = TaoUtil.FESTIVAL[this.getMonth() + '-' + this.getDay()];
        if (fs) {
            fs.forEach(f => {
                l.push(f);
            });
        }
        const jq = this._lunar.getJieQi();
        if (I18n.getMessage('jq.dongZhi') === jq) {
            l.push(new TaoFestival('元始天尊圣诞'));
        } else if (I18n.getMessage('jq.xiaZhi') === jq) {
            l.push(new TaoFestival('灵宝天尊圣诞'));
        }
        let f = TaoUtil.BA_JIE[jq];
        if (f) {
            l.push(new TaoFestival(f));
        }
        f = TaoUtil.BA_HUI[this._lunar.getDayInGanZhi()];
        if (f) {
            l.push(new TaoFestival(f));
        }
        return l;
    }

    /**
     * 检查日期是否在指定的日期列表中
     * 
     * @param days 日期列表，格式为"月-日"
     * @returns 是否在列表中
     * 
     * @private
     */
    private _isDayIn(days: string[]): boolean {
        const md = this.getMonth() + '-' + this.getDay();
        for (let i = 0, j = days.length; i < j; i++) {
            if (md === days[i]) {
                return true;
            }
        }
        return false;
    }

    /**
     * 是否是三会日
     * 
     * 三会日是指正月初七、七月初七、十月初五，是道教的重要节日。
     * 
     * @returns 是否是三会日
     */
    isDaySanHui(): boolean {
        return this._isDayIn(TaoUtil.SAN_HUI);
    }

    /**
     * 是否是三元日
     * 
     * 三元日是指正月十五上元节、七月十五中元节、十月十五下元节。
     * 
     * @returns 是否是三元日
     */
    isDaySanYuan(): boolean {
        return this._isDayIn(TaoUtil.SAN_YUAN);
    }

    /**
     * 是否是八节日
     * 
     * 八节日是指二十四节气中的八个重要节气：立春、春分、立夏、夏至、立秋、秋分、立冬、冬至。
     * 
     * @returns 是否是八节日
     */
    isDayBaJie(): boolean {
        return !!TaoUtil.BA_JIE[this._lunar.getJieQi()];
    }

    /**
     * 是否是五腊日
     * 
     * 五腊日是指正月初一天腊、五月初五地腊、七月初七道德腊、十月初一民岁腊、十二月初八王侯腊。
     * 
     * @returns 是否是五腊日
     */
    isDayWuLa(): boolean {
        return this._isDayIn(TaoUtil.WU_LA);
    }

    /**
     * 是否是八会日
     * 
     * 八会日是指根据天干地支组合确定的八个重要日子。
     * 
     * @returns 是否是八会日
     */
    isDayBaHui(): boolean {
        return !!TaoUtil.BA_HUI[this._lunar.getDayInGanZhi()];
    }

    /**
     * 是否是明戊日
     * 
     * 明戊日是指天干为戊的日子。
     * 
     * @returns 是否是明戊日
     */
    isDayMingWu(): boolean {
        return I18n.getMessage('tg.wu') === this._lunar.getDayGan();
    }

    /**
     * 是否是暗戊日
     * 
     * 暗戊日是指根据月份地支确定的戊日。
     * 
     * @returns 是否是暗戊日
     */
    isDayAnWu(): boolean {
        return this._lunar.getDayZhi() === TaoUtil.AN_WU[Math.abs(this.getMonth()) - 1];
    }

    /**
     * 是否是戊日
     * 
     * 戊日包括明戊日和暗戊日，是道教中需要避讳的日子。
     * 
     * @returns 是否是戊日
     */
    isDayWu(): boolean {
        return this.isDayMingWu() || this.isDayAnWu();
    }

    /**
     * 是否是天赦日
     * 
     * 天赦日是指根据月份地支和日干支确定的吉日，是道教中适合祭祀、祈福的日子。
     * 
     * @returns 是否是天赦日
     */
    isDayTianShe(): boolean {
        let ret = false;
        const mz = this._lunar.getMonthZhi();
        const dgz = this._lunar.getDayInGanZhi();
        if ([I18n.getMessage('dz.yin'), I18n.getMessage('dz.mao'), I18n.getMessage('dz.chen')].join(',').indexOf(mz) > -1) {
            if (I18n.getMessage('jz.wuYin') === dgz) {
                ret = true;
            }
        } else if ([I18n.getMessage('dz.si'), I18n.getMessage('dz.wu'), I18n.getMessage('dz.wei')].join(',').indexOf(mz) > -1) {
            if (I18n.getMessage('jz.jiaWu') === dgz) {
                ret = true;
            }
        } else if ([I18n.getMessage('dz.shen'), I18n.getMessage('dz.you'), I18n.getMessage('dz.xu')].join(',').indexOf(mz) > -1) {
            if (I18n.getMessage('jz.wuShen') === dgz) {
                ret = true;
            }
        } else if ([I18n.getMessage('dz.hai'), I18n.getMessage('dz.zi'), I18n.getMessage('dz.chou')].join(',').indexOf(mz) > -1) {
            if (I18n.getMessage('jz.jiaZi') === dgz) {
                ret = true;
            }
        }
        return ret;
    }

    /**
     * 获取道历日期的字符串表示
     * 
     * @returns 道历日期字符串，如"四七二六年十月初一"
     */
    toString(): string {
        return this.getYearInChinese() + '年' + this.getMonthInChinese() + '月' + this.getDayInChinese();
    }

    /**
     * 获取道历日期的完整字符串表示
     * 
     * @returns 道历日期完整字符串，包含更多详细信息
     */
    toFullString(): string {
        return '道歷' + this.getYearInChinese() + '年，天運' + this._lunar.getYearInGanZhi() + '年，' + this._lunar.getMonthInGanZhi() + '月，' + this._lunar.getDayInGanZhi() + '日。' + this.getMonthInChinese() + '月' + this.getDayInChinese() + '日，' + this._lunar.getTimeZhi() + '時。';
    }
}