# 领域模型与计算规则

状态：Draft

版本：0.17

最后更新：2026-08-22

本文是数量、成本、估值、精度和行情状态的唯一真源。它只记录已经确认的产品方向、由该方向直接推出的计算约束，以及明确标记的待确认事项。

## 1. 用户确认与边界

- `[用户确认 2026-07-30；2026-08-20 修订]` 股票首页不展开券商拆分，产品不建立自由券商账号、标签或筛选；v4 但以固定 `IBKR | MOOMOO` 作为股票来源维护子持仓，用户可见现金仍是 ADR-048 的统一组合现金。
- `[用户确认 2026-07-30]` 用户统一录入持仓；同一标的的数据统一计算并展示为一个持仓。
- `[用户确认 2026-07-30 至 2026-08-08]` 首页重点是直观显示组合总仓位和每只标的的合并持仓；当前采用紧凑总仓位标题、2 × 2 核心指标和五列连续资产表，具体展示以 `03-UX-SPEC.md` 为准。
- `[约束推导]` 产品只做查看、记录和计算，不连接券商、不自动读取券商账号、不向券商下单；用户手工记录的 v4 BUY/SELL 只维护本产品 current。
- `[用户确认 2026-07-30]` MVP 股票行情使用 Alpaca `delayed_sip`。
- `[用户确认 2026-07-30]` 估值跟随盘前、常规盘、盘后和 24/5 隔夜市场；隔夜使用 Alpaca `overnight`，所有行情均按约 15 分钟延迟表达，休市显示最后有效价。
- `[用户确认 2026-07-30；2026-08-12、2026-08-20 修订]` 未启用 v4 时，current 按标的维护旧快照批次；确认双券商校准后，v4 以 IBKR/moomoo 子持仓和手工 BUY/SELL 驱动 current 投影。长期 NAV 与历史导入仍停用。
- `[用户确认 2026-07-30]` 同一标的可以包含多组数量与成本输入；成本录入支持平均成本和剩余总成本两种模式。
- `[用户确认 2026-07-30]` 从普通录入入口再次录入已有标的时，本次输入叠加到其当前活动批次，并直接重算合并数量、总成本和均价。
- `[用户确认 2026-07-30 至 2026-08-08]` 首页点按或长按持仓可修改、加仓、复制单只资料或删除，横滑后不得误触：修改回填当前合并数量与均价并替换当前活动批次；加仓叠加本次数量与买入均价；复制保持只读；删除经第二次确认后只移除所选标的。首页不提供历史恢复入口。
- `[用户确认 2026-07-30]` P0 标的范围是 Alpaca 可解析的 USD 美国上市股票与 ETF；受支持的美国上市存托凭证（ADR）可以使用。
- `[用户确认 2026-07-30；2026-08-20 修订]` 旧 Vercel 来源继续保留 IndexedDB；Sites Production 使用 ChatGPT 登录与 D1 账号 current，同一账号跨设备读取。用户 ID 只用于所有者隔离，不进入持仓聚合键。
- `[约束推导]` UI 必须明确标注约 15 分钟延迟，不能把它描述为实时行情。
- `[约束推导]` 首页统一持仓只以 `instrument` 聚合；v4 子账本内部使用 `broker + instrument` 维护可卖数量与剩余成本，`broker` 不成为首页聚合键或用户可见现金池。
- `[约束推导]` 同一标的的数量与成本分别求和，再用总成本除以总数量；不得直接平均多个平均成本。
- `[约束推导]` 快照输入不是交易记录；普通录入的叠加表示增加一组当前持仓分项，不表示新增买入，提交中的重复操作不得把同一组输入计算两次。
- `[约束推导]` 某标的新版本只有在完整持久化后才能成为活动真值，失败时继续使用该标的上一活动版本。
- `[用户确认 2026-08-02]` 首页提供 USD / 人民币显示模式切换。USD 是持仓和成本真值；人民币只按当前有效 `USD/CNY` 汇率派生估算，不建立第二套成本或汇兑盈亏。
- `[用户确认 2026-08-02；2026-08-20、2026-08-22 修订]` 旧 v3 current 可包含一条 IBKR USD 现金；启用 v4 后，底层继续保留 IBKR/moomoo 已结算和待结算分量以兼容 current、结算和 IBKR 利息口径，但用户可见现金只是全部分量之和。这仍不表示产品连接了 IBKR 或 moomoo 账号。
- `[用户确认 2026-08-03；同日修订]` 首页总资产指标矩阵显示“今日盈亏”：主值是整个股票组合的今日盈亏估算金额，副值是组合今日涨跌幅；不设置独立入口或持仓表模式切换。持仓表第五列主值显示每只股票的 `estimatedDailyChangeRate`，下方小字显示同一计算结果的 `estimatedDailyPriceEffect` 格式化金额。指标使用当前股票数量相对最近常规收盘价估算，盘前、常规盘、盘后和夜盘都随行情刷新；IBKR USD 现金本金、NAV 和利息估算完全排除。当日持仓数量变化时，它不等同于券商基于真实账户流水的当日盈亏。
- `[用户确认 2026-08-09；2026-08-12 修订]` 首页只显示由 Alpaca Historical Bars SIP 15 分钟收盘点与当前数量派生的“今日走势”；缺前收、缺/失败 series、点数不足或纯现金时不画假线。长期范围、周期选择器和历史入口退出运行路径。
- `[用户确认 2026-08-09；2026-08-20 修订]` JSON v2/v3 只允许恢复到账号全部 current 为空的组合。恢复前严格校验并预览，不合并、不覆盖；空目标复查与 current 写入位于同一个 D1 state compare-and-swap，失败零写入。源 revision 只校验，恢复记录固定 `revision=1`、`nextRevision=2`、`previous=null`；草稿、行情/汇率缓存、legacy 和同步内部状态不恢复。
- `[用户确认 2026-08-09]` 组合结构分母为已定价股票市值加现金本金，缺价时明确部分口径。组合今日净额需要全部股票可计算；今日绝对贡献按单股今日变化绝对值占可计算股票绝对变化总量计算，缺失不补 `0`。
- `[用户确认 2026-08-22]` BOXX、SGOV 与全部其他受支持股票使用同一 BUY/SELL 现金公式；用户可见现金只按一个组合现金池汇总。券商只决定股票来源、超卖校验与该来源剩余成本，不成为用户需要管理的现金池。

