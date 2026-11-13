/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getAccessToken } from './googleAuth';

export interface EmailPayload {
  to: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
}

export interface GmailMessageItem {
  id: string;
  threadId: string;
  snippet?: string;
  date?: string;
  from?: string;
  subject?: string;
}

/**
 * Encodes string to UTF-8 Base64URL without padding (RFC 4648)
 */
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Creates RFC 2822 email format
 */
function createMimeMessage(payload: EmailPayload): string {
  const boundary = '----=_Part_' + Math.random().toString(36).substring(2);
  const subjectEncoded = `=?UTF-8?B?${btoa(unescape(encodeURIComponent(payload.subject)))}?=`;

  const lines = [
    `To: ${payload.to}`,
    `Subject: ${subjectEncoded}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    payload.bodyText || 'پیام از طرف بروکر آریا تریدر',
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    payload.bodyHtml || `<div>${payload.bodyText || ''}</div>`,
    '',
    `--${boundary}--`,
  ];

  return lines.join('\r\n');
}

/**
 * Sends an email via Gmail API
 */
export async function sendGmail(payload: EmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('توکن دسترسی جیمیل یافت نشد. لطفاً ابتدا با حساب گوگل خود وارد شوید.');
  }

  const rawMime = createMimeMessage(payload);
  const rawBase64 = base64UrlEncode(rawMime);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: rawBase64 }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `خطا در ارسال ایمیل (${response.status})`;
    throw new Error(message);
  }

  const data = await response.json();
  return { success: true, id: data.id };
}

/**
 * Lists recent sent or inbox messages for broker communication
 */
export async function listBrokerMessages(maxResults = 10): Promise<GmailMessageItem[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=label:SENT OR label:INBOX`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    if (!data.messages || !Array.isArray(data.messages)) return [];

    // Fetch details for first 5 messages
    const details = await Promise.all(
      data.messages.slice(0, 5).map(async (msg: { id: string; threadId: string }) => {
        try {
          const mRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!mRes.ok) return { id: msg.id, threadId: msg.threadId };
          const mData = await mRes.json();
          const headers = mData.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(بدون عنوان)';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || '';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
          return {
            id: msg.id,
            threadId: msg.threadId,
            snippet: mData.snippet,
            subject,
            from,
            date,
          };
        } catch {
          return { id: msg.id, threadId: msg.threadId };
        }
      })
    );

    return details;
  } catch (err) {
    console.error('Error fetching gmail messages:', err);
    return [];
  }
}
