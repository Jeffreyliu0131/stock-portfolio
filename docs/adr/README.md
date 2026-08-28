# 架构决策记录

最后更新：2026-08-28（价值投资框架顾问修订）

ADR 状态：

- `Accepted`：产品所有者已经明确确认的绑定决定；
- `Proposed`：候选方案，不能当作已确认需求；
- `Superseded by ADR-XXX`：已由新决定取代。
- `Amended by ADR-XXX`：原决定继续有效，但其中一部分由后续决定修订。

| ADR | 标题 | 状态 | 当前含义 |
|---|---|---|---|
| [ADR-001](ADR-001-PWA-DELIVERY.md) | 使用 PWA 交付 iPhone 体验 | Amended by ADR-047 | PWA 是当前交付形态；安装图标改用公开只读静态 origin |
| [ADR-002](ADR-002-LEDGER-SOURCE-OF-TRUTH.md) | 使用可审计手工账本作为持仓真源 | Superseded by ADR-010 and ADR-011 | 每券商账本和逐笔维护不能继续视为已确认 |
| [ADR-003](ADR-003-DELAYED-SIP-MARKET-DATA.md) | 使用 Alpaca 延迟 SIP 行情 | Amended by ADR-020 | Alpaca `delayed_sip` 与底层真实元数据继续有效；首页逐行状态展示由 ADR-020 修订 |
| [ADR-004](ADR-004-CLOUD-APPLICATION-STACK.md) | 未来云数据与认证方案 | Superseded by ADR-045 | Sites 登录、D1 与跨设备已由 ADR-045 确认 |
| [ADR-005](ADR-005-MOVING-WEIGHTED-AVERAGE-COST.md) | 移动加权平均卖出成本提案 | Superseded by ADR-006 | 历史提案 |
| [ADR-006](ADR-006-PER-BROKER-COST-BASIS.md) | 按券商分别计算成本的历史提案 | Superseded by ADR-007 | 历史提案；券商维度已由 ADR-010 移除 |
| [ADR-007](ADR-007-OPEN-POSITION-AVERAGE-COST.md) | 只维护当前开放持仓均价 | Superseded by ADR-010 | SELL 不进入 P0；未来加入交易时重新决定 |
| [ADR-008](ADR-008-USD-CNY-DERIVED-DISPLAY.md) | USD 真值与 CNY 派生显示 | Amended by ADR-022 | 首页可切换人民币估算；USD 仍为真值；固定 Alpaca 来源已由 ADR-022 修订为优先与降级链路 |
| [ADR-009](ADR-009-LOCAL-FIRST-CLOUD-REPLICATED-LEDGER.md) | 本地优先、云端复制 | Superseded by ADR-012 | P0 不接云同步 |
| [ADR-010](ADR-010-UNIFIED-PORTFOLIO.md) | 使用无券商维度的统一持仓模型 | Amended by ADR-044 | 首页继续按 `instrument` 合并；启用双券商账本后，底层按交易券商维护子持仓 |
| [ADR-011](ADR-011-CURRENT-POSITION-SNAPSHOT-BATCH.md) | P0 使用当前持仓快照批次 | Amended by ADR-044 | 旧 v3 current 保留；确认校准后由 v4 双券商账本驱动 current 投影 |
| [ADR-012](ADR-012-INDEXEDDB-LOCAL-P0.md) | P0 使用 IndexedDB 本地保存 | Superseded by ADR-045 | 只描述旧 Vercel 来源；Sites current 改为账号 D1 |
| [ADR-013](ADR-013-NEXTJS-APP-ROUTER-RUNTIME.md) | P0 使用 Next.js App Router 与 React | Amended by ADR-045 | 页面 contract 保留，Sites 使用 Vinext/Vite/Worker 构建 |
| [ADR-014](ADR-014-VERCEL-GITHUB-DEPLOYMENT.md) | 使用 Vercel 托管并从 GitHub main 自动部署 | Superseded by ADR-045; partially reused by ADR-046 | 产品 UI/current 转入 Sites；Vercel/GitHub `main` 只保留 provider-only 发布与 legacy JSON 来源 |
| [ADR-015](ADR-015-ADD-INPUTS-AND-REPLACE-EDIT.md) | 普通录入叠加，完整编辑替换 | Amended by ADR-044 | 旧 current 路径保留；v4 启用后使用带券商与现金联动的 BUY/SELL |
| [ADR-016](ADR-016-CONTINUOUS-MARKET-SESSION-VALUATION.md) | 按美股 24/5 市场时段连续估值 | Amended by ADR-020; Extended by ADR-027 | 盘前/常规/盘后使用 delayed_sip，隔夜使用 overnight；夜盘同时取 delayed_sip 常规收盘参考，休市保留最后有效价 |
| [ADR-017](ADR-017-HOME-POSITION-ACTIONS.md) | 首页长按持仓操作与聚合编辑 | Amended by ADR-019, ADR-020, ADR-030 and ADR-044 | v4 启用后股票操作改为买入、卖出、校准和复制；旧路径不再写活动组合 |
| [ADR-018](ADR-018-MANUAL-CURRENT-POSITION-JSON-EXPORT.md) | 手动导出当前持仓 JSON 副本 | Amended by ADR-023; Extended by ADR-031 | 只读 JSON v2 导出继续有效；ADR-031 只增加空组合 current-only 原子恢复，不改变导出范围 |
| [ADR-019](ADR-019-PAGE-LEVEL-DELAY-DISCLOSURE.md) | 行情延迟采用页面级单次披露 | Amended by ADR-020 | 页面级保留一次延迟披露；逐行行情元数据展示由 ADR-020 修订 |
| [ADR-020](ADR-020-FUTU-STYLE-PORTFOLIO-HOME.md) | Futu 账户页式首页信息层级 | Amended by ADR-024, ADR-025, ADR-027, ADR-028, ADR-029, ADR-030 and ADR-034 | 浅色连续持仓表、红涨绿跌保留；英雄区改为 Robinhood-inspired 连续纯黑层级 |
| [ADR-021](ADR-021-LOCAL-PORTFOLIO-TEXT-COPY.md) | 本机复制结构化持仓资料 | Amended by ADR-023, ADR-026, ADR-028, ADR-033 and ADR-038 | 前 5、前 10、全部或单只资料使用同一文本；ADR-038 分为普通复制与 ChatGPT 两个明确目标 |
| [ADR-022](ADR-022-ECB-USD-CNY-REFERENCE-FALLBACK.md) | USD/CNY 使用 Alpaca 优先与 ECB 日参考价降级 | Accepted | Alpaca 不可用时无需密钥使用 ECB 同日 EUR 参考价计算 USD/CNY；只有两个来源均失败才继续 USD |
| [ADR-023](ADR-023-IBKR-USD-CASH-ASSET.md) | 把 IBKR USD 现金作为本机资产记录 | Amended by ADR-044 | 旧 v3 IBKR cash 保留；v4 分别记录 IBKR/moomoo，利息只用正已结算 IBKR USD |
| [ADR-024](ADR-024-ESTIMATED-DAILY-PRICE-EFFECT.md) | 首页显示今日价格变化影响估算 | Amended by ADR-025 and ADR-027; Extended by ADR-034 | 当前数量、前收、现金排除和完整性规则延伸到真实当日时间序列 |
| [ADR-025](ADR-025-DAILY-RATE-SUMMARY-TILE.md) | 今日涨幅进入总资产指标矩阵 | Amended by ADR-027 and ADR-028 | 保留无独立变化条和无模式切换；指标名称与主副值由 ADR-027 修订，逐股今日涨幅与金额由 ADR-028 进入第五列 |
| [ADR-026](ADR-026-AI-FOCUSED-PORTFOLIO-COPY.md) | 复制文本只保留会改变 AI 判断的持仓上下文 | Amended by ADR-033 and ADR-038 | 低噪音字段与事实文本继续有效；两个交付目标复用同一内容 |
| [ADR-027](ADR-027-PORTFOLIO-DAILY-PNL-TILE.md) | 全股票仓今日盈亏动态展示 | Amended by ADR-028; Extended by ADR-034 | 金额主值和涨跌幅副值保留；ADR-034 新增同口径当日曲线 |
| [ADR-028](ADR-028-PER-POSITION-DAILY-CHANGE-RATE.md) | 持仓表直接显示逐股今日涨幅与金额 | Amended by ADR-029 | 第五列与展示简称继续有效；移动端压缩和极窄两列重排由 ADR-029 改为固定身份列加共享横向滚动 |
| [ADR-029](ADR-029-STICKY-HOLDINGS-HORIZONTAL-SCROLL.md) | 持仓表固定名称列并整块横向滑动 | Accepted | 名称/代码固定；表头、全部股票与现金行共享一个横向滚动容器，横滑不阻断页面纵向滚动或误触长按 |
| [ADR-030](ADR-030-FIRST-PRINCIPLES-PORTFOLIO-HOME.md) | 用第一性原理收敛持仓首页 | Amended by ADR-034 | 产品信息与操作收敛保留；总资产区扩展为黑色英雄区与真实当日曲线 |
| [ADR-031](ADR-031-SAFE-EMPTY-PORTFOLIO-JSON-RESTORE.md) | 只允许把 current-only JSON v2 原子恢复到空组合 | Amended by ADR-045 | 严格 contract 不变；Sites 中目标是完全空的账号 current，确认后写 D1 |
| [ADR-032](ADR-032-PORTFOLIO-STRUCTURE-AND-ABSOLUTE-DAILY-CONTRIBUTION.md) | 组合结构使用已定价总资产，今日贡献使用绝对变化总量 | Amended by ADR-039 | 确定性分母、净额与绝对贡献公式不变；ADR-039 在其上增加可选的证据约束 AI 解读 |
| [ADR-033](ADR-033-CHATGPT-PREFILLED-PROMPT-HANDOFF.md) | 复制后打开 ChatGPT 待发送 Prompt | Amended by ADR-038 | ChatGPT 入口继续通过官方 HTTPS URL 预填同一文本；不自动发送、不调用 API，普通复制由 ADR-038 独立出来 |
| [ADR-034](ADR-034-ROBINHOOD-INSPIRED-INTRADAY-PORTFOLIO-TREND.md) | Robinhood 式高级首页与真实当日持仓估算线 | Accepted | 连续纯黑英雄区；当日线使用 SIP 15Min 条形和当前数量本机派生，不伪造长期收益线 |
| [ADR-035](ADR-035-LOCAL-HISTORICAL-PORTFOLIO-RETURN.md) | 本机历史账本与现金流调整组合收益 | Superseded by ADR-037 | 历史设计与既有数据安全边界保留；首页、历史路由、Controller 查询和自动 NAV 写入已停用 |
| [ADR-036](ADR-036-PERSONAL-PRODUCTION-BOOTSTRAP.md) | 个人生产版一次性启动迁移 | Superseded by ADR-040 | 固定载荷和自动恢复已移除；本 ADR 只保留历史决策记录 |
| [ADR-037](ADR-037-SINGLE-INTRADAY-TREND.md) | 首页只保留今日走势 | Amended by ADR-040 | 移除长期周期和历史入口；`/history` 重定向首页，Controller 不读取或写入历史库，既有历史数据不删除。其中的个人 current 启动例外已移除 |
| [ADR-038](ADR-038-PORTFOLIO-COPY-DESTINATIONS.md) | 持仓资料提供普通复制与 ChatGPT 两个目标 | Accepted | 两个入口复用同一 USD 文本和范围；普通复制留在 PWA，ChatGPT 路径继续预填待发送 Prompt |
| [ADR-039](ADR-039-EVIDENCE-BOUND-DEEPSEEK-PORTFOLIO-INTERPRETATION.md) | 使用证据约束的 DeepSeek 解读当前组合 | Superseded by ADR-041 | 最小事实包和一次性输出已被取代；用户主动触发、服务端密钥、`no-store`、失败降级和不持久化原则继续有效 |
| [ADR-040](ADR-040-REMOVE-PERSONAL-PRODUCTION-BOOTSTRAP.md) | 移除个人 Production 固定启动数据 | Accepted | 客户端不再包含固定资产载荷或自动恢复调用；新来源保持空组合，已有 IndexedDB current、历史数据和旧标记不改写 |
| [ADR-041](ADR-041-FULL-CONTEXT-DEEPSEEK-PORTFOLIO-CONSULTATION.md) | 使用完整当前快照提供 DeepSeek 组合咨询与行业暴露分析 | Amended by ADR-042 and ADR-044 | 完整 current-only、安全输出与本机 Decimal 不变；现金 context 由 ADR-044 扩展为双券商 schema v3 |
| [ADR-042](ADR-042-SEPARATE-PORTFOLIO-ANALYSIS-AND-AI-CHAT.md) | 组合分析与 AI 对话使用两个独立入口和会话 | Amended by ADR-044 and ADR-049 | 两入口/触发/固定快照不变；对话升级为巴菲特框架顾问与 schema/prompt v4 |
| [ADR-043](ADR-043-PUBLIC-DEPLOYMENT-SECURITY-HARDENING.md) | 公开部署采用分层安全加固 | Amended by ADR-045 and ADR-046 | 产品页面公开免登录被取代；请求/上游/日志、Vercel 供应链与 provider 硬预算继续适用于 provider-only 后端 |
| [ADR-044](ADR-044-UNIFIED-VIEW-BROKER-AWARE-TRADE-BOOK.md) | 统一展示下使用双券商交易与现金账本 | Amended by ADR-045 and ADR-048 | 活动 v4 current 在账号 D1；股票来源仍分券商，用户可见现金改为统一组合池 |
| [ADR-045](ADR-045-SITES-AUTHENTICATED-CLOUD-PORTFOLIO.md) | OpenAI Sites 登录与账号云端持仓真值 | Accepted | owner-only 登录；D1 按 Sites 用户 ID 隔离；同账号跨设备；旧 IndexedDB 只经 JSON 显式迁移 |
| [ADR-046](ADR-046-SITES-VERCEL-PROVIDER-PROXY.md) | Sites 使用 Vercel 作为固定 provider 代理 | Amended by ADR-047 | Sites 保留 UI/登录/D1；五个 provider API 保持精确 CORS；Vercel 另提供公开只读 PWA 图标 |
| [ADR-047](ADR-047-PUBLIC-PWA-INSTALL-ICONS.md) | 受保护 Sites 使用公开只读的 PWA 安装图标 | Accepted | Sites 继续 owner-only；版本化图标从固定 Vercel origin 匿名读取，普通功能更新仍自动生效 |
| [ADR-048](ADR-048-UNIFIED-PORTFOLIO-CASH-POOL.md) | 所有股票买卖统一联动组合现金池 | Accepted | 无 BOXX/SGOV 特例；卖出净额进组合现金，买入总额从组合现金扣减；股票来源仍用于数量与成本 |
| [ADR-049](ADR-049-BUFFETT-FRAMEWORK-ADVISOR.md) | 巴菲特公开原则驱动的价值投资顾问 | Accepted | 非冒充方法论模拟；回答必须返回可验 framework lenses，基本面不足时输出证据缺口，空态披露完整运行时数据边界 |