本文定义 v4 current 买卖、移动平均剩余成本和双券商账面现金；不定义税务已实现盈亏、FIFO/指定批次、股息归因、预扣税、空头、期权或融资利息。

## 2. 核心术语

### 2.1 标的（Instrument）

用规范化标识识别证券。MVP 聚合键暂定为：

```text
listingMarket + normalizedSymbol + currency
```

不能只按显示名称聚合。不同市场的同名代码不能静默合并。

P0 只接受：

- Alpaca 能正常解析；
- `currency = USD`；
- 美国交易所上市的股票或 ETF。

OTC、期权、加密货币和非美国市场不进入 P0。美国存托凭证（ADR）若被 Alpaca 作为受支持的美国上市股票正常解析，可以使用。

### 2.2 统一持仓（Unified Position）

当前组合内，同一标的下全部有效录入合并后的结果。统一持仓至少包含：

```text
instrument
totalQuantity
totalOpenCost
averageCost
```

它没有券商属性。

### 2.3 录入项（Position Input）

当前持仓快照中的一组数量与成本信息。每个录入项属于一个标的，并选择一种成本模式：

```text
AVERAGE_COST
TOTAL_OPEN_COST
```

同一标的可以有多个录入项。录入项只描述保存时的当前状态，不表示 BUY、SELL 或历史交易。

### 2.4 持仓批次（Position Batch）

描述一个标的在保存时的全部当前录入项。同一批次中的每个录入项必须属于相同 `instrument`。

普通录入或“加仓”已有标的时，下一活动批次由“当前批次全部录入项 + 本次新增录入项”组成。“修改持仓”时，下一活动批次只包含由当前合并数量与合并均价回填、经用户修改后提交的一项输入。两种保存操作最终都形成一份完整批次。

### 2.5 当前持仓快照（Current Position Snapshot）

某个持仓批次的版本化已保存记录。每个标的任一时刻最多只有一个活动版本；组合真值由所有标的的活动快照共同组成。

保存该标的完整新批次后才能切换活动版本。替换失败时，该标的原活动版本与其他标的均保持不变。存储层可以保留上一成功版本作为故障防护，但首页不提供历史恢复入口。

### 2.6 估值价（Valuation Price）

用于估值的最近一笔有效市场价格。它必须带有 provider、feed、价格类型、市场事件时间和抓取时间。延迟行情不得描述为实时价或可成交价。

### 2.7 上一有效价（Last Valid Price）

最近一次通过基础校验和异常检查的估值价。新行情失败时可以继续用于降级估值，但必须在数据层保留原始时间和非健康状态。首页的可见表达服从 `03-UX-SPEC.md`：不逐行展示老化、上一有效价或时间，只明确缺价，并可对请求故障使用紧凑的页面级提示。

### 2.8 USD/CNY 汇率

表示 1 USD 可折算的 CNY 数量。当前记录固定包含：

```text
baseCurrency = USD
quoteCurrency = CNY
rate
provider = alpaca | ecb
rateType = MIDPOINT | REFERENCE
sourceEventAt
fetchedAt
```

合法组合只有 `alpaca + MIDPOINT` 与 `ecb + REFERENCE`。ECB 记录额外包含 `referenceDate`；其 `sourceEventAt` 使用官方响应的 `Last-Modified`，页面把 `referenceDate` 显示为参考日，不把日参考价描述为实时价格。`rate` 必须大于零，`sourceEventAt` 不得晚于 `fetchedAt`。汇率只参与显示派生，不属于持仓或股票行情真值。

### 2.9 旧 v3 IBKR USD 现金记录

本节定义校准前旧 current 的单条 IBKR 现金兼容 contract；启用 v4 后的底层分量与统一组合现金以第 2.14 节、第 5A 节和 ADR-048 为准：

```text
provider = IBKR
currency = USD
balance
netAssetValue
navSource = USER_ENTERED | CASH_BALANCE_FALLBACK
pricingPlan = IBKR_PRO | IBKR_LITE
```

`balance` 和 `netAssetValue` 必须是大于零、最多 8 位小数的十进制字符串。`netAssetValue` 表示 IBKR 用于利率分层的账户 NAV，不得从本 App 的统一股票组合自动推导。用户未填 NAV 时，记录必须同时满足 `navSource=CASH_BALANCE_FALLBACK` 与 `netAssetValue=balance`；两者不相等时记录无效。

### 2.10 今日盈亏估算（Estimated Daily Price Effect）

表示“以当前股票数量持有整段价格变化时，相对前一常规收盘价产生的金额变化估算”。它只依赖当前快照和行情，不是 BUY/SELL 账本、已实现盈亏或经现金流调整的真实当日业绩。

现金本金、NAV 和利息估算均不进入该指标。若任一股票缺少有效估值价或可确认的最近常规收盘价，组合今日盈亏保持未知，不以 `0` 补齐。

### 2.11 current-only JSON v2 恢复文档

本产品 JSON v2 是 current 股票快照集合与可选 current 现金快照的用户副本；JSON v3 是双券商 current book 与维护事件副本。它们不代表完整 D1、IndexedDB、历史收益或设备缓存。恢复解析必须把整个文件视为不可分割输入；只有在格式、版本、字段、十进制、时间、revision、标的和规范化唯一性全部有效时才形成恢复候选。

### 2.12 组合结构与今日绝对贡献

组合结构描述已计价资产在股票与现金之间的分布；缺价股票不以成本代替市值。今日绝对贡献描述可计算股票的今日变化金额绝对值占全部可计算绝对变化的比例；正负方向仍由原始今日变化金额表达。结构占比与今日贡献占比不是同一分母，不得混用。

### 2.13 当日持仓估算趋势（Portfolio Trend）

以当前持仓快照的未舍入数量、最近常规收盘价与真实当日 SIP 条形收盘价派生的只读时间序列。它回答“如果当前股数覆盖这些价格变化，价格影响和估算资产如何变化”，不是交易流水、已实现盈亏或真实账户时间加权收益。

