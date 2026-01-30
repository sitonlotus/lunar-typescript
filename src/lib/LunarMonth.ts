import {LunarUtil} from './LunarUtil';
import {LunarYear} from './LunarYear';
import {Solar} from './Solar';
import {NineStar} from './NineStar';

/**
 * 农历月份类
 * 
 * 表示农历月份，包含月份的各种属性和计算方法，如干支、节气、方位等。
 */
export class LunarMonth {

    private readonly _year: number;
    private readonly _month: number;
    private readonly _dayCount: number;
    private readonly _firstJulianDay: number;
    private readonly _index: number;
    private readonly _zhiIndex: number;

    /**
     * 根据农历年月创建农历月实例
     * 
     * @param lunarYear 农历年
     * @param lunarMonth 农历月（正数表示平月，负数表示闰月）
     * @returns 农历月实例，若输入无效则返回null
     */
    static fromYm(lunarYear: number, lunarMonth: number): LunarMonth | null {
        return LunarYear.fromYear(lunarYear).getMonth(lunarMonth);
    }

    /**
     * 构造函数
     * 
     * @param lunarYear 农历年
     * @param lunarMonth 农历月（正数表示平月，负数表示闰月）
     * @param dayCount 月天数
     * @param firstJulianDay 月初儒略日
     * @param index 月索引
     * 
     * @internal 建议使用静态工厂方法创建实例
     */
    constructor(lunarYear: number, lunarMonth: number, dayCount: number, firstJulianDay: number, index: number) {
        this._year = lunarYear;
        this._month = lunarMonth;
        this._dayCount = dayCount;
        this._firstJulianDay = firstJulianDay;
        this._index = index;
        this._zhiIndex = (Math.abs(lunarMonth) - 1 + LunarUtil.BASE_MONTH_ZHI_INDEX) % 12;
    }

    /**
     * 获取农历年
     * @returns 农历年份
     */
    getYear(): number {
        return this._year;
    }

    /**
     * 获取农历月
     * @returns 农历月份（正数表示平月，负数表示闰月）
     */
    getMonth(): number {
        return this._month;
    }

    /**
     * 获取月索引
     * @returns 月索引
     */
    getIndex(): number {
        return this._index;
    }

    /**
     * 获取月干索引
     * @returns 月干索引（0-9）
     */
    getGanIndex(): number {
        const offset = (LunarYear.fromYear(this._year).getGanIndex() + 1) % 5 * 2;
        return (Math.abs(this._month) - 1 + offset) % 10;
    }

    /**
     * 获取月支索引
     * @returns 月支索引（0-11）
     */
    getZhiIndex(): number {
        return this._zhiIndex;
    }

    /**
     * 获取月干
     * @returns 月干（甲、乙、丙等）
     */
    getGan(): string {
        return LunarUtil.GAN[this.getGanIndex() + 1];
    }

    /**
     * 获取月支
     * @returns 月支（子、丑、寅等）
     */
    getZhi(): string {
        return LunarUtil.ZHI[this._zhiIndex + 1];
    }

    /**
     * 获取月干支
     * @returns 月干支（如甲子、乙丑等）
     */
    getGanZhi(): string {
        return this.getGan() + this.getZhi();
    }

    /**
     * 判断是否为闰月
     * @returns true表示闰月，false表示平月
     */
    isLeap(): boolean {
        return this._month < 0;
    }

    /**
     * 获取月天数
     * @returns 该月的天数
     */
    getDayCount(): number {
        return this._dayCount;
    }

    /**
     * 获取月初儒略日
     * @returns 月初的儒略日
     */
    getFirstJulianDay(): number {
        return this._firstJulianDay;
    }

    /**
     * 获取喜神方位
     * @returns 喜神方位（如艮、坤等）
     */
    getPositionXi(): string {
        return LunarUtil.POSITION_XI[this.getGanIndex() + 1];
    }

    /**
     * 获取喜神方位描述
     * @returns 喜神方位的文字描述
     */
    getPositionXiDesc(): string {
        return LunarUtil.POSITION_DESC[this.getPositionXi()];
    }

    /**
     * 获取阳贵神方位
     * @returns 阳贵神方位（如艮、坤等）
     */
    getPositionYangGui(): string {
        return LunarUtil.POSITION_YANG_GUI[this.getGanIndex() + 1];
    }

    /**
     * 获取阳贵神方位描述
     * @returns 阳贵神方位的文字描述
     */
    getPositionYangGuiDesc(): string {
        return LunarUtil.POSITION_DESC[this.getPositionYangGui()];
    }

    /**
     * 获取阴贵神方位
     * @returns 阴贵神方位（如艮、坤等）
     */
    getPositionYinGui(): string {
        return LunarUtil.POSITION_YIN_GUI[this.getGanIndex() + 1];
    }

