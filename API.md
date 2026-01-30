# lunar-typescript API 使用说明

本文档说明本库中阳历、阴历、道历、佛历及相关工具类的使用方法。

---

## 一、阳历 Solar

阳历（公历）日期类，支持创建、转换、比较、推移等。

### 实例化

| 方法 | 说明 | 示例 |
|------|------|------|
| `Solar.fromYmd(year, month, day)` | 从年月日创建（时分秒为 0） | `Solar.fromYmd(2023, 12, 25)` |
| `Solar.fromYmdHms(year, month, day, hour, minute, second)` | 从年月日时分秒创建 | `Solar.fromYmdHms(2023, 12, 25, 14, 30, 0)` |
| `Solar.fromDate(date)` | 从 JavaScript `Date` 创建 | `Solar.fromDate(new Date())` |
| `Solar.fromJulianDay(julianDay)` | 从儒略日创建 | `Solar.fromJulianDay(2451545)` |
| `Solar.fromBaZi(yearGanZhi, monthGanZhi, dayGanZhi, timeGanZhi, sect?, baseYear?)` | 从八字反推阳历日期，返回匹配的阳历数组 | `Solar.fromBaZi("甲子","丙寅","戊辰","庚午")` |

参数约定：`year` 支持公元前（负数）；`month` 为 1–12；`day` 为 1–31；`hour` 0–23；`minute`、`second` 为 0–59。1582 年 10 月 5 日至 14 日不存在，会抛错。

### 转字符串与基本信息

| 方法 | 说明 | 返回值示例 |
|------|------|------------|
| `toString()` / `toYmd()` | 日期字符串 | `"2023-12-25"` |
| `toYmdHms()` | 日期时间字符串 | `"2023-12-25 14:30:00"` |
| `toFullString()` | 含星期、节日、星座等 | 长字符串 |
| `getYear()` / `getMonth()` / `getDay()` | 年、月、日 | 数字 |
| `getHour()` / `getMinute()` / `getSecond()` | 时、分、秒 | 数字 |

### 儒略日与星期

| 方法 | 说明 |
|------|------|
| `getJulianDay()` | 儒略日（含小数表示时刻） |
| `getWeek()` | 星期数字 0–6（0 为周日） |
| `getWeekInChinese()` | 星期中文（如「星期一」） |
| `getWeek(start)` | 以 `start` 为起点的星期（0–6） |
| `getSolarWeek(start)` | 得到该日所在的阳历周对象 `SolarWeek` |

### 闰年、节日、星座

| 方法 | 说明 |
|------|------|
| `isLeapYear()` | 是否闰年 |
| `getFestivals()` | 主要节日列表（如劳动节、国庆节） |
| `getOtherFestivals()` | 其他/纪念日列表 |
| `getXingZuo()` | 星座名称 |

### 日期推移与比较

| 方法 | 说明 |
|------|------|
| `nextYear(n)` | 加/减 n 年 |
| `nextMonth(n)` | 加/减 n 月 |
| `nextDay(n)` | 加/减 n 天 |
| `next(days)` | 加/减天数（同 `nextDay`） |
| `subtract(solar)` | 与另一阳历日期的天数差（本日 − 参数日） |
| `compareTo(solar)` | 比较先后：小于 0、等于 0、大于 0 |

### 薪资比例与阴历

| 方法 | 说明 |
|------|------|
| `getSalaryRate()` | 薪资比例：1 工作日，2 双倍（周末/调休），3 三倍（法定节假日） |
| `getLunar()` | 转为阴历对象 `Lunar` |

---

## 二、阳历周 SolarWeek

表示以某星期几为起点的「一周」。

### 实例化与基本信息

| 方法 | 说明 |
|------|------|
| `SolarWeek.fromYmd(year, month, day, start)` | 由某日及周起始日（0–6）得到该日所在周 |
| `getYear()` / `getMonth()` / `getDay()` | 该周代表的年、月、日（通常取该周某一天） |
| `getStart()` | 周起始日 0–6 |
| `getIndex()` | 本月第几周 |
| `getIndexInYear()` | 本年第几周 |
| `getFirstDay()` | 本周第一天（阳历） |
| `getDays()` | 本周每一天的 `Solar[]` |
| `next(n)` | 前/后 n 周 |

---

## 三、阳历月 SolarMonth

### 实例化与常用方法

