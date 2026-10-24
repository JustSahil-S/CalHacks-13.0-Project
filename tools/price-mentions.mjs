// Shared test for "this review talks about price". Used by the scanner and the backtest,
// so real reviews and simulated reviews are measured the same way.
export const PRICE_RE =
  /\b(pric(e|es|ey|ier|y)|expensive|overpriced|cost(s|ly)?|afford|raised|increase[sd]?|hike|used to be|value for)\b|\$\s?\d/i;

export const CHANGE_RE =
  /(used to (be|cost)|raised (their |the )?prices?|price(s)? (went|have gone|has gone) up|price (increase|hike)|(more|so much more) expensive (now|than before)|now (it'?s|costs?) \$?\d|went up to \$?\d)/i;

export const mentionsPrice = text => PRICE_RE.test(text ?? '');
export const mentionsPriceChange = text => CHANGE_RE.test(text ?? '');