    /**
     * 获取阴贵神方位描述
     * @returns 阴贵神方位的文字描述
     */
    getPositionYinGuiDesc(): string {
        return LunarUtil.POSITION_DESC[this.getPositionYinGui()];
    }

    /**
     * 获取福神方位
     * 
     * @param sect 流派（1或2），默认值为2
     * @returns 福神方位（如艮、坤等）
     */
    getPositionFu(sect: number = 2): string {
        return (1 == sect ? LunarUtil.POSITION_FU : LunarUtil.POSITION_FU_2)[this.getGanIndex() + 1];
    }

    /**
     * 获取福神方位描述
     * 
     * @param sect 流派（1或2），默认值为2
     * @returns 福神方位的文字描述
     */
    getPositionFuDesc(sect: number = 2): string {
        return LunarUtil.POSITION_DESC[this.getPositionFu(sect)];
    }

    /**
     * 获取财神方位
     * @returns 财神方位（如艮、坤等）
     */
    getPositionCai(): string {
        return LunarUtil.POSITION_CAI[this.getGanIndex() + 1];
    }

    /**
     * 获取财神方位描述
     * @returns 财神方位的文字描述
     */
    getPositionCaiDesc(): string {
        return LunarUtil.POSITION_DESC[this.getPositionCai()];
    }

    /**
     * 获取太岁方位
     * @returns 太岁方位（如艮、坤、巽等）
     */
    getPositionTaiSui(): string {
        const m = Math.abs(this._month);
        switch (m) {
            case 1:
            case 5:
            case 9:
                return '艮';
            case 3:
            case 7:
            case 11:
                return '坤';
            case 4:
            case 8:
            case 12:
                return '巽';
        }
        return LunarUtil.POSITION_GAN[Solar.fromJulianDay(this.getFirstJulianDay()).getLunar().getMonthGanIndex()];
    }

    /**
     * 获取太岁方位描述
     * @returns 太岁方位的文字描述
     */
    getPositionTaiSuiDesc(): string {
        return LunarUtil.POSITION_DESC[this.getPositionTaiSui()];
    }

    /**
     * 获取该月的九星
     * @returns 九星实例
     */
    getNineStar(): NineStar {
        const index = LunarYear.fromYear(this._year).getZhiIndex() % 3;
        const m = Math.abs(this._month);
        const monthZhiIndex = (13 + m) % 12;
        let n = 27 - (index * 3);
        if (monthZhiIndex < LunarUtil.BASE_MONTH_ZHI_INDEX) {
            n -= 3;
        }
        const offset = (n - monthZhiIndex) % 9;
        return NineStar.fromIndex(offset);
    }

    /**
     * 获取字符串表示
     * @returns 农历月的字符串表示，格式为"年[闰]月(天数)天"
     */
    toString(): string {
        return `${this.getYear()}年${this.isLeap() ? '闰' : ''}${LunarUtil.MONTH[Math.abs(this.getMonth())]}月(${this.getDayCount()})天`;
    }

    /**
     * 获取下n个月的农历月
     * 
     * @param n 月数差（正数表示未来，负数表示过去）
     * @returns 下n个月的农历月实例，若无效则返回null
     */
    next(n: number): LunarMonth | null {
        if (0 == n) {
            return LunarMonth.fromYm(this._year, this._month);
        } else {
            let rest = Math.abs(n);
            let ny = this._year;
            let iy = ny;
            let im = this._month;
            let index = 0;
            let months = LunarYear.fromYear(ny).getMonths();
            if (n > 0) {
                while (true) {
                    const size = months.length;
                    for (let i = 0; i < size; i++) {
                        const m = months[i];
                        if (m.getYear() === iy && m.getMonth() === im) {
                            index = i;
                            break;
                        }
                    }
                    const more = size - index - 1;
                    if (rest < more) {
                        break;
                    }
                    rest -= more;
                    const lastMonth = months[size - 1];
                    iy = lastMonth.getYear();
                    im = lastMonth.getMonth();
                    ny++;
                    months = LunarYear.fromYear(ny).getMonths();
                }
                return months[index + rest];
            } else {
                while (true) {
                    const size = months.length;
                    for (let i = 0; i < size; i++) {
                        const m = months[i];
                        if (m.getYear() === iy && m.getMonth() === im) {
                            index = i;
                            break;
                        }
                    }
                    if (rest <= index) {
                        break;
                    }
                    rest -= index;
                    const firstMonth = months[0];
                    iy = firstMonth.getYear();
                    im = firstMonth.getMonth();
                    ny--;
                    months = LunarYear.fromYear(ny).getMonths();
                }
                return months[index - rest];
            }
        }
    }
}