趋势只有当日范围，不持久化。它不增加持仓、现金、行情或汇率的新真值。

### 2.14 双券商 current book

用户确认校准后的新真值，固定包含：

```text
revision
savedAt
positions[] = broker + instrument + quantity + totalOpenCost
cashAccounts[] = broker + settledBalance + pendingBalance
events[] = RECONCILIATION | BUY | SELL
```

`broker` 只允许 `IBKR | MOOMOO`。它用于验证交易来源、卖出可用数量、剩余成本和现金归属；首页仍按 `instrument` 聚合。v4 book 与旧 v3 current 分离，只有用户确认校准后才进入首页读取路径。

`settledBalance` 与 `pendingBalance` 都是可为负的 USD 十进制账面值。负值表示融资负债或待付款，不得归零。它们按券商保留只为兼容既有 current、记录结算来源和维持 IBKR 利息口径；用户可见现金真值固定为全部分量之和，不形成两个可分别花用的现金池。IBKR 利息只读取正的 IBKR `settledBalance`。

## 3. 数值与时间规范

### 3.1 十进制真值

- `[约束推导]` 数量、价格、成本、费用、汇率和中间金额使用十进制定点或任意精度十进制类型。
- `[约束推导]` 禁止使用 JavaScript `number` 作为财务计算真值。
- `[约束推导]` API 中十进制值使用字符串传输，例如 `"0.12500000"`。
- `[建议]` 若以后采用 SQL，十进制列精度不得低于 `numeric(38, 18)`；具体数据库尚未确认。

### 3.2 精度与舍入

- `[实现事实]` 当前解析器接受最多 8 位输入小数；是否调整属于后续兼容性决定。
- `[实现事实]` 当前十进制计算精度配置为 80 位，并且不在中途按展示位数舍入。
- `[建议]` USD 和百分比先按 2 位小数展示；UI 原型可在不改变真值的前提下调整。
- 展示舍入值不得写回录入真值，也不得参与后续计算。

### 3.3 时间

- `[建议]` 若持久化时间，使用带时区的 RFC 3339 并规范化为 UTC。
- `[约束推导]` 美股市场日按 `America/New_York` 解释。
- `[建议 OQ-009]` UI 跟随设备本地时间，行情详情补充美东时间。
- `[约束推导]` 行情新鲜度不能只依赖设备时钟；服务端记录可信的 `fetchedAt`。

## 4. 统一持仓计算

### 4.1 分组

所有持仓输入按下列键分组：

```text
instrumentKey
```

`brokerAccountId`、券商名称和券商标签都不属于目标领域模型或计算键。

### 4.2 单项成本

若某个录入项提供数量和剩余总成本：

```text
inputQuantity = enteredQuantity
inputOpenCost = enteredOpenCost
```

若某个录入项提供数量和平均成本：

```text
inputQuantity = enteredQuantity
inputOpenCost = enteredQuantity × enteredAverageCost
```

系统必须保留原始十进制输入和输入模式。同一录入项只使用一种成本模式，不得同时保存相互矛盾的平均成本与总成本真值。

### 4.3 同一标的合并

对当前组合内同一 `instrument` 的全部有效录入：

```text
totalQuantity =
  Σ inputQuantity

totalOpenCost =
  Σ inputOpenCost

averageCost =
  totalOpenCost / totalQuantity
  （仅当 totalQuantity > 0）
```

必须先分别求数量总和与成本总和，再计算平均成本。

错误做法：

```text
(averageCostA + averageCostB) / 2
```

正确做法：

```text
(openCostA + openCostB)
/
(quantityA + quantityB)
```

### 4.4 不变量

1. 有效持仓数量不得为负数。
2. 剩余总成本不得为负数。
3. 数量为零时，总成本必须为零，平均成本为空。
4. 行情不得修改数量、成本或用户录入。
5. 派生持仓不得成为无法追溯的独立真值。
6. 同一录入不得因刷新、重试或同步重复计入。
7. 删除、覆盖或批量修正前必须有恢复路径或用户明确确认。
8. 快照保存不得产生部分生效状态。
9. 每个标的只有活动快照参与组合计算；存储层若执行故障恢复，必须从目标版本原始录入项重算，其他标的不受影响。

## 5. 按账号隔离、按标的维护的当前持仓快照

Sites 的组合真源是当前登录用户 D1 state 中按 `instrument` 区分的活动快照，或已启用的 v4 book 投影。`oai-authenticated-user-id` 只选择哪一个账号 state，不参与下列数学：

1. 每个快照只包含一个标的的全部当前录入项。
2. 同一标的允许多组数量与成本输入。
3. 普通录入已有标的时，系统把本次新增录入项与当前批次原始录入项合并，形成下一完整批次。
4. 从首页进入“修改持仓”时，系统先聚合当前批次，再以合并数量和合并均价回填一项输入；用户保存的这一项形成下一完整批次。
5. 两种写入都必须在新版本完整持久化后才能切换活动快照。
6. 写入成功后存储层可以保留该标的上一成功版本，但用户界面不提供历史恢复操作。
7. 修改、叠加或删除一个标的不得修改其他标的的活动版本。
8. 删除必须经用户第二次确认，并原子移除该标的当前批次、上一版本和该标的草稿。

### 5.1 普通录入叠加

若当前批次为：

```text
currentInputs = [A, B]
```

本次普通录入为：

```text
newInputs = [C]
```

则下一批次为：

```text
nextInputs = [A, B, C]
```

系统随后对 `nextInputs` 执行第 4 节聚合。该操作描述当前持仓的新增分项，不产生 BUY、成交时间或交易流水。

### 5.2 聚合数量与均价替换

从首页长按某标的并选择“修改持仓”时，页面先按第 4 节得到当前 `totalQuantity` 与 `averageCost`，再回填为一项 `AVERAGE_COST` 输入。用户保存的这一项直接成为 `nextInputs`，不与旧集合再次相加。若旧批次包含多组输入，保存后这些分组不再属于当前活动批次。

“加仓”使用第 5.1 节的叠加公式，只把本次数量与买入均价作为新增当前持仓分项；它不产生交易时间或历史流水。