| 方法 | 说明 |
|------|------|
| `SolarMonth.fromYm(year, month)` | 从年月创建 |
| `getYear()` / `getMonth()` | 年、月 |
| `getDays()` | 本月所有日的 `Solar[]` |
| `getWeeks(start)` | 本月按周起始日 `start` 分成的 `SolarWeek[]` |
| `next(n)` | 前/后 n 月 |

---

## 四、阳历季度 SolarSeason

| 方法 | 说明 |
|------|------|
| `SolarSeason.fromYm(year, month)` | 从年月得到所在季度 |
| `getYear()` / `getMonth()` | 年、月 |
| `getIndex()` | 第几季度（1–4） |
| `getMonths()` | 本季度三个月的 `SolarMonth[]` |
| `next(n)` | 前/后 n 个季度 |

---

## 五、阳历半年 SolarHalfYear

| 方法 | 说明 |
|------|------|
| `SolarHalfYear.fromYm(year, month)` | 从年月得到所在半年 |
| `getIndex()` | 上半年 1 或下半年 2 |
| `getMonths()` | 本半年六个月的 `SolarMonth[]` |
| `next(n)` | 前/后 n 个半年 |

---

## 六、阳历年 SolarYear

| 方法 | 说明 |
|------|------|
| `SolarYear.fromYear(year)` | 从年份创建 |
| `getYear()` | 年 |
| `getMonths()` | 本年 12 个月的 `SolarMonth[]` |
| `next(n)` | 前/后 n 年 |

---

## 七、阳历工具 SolarUtil

静态工具，不依赖具体日期实例。

| 方法 | 说明 |
|------|------|
| `SolarUtil.isLeapYear(year)` | 是否闰年 |
| `SolarUtil.getDaysOfYear(year)` | 该年总天数（1582 年为 355） |
| `SolarUtil.getDaysOfMonth(year, month)` | 该月天数 |
| `SolarUtil.getWeeksOfMonth(year, month, start)` | 该月周数（`start` 为周起始日 0–6） |
| `SolarUtil.getDaysInYear(year, month, day)` | 该日在当年是第几天 |
| `SolarUtil.getDaysBetween(ay,am,ad, by,bm,bd)` | 两日之间的天数差 |

---

## 八、阴历 Lunar

农历日期类，支持干支、节气、节日、宜忌等。

### 实例化

| 方法 | 说明 |
|------|------|
| `Lunar.fromYmd(lunarYear, lunarMonth, lunarDay)` | 农历年月日（时分秒 0） |
| `Lunar.fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second)` | 带时分秒 |
| `Lunar.fromSolar(solar)` | 由阳历转阴历 |
| `Lunar.fromDate(date)` | 由 `Date` 转阴历 |

注意：农历月正数表示平月，负数表示闰月，如 `-2` 表示闰二月。

### 年月日及时辰

| 方法 | 说明 |
|------|------|
| `getYear()` / `getMonth()` / `getDay()` | 农历年、月、日 |
| `getHour()` / `getMinute()` / `getSecond()` | 时、分、秒 |
| `getTimeInChinese()` | 时辰中文（如「子时」） |
| `getWeek()` | 星期 0–6 |
| `getWeekInChinese()` | 星期中文 |

### 干支与生肖

| 方法 | 说明 |
|------|------|
| `getYearInGanZhi()` | 年干支（以正月初一为界） |
| `getYearInGanZhiByLiChun()` | 年干支（以立春为界） |
| `getYearInGanZhiExact()` | 年干支（以立春交接时刻为界） |
| `getMonthInGanZhi()` / `getMonthInGanZhiExact()` | 月干支 |
| `getDayInGanZhi()` / `getDayInGanZhiExact()` / `getDayInGanZhiExact2()` | 日干支（含晚子时流派） |
| `getTimeInGanZhi()` | 时干支 |
| `getYearShengXiao()` | 年生肖（以正月初一为界） |

### 节气、节日、物候

| 方法 | 说明 |
|------|------|
| `getJieQi()` | 当前节气名称（若当日为节气日） |
| `getJieQiList()` | 当年节气名称列表 |
| `getJieQiTable()` | 节气名到阳历时刻的映射 |
| `getFestivals()` | 农历节日列表 |
| `getWuHou()` | 物候 |
| `getShuJiu()` | 数九信息（`ShuJiu` 或 null） |
| `getFu()` | 三伏信息（`Fu` 或 null） |

### 传统历法与文化

