# 测试策略与发布门禁

状态：Active  
最后更新：2026-08-22（统一组合现金修订）

## 1. 测试结论

- `[约束推导]` 验证一个统一组合：无券商管理，相同标的合并，首页展示总仓位。
- `[用户确认 2026-07-30]` P0 按标的使用当前持仓快照批次；普通录入与加仓叠加新输入，修改回填合并数量与均价并替换，删除需要第二次确认；首页不显示历史恢复入口。
- `[用户确认 2026-07-30；2026-08-20 修订]` 旧 Vercel IndexedDB 保留；Sites P0 使用 ChatGPT 登录、D1 账号 current、Vinext/Vite/Worker，不使用 Service Worker 或完整离线。
- `[用户确认 2026-07-30]` 首页需要把当前手机中已保存的持仓手动导出为 JSON；导出和后续修改不得弄丢现有数据。
- `[用户确认 2026-08-09；2026-08-20 修订]` JSON v2/v3 只在账号 positions/cash/broker 全空时恢复；必须先在当前设备严格校验并预览，服务端再重验文档并在一次 D1 CAS 中复查空目标、写入规范化 current。任何失败零变化，不合并、不覆盖；源 revision 不继承，恢复记录固定 `revision=1`、`nextRevision=2`、`previous=null`，原始文件、草稿或缓存不进入 D1。
- `[用户确认 2026-08-09]` 组合结构分母为已定价股票市值加现金；缺价必须标记部分口径。组合今日净额只在全量可计算时成立，绝对贡献使用单股变化绝对值占可计算股票绝对变化总量，缺失不补 `0`。
- `[用户确认 2026-08-13；2026-08-15 修订]` 首页提供“组合分析”和“AI 对话”两个独立入口与弹层。测试必须锁定组合分析点按即请求、聊天打开与草稿输入零请求、首次发送建立固定完整快照、最近六轮连续上下文、current-only 全字段白名单/身份与存储内部排除、语义十进制和真实 RFC 3339 时间戳、AI 行业/资产角色分类、本机 Decimal 暴露、六维体检、本机数字重绘、伪造高级风险指标/外部归因/预测/直接交易指令拒绝、无持久化和失败不影响确定性详情。
- `[用户确认 2026-08-01；2026-08-09、2026-08-12 修订]` 首页为前 5、前 10、全部或单只事实提供普通复制与 ChatGPT 两个目标；单只都带组合摘要、权重和排名。普通复制只写剪贴板并留在 PWA，ChatGPT 路径复制同一文本后打开待发送 Prompt；两者均不自动发送或调用 OpenAI API，失败时保留目标专属手工回退。
- `[用户确认 2026-08-03]` 复制文本面向 AI 建议使用组合摘要和紧凑持仓表，只保留会改变判断的字段；逐股排障元数据改为全局行情口径、价格时间范围和必要例外标记。
- `[用户确认 2026-08-02]` 首页需要 USD / 人民币显示模式；人民币金额使用一笔有效 USD/CNY 汇率从未舍入 USD 真值派生，优先 Alpaca `USDCNY` 中间价并以欧洲央行日参考交叉汇率降级；双源失败时保留合格的上一有效值或继续显示 USD。
- `[用户确认 2026-08-02]` 首页连续列表增加一条可录入的 IBKR USD 现金资产。现金本金计入总资产；利息按 Pro/Lite、首 USD 10,000 免息和 IBKR NAV 比例规则估算；schema v2 升 v3 必须保留现有手机股票数据。
- `[用户确认 2026-08-03；2026-08-08 修订]` 首页不设置独立今日变化入口或持仓表模式切换。总资产 2 × 2 核心指标使用“今日盈亏”，主值显示整个股票仓的今日盈亏估算金额，副值显示今日涨跌幅；其余三项为累计盈亏、股票成本和现金本金。持仓表第四列固定显示累计盈亏/收益率，第五列显示逐股今日涨幅与小字今日盈亏金额，不重复“估算”文案。计算使用当前数量、估值价和最近常规收盘价；现金与利息排除，缺失值不归零，当日数量变化时不解释为券商逐笔交易口径的当日盈亏。
- `[用户确认 2026-08-03；2026-08-08 修订]` 名称/代码列固定，其余持仓列整块左右滑动；表头、全部股票和现金行共享一个滚动位置，从任意行起手均有效。测试必须同时覆盖页面纵向滚动、横向移动取消长按并抑制随后点击、普通点按、静止长按、键盘浏览和极窄/文字放大不再两列重排。
- `[用户确认 2026-08-08]` 首页不显示账户身份、页面导航或资产类别假标签；刷新、导出和复制在“更多操作”，底部唯一“录入资产”再选择股票或现金。
- `[用户确认 2026-08-09；2026-08-12 修订]` 首页使用 Robinhood-inspired 连续纯黑英雄区，趋势只保留 SIP 15 分钟当前持仓“今日走势”。测试必须证明没有长期周期控件、历史入口或后台历史写入。
- `[用户确认 2026-08-12]` 停用历史模块的旧测试可以保留为数据安全回归，但不代表功能仍进入 P0。新增运行路径测试覆盖 `/history` 重定向、控制器不打开历史库、已有历史数据不删除，以及 current v3 零改动。
- `[用户确认 2026-08-15；2026-08-20 修订]` 固定个人 Production 载荷和自动启动恢复已移除。测试必须证明 production-like 全新 Sites 账号保持空组合、不调用恢复、不写入个人完成标记；Sites/Vercel 客户端扫描不含固定资产载荷，旧 Vercel IndexedDB 与历史数据不受变更。
- `[用户确认 2026-07-31]` 行情跟随盘前、常规盘、盘后和 24/5 隔夜时段；约 15 分钟延迟在页面级只披露一次。首页不显示逐行市场时段、行情日期时间、偏旧、过期、上一有效价或隔夜提醒，缺价与请求故障仍明确呈现。
- `[实现事实]` 领域、IndexedDB、同步端口、标的解析、行情路由与 Alpaca adapter 已有自动化测试。
- `[实现事实]` 新持仓领域与 IndexedDB 快照测试已经覆盖无券商 contract、两种成本模式、按标的替换、内部撤销能力和带 revision 的定向删除；旧账本测试仍保留券商语义，只作为非 P0 回归。
- `[实现事实 2026-08-09]` 提交 `6e5832d` 的自动化已覆盖 JSON v2 严格解析/预览、空股票/空现金目标、事务内复查、并发恢复与现金写入失败回滚；组合结构和今日贡献已有完整、部分、净额抵消与零绝对变化的纯函数/组件覆盖。该提交已进入 GitHub `main`；生产 smoke 与真实 Safari/iPhone 验证仍待完成。
- `[实现事实 2026-08-01]` 结构化文本生成、未舍入市值排序、仓位权重、范围/单只交互、重复点击保护、同步剪贴板调用和手工回退已有自动化覆盖；TypeScript、29 个测试文件中的 248 项测试、领域构建和 Next.js 生产构建完整门禁通过。合成 11 只持仓在 320 × 568、390 × 844、430 × 932 和 200% 根字号下已复核四项导航、动态范围、单只选择、手工回退、焦点返回与键盘关闭；真机剪贴板仍待验证。
- `[实现事实 2026-08-09]` 代码已增加 ChatGPT HTTPS Prompt URL 构造和交付边界；专项测试覆盖先调用剪贴板、同一用户动作内同步导航、完整百分号编码，以及剪贴板不可用/拒绝仍导航。组件已覆盖全部范围与单只入口、短暂成功 Toast、页面隐藏计时和手工回退。完整 `npm run check` 通过 42 个测试文件中的 388 项测试、TypeScript、领域构建和 Next.js 生产构建；真实 iPhone 外部行为仍待完成，不能据此声明稳定 App 接管。
- `[实现事实 2026-08-12]` 双目标组件专项测试覆盖“更多操作”和单只菜单入口、显式 `clipboard | chatgpt` 目标、共享范围、普通复制无 ChatGPT 文案、两个成功 Toast、两类手工回退与焦点返回；普通剪贴板处理器和 ChatGPT 既有 URL/调用顺序测试继续独立覆盖。真实 iPhone 外部行为仍待完成。
- `[实现事实 2026-08-02]` Alpaca `USDCNY` provider、ECB 日参考价 provider、安全双源汇率路由、浏览器 client/cache、7 天边界、未舍入 CNY ViewModel、整页切换、来源与不可用文案已有自动化覆盖；TypeScript、33 个测试文件中的 283 项测试、领域构建和 Next.js 生产构建完整门禁通过。真实 ECB 响应、无 Alpaca 凭据和 Alpaca 故障降级已验证；无密钥 320 × 844 页面已实际启用人民币按钮、显示 ECB 来源且无横向溢出，两个切换目标均为 44 × 44 CSS px。生产发布、Alpaca 端点与真机仍待验证。
- `[实现事实 2026-08-02]` IBKR USD 现金 contract、利息边界、独立 repository、v2→v3 升级、现金表单、总资产/CNY/JSON v2/复制与股票隔离已有自动化覆盖；TypeScript、35 个测试文件中的 298 项测试、领域构建和 Next.js 生产构建完整门禁通过。自动化保留 v2 股票 current、草稿与 legacy backup；生产、真实 Safari/IndexedDB 和真实 iPhone 尚待验证。
- `[实现事实 2026-08-03]` 今日盈亏的逐股/组合数学、正负/零/缺失状态、夜盘双 feed 常规收盘参考、参考失败、现金排除、CNY 金额派生、总资产指标格、第五列逐股涨幅与小字金额、公司简称和完整辅助名称已有自动化覆盖。共享横向 region、辅助说明、键盘滚动和横向移动取消长按已有组件测试；390 × 844 合成持仓覆盖左右终点、下方现金行起手和后续纵向滚动，320/430 px 几何检查无页面主体横向溢出。35 个测试文件中的 306 项测试及完整构建门禁通过；真实市场时段和 iPhone 尚待验收。
- `[实现事实 2026-08-08]` ADR-030 首页结构、更多操作、统一录入、现金五列标签、股票点按/长按和横滑点击抑制已有组件测试；React StrictMode 重放初始加载的竞态已有独立回归。36 个测试文件中的 308 项测试及 TypeScript、领域构建、Next.js 生产构建通过；320/390 px 浏览器检查覆盖空状态、现金、CNY、弹层、横滑终点和现金保存/删除后客户端返回首页。真实 iPhone、200% 文字、VoiceOver 和含行情股票页面仍待验证。
- `[实现事实 2026-08-09]` 本地工作区已增加 Historical Bars provider/API/client、当日趋势领域派生、趋势图与高级首页层级的专项测试文件。完整 `npm run check` 通过 47 个测试文件、416 项测试、TypeScript、领域构建和 Next.js 生产构建；320/390/430 px 无页面级横向溢出，390 同视口视觉 QA Passed，键盘/焦点主路与控制台已验证。200% 文字、真实 iPhone 和真实市场时段仍待验证。
- `[实现事实 2026-08-12]` 首页六档和历史入口已经撤回；组件回归覆盖唯一今日线、没有长期按钮与历史链接，Controller 单测覆盖不再记录本机 NAV。完整 `npm run check` 通过 53 个测试文件、456 项测试、TypeScript、领域构建与 Next.js 生产构建，npm 生产依赖审计为 0。390 × 844 与 320 × 844 本地生产构建无页面级横向溢出，`/history` 返回首页，控制台无 error/warning。停用的历史领域与存储测试仍保留。
- `[实现事实 2026-08-13]` DeepSeek P0 的完整 `npm run check` 通过 59 个测试文件、488 项测试、TypeScript、领域构建和 Next.js 生产构建，npm 生产依赖审计为 0。本地生产浏览器验收覆盖 390/320 px、主动同意、缺密钥降级、同源内部 URL 回归、焦点返回和无横向溢出。功能提交 `18f0d1c` 已部署；生产 390 px UI/控制台通过，合成请求返回 `503 AI_NOT_CONFIGURED`、`no-store`、`noindex`，证明新路由生效且密钥未配置时不调用 provider。生产 key/provider 成功 smoke、真实 iPhone、200% 文字与 VoiceOver 仍待验收。
- `[实现事实 2026-08-15]` 功能提交 `058d3f8` 已删除固定启动载荷模块、Controller 调用和旧载荷测试，并进入 GitHub `main` 与 Vercel Production；新增 production-like Controller 回归覆盖真实空状态、恢复边界零调用和 `localStorage` 零写入。完整 `npm run check` 通过 59 个测试文件、490 项测试、TypeScript、领域构建和 Next.js 生产构建；`nanoid` override 更新到修复版 `3.3.18` 后，生产依赖审计为 0 个已知漏洞。运行源码、本地构建与生产 17 个首页静态 chunk 扫描无旧载荷；隔离新来源、遗留标记与合成既有股票/现金 current 的 Production smoke 通过，控制台无 error/warning。最小合成 AI 请求返回 `200 / deepseek-v4-flash / no-store`；真实 iPhone、200% 文字和 VoiceOver 仍待验收。
- `[实现事实 2026-08-15，既有 Production]` ADR-041 schema v2 完整上下文组合咨询的 contract、快照生成、DeepSeek provider、route/client、逐只分类、本机行业/角色汇总、六维体检、连续追问、固定会话快照、“重新体检”、一次完整候选重做和失败降级已有自动化。最终提交 `7df9400` 已进入 GitHub `main` 与 Vercel Production；完整 `npm run check` 通过 64 个测试文件、518 项测试、TypeScript、领域构建和 Next.js 生产构建，生产依赖审计为零。合成初始/后续 provider smoke、分类锁定和安全响应头通过；390 px 生产 UI 无横向溢出或控制台错误。该记录描述 ADR-042 之前的线上版本；真实 iPhone、200% 文字与 VoiceOver 仍待验证。
- `[实现事实 2026-08-15，Production]` ADR-042 双入口 UI 提交 `c5c7040` 与严格函数协议修复 `3b29842` 已进入稳定 Production。动态 strict function schema 锁定全部 position key 与六个维度，服务端重新附着持仓身份并把体检问题固定为空；完整 `npm run check` 通过 65 个测试文件、525 项测试和两项构建。两轮独立的十只合成 Production smoke 均完成初始体检、聊天首轮和带上下文第二轮，共六次请求全部返回 200；真实 iPhone、200% 文字与 VoiceOver仍待完成。
- `[实现事实 2026-07-30]` 浏览器已验证空首页、320/375/390/430 px 紧凑持仓布局、模拟 200% 根字号无关键横向溢出、多组十进制预览、草稿刷新恢复和无服务端密钥错误；Vercel 功能提交 `7dbcdac`、AAPL 标的解析以及 AAPL/MSFT 盘前 `delayed_sip` 有效估值价 smoke 已通过，实际隔夜 `overnight`、完整保存至首页、真实 iPhone 与主屏幕安装仍未验证。
- `[实现事实 2026-07-30]` 生产依赖审计为 0 漏洞；Next.js 正式版通过 npm overrides 使用已修复的 PostCSS `8.5.25` 与 sharp `0.35.3`，完整门禁已验证兼容。