### 5.3 删除持仓

删除不通过零数量表达。用户第二次确认后，repository 删除该标的账号 current 与 previous，并尽力清理本机草稿；随后该标的不参与组合计算。删除一个标的不得修改其他标的，revision 不匹配时必须拒绝删除。

以下项目不属于旧快照批次路径，而由第 5A 节的 v4 current book 单独定义：

- BUY、SELL 与股票来源；
- 买入费用、卖出价与卖出费用；
- 部分卖出的剩余成本公式；
- current 校准与维护事件。

已实现盈亏、税务成本、FIFO/指定批次、券商历史导入、完整审计账本和长期收益仍不属于 P0；但 ADR-044/048 已确认的 current BUY/SELL 不得再写成“未进入 P0”。

### 5.4 current-only JSON v2/v3 空账号恢复

恢复是一个跨股票与现金的原子写入，不是普通录入、加仓、修改或历史版本回退。

恢复前置条件：

```text
backup.format = 当前产品格式
backup.formatVersion = 2 | 3
account.positions = []
account.cash = null
account.broker = null
```

规则：

1. JSON 顶层和嵌套对象必须符合 v2 或 v3 contract；数量、成本、余额和 NAV 等财务真值继续使用合法十进制字符串，时间与源 revision 必须有效。源 revision 只参与校验，不成为恢复后的账号 revision。
2. 每个标的必须通过 P0 的受支持 USD 美国上市股票/ETF 规则。同一 `instrument` 规范化后最多出现一次；同一规范 symbol 同时出现在多个受支持市场也视为有歧义。重复、未知、范围外或多市场歧义使整个文档无效，不允许只跳过错误项。
3. 解析与预览不得写入；空备份不执行恢复。用户二次确认后，repository 在同一个 D1 compare-and-swap 中重新检查账号股票、现金和 v4 book 都为空，再写入全部账号 current。
4. 账号任一 current 非空时整次拒绝；不得把恢复解释成叠加、合并或覆盖。两个并发恢复最多一个能通过 D1 CAS 空目标检查。
5. 任一记录写入、事务完成或竞争检查失败时，股票与现金都保持空；不得保留已写入的一部分。
6. 恢复只创建新的账号 current：一律 `revision=1`、`nextRevision=2`、`previous=null`。源 revision 不继承；不导入 previous、录入草稿、行情/汇率缓存、legacy 备份、outbox、同步游标或其他内部状态。
7. 现金为 `CASH_BALANCE_FALLBACK` 时必须有 `netAssetValue=balance`；否则整个文档无效。
8. 恢复文件先在当前设备读取与严格预览；确认后只把规范化 current 写入当前登录账号，原始文件不持久化。恢复不改变行情、汇率、聚合或现金利息公式。

## 5A. 来源持仓、买入、卖出与统一组合现金

### 5A.1 校准与投影

首次校准不读取旧输入推断券商；旧聚合数量与成本只作对照。用户为每个 `broker + instrument` 输入当前 `quantity` 与 `totalOpenCost`，并为两个券商输入：

```text
bookCash_broker = settledBalance_broker + pendingBalance_broker
totalBookCash = Σ bookCash_broker
```

允许两个内部现金分量与合计为负。`totalBookCash` 是首页、交易预览、总资产、复制和 AI 的统一组合现金；两个分量不是用户可分别花用的现金池。校准内容必须先完整验证，再以一条 v4 current 写入；失败不创建 book。重复校准产生新的 current revision 与 `RECONCILIATION` 事件，previous 保留上一成功 book。旧 v3 股票、现金、草稿和缓存不参与该写事务。

首页统一股票投影：

```text
totalQuantity_instrument = Σ quantity_broker,instrument
totalOpenCost_instrument = Σ totalOpenCost_broker,instrument
averageCost_instrument = totalOpenCost_instrument / totalQuantity_instrument
```

### 5A.2 买入

对所选券商、标的、数量 `q`、成交均价 `p`、非负手续费 `f`：

```text
gross = q × p
quantityAfter = quantityBefore + q
openCostAfter = openCostBefore + gross + f
cashDelta = -(gross + f)
totalBookCashAfter = totalBookCashBefore + cashDelta
```

`cashStatus=SETTLED` 时把 `cashDelta` 记入内部已结算分量；`PENDING` 时记入内部待结算分量。`broker` 只选择股票来源和兼容分量，不要求用户另选现金账户；无论买入 BOXX、SGOV 或其他标的，组合现金都减少 `gross + f`。

### 5A.3 卖出

卖出必须满足 `0 < q <= quantityBefore_broker,instrument`。设卖出前该券商剩余成本为 `C`、数量为 `Q`：

```text
remainingQuantity = Q - q
remainingOpenCost =
  0                                      （remainingQuantity = 0）
  C × remainingQuantity / Q              （remainingQuantity > 0）

gross = q × p
cashDelta = gross - f
totalBookCashAfter = totalBookCashBefore + cashDelta
```

该算法保持所选券商卖出前移动平均成本不变，只用于 current 剩余成本和组合浮动盈亏；它不是 FIFO、指定批次或税务成本。全卖只删除该券商子持仓；另一券商仍有数量时，首页合并行继续存在。无论卖出哪个标的或股票来源，组合现金都增加 `gross - f`。

### 5A.4 原子性与幂等

- BUY/SELL 必须在同一 v4 current 写入中同时提交来源股票、组合现金变化与事件；不存在先改股票后改现金的中间成功状态。
- event id 在同一 book 中唯一；重复 id 整笔拒绝。
- 写入必须带预期 revision；stale revision、超卖、无效十进制、费用、标的或持久化失败均零变化。
- `CASH_BALANCE_FALLBACK` 只在 IBKR 正已结算现金上成立；SETTLED 交易改变该余额时，fallback NAV 同步为 `max(settledBalance, 0)`。余额不正时不生成利息估算。
- 待结算款与负现金进入总资产，但不进入 IBKR 计息余额。moomoo 现金永不套用 IBKR 利率。
- 首页和交易预览只展示 `totalBookCash`。底层券商现金分量继续随 JSON v3 保存，但不能被 UI 描述成两个独立可用现金池。