| 方法 | 说明 |
|------|------|
| `getLiuYao()` | 六曜 |
| `getXiu()` | 二十八星宿 |
| `getZheng()` | 七政（七曜） |
| `getGong()` | 四宫 |
| `getShou()` | 四神兽 |
| `getPengZuBaJi()` | 彭祖百忌 |
| `getPosition()` | 八卦方位 |
| `getDayPositionXi()` | 喜神方位等 |
| `getDayPositionYangGui()` / `getDayPositionYinGui()` | 阳贵神/阴贵神方位 |
| `getDayPositionFu()` / `getDayPositionCai()` | 福神/财神方位 |
| `getTimePositionXi()` 等 | 时辰方位 |
| `getTaishen()` | 胎神方位 |
| `getDayTaisui()` / `getTimeTaisui()` | 太岁方位 |
| `getChong()` | 冲 |
| `getSha()` | 煞 |
| `getNaYin()` | 纳音 |
| `getEightChar()` | 八字对象 `EightChar` |
| `getLu()` | 禄 |

### 择日与神煞

| 方法 | 说明 |
|------|------|
| `getDayYi()` / `getDayJi()` | 日宜/日忌 |
| `getTimeYi()` / `getTimeJi()` | 时宜/时忌 |
| `getDayJiShen()` / `getDayXiongSha()` | 日吉神/凶煞 |
| `getZhiXing()` | 建除十二值星 |
| `getTianShen()` | 十二天神 |
| `getYueXiang()` | 月相 |
| `getNineStar()` | 九星（`NineStar`） |

### 日期推移与转换

| 方法 | 说明 |
|------|------|
| `next(n)` | 加/减 n 天 |
| `nextYear(n)` / `nextMonth(n)` / `nextDay(n)` | 加/减年、月、日 |
| `getSolar()` | 转阳历 `Solar` |
| `getFoto()` | 转佛历 `Foto` |
| `getTao()` | 转道历 `Tao` |

---

## 九、阴历月 LunarMonth

| 方法 | 说明 |
|------|------|
| `LunarMonth.fromYm(lunarYear, lunarMonth)` | 从农历年月取月（闰月用负数） |
| `getYear()` / `getMonth()` | 年、月 |
| `getDayCount()` | 本月天数 |
| `getFirstJulianDay()` | 初一儒略日 |
| `isLeap()` | 是否闰月 |
| `next(n)` | 前/后 n 月 |
| `getNineStar()` | 九星等 |

---

## 十、阴历年 LunarYear

| 方法 | 说明 |
|------|------|
| `LunarYear.fromYear(lunarYear)` | 从农历年创建 |
| `getYear()` / `getGanZhi()` | 年、干支 |
| `getMonths()` | 本年所有农历月（含跨年） |
| `getMonthsInYear()` | 仅本年内的月 |
| `getMonth(lunarMonth)` | 取指定月（闰月用负数） |
| `getLeapMonth()` | 闰几月（0 表示无闰月） |
| `getDayCount()` | 本年天数 |
| `getJieQiJulianDays()` | 节气儒略日数组 |
| `getTouLiang()` 等 | 灶马头相关 |
| `getYuan()` / `getYun()` | 三元九运 |
| `getNineStar()` | 九星 |
| `next(n)` | 前/后 n 年 |

---

## 十一、阴历工具 LunarUtil

主要为静态方法，供内部或高级用法使用。

| 方法 | 说明 |
|------|------|
| `LunarUtil.getDaysOfMonth(lunarYear, lunarMonth)` | 指定农历月天数 |
| `LunarUtil.nextMonth(lunarYear, lunarMonth)` | 下个月的年月（含闰月） |
| `LunarUtil.leapMonth(lunarYear)` | 该年闰几月（0 为无） |
| `LunarUtil.getTimeZhiIndex(hm)` | 时辰地支序号（hm 如 "14:30"） |
| `LunarUtil.convertTime(hm)` | 时辰中文名 |

其余如 `getDayYi`、`getDayJi`、`getTimeYi`、`getTimeJi`、`getXun`、`getXunKong` 等为干支、宜忌、旬空等计算用。

---

## 十二、佛历 Foto

佛历以释迦牟尼涅槃年为元年，与公历差约 543 年。

### 实例化

| 方法 | 说明 |
|------|------|
| `Foto.fromLunar(lunar)` | 由阴历创建 |
| `Foto.fromYmd(lunarYear, lunarMonth, lunarDay)` | 佛历年月日（注意：年为佛历纪年） |
| `Foto.fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second)` | 带时分秒 |