通过旧测试只能证明旧实现没有回归。完成产品对齐后，必须用统一组合场景重新建立验收证据。

## 2. 当前自动化能力

当前工具：

- Vitest：单元与合约测试；
- fast-check：属性测试；
- `fake-indexeddb`：IndexedDB 自动化替身；
- Playwright：只有依赖与 `test:e2e` 脚本入口；当前没有 config、E2E 目录或 spec，尚不构成浏览器 E2E 套件；
- TypeScript：严格类型检查；
- `decimal.js`：高精度计算实现。

当前已覆盖：

- 十进制输入、运算和展示舍入边界；
- 无券商 `PositionInput` / `UnifiedPosition` 聚合与两种成本模式；
- 账号 repository 按标的原子叠加、替换、revision 冲突和定向删除；旧 IndexedDB 的内部撤销、草稿恢复和 legacy backup 只作兼容回归；
- 期初、买入、卖出、校准和更正等现有账本代码；
- 现有券商分组后聚合；
- 组合估值和行情状态；
- D1 `state_version`/business revision 原子写入、恢复、幂等和用户隔离；legacy IndexedDB 原子性另作兼容回归；
- 同步端口的先拉后推、分页、冲突和重试；
- 受支持标的规则、Alpaca 标的解析器和安全标的路由；
- Alpaca `delayed_sip` / `overnight` 请求、认证 header、无损价格解析和错误分类；
- 安全行情路由、市场日历、24/5 时段推断、隔夜回退和 IndexedDB 上一有效价缓存；
- 行情异常、部分失败和较旧响应不能覆盖上一有效价；
- 首页空状态、组合 view model、十进制预览、点按/长按操作菜单、横滑点击抑制、修改回填、加仓、单只复制并打开 ChatGPT 和删除确认的组件或视图模型测试。
- 版本化 JSON 备份格式、十进制字符串、current-only 读取、空组合、重复标的拒绝、Web Share 文件优先、取消和 Blob 下载回退。
- JSON v2/v3 严格解析、恢复预览、账号 positions/cash/broker 全空目标、D1 CAS 恢复、非空拒绝、并发竞争、写入失败零变化和 current-only 排除范围；legacy IndexedDB 恢复只作兼容回归。
- 前 5/前 10/全部/单只结构化持仓文本、稳定排序、部分/全部缺价、上一有效价、权重与排名、系统剪贴板、ChatGPT URL 编码/同步导航和手工回退。
- Alpaca `USDCNY` 中间价请求、无损 JSON 数字解析、ECB 同日 USD/EUR 与 CNY/EUR CSV 参考价解析和精确交叉计算、双源安全汇率路由、浏览器 client、上一有效汇率缓存、精确 CNY ViewModel 和 USD / 人民币切换。
- IBKR USD 现金 contract、Pro/Lite 与 NAV 调整利息计算、独立 current/previous/revision 存储、v2→v3 追加式升级、现金表单、股票与现金合并总资产、CNY 派生、JSON v2 和全部资产复制。
- 逐股和组合今日盈亏估算金额/涨跌幅、缺失前收完整性、现金排除、CNY 金额派生，以及总资产“今日盈亏”指标格的金额主值和涨跌幅副值。
- 组合结构同分母、Top N、现金权重、缺价部分口径、全量今日净额、可计算子集绝对贡献、正负抵消与零绝对变化。
- AI 完整快照 schema v3、高精度 Decimal/RFC 3339/合计/字段白名单、双券商现金分项、`INITIAL_ANALYSIS`/`CHAT` 模式、分析分类覆盖、本机行业/资产角色汇总、六类证据一致性、聊天空分类轻量回答、固定 provider/分模式预算、多轮稳定快照、路由同源/大小/限流/无配置、客户端复验和两个独立弹层生命周期。
- Historical Bars 请求白名单、SIP 15Min/split 参数、15 分钟 cutoff、分页/限流/未授权/畸形响应，以及浏览器合约复验。
- 当前数量的当日趋势十进制派生、多标的错位时间点、现金只进入估算资产、缺前收/series/点数和隔夜独立点语义。
- 趋势图的加载、可用、缺失、纯现金、USD/CNY、指针/键盘探查和减少动效状态。

