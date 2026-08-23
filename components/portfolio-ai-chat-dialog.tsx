"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  MAX_PORTFOLIO_CONSULTATION_HISTORY_MESSAGES,
  MAX_PORTFOLIO_CONSULTATION_QUESTION_CHARS,
  type PortfolioConsultationHistoryMessage,
  type PortfolioConsultationRequest,
} from "../application/ai/portfolio-consultation-api.ts";
import {
  PortfolioConsultationClientError,
  requestPortfolioConsultation,
} from "../application/ai/browser/portfolio-consultation-client.ts";
import { Decimal, deriveCnyAmount } from "../domain/index.ts";
import {
  createPortfolioConsultationChatTurnRequest,
  createPortfolioConsultationRequest,
} from "../ui/portfolio-consultation-context.ts";
import type { PortfolioCopySource } from "../ui/portfolio-copy-text.ts";
import type { PortfolioInsights } from "../ui/portfolio-insights.ts";
import { formatCny, formatUsd } from "../ui/position-preview.ts";
import { containModalFocus } from "./modal-accessibility.ts";

interface PortfolioAiChatDialogProps {
  readonly insights: PortfolioInsights;
  readonly portfolioSource: PortfolioCopySource | null;
  readonly displayCurrency: "USD" | "CNY";
  readonly usdCnyRate: string | null;
  readonly onClose: () => void;
}

interface PortfolioChatMessage extends PortfolioConsultationHistoryMessage {
  readonly id: number;
  readonly evidenceRefs: readonly string[];
}

const MAX_VISIBLE_CHAT_MESSAGES = 24;

function percent(value: string | null, digits = 2): string {
  return value === null
    ? "—"
    : `${new Decimal(value).mul(100).toFixed(digits)}%`;
}

function displayAmount(
  valueUsd: string | null,
  currency: "USD" | "CNY",
  usdCnyRate: string | null,
): string {
  if (valueUsd === null) {
    return "—";
  }
  if (currency === "CNY" && usdCnyRate !== null) {
    return formatCny(deriveCnyAmount(valueUsd, usdCnyRate).cnyAmount);
  }
  return formatUsd(valueUsd);
}

function signedDisplayAmount(
  valueUsd: string | null,
  currency: "USD" | "CNY",
  usdCnyRate: string | null,
): string {
  if (valueUsd === null) {
    return "—";
  }
  const value = new Decimal(valueUsd);
  if (value.isZero()) {
    return displayAmount("0", currency, usdCnyRate);
  }
  return `${value.isPositive() ? "+" : "−"}${displayAmount(
    value.abs().toString(),
    currency,
    usdCnyRate,
  )}`;
}

function chatErrorMessage(error: unknown): string {
  if (
    error instanceof PortfolioConsultationClientError &&
    error.code === "RATE_LIMITED"
  ) {
    return "请求较多，请稍后重试。";
  }
  return "暂时无法回答，请重试。";
}

