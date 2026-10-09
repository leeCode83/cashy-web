/**
 * Every user-facing string in the app lives here (brief §7.4), so copy stays
 * consistent and can be edited in one place. Rules baked into this file:
 * Title Case for buttons, tabs and page titles; sentence case for messages;
 * curly apostrophes; `…` (single character) for running states.
 *
 * Message shape follows brief §7.3: `title` (≤6 words, what happened) +
 * `body` (≤2 sentences, why and what it means for your money) + optional
 * `action` (specific verb, Title Case).
 *
 * Functions take pre-formatted strings (use {@link ../lib/money.formatIDRX})
 * so this file never formats numbers itself.
 */

/** A status message with an optional primary action. */
export interface Message {
  /** What happened — max 6 words. */
  title: string
  /** Why it happened and what it means for the user's money — max 2 sentences. */
  body: string
  /** Specific verb for the primary action, e.g. `Try Again`. */
  action?: string
}

export const messages = {
  /** Step 1 — Verify. */
  verify: {
    waitingSignIn: {
      title: 'Waiting for you to sign in',
      body: 'Finish signing in to AdSense in the window that just opened.',
      action: 'Reopen Window',
    } satisfies Message,
    sealing: {
      title: 'Sealing your session…',
      body: 'This takes about 20 seconds. We never see your password.',
    } satisfies Message,
    stillWorking: {
      title: 'Still working…',
      body: 'This can take up to a minute. Please keep this tab open.',
      action: 'Cancel',
    } satisfies Message,
    /** @param balance Final balance formatted with formatIDRX. */
    verified: (balance: string): Message => ({
      title: 'Balance verified',
      body: `Final balance ${balance}, payable on the 21st.`,
      action: 'Continue',
    }),
    cancelled: {
      title: 'Sign-in was cancelled',
      body: 'Nothing was shared. Try again when you’re ready.',
      action: 'Try Again',
    } satisfies Message,
    sealFailed: {
      title: 'We couldn’t seal your session',
      body: 'Your data wasn’t saved. Check your connection and try again.',
      action: 'Try Again',
    } satisfies Message,
    noFinalBalance: {
      title: 'No final balance yet',
      body: 'Google posts your balance around the 3rd. Come back then to cash out.',
      action: 'Back To Dashboard',
    } satisfies Message,
    lowerLimit: {
      title: 'Lower limit with this method',
      body: 'Using YouTube Analytics, you can take up to 40% of your balance.',
      action: 'Use AdSense Instead',
    } satisfies Message,
  },

  /** Step 2 — Amount. */
  amount: {
    /** @param max Limit formatted with formatIDRX. */
    overLimit: (max: string): Message => ({
      title: `Maximum is ${max}.`,
      body: 'Lower the amount to continue.',
    }),
    /** @param min Minimum formatted with formatIDRX. */
    underMinimum: (min: string): Message => ({
      title: `Minimum is ${min}.`,
      body: '',
    }),
    invalid: {
      title: 'Enter an amount, like 500,000.00.',
      body: '',
    } satisfies Message,
    whyLimit: {
      title: 'Why this limit?',
      body: 'Your limit comes from your last 12 months of earnings and how steady they are. You can take up to 70% of your final balance.',
    } satisfies Message,
  },

  /** Step 3 — Review. */
  review: {
    waitingApproval: {
      title: 'Waiting for you to approve',
      body: 'Approve the connection in the window that just opened.',
      action: 'Reopen Window',
    } satisfies Message,
    linked: {
      title: 'Account linked',
      body: 'Account ending in 4821.',
    } satisfies Message,
    approvalFailed: {
      title: 'The connection wasn’t approved',
      body: 'Nothing was set up and no funds moved. Try again to continue.',
      action: 'Try Again',
    } satisfies Message,
    /** Button label while the advance is being sent. */
    sending: 'Sending…',
    alreadyFunded: {
      title: 'This payout is already funded',
      body: 'Another lender has advanced it. Nothing was charged.',
      action: 'Back To Dashboard',
    } satisfies Message,
    sendFailed: {
      title: 'Cash out didn’t go through',
      body: 'Your balance is unchanged and nothing was charged.',
      action: 'Try Again',
    } satisfies Message,
    /** Written reason shown below the disabled primary button — never a tooltip-only hint. */
    disabledReason: 'Link your payout account and accept the repayment terms to continue.',
    consent: 'I allow Cashy to collect repayment from this account on Oct 21, when my payout arrives.',
    connectPayout: 'Connect Payout Account',
    cashOutNow: 'Cash Out Now',
  },

  /** Step 4 — Done. */
  done: {
    /** @param amount Advance amount formatted with formatIDRX. */
    onItsWay: (amount: string): Message => ({
      title: 'Money’s on its way',
      body: `${amount} is heading to your account.`,
    }),
    /**
     * @param amount Advance amount formatted with formatIDRX.
     * @param repay Repayment amount formatted with formatIDRX.
     */
    received: (amount: string, repay: string): Message => ({
      title: 'Money received',
      body: `${amount} is in your account. We’ll collect ${repay} automatically on Oct 21.`,
    }),
    backToDashboard: 'Back To Dashboard',
    viewReceipt: 'View Receipt',
  },

  /** Creator dashboard and history. */
  creator: {
    /** @param repay Repayment amount formatted with formatIDRX. */
    repayScheduled: (repay: string): Message => ({
      title: 'Repayment on Oct 21',
      body: `We’ll collect ${repay} from your linked payout account when your payout arrives.`,
    }),
    /**
     * @param repay Repayment amount formatted with formatIDRX.
     * @param keep Amount the creator kept from the payout, formatted with formatIDRX.
     */
    repaidOnTime: (repay: string, keep: string): Message => ({
      title: 'Repaid on time',
      body: `${repay} was collected. You received ${keep}. Your credit record was updated.`,
    }),
    repayFailed: {
      title: 'Auto-repay didn’t go through',
      body: 'We couldn’t collect from your payout account. Make sure your payout has arrived, then retry before Oct 23.',
      action: 'Retry Repayment',
    } satisfies Message,
    activeAdvanceHint: 'You have an active advance. You can cash out again after it’s repaid on Oct 21.',
  },

  /** LP vault and position. Sides here may use technical wording (addresses, hashes). */
  lp: {
    connectFirst: {
      title: 'Connect a wallet to deposit',
      body: '',
      action: 'Connect Wallet',
    } satisfies Message,
    wrongNetwork: {
      title: 'Wrong network',
      body: 'Switch your wallet to the right network to continue.',
      action: 'Switch Network',
    } satisfies Message,
    /** @param balance Wallet balance formatted with formatIDRX. */
    insufficient: (balance: string): Message => ({
      title: 'You don’t have enough IDRX.',
      body: `Your balance is ${balance}.`,
    }),
    /** @param spaceLeft Remaining tier capacity formatted with formatIDRX. */
    overCapacity: (spaceLeft: string): Message => ({
      title: `Only ${spaceLeft} of space is left in Senior.`,
      body: '',
    }),
    juniorRisk: {
      title: 'Junior takes losses first',
      body: 'If advances aren’t repaid, Junior absorbs losses before other tiers. You can lose part of your deposit.',
    } satisfies Message,
    juniorRiskAck: 'I understand this risk',
    confirmInWallet: {
      title: 'Confirm in your wallet',
      body: 'Approve the deposit in your wallet to continue.',
    } satisfies Message,
    waitingConfirmation: {
      title: 'Waiting for confirmation…',
      body: 'This usually takes under a minute.',
    } satisfies Message,
    /** @param amount Deposit amount formatted with formatIDRX. @param tier Tier name. */
    deposited: (amount: string, tier: string): Message => ({
      title: 'Deposit confirmed',
      body: `${amount} added to ${tier}.`,
    }),
    rejected: {
      title: 'You rejected the request',
      body: 'Nothing was deposited.',
      action: 'Try Again',
    } satisfies Message,
    depositFailed: {
      title: 'Deposit failed',
      body: 'The transaction didn’t go through and no funds moved.',
      action: 'Try Again',
    } satisfies Message,
    copied: 'Copied',
    connectWallet: 'Connect Wallet',
    deposit: 'Deposit',
  },

  /** Global conditions — banners that persist until the condition clears. */
  global: {
    offline: {
      title: 'You’re offline',
      body: 'We’ll reconnect automatically. Your progress is saved.',
    } satisfies Message,
    signedOut: {
      title: 'You were signed out',
      body: 'Sign in again to continue. Your progress was saved.',
      action: 'Sign In',
    } satisfies Message,
    genericError: {
      title: 'Something went wrong on our side',
      body: 'Nothing was charged. Try again in a moment.',
      action: 'Try Again',
    } satisfies Message,
  },
} as const