以下覆盖只代表代码已经存在：

- 旧 `domain/ledger/` 的 SELL 和交易流水测试不代表当前流程；P0 current BUY/SELL 只以 ADR-044/048 的 v4 book 测试为准；
- 旧 `application/sync/` 端口测试不代表当前账号同步；真实登录、同账号读写和冲突边界由 Sites 身份、`/api/portfolio`、D1 CAS 与第二设备验收证明。

## 3. 测试数据纪律

- 仓库只保存合成数据。
- 仓库、Sites 发布包和 Vercel 浏览器构建都不保存个人 Production 固定持仓/现金载荷；历史 ADR 只保留决策记录。
- 不提交真实数量、成本、总资产、邮箱、token、API key 或用户导出的 JSON 文件。
- 股票代码可以使用公开标识，数量、金额和时间必须人为构造。
- provider 合约使用模拟响应；真实市场价格不能成为确定性断言。
- 测试输出不得打印认证 header 或响应中的敏感内容。
- 每个涉及计算的 fixture 必须使用未舍入十进制字符串。

## 4. 统一领域重构测试

### 4.1 Contract

重构完成后必须证明：

1. 用户输入 contract 不含 `brokerAccountId`。
2. 领域结果不含 `BrokerPosition` 或 `brokerAccountIds`。
3. IndexedDB 新记录不要求券商字段。
4. 同一标的的有效输入进入一个计算组。
5. 不同市场或币种的同代码标的不被错误合并。
6. 页面和无障碍树没有券商管理、筛选或拆分。
7. P0 输入 contract 使用快照行，不暴露 BUY、SELL 或交易追加语义。
8. 每行明确区分平均成本和剩余总成本模式。

### 4.2 数学不变量

- 数量与成本使用十进制真值。
- 相同标的的数量和剩余成本可确定性合并。
- 平均成本由未舍入总成本除以未舍入数量。
- 展示舍入不回写领域真值。
- 行情变化只改变估值，不改变数量或成本。
- 缺失价格不等于零。
- 同一输入、计算版本和时钟产生相同结果。
- 输入顺序或内部遍历顺序不改变最终合并值。
- 单只今日盈亏估算金额等于未舍入当前数量乘以估值价与最近常规收盘价之差；单只今日涨跌幅不依赖数量或成本。
- 组合今日盈亏只在全部股票都可计算时汇总，现金本金、NAV 与利息不参与，任一缺失项不得按零补齐。
- CNY 今日盈亏金额先用未舍入 USD 结果乘以有效汇率，再在展示层舍入；币种切换不改变 USD 真值。

旧 G-001 至 G-010 可以保留数值作为回归资料，但需调整语义：

- “单券商”改为“单次持仓输入”；
- “两券商加权合并”改为“同一标的两组输入合并”；
- “按券商平均成本”改为“按当前平均成本建立持仓”；
- SELL 和同步样例标为现有代码回归；CNY 样例按 ADR-008 的当前产品验收语义维护。

## 5. 首页与统一录入测试

首个 UI 纵向切片至少覆盖：

1. 空组合打开后显示清楚的统一录入入口。
2. 录入股票、数量和成本后保存成功。
3. 首页显示该股票的一条合并持仓；展示简称、完整辅助名称、代码、市值、数量、估值价、均价、累计盈亏、持仓收益率和今日涨幅成为固定 UI 断言。
4. 使用同一快照内两项相同标的输入时，首页仍只显示一条持仓。
5. 先保存一组输入，再从普通录入入口保存同一标的的第二组输入时，保存前预览与首页都按两组输入合并。
6. 不同标的分别显示，持仓列表的标的数量正确。
7. 碎股和高精度成本不丢失。
8. 非法、零值或超范围输入有明确错误，且不污染已保存数据。
9. 保存失败后表单输入保留。
10. 页面刷新、PWA 重开或同一 ChatGPT 账号换设备后，从 D1 账号活动 current 恢复；本机草稿/缓存不覆盖它。
11. 首页没有券商创建、选择、筛选或拆分。
12. 平均成本和剩余总成本两种模式都能生成正确的规范成本真值。
13. 从首页选择修改时，只回填当前合并数量与均价；保存替换当前标的批次，不累加旧集合，也不修改其他标的。
14. 从首页选择加仓时，只填写本次数量与买入均价，保存后按当前批次和本次输入共同重算。
15. OTC、期权、加密货币、非美国市场和无法解析标的在保存前被拒绝。
16. 输入股票代码后自动触发 Alpaca 解析，并从返回结果填写只读名称和上市市场；页面没有前置验证按钮、市场选择器或币种选择器，币种固定为 USD。
17. 代码变化后，较早的异步解析响应不能覆盖当前代码或匹配结果。
18. 320–430 px 默认文字大小和 200% 文字下，每个标的保持“名称/代码、市值/数量、估值价/均价、盈亏/收益率、今日涨幅”五列；名称左对齐并 sticky，数字右对齐，持仓表内部可横向滚动，页面主体无非预期横向溢出。
19. 页面级只出现一次约 15 分钟延迟文案并保留今日变化估算边界，持仓行不重复“估算”；第四列累计持仓收益率与第五列今日涨幅/今日盈亏金额的口径同屏可理解，页面不把任一指标称为实时涨跌。
20. 正收益率和正盈亏使用红色，负收益率和负盈亏使用绿色；行情健康、警告和错误状态保持各自状态配色，正负号仍然可见。
21. 点按或静止长按持仓打开只针对该标的的修改、加仓、仅复制、复制并打开 ChatGPT 和删除菜单；横滑取消长按并抑制随后点击，键盘有等价入口。
22. 删除必须经过第二次确认，revision 冲突时保留最新持仓，成功后只删除目标标的及其草稿。
23. 首页不渲染健康、偏旧、过期、缺价或异常行情汇总卡；页面级单次延迟披露仍存在，持仓行显示估值价但不显示时段、行情日期时间、老化、上一有效价或隔夜提醒；缺价和紧凑错误提示仍准确。
24. 首页和持仓操作菜单不出现“恢复上一版”或等价历史恢复入口。
25. “更多操作”中的“数据安全与恢复”有准确可访问名称；页面区分持久存储状态、最近生成副本和最近成功恢复，生成期间阻止重复点击。
26. 导出成功、取消和失败提示都明确当前账号 current 没有被修改；页面只承诺 current-only JSON v2/v3 的空账号恢复，不出现合并、覆盖、自动或云备份承诺。
27. “更多操作”中的“仅复制持仓资料”和“复制并打开 ChatGPT”都有准确可访问名称并位于同一“持仓资料”分组；两者打开同一动态范围菜单，分别传递明确目标。
28. 股票菜单提供两个单只目标；普通复制留在 PWA 且不出现 ChatGPT 文案，ChatGPT Prompt 仍待用户发送。两者失败时返回同一只读文本，完成或关闭后焦点与重复操作状态正确。
29. 有效汇率到达后，总仓位标题区显示可操作的 USD / 人民币切换；默认 USD，当前状态可被辅助技术识别。
30. 人民币模式同步换算总览、2 × 2 指标和持仓表的全部金额；数量、收益率和排序不变。
31. CNY 金额由未舍入 USD 真值乘以未舍入汇率后舍入，不解析已格式化美元字符串。
32. 汇率说明包含估算边界、方向与实际来源；Alpaca 显示中间价和来源时间，ECB 显示日参考汇率、参考日和官方更新时间；缓存值写“上次有效汇率”或“上次有效参考汇率”。
33. 只有 Alpaca、ECB 与合格缓存均无有效汇率时才禁用人民币模式并继续显示 USD；缺失汇率不制造 `¥0.00`，汇率故障不阻塞其他页面能力。
34. 切换或汇率刷新不改变 D1 current、旧 Vercel IndexedDB、JSON 副本和 USD 复制文本。
35. 空首页和连续列表都提供 IBKR 现金入口；未录入时不制造 `$0.00`，已录入时显示余额与“估算”利息。
36. 现金表单接受正数 USD 余额、Pro/Lite 和可选 IBKR NAV；留空 NAV 时保存现金余额作为 fallback，并明确披露假设。
37. 现金本金计入已计价总资产与总本金；未入账利息不计入总资产、浮动盈亏或收益率分子。
38. 保存现金只改现金 store；失败或 revision 冲突保留已有股票和表单输入。删除需二次确认且只删除现金 current/previous。
39. 现金单独存在时首页不请求股票行情；股票行情或现金读取单边失败不清空另一类可读资产。
40. 官方利率来源、核验日、免息门槛、NAV 门槛和三个利率口径可理解，页面不把利率称为实时、固定或保证收益。
41. JSON v2/v3、全部资产复制和 CNY 显示都使用同一条 current 组合现金真值；这些只读或派生动作不写回 D1 或本机 IndexedDB。
42. 有股票时总资产 2 × 2 核心指标显示“今日盈亏”，主值为整个股票仓的今日盈亏估算金额，副值为组合今日涨跌幅并保留“估算”语义和正负号；其余三项为累计盈亏、股票成本和现金本金。
43. 总资产数字下方不存在独立今日变化条；持仓工具栏不存在“持仓 / 今日”切换，第四列始终显示累计盈亏/收益率，第五列直接显示逐股今日涨幅与小字今日盈亏金额。
44. 缺少估值价或最近常规收盘价时，对应股票第五列及组合今日金额/涨幅均不可计算，不制造零值；现金本金、NAV 与利息不参与组合今日指标，现金第五列显示“不参与”。
45. 组合今日指标和逐股第五列的百分比/金额均按正值红色、负值绿色显示并保留符号；行内小字是具体金额而非“估算”，页面级估算说明继续存在。当日持仓数量变化提示明确说明它不等于券商按逐笔交易计算的当日盈亏。
46. CNY 模式使用同一笔汇率从未舍入 USD 今日盈亏派生组合与逐股金额，组合与逐股今日涨跌幅不变；320–430 px、200% 文字和辅助技术可完整读取指标格及逐股今日涨幅/金额。
47. 组件结构中五列表头、股票列表和现金行位于同一个可聚焦横向滚动 region；辅助名称与说明明确固定名称列和左右滑动，方向键/Home/End 改变该容器的 `scrollLeft`。
48. 横向 pointer move 超过既有阈值后即使长按计时到期或浏览器补发 click 也不打开操作菜单；无移动的点按或长按仍打开所选股票操作。
49. `Amazon.com, Inc.`、`Apple Inc.`、`Microsoft Corp.` 和 ETF 后缀在可见第一列被精简，完整名称仍用于辅助技术、持仓操作、标的身份和复制资料。
50. React StrictMode 重放首页 mount Effect 时，本机持仓加载最终进入 ready 或 empty，不永久停在 loading；现金保存与删除后的客户端返回首页同样成立。
51. 有效 JSON v2 在写入前显示资产预览和二次确认；无效格式/版本/字段/十进制/时间/源 revision、不受支持标的、规范化重复标的、同一 symbol 跨多个市场、无效现金 fallback 与空备份均不打开资产写事务。
52. 股票或现金任一非空时恢复整次拒绝；完全空目标成功时股票与现金在同一事务写入，任一强制失败零写入，并发恢复最多一个成功。
53. 恢复只生成新的本地 current，每条 `revision=1`、内部 `nextRevision=2`、`previous=null`；源 revision 不继承，第一次后续修改得到 revision 2。草稿、行情/汇率缓存、legacy、outbox 和同步状态不从文件创建或被清空，文件不上传。
54. 组合结构详情用已定价股票市值加现金本金作为统一分母；缺价股票权重不可用且显示部分口径，Top 1/3/5 按未舍入市值计算。
55. 今日贡献完整/部分覆盖、最大正负、净额抵消、绝对贡献和零绝对变化均可读；净额只在全量可计算时显示，缺失不补 `0`，现金不参与。

