#!/usr/bin/env python3
# send_brief.py — Format brief.json into a beautiful HTML email and send via Gmail SMTP
# Called by GitHub Actions after run_pipeline.py completes.
# Requires: GMAIL_USER and GMAIL_APP_PASSWORD secrets in GitHub repo.

import json, os, smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

# ── Config ────────────────────────────────────────────────────────
GMAIL_USER     = os.environ['GMAIL_USER']          # zikash@gmail.com
GMAIL_PASSWORD = os.environ['GMAIL_APP_PASSWORD']  # 16-char app password
TO_EMAILS      = ['zikash@gmail.com', 'vikash.rajan@redpincompany.com']
BRIEF_PATH     = 'public/brief.json'

DOMAIN_COLORS = {
    'fintech':   '#2D9B8F',
    'dev':       '#7C5CFF',
    'trading':   '#D98E2B',
    'marketing': '#C2476B',
    'general':   '#6B6578',
}
WORKFLOW_LABELS = {
    'redpin':     ('⬡', 'Redpin'),
    'nifty':      ('◈', 'NIFTY'),
    'reel_iq':    ('◎', 'Reel IQ'),
    'automation': ('⟳', 'Automation'),
    'general':    ('◆', 'General'),
}
URG_COLORS = { 'high':'#C2476B', 'medium':'#D98E2B', 'low':'#2D9B8F' }
SIG_COLORS = { 'strong':'#2D9B8F', 'moderate':'#D98E2B', 'weak':'#C2476B' }

def load_brief():
    with open(BRIEF_PATH) as f:
        return json.load(f)

def plain_text(brief):
    hr = '─' * 56
    lines = [
        f"GITHUB INTELLIGENCE STATION — MORNING BRIEF",
        f"{brief['briefing_date']} · Signal: {brief['signal_quality'].upper()} · {brief['total_scanned']} repos scanned",
        "", hr, brief['executive_summary'], "", "TOP PICKS", hr,
    ]
    for p in brief.get('top_picks', []):
        wf = WORKFLOW_LABELS.get(p.get('primary_workflow','general'), ('◆','General'))
        lines += [
            f"\n{p['rank']}. {p['headline']}",
            f"   {wf[1]} · {p['urgency'].upper()}",
            f"   Why now: {p['why_now']}",
            f"   → {p['action']}",
            f"   https://github.com/{p['repo_id']}",
        ]
    lines += ["", hr,
        "View full brief: https://thesoulofsuccess.github.io/github-intel-station",
        "The Intelligence Station · github.com/Thesoulofsuccess/github-intel-station"]
    return "\n".join(lines)