## 当前绑定基线

1. PWA 交付；
2. Alpaca `delayed_sip` 股票行情；
3. 首页股票继续统一展示，不提供自由券商账户管理；启用 ADR-044/048 后，校准和买卖固定使用 IBKR/moomoo 股票来源，现金在产品中统一汇总为一个组合池；
4. 同一标的数量、成本分别求和后计算平均成本；
5. 未启用 v4 时保留旧按标的快照批次；确认校准后，v4 双券商账本以 BUY/SELL 和重复校准驱动统一 current 投影；
6. 成本录入同时支持平均成本和剩余总成本模式；
7. Sites Production 必须用 ChatGPT 登录；资产 current 以 D1 按稳定 Sites 用户 ID 隔离，同一账号跨设备读取同一组合；IndexedDB 只保留设备草稿与缓存；
8. 页面继续使用 App Router + React contract，部署构建改为 Vinext + Vite + Cloudflare Worker-compatible ESM；
9. 首页以统一组合总仓位为核心；
10. OpenAI Sites 是 UI、登录、D1 与主发布入口；Vercel/GitHub `main` 按 ADR-046 保留为 provider-only 后端，不接收账号 current 写入。
11. 行情估值跟随美股盘前、常规盘、盘后和 24/5 隔夜时段；前台每分钟刷新，休市显示最后有效价。
12. 首页不显示独立健康行情汇总卡；约 15 分钟延迟在总资产附近只披露一次。顶部仅保留总仓位、币种切换和更多操作，总资产下使用 2 × 2 核心指标，底部只保留“录入资产”。五列持仓表不显示逐行市场时段、行情日期时间、过期、上一有效价或隔夜提醒；名称/代码固定在左侧，其余列由整张表共享横向滑动。
13. 首页可手动导出当前活动资产 JSON v2/v3 副本；导出只读、不上传 Vercel provider、不改变 D1，不包含 previous、草稿、缓存或同步内部状态。
14. 首页为前 5、前 10、全部或单只资料提供“仅复制持仓资料”和“复制并打开 ChatGPT”两个目标；两者复用同一低噪音 USD 事实文本与范围。普通复制写入剪贴板并留在 PWA；ChatGPT 路径复制后通过 `https://chatgpt.com/?prompt=` 预填待发送 Prompt。均不自动发送或调用 OpenAI API；只有 ChatGPT 路径进入 `chatgpt.com` 外部数据边界。
15. 首页提供 USD / 人民币显示模式切换；人民币金额由未舍入 USD 真值和一笔有效 USD/CNY 汇率派生，不形成第二套成本或汇兑盈亏。汇率优先使用 Alpaca `USDCNY` 中间价，失败时使用 ECB 日参考交叉汇率；两个来源均不可用时继续显示 USD。
16. 旧 current 最多一条 IBKR USD 现金；v4 底层保留 IBKR/moomoo 已结算与待结算分量，但首页和交易预览只显示一条组合现金合计。IBKR 利息只用正已结算余额；其他分量、待结算和负现金排除。
17. 首页不设置独立今日入口或持仓表模式切换；2 × 2 核心指标中的“今日盈亏”主值为整个股票组合的估算金额，副值为组合涨跌幅；持仓表第四列固定为累计盈亏/收益率，第五列显示逐股今日涨幅与小字今日盈亏金额。现金完全排除，缺值不以零补齐。
18. 股票可见名称删除常见法律实体和证券类型后缀，例如 `Amazon.com, Inc.` 显示为 `Amazon`；股票代码、标的身份、保存名称、复制资料和辅助技术完整名称保持不变，表格左右留白同步收紧。
19. 持仓表头、全部股票行与单条组合现金行共用一个横向滚动位置；手势可从持仓区任意位置开始，固定名称/代码列不动，页面仍可纵向滚动。股票点按或长按打开当前模式操作，横向移动取消待触发长按并抑制随后点击。
20. JSON v2/v3 可在当前设备严格校验和预览后恢复到 positions/cash/broker 全空的登录账号。Sites 服务端在同一 D1 CAS 中重验文档、复查空目标并写入规范化 current；源 revision 不继承，固定 `revision=1`、`nextRevision=2`、`previous=null`。不合并、不覆盖，任何失败零变化，原始文件、草稿和缓存不进入 D1。
21. 组合结构分母为已定价股票市值加现金本金，缺价时明确部分口径；组合今日净额只在全部股票可计算时成立，绝对贡献占比按 `abs(单股变化) / Σ abs(可计算股票变化)` 计算，缺失不补 `0`。
22. 首页总资产使用 Robinhood-inspired 连续纯黑英雄层级；唯一“今日走势”使用 `feed=sip`、`15Min`、`split` 的当前持仓估算线，服务端只接收标的，数量、现金和组合计算留在本机。
23. 首页不显示 `1W / 1M / 3M / 1Y / ALL`、历史菜单或导入入口；`/history` 重定向首页，Controller 不读取或写入历史库。既有本机历史数据保留，重新启用需新决定。
24. Production 客户端不包含固定个人资产载荷或自动恢复调用；新账号保持空组合，只能手工录入或使用 ADR-031/044 的 JSON v2/v3 空账号恢复。旧 Vercel origin 的 current、历史数据和旧标记不改写，也不会被 Sites 自动读取。
25. 首页提供“组合分析”和“巴菲特框架顾问”两个独立入口与弹层。点按组合分析明确触发 current-only USD 六维体检和逐只行业/角色推断；打开顾问零请求，可直接输入，首次发送才建立完整固定快照，后续只附最近六轮成功历史。顾问是非冒充的公开价值投资原则模拟；每个回答必须选择可验 framework lenses，基本面不足时明确输出证据缺口。空态披露会发送的当前组合字段和不发送的身份/存储字段；无同意页或额外步骤。本机使用 Decimal 真值渲染数字，不伪造高级风险、外部归因、目标价、预测或直接交易指令，会话不持久化且不修改资产。
26. provider 服务继续使用严格 JSON/字段/实际字节、限流、固定上游、超时和响应上限；Vercel 只允许精确 Sites origin 的无 credentials CORS，Sites CSP 只增加固定 Vercel `connect-src`。provider 硬预算与无敏感日志原则继续有效。
27. 来源持仓账本必须经过校准确认才启用；买卖、费用、来源股票、统一组合现金变化和事件在同一 v4 current 写入中生效。JSON v3 保留 current 与事件，恢复只允许账号全 current 为空。
28. PWA 安装图标是公开只读静态资产：Sites 的 App identity、`start_url`、登录和 D1 不变；favicon、`apple-touch-icon` 与 manifest 图标从固定 Vercel `/icons/` 获取，CSP `img-src` 只增加该 origin，API CORS 不扩大。
29. BOXX、SGOV 与全部受支持股票使用同一交易现金公式。首页和交易预览只显示一条组合现金；买入扣除成交额与手续费，卖出增加成交额减手续费。券商只决定股票来源与剩余成本，底层现金分量仅为兼容、结算与 IBKR 利息口径保留。

历史收益/导入、券商 API、向已有账号 current 合并或覆盖、无人值守迁移、Service Worker 和完整离线不属于当前绑定范围。账号登录、D1 current 与跨设备读取由 ADR-045 进入范围；provider 双运行时由 ADR-046 进入范围。

## 维护规则

1. Accepted 方向变化时新增 ADR，不静默覆盖历史。
2. 旧代码和旧文档不能作为产品所有者确认的证据。
3. Proposed 不构成实现、创建账号、购买服务或部署授权。