export function PortfolioAiChatDialog({
  insights,
  portfolioSource,
  displayCurrency,
  usdCnyRate,
  onClose,
}: PortfolioAiChatDialogProps) {
  const dialog = useRef<HTMLElement | null>(null);
  const input = useRef<HTMLTextAreaElement | null>(null);
  const messageList = useRef<HTMLDivElement | null>(null);
  const initialRequest = useRef<PortfolioConsultationRequest | null>(null);
  const usdCnyRateAtStart = useRef<string | null>(null);
  const generation = useRef(0);
  const messageSequence = useRef(0);
  const [messages, setMessages] = useState<readonly PortfolioChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentDialog = dialog.current;
    if (currentDialog === null) {
      return;
    }
    const releaseFocus = containModalFocus(currentDialog);
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      generation.current += 1;
      document.removeEventListener("keydown", closeOnEscape);
      releaseFocus();
    };
  }, [onClose]);

  useEffect(() => {
    const currentList = messageList.current;
    if (currentList !== null) {
      currentList.scrollTop = currentList.scrollHeight;
    }
  }, [isSending, messages, pendingQuestion]);

  const evidenceLabel = useCallback(
    (ref: string): string | null => {
      const request = initialRequest.current;
      if (request === null) {
        return null;
      }
      const { portfolio } = request;
      const { summary } = portfolio;
      const rate = usdCnyRateAtStart.current;
      if (ref.startsWith("position.")) {
        const positionId = ref.slice("position.".length);
        const position = portfolio.positions.find(
          (candidate) => candidate.positionId === positionId,
        );
        if (position === undefined) {
          return null;
        }
        if (position.marketValueUsd === null) {
          return `${position.symbol} · 未计价`;
        }
        return `${position.symbol} · 仓位 ${percent(
          position.assetWeight,
        )} · 浮动盈亏 ${signedDisplayAmount(
          position.unrealizedPnlUsd,
          displayCurrency,
          rate,
        )}`;
      }
      switch (ref) {
        case "portfolio.structure":
          return `总资产 ${displayAmount(
            summary.totalAssetsUsd,
            displayCurrency,
            rate,
          )} · 股票 ${summary.stockPositionCount} 只`;
        case "portfolio.concentration":
          return `Top 1 ${percent(summary.top1Weight)} · Top 3 ${percent(
            summary.top3Weight,
          )} · Top 5 ${percent(summary.top5Weight)}`;
        case "portfolio.performance":
          return `累计浮动盈亏 ${signedDisplayAmount(
            summary.pricedUnrealizedPnlUsd,
            displayCurrency,
            rate,
          )} · ${percent(summary.pricedUnrealizedReturn)}`;
        case "portfolio.daily":
          return summary.dailyNetEffectUsd === null
            ? `今日覆盖 ${summary.dailyCalculablePositionCount}/${summary.stockPositionCount} 只`
            : `今日净贡献 ${signedDisplayAmount(
                summary.dailyNetEffectUsd,
                displayCurrency,
                rate,
              )}`;
        case "portfolio.cash":
          return summary.cashBalanceUsd === null
            ? "当前未记录 USD 现金"
            : `USD 现金 ${displayAmount(
                summary.cashBalanceUsd,
                displayCurrency,
                rate,
              )} · ${percent(summary.cashWeight)}`;
        case "portfolio.data":
          return `估值覆盖 ${summary.pricedPositionCount}/${summary.stockPositionCount} 只 · 今日覆盖 ${summary.dailyCalculablePositionCount}/${summary.stockPositionCount} 只`;
        default:
          return null;
      }
    },
    [displayCurrency],
  );

  const submitQuestion = useCallback(
    async (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      if (isSending) {
        return;
      }
      const trimmedQuestion = question.trim();
      if (trimmedQuestion.length === 0) {
        input.current?.focus();
        return;
      }
      if (portfolioSource === null) {
        setError("当前组合暂不可用。");
        return;
      }
      const history = messages
        .slice(-MAX_PORTFOLIO_CONSULTATION_HISTORY_MESSAGES)
        .map(
          (message): PortfolioConsultationHistoryMessage => ({
            role: message.role,
            content: message.content,
          }),
        );
      let request: PortfolioConsultationRequest;
      try {
        if (initialRequest.current === null) {
          request = createPortfolioConsultationRequest(
            portfolioSource,
            insights,
            {
              mode: "CHAT",
              history,
              question: trimmedQuestion,
            },
          );
          initialRequest.current = request;
          usdCnyRateAtStart.current = usdCnyRate;
        } else {
          request = createPortfolioConsultationChatTurnRequest(
            initialRequest.current,
            history,
            trimmedQuestion,
          );
        }
      } catch {
        setError("当前组合暂不可用。");
        return;
      }

      const currentGeneration = generation.current + 1;
      generation.current = currentGeneration;
      setIsSending(true);
      setError(null);
      setPendingQuestion(trimmedQuestion);
      setQuestion("");
      try {
        const result = await requestPortfolioConsultation(request);
        const answer = result.answer;
        if (generation.current !== currentGeneration || answer === null) {
          return;
        }
        const userId = messageSequence.current + 1;
        const assistantId = userId + 1;
        messageSequence.current = assistantId;
        setMessages((current) =>
          [
            ...current,
            {
              id: userId,
              role: "user" as const,
              content: trimmedQuestion,
              evidenceRefs: [],
            },
            {
              id: assistantId,
              role: "assistant" as const,
              content: answer.text,
              evidenceRefs: answer.evidenceRefs,
            },
          ].slice(-MAX_VISIBLE_CHAT_MESSAGES),
        );
        setPendingQuestion(null);
      } catch (caught) {
        if (generation.current === currentGeneration) {
          setError(chatErrorMessage(caught));
          setPendingQuestion(null);
          setQuestion(trimmedQuestion);
        }
      } finally {
        if (generation.current === currentGeneration) {
          setIsSending(false);
          requestAnimationFrame(() => input.current?.focus());
        }
      }
    },
    [insights, isSending, messages, portfolioSource, question, usdCnyRate],
  );

  const onQuestionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        event.currentTarget.form?.requestSubmit();
      }
    },
    [],
  );

  return (
    <div
      className="action-sheet-backdrop portfolio-ai-chat-backdrop"
      role="presentation"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="portfolio-ai-chat-dialog"
        ref={dialog}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="portfolio-ai-chat-dialog-title"
      >
        <header className="portfolio-ai-chat-dialog__header">
          <h2 id="portfolio-ai-chat-dialog-title">AI 对话</h2>
          <button type="button" onClick={onClose}>
            完成
          </button>
        </header>

        <div
          className="portfolio-ai-chat-dialog__messages"
          ref={messageList}
          aria-live="polite"
        >
          {messages.map((message) => (
            <article
              className={`portfolio-ai-chat-dialog__message portfolio-ai-chat-dialog__message--${message.role}`}
              key={message.id}
            >
              <p>{message.content}</p>
              {message.role === "assistant" && message.evidenceRefs.length > 0 ? (
                <div className="portfolio-ai-evidence-list">
                  {message.evidenceRefs.flatMap((ref) => {
                    const label = evidenceLabel(ref);
                    return label === null
                      ? []
                      : [
                          <span className="portfolio-ai-evidence" key={ref}>
                            {label}
                          </span>,
                        ];
                  })}
                </div>
              ) : null}
            </article>
          ))}
          {pendingQuestion !== null ? (
            <article className="portfolio-ai-chat-dialog__message portfolio-ai-chat-dialog__message--user">
              <p>{pendingQuestion}</p>
            </article>
          ) : null}
          {isSending ? (
            <div className="portfolio-ai-chat-dialog__thinking" role="status">
              <span className="portfolio-ai-loading__mark" aria-hidden="true" />
              <span>正在回答</span>
            </div>
          ) : null}
        </div>

        <form
          className="portfolio-ai-chat-dialog__composer"
          onSubmit={(event) => void submitQuestion(event)}
        >
          {error !== null ? (
            <p className="portfolio-ai-chat-dialog__error" role="alert">{error}</p>
          ) : null}
          <div>
            <label className="sr-only" htmlFor="portfolio-ai-chat-input">
              输入问题
            </label>
            <textarea
              id="portfolio-ai-chat-input"
              ref={input}
              data-autofocus
              value={question}
              maxLength={MAX_PORTFOLIO_CONSULTATION_QUESTION_CHARS}
              rows={2}
              disabled={isSending}
              placeholder="输入问题"
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={onQuestionKeyDown}
            />
            <button
              type="submit"
              disabled={isSending || question.trim().length === 0}
            >
              发送
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