### 5A.5 JSON v3

JSON v3 是双券商 current book 与其 current 维护事件的严格副本，不包含旧 v3 current、行情、汇率、草稿或历史 NAV。恢复前必须在同一事务内确认：

```text
count(position_batches_v2) = 0
count(cash_accounts_v3) = 0
count(broker_portfolio_v4) = 0
```

成功恢复只创建 v4 `revision=1`、`previous=null`、`nextRevision=2`；源 revision 不继承，事件内容保留。任一检查或写入失败零写入。旧 JSON v2 规则继续适用于未启用双券商账本的旧 current。

## 6. 估值与浮动盈亏

本节金额真值为 USD。

对有有效估值价的统一持仓：

```text
marketValue =
  totalQuantity × valuationPrice

unrealizedPnL =
  marketValue - totalOpenCost

unrealizedReturn =
  unrealizedPnL / totalOpenCost
  （仅当 totalOpenCost > 0）
```

总成本为零时，收益率显示未知，不显示 `∞`、`0%` 或伪造值。

组合层：

```text
portfolioOpenCost =
  Σ positionTotalOpenCost

pricedMarketValue =
  Σ marketValue for positions with an effective price

pricedOpenCost =
  Σ positionTotalOpenCost for positions with an effective price

portfolioUnrealizedPnL =
  pricedMarketValue - pricedOpenCost
```

至少一个开放持仓没有任何可用价格时，不能把已定价部分无警告地显示成完整总市值。

组合状态：

```text
COMPLETE_HEALTHY
COMPLETE_WITH_AGING
COMPLETE_WITH_STALE
PARTIAL
UNAVAILABLE
```

### 6.1 今日盈亏估算金额与涨跌幅

对同时具备有效估值价和前一常规收盘价的统一持仓：

```text
estimatedDailyPriceEffect =
  totalQuantity × (valuationPrice - previousRegularClose)

estimatedDailyChangeRate =
  (valuationPrice - previousRegularClose)
  / previousRegularClose
```

组合层只有在全部开放股票持仓都具备上述两个价格时才生成完整值：

```text
portfolioEstimatedDailyPriceEffect =
  Σ estimatedDailyPriceEffect

portfolioEstimatedDailyChangeRate =
  portfolioEstimatedDailyPriceEffect
  / Σ (totalQuantity × previousRegularClose)
```

计算使用当前快照数量，因此当日发生加仓、减仓或手工修改时，结果不等于券商按逐笔交易计算的当日盈亏。现金余额、NAV、现金利息估算和未定价股票均不得按 `0` 加入；正负配色只辅助表达，金额仍保留正负号。

### 6.2 组合结构与今日绝对贡献

组合结构只使用当前可估值资产：

```text
pricedStockMarketValue =
  Σ marketValue for positions with an effective price

structureDenominator =
  pricedStockMarketValue + cashBalance（存在现金时）

positionWeight_i =
  marketValue_i / structureDenominator

cashWeight =
  cashBalance / structureDenominator

topNConcentration =
  Σ 前 N 个未舍入股票市值 / structureDenominator
```

单只股票缺少有效估值价时，不以剩余成本、`0` 或舍入展示值替代市值；该股票不进入 `pricedStockMarketValue`，其 `positionWeight` 未知。只要存在缺价股票，结构状态就是 `PARTIAL`，所有可计算占比都必须说明只覆盖已定价股票与现金。分母为零或不存在可计价资产时，占比不可用。

今日贡献沿用第 6.1 节的单股金额：

```text
dailyEffect_i =
  totalQuantity_i × (valuationPrice_i - previousRegularClose_i)

portfolioDailyNet =
  Σ dailyEffect_i
  （仅当全部开放股票都可计算）

absoluteDailyDenominator =
  Σ abs(dailyEffect_i) for calculable positions

absoluteContributionShare_i =
  abs(dailyEffect_i) / absoluteDailyDenominator
```

规则：

- 任一股票缺少估值价或最近常规收盘价时，`portfolioDailyNet` 未知，不以 `0` 补齐。
- 部分股票可计算时，可以对可计算子集生成绝对贡献排序，但必须披露覆盖数量；不可称为完整组合贡献。
- 绝对贡献占比不表达方向。最大正贡献与最大负贡献按带符号的 `dailyEffect_i` 分别选择。
- `absoluteDailyDenominator = 0` 时，所有贡献占比未知；不得显示 `0%` 或平均分配。
- 现金余额、NAV 与利息估算不进入今日净额或绝对贡献。
- USD 是计算真值；人民币模式只折算带币种的金额，占比和排序不变。

### 6.3 当日持仓估算时间序列

设当前组合有股票 `i`，其当前未舍入数量为 `Q_i`，最近常规收盘价为 `C_i`，某真实日内时点上的最后已知条形收盘价为 `P_i(t)`：

```text
referenceStockValue = Σ(Q_i × C_i)

estimatedDailyPriceEffect(t) =
  Σ[Q_i × (P_i(t) - C_i)]

estimatedDailyChangeRate(t) =
  estimatedDailyPriceEffect(t) / referenceStockValue

estimatedAsset(t) =
  cashBalance + Σ[Q_i × P_i(t)]
```

多标的条形时间可不同。时间轴取所有真实事件时间的升序并集；某标的在该时点没有新条形时，使用该标的上一已知条形收盘价，在它的第一个条形之前使用 `C_i`。这只是阶梯式持有最后已知真实价，不在两个时点间生成新价格。

完整性规则：

- 任一 `C_i` 缺失或不大于零时，整个趋势不可用。
- 任一持仓没有对应 series，或 series 标记失败时，整个趋势不可用。`NO_DATA` 不伪造价格；它只保持该标的最近已知真实参考价。
- 无股票、没有真实点或 UI 不足以绘制可读连续线时，不用零或直线伪造趋势。
- 现金只进入 `estimatedAsset(t)`；它不进入 `referenceStockValue`、`estimatedDailyPriceEffect(t)` 或 `estimatedDailyChangeRate(t)`。
- USD 是真值。CNY 使用同一笔有效 USD/CNY 汇率对每个未舍入 USD 金额派生展示；涨跌幅不换算。
- `overnight` 当前价未接入趋势时不补点。以后只有在每个开放持仓都有同一真实时点的隔夜价时，才可添加 `OVERNIGHT_CURRENT` 独立点；其 `connectFromPrevious=false`，不与 SIP 历史连线。