状态测试至少包含：

- 初次空数据；
- 加载中；
- 本地保存失败；
- 行情首次缺失；
- 行情老化或过期；
- 所有行情状态都不渲染独立汇总卡；页面级只披露一次延迟，持仓行不重复，也不显示时段、行情日期时间或老化提醒；
- provider 限流、未授权和服务失败；
- Alpaca 在线成功、无凭据时 ECB 成功、Alpaca 失败后 ECB 成功、双源失败、ECB 缺列/异日/非正值/缺失更新时间、7 天内缓存降级、超过 7 天、未来时间、无效方向和 provider/rate type 错配；
- 部分股票有价格、部分股票无价格；
- 全部股票有前一常规收盘价、部分缺少前收、估值价等于前收、正变化和负变化；
- 只有现金、股票与现金并存、现金读取损坏、现金保存失败和现金 revision 冲突；
- 恢复后上一有效价仍带原事件时间。

## 6. 账号 current、legacy IndexedDB 与恢复测试

以下首组用例验证旧 Vercel IndexedDB 适配器与草稿的 legacy 兼容；Sites 活动 current 的身份、D1 CAS 与恢复另见 6.1、6.7：

- 某标的新版本写入失败不留下半个可见快照；
- 某标的活动版本切换失败时继续读取其旧活动版本，其他标的不受影响；
- 普通录入同一标的两次时，两组输入都保留且统一聚合；
- 同一次提交的重复操作不重复计入；
- 多次打开数据库可恢复相同结果；
- 存储层内部上一版本能力保持隔离，不接入首页；
- 删除使用 expected revision，并在同一事务中移除目标标的当前/上一版本和该标的草稿，不影响其他标的；
- schema 升级成功迁移已有记录；
- schema v2→v3 只新增 `cash_accounts_v3`，升级前后的 `position_batches_v2`、`position_drafts_v2`、行情缓存和 legacy backup 逐字段一致；
- schema 升级失败保留旧数据或提供可恢复提示；
- 不再生成新的券商字段；
- 页面使用的持仓结果与从各标的活动版本重算一致；
- 清理动作有明确范围，不误删其他命名空间。
- 现金 current/previous 使用独立固定键和 revision；新增、替换、删除现金都不改变任一股票 current/previous 或草稿。

`fake-indexeddb` 只覆盖自动化逻辑。真实 Safari 仍需验证事务、版本升级、存储清理和容量异常。

### 6.1 JSON v2/v3 导出与空账号恢复测试

纯函数与 repository 集成测试验证：

- JSON v2 顶层 `format`、`formatVersion=2`、`exportedAt`、`snapshots` 和 `cash` 结构稳定；JSON v3 只包含 v4 current book 与 current 维护事件，两种格式都拒绝未知字段；
- 快照按规范标的稳定排序，同一标的出现两个 current snapshot 时拒绝生成；
- `revision`、`savedAt`、标的、可选名称、输入 ID、数量、成本模式和值完整保留；
- 所有十进制值经过 stringify/parse 后仍为字符串；
- 股票 `listSnapshots()` 和现金 `getCashSnapshot()` 只得到 current，两类 previous 在导出前后保持不变；
- 没有现金时 `cash=null`；有现金时完整保留 revision、保存时间、余额、Pro/Lite、NAV 和 NAV 来源；
- 空账号生成合法空文件；只有旧现金或只有 v4 book 也能生成对应格式的合法文件；
- 导出前后股票与现金 current、previous、草稿和 schema 不变。

浏览器交付测试验证：

- 支持文件分享时只调用一次 Web Share，并交付 `application/json` 文件；
- 用户以 `AbortError` 关闭分享时返回取消，不触发下载；
- 文件分享不可用或发生非取消型失败时触发 Blob 下载；
- Blob URL 在交付后释放，临时链接不进入持久状态；
- 导出动作不调用持仓上传 API。

真实 iPhone 手工验证负责确认系统分享面板、“存储到文件”、主屏幕独立模式和下载回退的实际行为。自动化通过不能替代这一设备证据，也不能证明用户最终把文件保存到了持久位置。

严格解析与预览测试验证：

- 无效 JSON、未知 `format`、非 v2/v3、缺失/多余字段、非法十进制、时间、源 revision 和标的全部在写入前拒绝；
- 标的解析遵守 P0 的 USD 美国上市股票/ETF 范围，拒绝不支持市场、币种和 symbol；同一规范标的重复必须拒绝，并覆盖同 symbol 不同 market 的歧义边界；
- 源 revision 必须是合法安全整数，但只用于校验；合法的高源 revision 不影响恢复后账号 current 从 1 开始；
- `CASH_BALANCE_FALLBACK` 必须同时满足 `netAssetValue=balance`；不相等时整份文件拒绝；
- 预览准确汇总导出时间、股票/输入数量、数量与剩余成本、现金或 v4 book 摘要；空备份不进入恢复确认；
- 解析和预览不访问 repository 写方法，也不记录完整私人文件。

repository 集成测试验证：

- 账号 positions/cash/broker 全空时，服务端通过同一 D1 CAS 写入全部规范化 current；无论源 revision 是多少，恢复后都为 `revision=1`、`nextRevision=2`、`previous=null`；
- positions、cash 或 broker 任一非空都整次拒绝，原 D1 state 逐字段不变；
- 空目标检查在 D1 CAS 中执行；两个并发恢复最多一个成功，另一个返回冲突且零变化；
- 服务端重验、D1 CAS 竞争或持久化失败时，全部账号 current 保持原状；
- previous、草稿、行情/汇率缓存、legacy backup、outbox 与同步游标不被导入或清空；
- Sites `/api/portfolio` 写边界重新校验传入文档，不能绕过浏览器解析器注入无效数据；原始文件不持久化。

持久存储状态测试验证：

- `persisted()` 或 `persist()` 明确返回 `true` 为 `persistent`，明确返回 `false` 为 `best-effort`；
- API 缺失为 `unsupported`；API 调用、能力属性读取或结果确认抛错为 `unknown`，UI 文案不得称“已拒绝”或“未授予”；
- 任一状态都不阻塞 JSON 导出、文件解析或空账号恢复，设备持久存储也不替代外部副本或 D1 账号 current。

### 6.2 本机持仓资料双目标交付测试

纯函数测试验证：

