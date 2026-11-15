# Inbox Signal

**Live demo:** https://rocketsdr-inbox-signal.vercel.app

Inbox Signal sorts replies to cold email into three buckets and shows the evidence for each one:

| Bucket | Labels | Counts as proof the email reached an inbox? |
|---|---|---|
| Human reply | interested, referral, not now, not interested, unsubscribe, other | Yes (but it also depends on the copy) |
| Mailbox auto reply | out of office, left company, auto acknowledgement | Yes (and it ignores the copy) |
| Pre-inbox notice | bounce, delayed, gateway hold / sender verification | **No** |

It also includes a simulator that shows how a labelling leak changes a "link vs no link" deliverability readout.

I built it as proof of work for RocketSDR (YC W21). I'm not affiliated with them and it uses none of their data.

## The problem

RocketSDR's post [Do Links in Cold Emails Hurt Deliverability?](https://www.rocketsdr.ai/blog/do-links-hurt-cold-email-deliverability) (7 Nov 2026) estimates inbox placement from replies. It leans on **automatic replies** (out of office, "I've left the company", auto acknowledgements) because they "track whether the email arrived, not whether it persuaded". The headline result is that Microsoft-hosted prospects sent 0.32× as many automatic replies when the first email had a link.

That signal is only clean if no machine notice that fires *before* the inbox lands in the automatic bucket. The same post's own numbers show why this matters: 10,773 of 138,530 sends bounced (7.8%), while automatic reply rates in its Table 3 run from 0.19% to 1.13% of delivered emails. Bounce, delay and gateway notices outnumber real auto replies, so even a small leak can swamp the signal.

The reply labelling I found in the public help docs of Instantly, Smartlead, lemlist, Outreach, Salesloft, Apollo and Reply.io uses buckets like Interested / Not interested / Out of office / Wrong person / Unsubscribe. None of the pages I read keeps "notice before the inbox" apart from "auto reply from the recipient's mailbox". This repo is about that split.

## Method

1. **Cut the quoted thread** at Gmail (`On … wrote:`), Outlook (`From:` then `Sent:`), `-----Original Message-----` or `>` markers. Text below the cut was written by the sender and often contains "unsubscribe" or "out of office".
2. **Machine notice?** A delivery status report header (RFC 3464 `report-type=delivery-status`), a daemon, postmaster or gateway sender, or an SMTP status code, combined with hold, delay or failure wording. These become `gateway_hold`, `delayed` or `bounce`.
3. **Auto reply or a person?** Auto evidence (the RFC 3834 `Auto-Submitted` header, auto-reply subject lines in English, German, French, Spanish and Italian, "no longer with" wording, ticket wording, away wording, template phrases) is weighed against signs that a person answered the pitch ("can you", "send me", "follow up in Q2", "not the right person"). Close calls get a review flag.
4. **Intent** for human replies, checked in a fixed order: unsubscribe, referral, not now, not interested, interested, other.

The rules are plain JavaScript (`src/classify.js`) with no dependencies, and the same file runs in the browser and in Node. Visitors don't need an API key, and nothing they paste leaves the browser.

### Baselines
- **Keyword rules:** a daemon sender counts as a bounce, any "out of office / auto reply / on leave / vacation" word counts as OOO, and there is no quote cutting.
- **Headers only:** the RFC 3834 / RFC 3464 headers and daemon senders, nothing else.

## Evaluation

- `data/dev.js`: 58 synthetic replies. I wrote and tuned the rules against this set.
- `data/blind.js`: 40 synthetic replies. This set was committed **before any classifier code existed** (commit `81359b2`), never edited, and scored once. The output is saved unedited in `eval/blind_run_2026-11-15.txt`.

Blind set, one run:

| Method | Right bucket | Exact label (12) | Notices counted as inbox signal | Auto counted as human | Human counted as auto |
|---|---|---|---|---|---|
| Inbox Signal | 40/40 | 40/40 | 0 | 0 | 0 |
| Keyword rules | 33/40 | 16/40 | 2 | 4 | 1 |
| Headers only | 33/40 | 10/40 | 2 | 5 | 0 |

On the dev set (which the rules were tuned on) Inbox Signal scores 58/58, keyword rules 43/58 and headers only 46/58.

### Simulator (`src/simulate.js`)

The simulator runs 200 times. Each run has 40 campaigns × 3 recipient providers × 2 arms × 400 sends:

- True human and automatic reply rates per arm are the post's Table 3 pooled rates.
- The bounce rate comes from the post's Table 1.
- Gateway hold, delay and leak rates are assumptions you set with sliders.
- Every simulated reply gets a text sampled from the blind set. Each method's real output on that text decides its bucket.
- The link ÷ no link ratio is computed with Mantel-Haenszel across campaigns, as in the post.

What I found (default seed):
- With no leak, the three methods give the same median ratios. The baselines' errors on these samples mostly **widen the spread**: the Google auto-reply ratio's 5 to 95% range goes from 1.17–1.79 with true labels to 0.92–2.31 with keyword or header labels, which now crosses 1.0.
- **What-if leak:** if 5% of bounce, delay and hold notices are filed as automatic replies, the Microsoft auto-reply ratio reads 0.70 instead of 0.41. Add 2% extra rejections when the email has a link and it reads 0.82 (true 0.42). Raise the leak to 10% with the same 2% and it reads 0.97, so the link penalty disappears from the readout.

## Honest limits

- **Synthetic data only, and one author.** I wrote both sets and the rules. A perfect blind score means the rules cover the patterns I thought of, not that they work on real inboxes. With 40/40 correct, the 95% lower bound on accuracy is still only about 91%.
- **Rules, not a model.** They're explainable and fast, but they will miss phrasings nobody wrote down. The next step is a few hundred real replies labelled by two people, then a small classifier with these rules kept as a check.
- **The simulator is a what-if tool.** Its "true" ratios are raw pooled rate ratios (Google auto 0.89 ÷ 0.62 ≈ 1.4), not the post's within-campaign ratios (Google 1.07). It shows the direction and rough size of a bias, not RocketSDR's actual error.
- Whether delay and gateway notices reach the sender's reply inbox depends on the sending setup.
- The auto-reply subject prefixes in other languages are common forms. I didn't check them against every Outlook build.

## Run it

```bash
npm test               # 21 tests, Node 20+ (node:test, no dependencies)
npm run eval           # dev set scorecard
npm run eval:blind     # blind set scorecard
npx serve .            # open the web app locally
```

## Related

[AI Outbound Agent](https://github.com/techi101/ai-outbound-agent) researches companies, scores fit and drafts outreach, with a critic pass that rejects generic drafts. That covers what happens before the send. Inbox Signal covers what comes back after it.

Built by Nitesh Kumar Yadav, B.Tech ECE (AI and ML), NSUT Delhi. MIT licence.