`[实现事实 2026-08-09]` `domain/portfolio-trend.ts` 已在本地工作区实现上述十进制派生与完整性状态，不依赖应用层或 IndexedDB。完整 `npm run check` 已通过 47 个测试文件、416 项测试、TypeScript、领域构建与 Next.js 生产构建；真实 iPhone 与真实市场时段尚未验收。

### 6.4 长期现金流调整收益

`[用户确认 2026-08-12]` 本节算法目前是停用的历史设计记录，不进入首页、控制器或后台写入路径。保留它只为解释既有本机历史数据和代码的安全边界，不能作为重新启用授权。

长期范围的最小真值是同一组合口径的两个 NAV 锚点和其间全部外部现金流。设区间起点资产为 `BV`，终点资产为 `EV`，现金流 `CF_i` 在区间内发生；入金为正，出金为负：

```text
w_i = (endAt - flowAt_i) / (endAt - beginAt)
periodReturn =
  (EV - BV - ΣCF_i) / (BV + Σ(w_i × CF_i))
linkedReturn_n = Π(1 + periodReturn_k) - 1
flowAdjustedChange_n = rangeStartNav × linkedReturn_n
```

- `BV`、`EV`、现金流、权重、分母和链式结果全部用未舍入十进制计算。
- 买卖、内部转账、换汇、股息、利息、税费、佣金、融资利息和期权结算不是外部现金流；它们通过 NAV 变化进入表现。
- 分母不大于零、未知现金流、少于两个 NAV、来源覆盖集合变化或 NAV 口径无法核对时不可计算。
- 固定范围的完整收益要求起点和终点各有距离边界不超过 3 个自然日的真实 NAV，用于容纳周末或节假日。为了让月结单形成可见但诚实的部分线段，起点前最近 NAV 可在 14 个自然日内作为图形基线；超过 3 日时结果仍必须标为 `PARTIAL`，不得把该段冒充完整所选范围。
- 停用状态下不得自动写入本机每日 NAV；如果未来重新启用，仍只能在本次行情刷新成功且全部 current 股票完成定价时写入，请求失败后的上一有效价不得冒充当天 NAV。
- 相邻真实 NAV 间隔超出该数据源声明频率时，后一点 `connectFromPrevious=false`；UI 显示部分口径，不插值。
- 多来源组合只在同一日期拥有全部来源 NAV 时求和；不能以前一月 NAV 前向填充缺失账户。同一组已知但不完整的来源可以用稳定的不可逆来源集合键连接为 `PARTIAL` 线段；来源集合变化、来源未知或完整组合接续部分账户时必须断线。
- 长期 CNY 金额只用当前有效汇率折算 `flowAdjustedChange` 和 NAV；收益率不变，必须披露为当前汇率折算。
- `[用户确认 2026-08-15]` 个人 Production 固定启动载荷与自动恢复路径已移除；既有 current 和历史库旧记录保持原样，不得因本次变更删除、迁移或自动连接。

## 7. 行情契约

每条可用于估值的行情至少包含：

```text
instrument
provider
feed
price
priceType
sourceEventAt
fetchedAt
marketSession
validationStatus
previousRegularClose（能可靠识别时）
```

`previousRegularClose` 必须是大于零的十进制值。adapter 无法可靠识别正确参考日时保持缺失；缓存回退保留其真实旧值和元数据，不猜测、不写 `0`。

`[2026-08-03 实现事实]` 夜盘估值价来自 `overnight` 指示价，最近常规收盘参考来自同批标的的 `delayed_sip` Snapshot latest daily bar。两个来源在服务端按标的合并；`overnight` feed 的 daily bar 不得被解释为常规收盘。

首页当日趋势使用独立合约：

```text
provider = alpaca
sourceFeed = sip
timeframe = 15Min
adjustment = split
priceType = MINUTE_BAR_CLOSE
delayPolicy = AT_LEAST_15_MINUTES
availableThrough <= serverNow - 15 minutes
```

Historical Bars 服务端请求只含 `instruments` 与可选 `asOf`，不得包含数量、成本、现金或组合派生值。该合约不取代当前估值的 `delayed_sip` / `overnight` Snapshot 选择。

### 7.1 已确认 provider

MVP 股票行情按市场时段使用：

```text
盘前 / 常规盘 / 盘后：
  provider = alpaca
  feed = delayed_sip
  priceType = LATEST_TRADE

隔夜：
  provider = alpaca
  feed = overnight
  priceType = INDICATIVE_TRADE
```

接口与领域数据必须保留实际 `feed` 和 `priceType`，任何界面都不得使用“实时”描述。首页只在页面级披露一次约 15 分钟延迟，不逐行展示隔夜或指示性提醒；诊断资料若展示 `overnight`，必须按 `INDICATIVE_TRADE` 解释，不能伪装成 SIP 成交。

`[实现事实]` 当前 adapter 映射 Alpaca Stock Snapshot 的 `latestTrade`。`delayed_sip` 映射为 `LATEST_TRADE`；`overnight` 映射为 `INDICATIVE_TRADE`，不得把字段名直接解释为“合格成交”或 `LATEST_ELIGIBLE_TRADE`。

### 7.2 状态维度

`[实现事实]` 当前代码使用以下抓取状态：

```text
FETCH_OK
NOT_REQUESTED
FETCH_FAILED
RATE_LIMITED
UNAUTHORIZED
```

`NOT_REQUESTED` 保留给明确选择不请求行情的策略，不是接口故障。当前连续市场路由不会仅因盘前、盘后、隔夜或休市使用该状态；日历故障也不得伪装成休市或阻断 Snapshot 请求。

`[实现事实]` 当前代码使用以下市场时段：

```text
PRE_MARKET
REGULAR
AFTER_HOURS
OVERNIGHT
CLOSED
HOLIDAY
UNKNOWN
```