- 前 5、前 10、全部和单只范围从同一批原始快照与行情结果生成；
- 市值使用十进制真值降序，同值先按代码、再按规范标的键稳定排序，缺价置后；
- 单只只展开所选标的，但保留组合总览、占已定价总市值比例和市值排名；
- 组合摘要只保留资产、定价数量、必要成本/盈亏、现金/仓位和范围覆盖；定价完整时不输出重复覆盖率与零值拆分；
- 持仓 Markdown 表只包含排名、标的、数量、均价、现价、市值、盈亏、收益率和仓位；表头只出现一次；
- 全局行情说明包含 Alpaca 延迟/非实时与组合价格时间范围；逐股来源、feed、时段、状态和获取时间不进入文本；
- 碎股、大金额、部分缺价、全部缺价、上一有效价 `*` 和隔夜指示价 `†` 均不制造零值或丢失关键状态；
- 文本不包含原始输入 ID、revision、草稿、历史版本、缓存内部状态、服务端凭据或 AI 提问。
- 有现金时“全部资产”紧凑包含余额、Pro/Lite、NAV 与来源、免息额、计息余额、公布/NAV 调整/整笔利率、年/月利息估算和核验日；前 5/前 10 仍只按股票市值排序。
- 单只股票的权重分母包含现金本金；只有现金时全部资产文本仍有完整组合摘要，不制造股票行情或盈亏。

浏览器与组件测试验证：

- 普通复制只调用 `navigator.clipboard.writeText()`，成功后不调用 ChatGPT navigation；ChatGPT 路径的剪贴板与导航都发生在第一次异步等待前，顺序为剪贴板在前、导航在后；
- URL 固定使用 `https://chatgpt.com/?prompt=`，完整 Prompt 通过 `encodeURIComponent` 成为一个 query value；中文、换行、`&`、`?`、`#`、百分号和正负号往返解码后逐字符相同；
- ChatGPT 路径在剪贴板成功、不存在或拒绝三种状态都只导航一次；普通路径在三种状态都零导航。两条失败路径都保留同一文本；
- 范围菜单动态显示、前 5、前 10、全部、单只和股票菜单传递正确 `PortfolioCopyScope` 与 `PortfolioCopyTarget`；切换入口不会沿用上一次目标；
- 生成中阻止重复触发；普通失败说明系统剪贴板问题且不出现 ChatGPT，ChatGPT 提示明确 Prompt 待发送，不得出现“已发送”；失败文本框可聚焦和全选；
- 成功只渲染不占布局的目标专属 `role=status` Toast：普通复制“已复制，可粘贴到其他应用”，ChatGPT“已复制并打开 ChatGPT”；不写页面级 `notice`，失败不显示成功 Toast；
- 交付处理器不调用 repository、行情 client、本产品上传接口、OpenAI API 或任何 IndexedDB 写方法，也不把完整 URL 写入日志、分析事件或测试快照。

真实 iPhone 验证负责确认 Safari 与主屏幕 PWA 中普通复制留在当前页面且可粘贴到其他应用，以及 ChatGPT App 接管、网页回落、未登录、待发送、中文换行、长列表、URL 长度和手工粘贴。只使用合成持仓，证据中不得出现真实资产、登录资料或完整 Prompt URL。

### 6.3 IBKR 现金存储与表单测试

领域测试验证：

- Pro `0.0313`、Lite `0.0213`、免息额 `10000` 和完整利率 NAV 门槛 `100000` 与核验 contract 一致；
- 余额低于、等于和高于免息额时，计息余额分别正确；NAV 低于、等于和高于门槛时 multiplier 正确且不超过 `1`；
- `$20,000` 余额、`$80,000` NAV、Pro 的年利息为 `$250.40`，整笔混合年利率为 `1.252%`；
- 余额、NAV、利率、年/月利息全程使用 Decimal，展示舍入不写回真值。

repository 与组件测试验证：

- 新建、读取、替换和删除 current/previous 现金记录，revision 冲突保护和无效持久化数据拒绝；
- v2 股票库升级 v3 后原股票记录逐字段不变，随后写入现金也不改股票；
- 保存现金表单不调用股票写入，删除第一次点击不执行、第二次确认只调用现金删除；
- 现金单独存在、股票与现金并存、无现金入口、CNY、JSON v2 和复制全部资产状态。

### 6.4 组合结构与今日贡献测试

纯函数测试验证：

- 结构分母严格为未舍入已定价股票市值之和加现金本金；股票、现金和 Top 1/3/5 使用同一分母；
- 缺价股票不以成本或 `0` 代替，权重为不可用、状态为部分，并返回未计价数量；全部缺价、纯现金和零分母边界明确；
- 单股今日金额复用既有公式；组合净额只有全部股票可计算时存在，部分缺失不补 `0`；
- 绝对分母为可计算单股金额绝对值之和，正负抵消不改变绝对贡献；缺失项占比不可用；
- 所有可计算金额为零时净额可以为零，但绝对贡献占比全部不可用；
- 最大正/负贡献选择保留方向；现金始终排除，CNY 只折算金额、不改变占比与排序。

组件测试验证完整、部分、零分母、纯现金、前 5 大与“其他股票”聚合、二维环图、统一零轴条形图、关闭/焦点返回、键盘操作、红涨绿跌与非颜色语义，以及 320–430 CSS px 和 200% 文字下的可读性。图表只验证呈现坐标，不替代对原始十进制金额、分母与排序的纯函数断言。

### 6.5 DeepSeek 组合分析与独立 AI 对话测试

contract 与快照生成测试验证：

- 请求只接受精确 schema v3 字段，current-only 组合摘要、逐只数据、总现金、IBKR/moomoo settled/pending、可选 IBKR 利息和合法历史必须往返保真；账户分项必须精确求和。身份、账号、设备、revision/savedAt、event id、历史库、草稿、备份和额外字段全部拒绝。
- 十进制字符串按有限长度、符号、语义和取值范围验证；真实小仓位生成超过八十位小数的合法比例可通过，非有限值、越界、不一致合计和过长字符串拒绝。
- RFC 3339 同时覆盖无小数秒、毫秒、纳秒和显式时区；非法日期、缺失时区和过长值拒绝。
- `INITIAL_ANALYSIS` 不带 prior classifications/history/question；`CHAT` 要求 `priorClassifications=null`、非空问题和合法的交替 user/assistant 历史，可在零历史下首次发送。保留的后续体检模式继续要求完整且按持仓顺序的已验证分类。一百只持仓、十二条历史消息、问题长度和请求字节上限均有边界/越界断言。
- 本机行业/资产角色汇总验证 AI 分类映射回未舍入 `assetWeight`，现金排除、缺价部分口径、未知/重复/错序分类拒绝和 Decimal 精度。

provider、route 与 browser client 测试验证：

- 固定 `https://api.deepseek.com/beta/chat/completions`、`deepseek-v4-flash`、关闭思考、强制命名函数、`strict: true`、模式专属动态参数 schema、非流式、零温度、拒绝重定向和上游大小上限；不得回落到自由文本或 JSON Object。分析使用 25 秒/7000 token 边界，聊天使用 18 秒/1800 token 边界，认证 header 不进入断言输出。
- provider messages 包含稳定 system 与完整快照；分析请求追加体检约束，聊天请求追加最近对话与当前问题。测试证明两者都由客户端重发上下文，不依赖 provider 持久会话。
- `INITIAL_ANALYSIS` 的工具参数没有 positionId/symbol/basis 字段，测试证明服务端按请求重建身份和顺序；体检问题固定为空。`CHAT` 只接受空 `classifications`、空 `brief`、空建议问题和单个证据约束回答；空、截断、畸形、持仓缺失、未知/跨类 evidenceRefs、数字、伪造高级指标、外部因果、目标价、收益保证、预测和直接交易指令候选均不展示。首个不合规候选不回送原始参数，只在同一模式总超时内最多完整重做一次；429、5xx、网络失败映射为不含上游 body 的安全错误且不重试。
- 路由拒绝 cross-site、非 JSON、声明或实测超过 262,144 bytes、额外字段和无密钥请求，返回 `no-store`；每调用方每分钟十二次尽力限流与 kill switch 可测试。
- 浏览器只向同源路由 POST 已在本机校验的快照/后续请求，并用原请求再次验证返回；异常 HTTP/JSON/contract 不进入 UI。

组件测试分别验证：两个首页入口打开不同 dialog；组合分析挂载即请求并呈现紧凑加载/错误、行业/角色暴露、逐只分类/置信度、六个维度和本机 USD/CNY 证据；独立聊天打开、输入和关闭均为零请求，首次发送包含完整 `CHAT` 快照，后续只带最近六轮成功历史且父页刷新不替换固定快照，失败恢复草稿。两类弹层均验证不合规响应拒绝、确定性内容保留、无旧披露/示例/建议/重启噪音、焦点陷阱、Escape 和关闭清除。测试只使用合成股票和金额，不做真实 DeepSeek 网络调用。

### 6.6 双券商 current、交易与 JSON v3 测试

- 领域：校准唯一性、IBKR/moomoo 同标的、AAPL/BOXX/SGOV 等不同标的共享同一现金公式、碎股 BUY、手续费成本、SETTLED/PENDING 现金、部分/全部 SELL、移动平均剩余成本、超卖、负现金、fallback NAV 与 event id 幂等。
- repository：schema v3→v4 只新增 store且旧记录逐字段不变；校准 current/previous/revision；BUY/SELL 单 current 原子 put；stale revision、重复 id、写失败零变化；旧 store 与 v4 隔离。
- 投影/ViewModel：两边同股只形成一条统一行；数量与成本分别求和；首页只显示一条组合现金，CNY、结构/权重、趋势现金、复制和 AI context 使用同一未舍入总现金。
- 组件：校准页旧值对照、按券商分配、预览/确认、重复校准；交易页券商选择只影响股票来源，预览组合现金合计的通用 BUY/SELL 变化；Dashboard 只显示单条组合现金和通用规则；旧直达路由转向。
- JSON v3：严格顶层与 book、未知字段/格式/版本拒绝、十进制与事件 round-trip、Web Share/下载；恢复时三 store 全空、revision 重置、previous null、事件保留和失败回滚。
- 真实 iPhone：从既有 v3 升级、校准中断、校准成功、两券商各一次 BUY/SELL、待结算与负现金、刷新/PWA 重启、v3 文件保存/空来源恢复；全过程核对旧 v3 未改写。

