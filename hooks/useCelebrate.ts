import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { useCallback } from "react";

type CelebrationType =
  | "win"
  | "stake_placed"
  | "first_prediction"
  | "win_streak"
  | "claim";

interface CelebrateOptions {
  type: CelebrationType;
  pollTitle?: string;
  amount?: number;
  winnings?: number;
  streakCount?: number;
  pollId?: string;
}

const celebrationMessages: Record<CelebrationType, (opts: CelebrateOptions) => string> = {
  win: (opts) =>
    `Just called it right on "${opts.pollTitle}" and won ${opts.winnings?.toFixed(2)} USDC on @showstakr`,

  stake_placed: (opts) =>
    `I'm putting my money where my mouth is - staked ${opts.amount?.toFixed(2)} USDC on "${opts.pollTitle}" on @showstakr`,

  first_prediction: (opts) =>
    `Made my first prediction on @showstakr! Let's see if I called it right...`,

  win_streak: (opts) =>
    `${opts.streakCount} wins in a row on @showstakr - who wants to challenge me?`,

  claim: (opts) =>
    `Just claimed ${opts.winnings?.toFixed(2)} USDC in winnings from @showstakr`,
};

export function useCelebrate() {
  const { composeCast } = useComposeCast();

  const celebrate = useCallback((options: CelebrateOptions) => {
    const message = celebrationMessages[options.type](options);
    const appUrl = typeof window !== "undefined"
      ? options.pollId
        ? `${window.location.origin}/polls/${options.pollId}`
        : window.location.origin
      : "https://showstakr.com";

    composeCast({
      text: message,
      embeds: [appUrl],
    });
  }, [composeCast]);

  return { celebrate };
}