`[实现事实]` 当前代码使用以下估值状态：

```text
HEALTHY_DELAYED
AGING
STALE
NO_RECENT_TRADE
ANOMALOUS
UNAVAILABLE
CLOSED_FINAL
```

不得用一个布尔值混合抓取失败、市场闭市、低流动性和价格过期。

### 7.3 新鲜度

对约 15 分钟延迟 feed，当前工作阈值为：

```text
sourceEventAge <= 17 minutes     HEALTHY_DELAYED
17 minutes < age <= 20 minutes  AGING
age > 20 minutes                进一步区分 STALE、NO_RECENT_TRADE 或故障
```

`[实现事实]` 17/20 分钟是当前代码阈值，不代表 provider 服务承诺。闭市、周末和节假日不得继续累加延迟并制造永久告警。

`[实现事实 2026-07-30]` 服务端按 `America/New_York` 识别盘前 04:00–09:30、常规盘 09:30–16:00、盘后 16:00–20:00 和隔夜 20:00–04:00，并用 Alpaca 市场日历修正节假日与提前收盘。日历暂时不可用时按标准 24/5 时段继续刷新，不能因为日历故障停止估值。

- 盘前、常规盘和盘后请求 `delayed_sip`；
- 隔夜请求 `overnight` 估值价，并请求同批标的的 `delayed_sip` latest daily bar 作为最近常规收盘参考；标的没有新隔夜成交时，同一笔 `delayed_sip` 结果作为估值回退，再失败时使用上一有效价；
- 周末、节假日和休市仍可请求最近的 `delayed_sip` Snapshot，以便新设备取得最后市场价；结果标为 `CLOSED_FINAL` 并保留原事件时间；
- 页面可见时每 60 秒刷新，从后台恢复时补刷；页面被 iOS 暂停或关闭时不承诺后台运行。

### 7.4 异常与降级

以下候选价无效：

- 缺失、非数值或小于等于零；
- 标的或币种不匹配；
- `sourceEventAt` 位于可信当前时间之后。

新价失败、过期或异常时：

- 保留上一有效价；
- 只允许事件时间和获取时间不早于已缓存版本的新候选覆盖缓存；
- 保留上一有效价原始 `sourceEventAt`；
- 在数据层保留当前失败或老化状态；首页按 UX 规则只显示缺价和紧凑的请求故障提示，不逐行展示老化标签；
- 禁止把价格回退为 `0`；
- 禁止伪造新的成功时间。

## 8. CNY 派生显示

`[用户确认 2026-08-02]` 人民币金额只从未舍入 USD 金额派生：

```text
cnyDisplayAmount =
  unroundedUsdAmount × usdCnyRate
```

同一页面刷新周期内，组合总资产、股票成本、现金本金、现金利息估算、股票浮动盈亏、组合与单只今日变化金额、单只市值、估值价、均价和单只浮动盈亏必须使用同一笔汇率。股数、现金利率、收益率与今日涨跌幅不换算；股票排序继续使用未舍入 USD 市值。

派生顺序固定为：

```text
未舍入 USD 真值
→ 乘以未舍入 USD/CNY 汇率
→ 得到未舍入 CNY 派生值
→ 只在展示边界按人民币 2 位小数舍入
```

禁止用已经展示舍入的 USD 数字换算，禁止把 CNY 舍入结果写回 USD 股票或现金真值，也不计算汇兑盈亏。录入、JSON 备份和结构化复制资料继续使用 USD。

汇率优先使用 Alpaca 最新 `USDCNY` midpoint。Alpaca 凭据未配置、被拒绝或服务不可用时，服务端请求欧洲央行同一参考日的 USD/EUR 与 CNY/EUR 每日参考价，并按以下公式以任意精度十进制计算，再在汇率 contract 边界规范为最多 8 位小数：

```text
usdCnyReferenceRate =
  cnyPerEurReferenceRate / usdPerEurReferenceRate
```

两条参考价必须来自同一日期；provider 记为 `ecb`，rate type 记为 `REFERENCE`，并保留参考日、官方更新时间与抓取时间。客户端最多每 15 分钟主动刷新；最后有效汇率在 7 天内可作为降级值，但必须保留真实来源元数据并标为上一有效汇率。两个在线来源均不可用且本机没有合格缓存、来源时间在未来或年龄超过 7 天时，人民币模式不可用并继续显示 USD；禁止回退为 `0` 或伪造新时间。

## 9. IBKR USD 现金利息与总资产

`[外部事实 2026-08-02]` Interactive Brokers 官方现金利率页对直接客户的正结算 USD 现金公布：IBKR Pro 档位年利率为 `0.0313`，IBKR Lite 为 `0.0213`；首 USD 10,000 不计息，NAV 达到 USD 100,000 时可使用完整档位利率，低于门槛时按 NAV 比例调整。利率可变，因此 contract 同时保留官方链接和核验日：

<https://www.interactivebrokers.com/en/accounts/fees/pricing-interest-rates.php>

设：

```text
B = 未舍入 USD 现金余额
N = 未舍入 IBKR 账户 NAV
F = 10000
T = 100000
r = pricingPlan 对应的公布档位年利率
```

规范公式是：

```text
interestBearingBalance = max(B - F, 0)
navRateMultiplier = min(N / T, 1)
navAdjustedAnnualRate = r × navRateMultiplier
estimatedAnnualInterest = interestBearingBalance × navAdjustedAnnualRate
blendedAnnualRate = estimatedAnnualInterest / B
estimatedMonthlyInterest = estimatedAnnualInterest / 12
```

全部中间量使用未舍入十进制值，只在展示边界舍入。`estimatedMonthlyInterest` 是年化估算的 1/12；IBKR 实际按日计提并按月入账，实际天数、已结算余额、账户结构和最终入账以 IBKR 为准。

现金与股票的组合口径是：

```text
pricedAssetValue = pricedStockMarketValue + B
recordedPrincipal = totalStockOpenCost + B
pricedAssetReturn = pricedStockUnrealizedPnl / (pricedStockOpenCost + B)
```