### 6.7 Sites 登录、D1 与跨设备测试

- 身份：资产页面调用 `requireChatGPTUser()`；Production 缺失身份时跳转登录，`/api/portfolio` 缺失身份返回 401；本地 development user 只在 development 生效。
- 隔离：相同 D1 实例中 user A 写入后 user B 仍为空；数据库只保存稳定 user id，不保存邮箱或姓名。
- 状态：严格解析 `formatVersion=1`、positions/cash/broker current/previous，拒绝未知字段、重复标的、非法 revision 链和超过大小上限的 state。
- 写入：position replace/add/delete、cash replace/delete、broker reconcile/trade 与 v2/v3 restore 在服务端重新执行领域校验；D1 `state_version` CAS 与业务 expected revision 任一失败都零变化。
- 跨设备：两个独立 client 先读同一 revision；一边成功写入后，另一边旧写入得到 409，再刷新读取新 current。不得用 last-write-wins。
- 迁移：Sites 不读取旧 Vercel IndexedDB。v2/v3 只在账号 positions/cash/broker 全空时恢复；源 revision 重置为 1，原始 JSON、草稿、行情/汇率缓存和历史不进入 D1。
- 构建：`.openai/hosting.json` 固定 `d1=DB/r2=null`，Drizzle migration 与 `dist/.openai/drizzle` 存在；`dist/server/index.js` 为 Worker-compatible ESM。
- 发布：只允许 owner-only private deployment；发布后用两个同账号会话验证写后读，用未授权会话验证不能进入。不得使用真实资产做 smoke。

### 6.8 Sites → Vercel provider proxy 测试

- origin 选择：五个 browser client 只在精确 Sites Production origin 下构造固定 Vercel URL；localhost 与 Vercel legacy 仍使用同源相对路径，任意相似 hostname 不匹配。
- credentials：跨域 provider request 固定不携带 cookie/Authorization；AI 与 JSON POST 只触发 `Content-Type` preflight。
- CORS：五个 Vercel route 对精确 Sites origin 返回对应 GET/POST/OPTIONS、精确 `Access-Control-Allow-Origin`、`Vary: Origin`；不返回 `*` 或 credentials，攻击者 origin 在调用上游前拒绝。
- CSP：Next.js 与 Sites Worker 的 `connect-src` 只包含 `'self'` 和固定 Vercel origin；Sites Vite config 不含 `global_fetch_strictly_public`。
- PWA 图标例外：Sites `img-src` 只增加同一固定 Vercel origin；metadata 与 manifest 的所有图标 URL 都指向版本化 `/icons/*.png`。匿名 GET/HEAD 返回 PNG、CORP cross-origin、`Access-Control-Allow-Origin: *` 和 immutable cache；这组 header 不得出现在 `/api/*`。
- 数据边界：标的/行情/条形只发 instrument，FX 零资产输入；AI 只在用户明确触发时携带 ADR-042 current-only 快照。Vercel 无 `/api/portfolio` 且 provider 错误不写 D1。
- 生产 smoke：用合成标的/资产执行 preflight、AAPL 标的、`delayed_sip` 行情、SIP 15Min 条形、ECB 汇率和 schema v3 AI；不记录真实持仓、密钥或模型原始回答。

## 7. 行情合约测试

### 7.1 股票行情合约测试

现有 fixture provider 与 Alpaca adapter 继续验证：

- 盘前、常规盘和盘后显式指定 `feed=delayed_sip`；隔夜对同一批标的同时请求 `feed=overnight` 估值价和 `feed=delayed_sip` 最近常规收盘参考；
- 批量 symbol 正确对齐；
- JSON number 在进入领域前无损转为十进制字符串；
- Snapshot 的最近常规收盘价按市场时段正确选择并保留为 `previousRegularClose`；隔夜只接受 `delayed_sip` latest daily bar 作为该参考，不使用 `overnight` daily bar；缺失或无效值保持不可计算，不以估值价或零代替；
- provider、feed、price type、事件时间和抓取时间完整；
- Alpaca 市场日历识别节假日、提前收盘和有效隔夜交易日；日历异常、超时和不安全 base URL 均回退到标准 24/5 时段；
- 盘前、常规盘、盘后和隔夜都请求新行情；休市请求最近的 `delayed_sip` Snapshot 并显示“最后有效价”；
- 隔夜有指示价时保留 `overnight` 估值价并合入 `delayed_sip` 常规收盘参考；无隔夜成交时才用同批 `delayed_sip` 估值价或缓存回退；
- 单标的缺失不让整批归零；
- 401/403 映射未授权；
- 429 映射限流；
- 5xx、timeout 和畸形响应映射抓取失败；
- 异常或较旧候选不覆盖上一有效价；
- 浏览器 IndexedDB 已有较新事件或获取时间时，迟到响应不能回退缓存；
- 错误结果和日志不包含凭据。

当前自动化已验证服务端标的/行情路由的输入边界、缺少凭据时的安全失败和不泄露凭据响应；Next.js 生产构建、生产标的解析和常规交易时段外响应也已通过。以下仍需发布级验证：

- `[实现事实 2026-07-30]` 本地构建产物和生产 smoke 响应不含 Alpaca 凭据；
- 页面级只显示一次约 15 分钟延迟，每只健康持仓行不重复；
- provider、feed、价格类型与时间戳在数据层保留，首页不逐行显示这些元数据；
- 页面隐藏或恢复时不会伪造刷新时间；
- 各市场时段真实报价 smoke 只检查 schema、feed、来源和时间合理性，不断言具体价格。

### 7.2 Historical Bars 与当日趋势测试

服务端 provider 和路由测试验证：

- 路由只允许 `instruments/asOf`，拒绝数量、成本、现金、额外字段、超量标的、重复标的和同 symbol 跨市场歧义；
- 上游 URL 固定 `feed=sip`、`timeframe=15Min`、`adjustment=split`、`currency=USD`、`sort=asc`，密钥只在服务端 header；
- `availableThrough <= serverNow - 15 minutes`，同时不超过 `asOf` 和当日 20:00 ET；覆盖美东日光节约束和 04:00 前无可查窗口；
- 十进制 JSON 原文保留、点时间升序、重复冲突、超窗口点和畸形响应不进入领域；
- 分页 token 正常继续，重复 token、超页数、超时、超响应大小、401/403、429、5xx 和网络失败进入安全错误分类；
- 浏览器 client 重验 provider/feed/timeframe/adjustment/delay policy、窗口时间、点升序和 15 分钟 cutoff，拒绝多出或矛盾数据。

领域测试使用未舍入十进制 fixture 验证：

- `effect(t)=Σ[Q×(P(t)-C)]`、`rate(t)=effect(t)/Σ(Q×C)` 与 `asset(t)=cash+Σ(Q×P(t))`；
- 多标的不同条形时间使用真实时间并集和最后已知价，不插值；
- 缺前收、缺/失败 series、无真实点和无股票返回明确不可用状态，不生成零线；
- 现金只改变资产点，不改变今日价格影响或涨跌幅；
- 真实隔夜点要求所有持仓完整覆盖且 `connectFromPrevious=false`，当前未接入时不补点。

组件与浏览器检查覆盖加载、真实线、缺失原因、纯现金、USD/CNY、红涨绿跌与正负号、唯一“今日走势”口径、长期按钮和历史入口缺席、指针横向探查不阻断纵向滚动、方向键/Home/End 和减少动效。390 × 844 需复核英雄区与持仓表无页面级横向溢出；200% 文字与真实 iPhone 仍需补验。

停用历史模块的专项测试只作为安全回归：它们继续使用合成资料，证明独立历史库不触碰 current v3。产品运行路径必须额外证明不会渲染或调用这些入口。

Production 启动移除回归另行覆盖：运行源码不再存在固定载荷模块或 Controller 引用；在 production-like 环境渲染全新来源时，页面进入空状态，`restoreCurrentBackup()` 零调用，`localStorage` 零写入。发布候选完成 Next.js 构建后，对客户端产物执行旧标记、载荷识别字段和固定资产数值扫描。已有 current 保留由现有 repository 读取回归与无 schema 变更 diff 共同证明。

### 7.3 USD/CNY 汇率合约测试

自动化验证：