### 常用方法

| 方法 | 说明 |
|------|------|
| `getLunar()` | 对应阴历 |
| `getYear()` / `getMonth()` / `getDay()` | 年、月、日 |
| `getYearInChinese()` / `getMonthInChinese()` / `getDayInChinese()` | 中文数字表示 |
| `getFestivals()` | 因果犯忌等节日（`FotoFestival[]`） |
| `getOtherFestivals()` | 其他纪念日 |
| `isMonthZhai()` | 是否月斋 |
| `isDayZhaiTen()` | 是否十斋日 |
| `isDayZhaiSix()` | 是否六斋日 |
| `isDayZhaiShuoWang()` | 是否朔望斋 |
| `isDayZhaiGuanYin()` | 是否观音斋 |
| `isDayYangGong()` | 是否杨公忌 |
| `getXiu()` / `getXiuLuck()` / `getXiuSong()` | 二十七星宿及吉凶等 |
| `getZheng()` / `getGong()` / `getShou()` / `getAnimal()` | 七曜、宫、神兽、生肖 |
| `toString()` / `toFullString()` | 字符串输出 |

---

## 十三、道历 Tao

道历以黄帝纪年等为基准，用于道教节日与斋日。

### 实例化

| 方法 | 说明 |
|------|------|
| `Tao.fromLunar(lunar)` | 由阴历创建 |
| `Tao.fromYmd(lunarYear, lunarMonth, lunarDay)` | 年月日 |
| `Tao.fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second)` | 带时分秒 |

### 常用方法

| 方法 | 说明 |
|------|------|
| `getLunar()` | 对应阴历 |
| `getYear()` / `getMonth()` / `getDay()` | 年、月、日 |
| `getYearInChinese()` 等 | 中文表示 |
| `getFestivals()` | 道历节日（`TaoFestival[]`） |
| `isDaySanHui()` | 是否三会日 |
| `isDaySanYuan()` | 是否三元日 |
| `isDayBaJie()` | 是否八节日 |
| `isDayWuLa()` | 是否五腊日 |
| `isDayBaHui()` | 是否八会日 |
| `isDayWu()` | 是否戊日（含明戊、暗戊） |
| `isDayTianShe()` | 是否天赦日 |
| `toString()` / `toFullString()` | 字符串输出 |

---

## 十四、法定假日 HolidayUtil

查询中国法定节假日与调休。数据可被 `fix` 修正或补充。

| 方法 | 说明 |
|------|------|
| `HolidayUtil.getHoliday(yearOrYmd, month?, day?)` | 指定日期的节假日信息。参数可为 `(year, month, day)` 或 `'yyyyMMdd'` / `'yyyy-MM-dd'`，无则为 `null` |
| `HolidayUtil.getHolidays(yearOrYmd, month?)` | 指定年或年月的节假日列表。`yearOrYmd` 为年或 `yyyyMM` |
| `HolidayUtil.getHolidaysByTarget(yearOrYmd, month?)` | 按「调休目标日」查询，即该日因哪几个节假日被调休 |
| `HolidayUtil.fix(a, b?)` | 修正数据：仅改数据时 `fix(data)`；同时改名称与数据时 `fix(names, data)` |

返回的 `Holiday` 可调用 `getName()`、`isWork()`（是否上班）、`getTarget()`（调休目标日）等。

---

## 十五、八字与运程

| 类 | 说明 |
|------|------|
| `EightChar` | 八字，可从 `Lunar.getEightChar()` 获取，含十神、大运等 |
| `Yun` | 运，起运时间与方向等 |
| `DaYun` | 大运，十年一运 |
| `XiaoYun` | 小运，一年一运 |
| `LiuNian` | 流年 |
| `LiuYue` | 流月 |

---

## 十六、其它类

| 类 | 说明 |
|------|------|
| `JieQi` | 节气，含名称与阳历时刻 |
| `ShuJiu` | 数九 |
| `Fu` | 三伏 |
| `NineStar` | 九星 |
| `LunarTime` | 农历时辰 |
| `Holiday` | 法定节假日条目 |
| `I18n` | 多语言，`I18n.init()` 初始化，可切换语言 |

---

以上为库内主要 API 的用法说明，具体参数与返回值以源码为准。名称中带 `Exact` 与不带 `Exact` 的成对方法（如日干支、月干支）分别表示「按交接时刻」与「按日」计算，按需选用。