def html_email(brief):
    date     = brief.get('briefing_date', datetime.now().strftime('%Y-%m-%d'))
    sig      = brief.get('signal_quality', 'moderate')
    sig_col  = SIG_COLORS.get(sig, '#6B6578')
    summary  = brief.get('executive_summary', '')
    scanned  = brief.get('total_scanned', 0)
    picks    = brief.get('top_picks', [])

    picks_html = ''
    for p in picks:
        wf_key   = p.get('primary_workflow', 'general')
        wf       = WORKFLOW_LABELS.get(wf_key, ('◆', 'General'))
        wf_col   = DOMAIN_COLORS.get(wf_key, '#6B6578')
        urg_col  = URG_COLORS.get(p.get('urgency','low'), '#6B6578')
        picks_html += f"""
        <tr>
          <td style="padding:18px 0; border-bottom:1px solid #2A2833; vertical-align:top;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:32px; vertical-align:top; padding-top:3px;">
                  <span style="font-family:monospace; font-size:20px; color:#2A2833; font-weight:700;">{p['rank']}</span>
                </td>
                <td style="vertical-align:top;">
                  <div style="margin-bottom:6px;">
                    <span style="font-family:Georgia,serif; font-size:16px; font-weight:500; color:#F4F1EA; line-height:1.3;">{p['headline']}</span>
                  </div>
                  <div style="margin-bottom:8px;">
                    <span style="font-family:monospace; font-size:10px; color:{wf_col}; border:1px solid {wf_col}44; padding:2px 7px; border-radius:3px; margin-right:6px;">{wf[0]} {wf[1]}</span>
                    <span style="font-family:monospace; font-size:10px; color:{urg_col}; letter-spacing:1px; text-transform:uppercase;">{p.get('urgency','')}</span>
                  </div>
                  <div style="font-size:13px; color:#A8A2B8; margin-bottom:6px; line-height:1.5;">{p.get('why_now','')}</div>
                  <div style="font-size:13px; color:#F4F1EA; font-style:italic; line-height:1.5; margin-bottom:10px;">→ {p.get('action','')}</div>
                  <a href="https://github.com/{p.get('repo_id','')}" style="font-family:monospace; font-size:11px; color:#6B6578; text-decoration:none;">
                    github.com/{p.get('repo_id','')}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>"""

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0E0D13;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0D13;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="padding-bottom:28px; border-bottom:1px solid #2A2833;">
            <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px;">
              <span style="font-family:monospace; font-size:10px; letter-spacing:3px; color:#6B6578; text-transform:uppercase;">
                The Intelligence Station
              </span>
            </div>
            <h1 style="margin:0 0 10px; font-size:36px; font-weight:600; letter-spacing:-1px; line-height:1.1; color:#F4F1EA;">
              What's worth<br><em style="font-weight:400;">your attention</em> today.
            </h1>
            <p style="margin:0; font-size:14px; color:#A8A2B8; line-height:1.6;">
              Five agents ranged all of GitHub. Here's what matters.
            </p>
          </td>
        </tr>

        <!-- Meta bar -->
        <tr>
          <td style="padding:16px 0; border-bottom:1px solid #2A2833;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;">
                  <span style="font-family:monospace; font-size:10px; letter-spacing:2px; color:#6B6578; text-transform:uppercase;">
                    Morning Brief · {date}
                  </span>
                </td>
                <td style="padding-right:16px;">
                  <span style="font-family:monospace; font-size:9px; color:{sig_col}; border:1px solid {sig_col}44; padding:2px 8px; border-radius:3px; letter-spacing:1px; text-transform:uppercase;">
                    {sig} signal
                  </span>
                </td>
                <td>
                  <span style="font-family:monospace; font-size:10px; color:#6B6578;">{scanned} repos scanned</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Executive Summary -->
        <tr>
          <td style="padding:24px 0; border-bottom:1px solid #2A2833;">
            <p style="margin:0; font-size:15px; line-height:1.75; color:#F4F1EA;">{summary}</p>
          </td>
        </tr>

        <!-- Top picks label -->
        <tr>
          <td style="padding:20px 0 4px;">
            <span style="font-family:monospace; font-size:9px; letter-spacing:2.5px; color:#6B6578; text-transform:uppercase;">
              Top picks · ranked by urgency × opportunity
            </span>
          </td>
        </tr>

        <!-- Picks -->
        <tr>
          <td>
            <table width="100%" cellpadding="0" cellspacing="0">
              {picks_html}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:28px 0 0; text-align:center;">
            <a href="https://thesoulofsuccess.github.io/github-intel-station"
              style="display:inline-block; background:#16151D; border:1px solid #2A2833; color:#F4F1EA;
                font-family:monospace; font-size:12px; letter-spacing:1px; padding:12px 28px;
                border-radius:24px; text-decoration:none;">
              Open full brief →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 0 0; border-top:1px solid #2A2833; margin-top:28px;">
            <p style="margin:0; font-size:11px; color:#6B6578; font-style:italic; line-height:1.7; font-family:monospace;">
              The Intelligence Station · Every Monday 6:30 AM IST ·
              <a href="https://github.com/Thesoulofsuccess/github-intel-station" style="color:#6B6578;">github.com/Thesoulofsuccess/github-intel-station</a><br>
              Rate picks in the app to teach the Learner. Next brief adapts to your feedback.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

def send(brief):
    subject = f"◆ Intelligence Brief · {brief['briefing_date']} · {brief['signal_quality'].upper()} signal · {len(brief.get('top_picks',[]))} picks"
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From']    = GMAIL_USER
    msg['To']      = ', '.join(TO_EMAILS)
    msg.attach(MIMEText(plain_text(brief), 'plain'))
    msg.attach(MIMEText(html_email(brief), 'html'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as s:
        s.login(GMAIL_USER, GMAIL_PASSWORD)
        s.sendmail(GMAIL_USER, TO_EMAILS, msg.as_string())
    print(f"✅ Brief sent to: {', '.join(TO_EMAILS)}")

if __name__ == '__main__':
    brief = load_brief()
    send(brief)
    print(f"   Subject: ◆ Intelligence Brief · {brief['briefing_date']} · {brief['signal_quality'].upper()} signal")