- 请求固定使用官方 latest forex rates 端点和 `currency_pairs=USDCNY`，读取 `mp` 与 `t`；
- 认证 header、`redirect: error`、10 秒超时和 401/403、429、5xx、网络失败、畸形响应分类正确；
- JSON number 在进入领域前无损保留为十进制字符串，正数、方向与 `sourceEventAt <= fetchedAt` 校验生效；
- ECB 请求固定使用官方 `EXR/D.USD+CNY.EUR.SP00.A`、`lastNObservations=1`、CSV data-only，不发送认证 header；
- ECB 只接受同一参考日的正数 USD/EUR 与 CNY/EUR，以任意精度十进制计算 `CNY/EUR ÷ USD/EUR` 并规范为最多 8 位小数；contract 使用 `ecb + REFERENCE`，包含参考日、官方 `Last-Modified` 与抓取时间；
- `/api/fx/usd-cny` 成功优先返回 Alpaca；缺少凭据或 Alpaca 失败时返回 ECB。只有两个来源均失败才返回不泄露细节的 503；
- 浏览器 client 拒绝无效 contract，`localStorage` 读取和写入异常不阻塞页面；
- 7 天年龄边界包含临界时刻，未来时间和超过边界的缓存不可用；
- 手动刷新允许立即尝试，自动前台刷新至少间隔 15 分钟；请求重叠受到保护；
- CNY ViewModel 对总览与逐行金额使用同一汇率和未舍入值，数量、收益率、排序与 USD copy source 不变；
- 组件切换覆盖 USD→人民币→USD、不可用禁用、缓存披露和无混合币种。

真实 ECB 官方响应的 schema、参考日、官方更新时间和交叉计算已通过 server adapter smoke。发布级验证仍需检查生产运行时能访问 ECB，并使用生产服务端凭据检查具体 Alpaca 账户的 latest forex rates 权限、响应 schema、来源时间合理性和客户端响应无凭据；不得断言某个具体汇率值。

## 8. PWA 与真实 iPhone 验证

自动化或构建检查：

- `[实现事实 2026-07-30]` Next.js App Router 的首页、快照页和服务端路由可以完成生产构建；
- `[实现事实 2026-07-31]` TypeScript typecheck、领域构建、Next.js 生产构建和 27 个测试文件中的 233 项自动化测试通过；
- `[实现事实 2026-07-30]` Vercel 已连接 GitHub，Production Branch 为 `main`，生产主域名可访问；
- manifest 可读取且字段有效；
- `display: standalone`、`start_url`、scope 和图标存在；
- iPhone 安装使用的 `apple-touch-icon` 与 manifest icon 不依赖 Sites 登录 cookie；生产逐字节比对公开 Vercel 图标与发布源一致；
- P0 不生成或注册 Service Worker；测试不得把 IndexedDB 本地恢复误称为完整离线；
- 新版本更新不清除 IndexedDB 数据，并覆盖其升级路径；
- `[实现事实 2026-07-30]` 320/375/390/430 px 浏览器布局无关键横向溢出，模拟 200% 根字号下关键数字和持仓行有序重排；真实 iPhone 的 Safari 文字放大仍待验证；
- 使用多条合成持仓复核 320、375、390 和 430 px 及 200% 文字：五列表格不重排，表内 `scrollWidth > clientWidth`；从表头、首行、下方股票和现金行横滑时共享 `scrollLeft`，固定列位置不变，滑到终点第五列完整可见；随后纵向滚动页面仍有效；
- 表单标签、焦点顺序和错误提示可访问。

真实 iPhone 手工检查：

- 添加到主屏幕；
- 独立窗口启动；
- 刘海、灵动岛和 Home Indicator 安全区域；
- 表单键盘、触控尺寸和长列表；
- 前后台暂停与恢复；
- 弱网、断网和重新联网；
- 刷新或重新启动后本地持仓仍存在；
- 从实际保存持仓的 PWA 点击“备份”，通过系统分享存到“文件”并打开 JSON；核对 `format`、`formatVersion`、`exportedAt`、当前快照数量以及导出前后持仓不变；
- 在完全空组合中选择有效 v2 文件，核对预览、二次确认、股票/现金一次恢复与刷新后结果；再验证无效/空文件、非空目标、取消和模拟失败都不改变任何资产，文件选择不产生上传请求；
- 打开组合结构与今日贡献，核对完整/部分结构、Top N、现金、完整净额、可计算子集绝对贡献、净额抵消、零绝对变化、人民币折算和 VoiceOver；
- 分别对全部、前 5/前 10 和单只资料执行两个目标；普通复制必须留在 PWA并可粘贴到其他应用，ChatGPT 路径核对 App 接管或网页回落与待发送 Prompt。确认文本一致、目标专属反馈、手工回退和操作前后 D1 current/本机缓存不变；
- 在 USD / 人民币间来回切换，核对所有金额同步切换、数量和收益率不变、汇率说明可读、复制文本仍为 USD，并验证 320–430 px、200% 文字和 VoiceOver；
- 核对总资产指标格中的“今日盈亏”金额主值和今日涨跌幅副值，以及股票第五列的逐股今日涨幅与小字金额；验证股票行不重复“估算”、夜盘随行情刷新、缺少最近常规收盘时金额/涨幅均为 `—`、现金显示“不参与”、CNY 只折算金额、正负语义以及当日数量变化提示；
- 从带有旧版股票数据的生产 PWA 升级，逐项记录股票数量、成本、revision、草稿与上一有效行情；录入、修改、备份、复制和二次确认删除 IBKR 现金后再次核对这些股票数据不变；
- 验证现金入口、Pro/Lite、填写或留空 NAV、利率来源链接、年/月估算、CNY 折算、键盘、安全区域、200% 文字和 VoiceOver；
- 行情旧数据时间在数据层不被改写，首页不展示逐行日期时间或过期提醒；
- 200% 文字和 VoiceOver 主路径。

记录设备型号、iOS 版本、应用版本、结果和缺口，不记录真实资产。

## 9. 当前发布门禁

### Gate 1：统一模型

- 首页统一持仓 contract 不含券商拆分；v4 内部 contract 只允许固定 IBKR/moomoo；
- 若复用旧 IndexedDB schema，已有数据有迁移路径；
- 统一组合数学测试通过；
- 现有高精度与行情回归测试继续通过。

### Gate 2：账号 current 可用

- 空组合到统一录入再到首页展示的 E2E 通过；
- 平均成本与剩余总成本两种输入模式通过；
- 刷新、PWA 重开和同账号换设备后从 D1 活动 current 恢复成功；
- 当前标的聚合数量与均价替换原子完成，失败保留该标的旧版本且不影响其他标的；
- 加仓原子叠加，删除经二次确认并通过 revision 冲突保护；
- 普通录入已有标的时原子叠加，保存前预览与首页按当前输入和本次输入共同重算；
- 相同标的只出现一份合并持仓；
- 页面不存在自由券商管理或股票拆分表；校准与交易必须显示固定来源选择；
- 保存与行情失败不会清空已有数据。
- 手动 JSON v2/v3 只包含对应模式的活动 current，十进制保持字符串，成功、取消和失败都不修改 D1 state 或本机 schema。
- JSON v2/v3 恢复严格解析并预览；只在账号 positions/cash/broker 全空时通过单次 D1 CAS 写入新 current，非空、并发或任一失败零变化；源 revision 只校验，恢复记录固定 `revision=1`、`nextRevision=2`、`previous=null`，草稿、缓存与同步内部状态不恢复。
- schema v4 追加式兼容、来源持仓校准、BUY/SELL 来源股票与统一组合现金原子联动、单现金投影、待结算/负现金、旧入口退出和 JSON v3 空账号恢复通过；校准前后旧 v3 逐字段不变。
- 持仓资料复制使用当前页面的原始十进制与行情结果；两个目标的范围、权重、缺价和单只上下文一致，剪贴板、ChatGPT URL 和手工路径复用同一文本。普通复制零外部导航；只有 ChatGPT 目标进入外部交付边界。
- 人民币 ViewModel 使用未舍入 USD 真值和一笔规范汇率；切换、缓存和失败路径不修改持仓、备份或 USD 复制资料。
- 旧 Vercel IBKR 现金 store/revision 与 v2→v3 追加升级作为 legacy 兼容回归；Sites 中旧 cash current 和 v4 统一组合现金通过 D1 state/business revision 验证，现金本金和 IBKR 利息口径通过领域与组件测试。
- 今日盈亏使用当前数量、估值价和最近常规收盘价的未舍入真值；逐股/组合完整性、夜盘双 feed 参考、现金排除、CNY 金额派生、总资产指标格和第五列逐股今日涨幅/金额通过行情、领域、ViewModel 与组件测试。
- 组合结构的同分母、Top N、现金与缺价部分口径通过；今日净额要求全量，绝对贡献在可计算子集按变化绝对值分配，缺失和零分母不制造比例。
- AI 两个入口与弹层、组合分析点按触发、聊天打开零请求与发送触发、current-only 完整快照白名单/排除面、高精度 Decimal 与 RFC 3339、分析分类覆盖、本机行业/角色暴露、六维证据集合一致性、`CHAT` 轻量回答、多轮上下文上限、固定首次发送快照、固定 provider、安全输出、无数字模型正文、错误降级、无资产写入和内存生命周期通过；构建与日志扫描不含 DeepSeek 密钥、合成请求体快照或模型原始响应。
- Historical Bars 路由只接受标的/`asOf`，SIP 15Min/split 参数、15 分钟 cutoff、分页和错误分类通过；持仓数量与现金不进入服务端请求。
- 当日趋势使用当前数量与前收的未舍入十进制派生；现金只进入资产点，缺前收/series/时点不画假线，范围只有“今日”，趋势不写 IndexedDB。
- Production 启动不存在固定个人资产载荷或自动恢复调用；全新 Sites 账号保持空组合且不写 current/标记，旧 Vercel origin IndexedDB 和历史数据零改动。
- ChatGPT 身份守卫、D1 user-id 隔离、严格 `/api/portfolio`、state/business 双 revision、跨设备冲突 409、v2/v3 空账号恢复与旧 origin 零自动迁移通过。
- Sites/Vercel 固定 origin 选择、五 client 路由、精确 CORS preflight、无 credentials、单 origin CSP、攻击者 origin 拒绝与 provider 故障 D1 零写入通过。