存在未定价股票时，`pricedAssetValue` 必须标为“已计价资产”；现金不需要股票行情。预估利息不是已入账资产，不计入 `B`、`pricedAssetValue`、浮动盈亏或收益率分子。

ADR-044 启用后，组合现金改为：

```text
ibkrBookCash = ibkrSettled + ibkrPending
moomooBookCash = moomooSettled + moomooPending
totalBookCash = ibkrBookCash + moomooBookCash
pricedAssetValue = pricedStockMarketValue + totalBookCash
```

其中 `B` 仅等于正的 `ibkrSettled`，用于本节利息公式；`ibkrPending`、全部 moomoo 现金和负余额不进入利息计算。负 `totalBookCash` 作为负债减少总资产，结构权重若因非正分母失去解释性则保持不可用。

## 10. 黄金样例

### 10.1 同一标的统一合并

输入：

```text
录入 A：10 股，剩余总成本 $1,001
录入 B：5 股，剩余总成本 $602
估值价：$130
```

预期：

```text
总数量 = 10 + 5 = 15
总成本 = 1,001 + 602 = $1,603
平均成本 = 1,603 / 15 = $106.8666666667
市值 = 15 × 130 = $1,950
浮动盈亏 = 1,950 - 1,603 = $347
```

录入 A、B 不代表券商账户，也不保留券商分类。

录入 A、B 可以在同一表单中一次填写，也可以先保存 A，再从普通录入入口或“加仓”保存 B；两条路径都必须得到同一个统一持仓结果。若从首页选择“修改持仓”，则以回填并提交的合并数量与均价形成新的单项当前批次。

### 10.2 碎股

输入：

```text
数量 0.125 股
平均成本 $200.80
估值价 $212.40
```

预期：

```text
总成本 = 0.125 × 200.80 = $25.10
市值 = 0.125 × 212.40 = $26.55
浮动盈亏 = $1.45
```

### 10.3 行情失败

输入：

```text
上一有效价 $130
新一轮刷新失败
```

预期：

- 继续显示 `$130`；
- 保留上一有效价的事件时间；
- 数据层保留失败或老化状态；首页不逐行显示该状态，但请求故障可使用紧凑的页面级提示；
- 价格不能变成 `$0`。

### 10.4 人民币估算

输入：

```text
未舍入 USD 总市值 = 1000.005
USD/CNY 中间价 = 7.2
```

预期：

```text
未舍入 CNY 估算 = 1000.005 × 7.2 = 7200.036
展示 = ¥7,200.04
```

不得先把 USD 展示为 `$1,000.01` 再换算；切换前后的持仓数量与收益率完全相同。

### 10.5 今日盈亏估算

输入：

```text
当前数量 = 10 股
估值价 = $130
前一常规收盘价 = $125
```

预期：

```text
今日盈亏估算金额 = 10 × (130 - 125) = +$50
今日涨跌幅 = (130 - 125) / 125 = +4%
```

若 USD/CNY 为 `7.2`，人民币今日盈亏估算金额显示为 `+¥360.00`，涨跌幅仍为 `+4.00%`。缺少前收盘价时两项均显示未知，不显示 `$0.00`。

### 10.6 IBKR Pro 现金与 NAV 调整

输入：

```text
现金余额 B = $20,000
IBKR 账户 NAV N = $80,000
pricingPlan = IBKR_PRO
公布档位年利率 r = 3.13%
```

预期：

```text
计息余额 = 20000 - 10000 = $10,000
NAV 乘数 = 80000 / 100000 = 0.8
NAV 调整后档位年利率 = 3.13% × 0.8 = 2.504%
估算年利息 = 10000 × 2.504% = $250.40
整笔现金混合年利率 = 250.40 / 20000 = 1.252%
估算月均利息 = 250.40 / 12 ≈ $20.87
```

总资产只加入 `$20,000` 现金本金，不加入未入账的 `$250.40` 估算年利息。

### 10.7 组合结构与正负抵消的今日贡献

输入：

```text
A 市值 = $600，今日变化 = +$30
B 市值 = $300，今日变化 = -$20
现金本金 = $100
C 缺少估值价和前收盘价，剩余成本 = $200
```

预期：

```text
结构分母 = 600 + 300 + 100 = $1,000
A 结构占比 = 60%
B 结构占比 = 30%
现金占比 = 10%
C 结构占比 = 未知，结构状态 = PARTIAL

组合今日净额 = 未知（C 不可计算）
可计算子集绝对变化总量 = abs(30) + abs(-20) = $50
A 绝对贡献占比 = 30 / 50 = 60%
B 绝对贡献占比 = 20 / 50 = 40%
```

C 的 `$200` 成本不得进入结构分母，也不得把 C 的今日变化补为 `$0`。若 C 后续可计算且今日变化为 `-$10`，完整组合今日净额为 `$0`，但绝对变化总量为 `$60`，三只股票的绝对贡献仍分别为 `50%`、`33.333…%` 和 `16.666…%`；净额抵消不代表没有贡献。

### 10.8 任意股票卖出进入组合现金，另一来源持仓保留

输入：

```text
IBKR BOXX：10 股，剩余成本 $1,000
moomoo BOXX：5 股，剩余成本 $525
IBKR 卖出：4 股 × $108，手续费 $2，现金状态 SETTLED
IBKR 卖出前已结算现金：$2,000
moomoo 账面现金：$300
```

预期：

```text
IBKR 剩余数量 = 6
IBKR 剩余成本 = 1000 × 6 / 10 = $600
IBKR 现金增加 = 4 × 108 - 2 = $430
IBKR 已结算现金 = $2,430
组合现金 = 2,430 + 300 = $2,730

moomoo 数量 = 5（不变）
moomoo 成本 = $525（不变）

首页 BOXX 合并数量 = 11
首页 BOXX 合并成本 = $1,125
首页 BOXX 合并均价 = 1125 / 11
```

BOXX 在此只作为普通受支持 ETF 样例。换成 SGOV、AAPL 或任意其他受支持标的时，卖出净额进入组合现金、买入总额从组合现金扣减的公式完全相同。

## 11. 待确认清单

- 公司行为、股息、税费、空头和多币种账本均不在当前已确认范围。