### Gate 3：PWA 可用

- Sites Vinext 生产构建与 Vercel Next.js provider 构建分别通过，两个发布包都不含不应进入客户端的 server-only 凭据；
- manifest 与 standalone 通过；
- 真实 iPhone 主路径通过；
- 真实 iPhone 的 Web Share 文件保存或下载回退通过，文件可在 App 外打开；记录只使用合成数据，不保存真实资产证据；
- 真实 iPhone 的文件选择、严格预览、空账号二次确认、D1 CAS 恢复、拒绝/失败零变化和同账号第二设备刷新通过；
- 真实 iPhone 的组合结构与今日贡献在完整/部分/零变化、CNY、200% 文字和 VoiceOver 下通过；
- 真实 iPhone 的两个 AI 入口与独立弹层、组合分析点按触发、聊天打开零请求、发送/连续上下文、加载/成功/失败、证据标签、关闭清除、CNY、200% 文字、VoiceOver 与减少动效通过；Production 使用合成事实完成分析与 `CHAT` 成功、无配置、限流或 kill switch smoke，账户余额设有硬费用边界；
- 真实 iPhone Safari 与主屏幕 PWA 的普通复制留页/跨应用粘贴、ChatGPT App 接管、网页回落、待发送、长文本与手工回退通过；全部、前 5/前 10 和单只在两个目标中复用同一文本；
- 真实 iPhone 的 USD / 人民币切换、汇率披露、窄屏/200% 文字和无障碍通过；生产 Alpaca `USDCNY` 优先、ECB 降级与安全响应 smoke 通过；
- 真实 iPhone 从已有股票数据升级到 schema v3 后股票不变；现金录入、修改、刷新、JSON v2、复制、CNY 和二次确认删除主路径通过；
- 真实 iPhone 的总资产“今日盈亏”金额主值、涨跌幅副值、夜盘刷新、缺失前收、CNY、200% 文字和 VoiceOver 通过；
- 真实 iPhone 的纯黑英雄区、真实当日曲线、指针探查、键盘/辅助技术、缺失状态、CNY 与 200% 文字通过；实际市场时段只核对合约和时间合理性，不断言价格。
- 行情来源与约 15 分钟延迟在页面级单次清楚披露；事件时间、市场时段和价格类型保留在数据层，不在健康持仓行重复；
- 构建产物密钥扫描通过；
- GitHub `main` 推送能自动产生相同 commit 的 Vercel provider Ready deployment，五个路由完成精确 Sites CORS 与生产 smoke。
- Sites Vinext build、D1 migration、owner-only private deployment、Production 登录、同账号第二设备读写与匿名拒绝通过；Sites 发布包的 CSP 和五个 client 必须与已验证 Vercel provider origin 一致。
- 隔离的全新 Sites 账号通过 smoke 后仍显示空组合，不产生固定资产或个人完成标记；同一 deployment 在带合成 D1 current 的账号上不改写已有数据。

Sites D1/认证与 Vercel provider proxy 现在属于前三个门禁。人民币、IBKR 现金与今日变化继续进入当前门禁；生产 provider 已用合成资料通过端点 smoke，但真机现金/今日变化验证未完成前，不得声明对应设备主路径已验收。

## 10. 尚未建立的验证

- Vercel 免费 Bot Protection 从 Log 切换 Challenge 前的真实误报、必要自动化绕过与 iPhone 行为；付费 WAF 限流已明确排除；
- 覆盖“保存到首页、点按/长按菜单、横滑误触抑制、修改、加仓、单只复制并打开 ChatGPT、确认删除、刷新和行情降级”完整主路径的自动化浏览器 E2E；当前仓库虽有 Playwright 依赖和 `test:e2e` 脚本，但没有 config 或 spec；
- manifest 测试；
- 真实 Safari/IndexedDB 验证；
- 真实 iPhone Safari 与主屏幕模式的 JSON 分享、存到“文件”、文件可读和回退下载验证；
- 真实 iPhone 的 D1 CAS 空账号检查、原子恢复、失败零变化、多标签冲突与同账号第二设备验证；旧 Safari/IndexedDB 跨 store 只作 legacy 兼容验证；
- 真实 iPhone Safari 与主屏幕模式的 JSON 文件选择、预览、二次确认、恢复成功/拒绝/失败和无上传验证；
- 真实 iPhone Safari 与主屏幕模式的组合结构与今日贡献完整/部分/零变化、CNY、200% 文字和 VoiceOver 验证；
- 真实 iPhone Safari 与主屏幕模式的两个 AI 入口与独立弹层、组合分析初始体检、行业/资产角色暴露、逐只置信度、聊天打开零请求、首次发送与连续上下文、成功/失败、证据重绘、CNY、父页自动刷新时固定聊天会话、200% 文字、VoiceOver、减少动效和关闭/刷新后不持久化验证；
- DeepSeek ADR-042 分离界面与严格函数协议已进入 Production，完整门禁及两轮合成 Production 体检/连续聊天路由复验通过。真实 iPhone 上的两个入口、零请求打开、连续追问、固定快照、CNY、关闭清除、200% 文字与 VoiceOver，以及独立 Preview 的 kill switch/超时/大小/限流运行验证仍待完成；
- 真实 iPhone Safari 与主屏幕模式的系统剪贴板用户手势、ChatGPT App 接管/网页回落、未登录、待发送状态、长文本 URL 上限、截断识别和手工粘贴验证；
- 常规盘、盘后和实际隔夜时段的时间绑定 smoke；其中 `overnight` 还需验证账户权限、指示性价格类型、来源与时间戳；
- 生产真实 Alpaca 凭据的 `USDCNY` latest forex rates 权限、schema、来源时间和安全响应 smoke，以及生产运行时的 ECB 降级可达性；
- 真实 iPhone Safari 与主屏幕模式的 USD / 人民币切换、缓存/不可用文案、200% 文字和 VoiceOver 验证；
- 真实 iPhone 上从实际 schema v2 股票数据升级到 v3、现金表单与连续列表、刷新恢复、JSON v2、复制、CNY 和现金删除隔离验证；
- 真实 iPhone Safari 与主屏幕模式的“今日盈亏”指标格、夜盘刷新、缺失前收、窄屏/200% 文字和 VoiceOver 验证；
- 真实 iPhone Safari 与主屏幕模式的 Robinhood-inspired 纯黑英雄区、当日趋势指针探查、缺数据不画线、CNY、200% 文字、VoiceOver 和减少动效验证；
- 使用真实延迟 SIP Historical Bars 完成实际市场时段 smoke，并确认不伪连未接入的隔夜点；
- 真实 iPhone 主屏幕安装、standalone、200% 文字和 VoiceOver 验证；
- 客户端网络响应与浏览器存储的真机密钥复核。

向已有账号组合合并/覆盖、无人值守旧 origin 迁移、自动版本化云备份、跨账号共享和完整离线不进入本轮。登录、D1 current 与同账号跨设备读取已进入本轮，但在真实第二设备 Production 验证前不得声明设备级闭环通过。

## 11. 验证命令

当前命令：

```bash
npm run typecheck
npm test
npm run build:domain
npm run build
npm run check
npm audit --omit=dev --audit-level=high
```

`npm run check` 当前通过 `prebuild` 运行 typecheck、自动化测试和领域构建，随后生成 Sites 的 Vinext/Vite/Worker 生产包。Vercel provider 还必须独立执行 `build:next`/Webpack、SRI、安全头与 provider route 门禁。依赖审计、完整浏览器 E2E、真实外部服务、Sites private deployment、Vercel 自动部署和真实设备仍需各自的发布检查；完成声明只能覆盖实际执行成功的范围。

`[实现事实 2026-08-17，Production]` `npm run build` 通过 `prebuild` 强制先执行 typecheck、全部测试和领域构建；新增共享请求边界、五路由跨站/Content-Type/实际字节/字段测试、汇率实例缓存测试及全站安全头/SRI 测试。完整门禁通过 67 个测试文件、539 项测试。GitHub Actions 使用当前官方 v7 固定 SHA，执行 `npm ci`、High/Critical 生产依赖审计、不输出匹配正文的秘密格式扫描和完整构建；npm 审计结果为 0。

`[实现事实 2026-08-17，修复实现]` SRI/Webpack 绑定回归增加 1 项，总计 67 个测试文件、540 项测试；完整 `npm run check`、TypeScript、领域构建和 Next.js Webpack 生产构建通过。对本地生产服务器实际返回的首页和 5 个带 SRI 脚本逐字节重算 SHA-384，全部匹配。线上仍必须重复同一检查，因为 Vercel 平台注入发生在本地构建之后。

`[实现事实 2026-08-17，Production]` 提交 `8e1ef1f` 的 GitHub Security gate 与 Vercel Production 均成功。线上首页为 Webpack 产物，5 个实际 HTTP 脚本哈希与 SRI 全部匹配且无工具栏注入；真实 Chrome 中 `main[aria-busy=true]` 为 0、已加载壳为 1，标题和录入入口存在，控制台无 warning/error。manifest、AAPL 标的、`delayed_sip` 当前行情、SIP 15Min 条形与 ECB 汇率均返回 200。
