/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
  body?: string;
}

/**
 * Utility to encode a string to Base64URL (safe for Gmail API raw payloads)
 */
function toBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * List the user's latest emails.
 */
export async function listEmails(accessToken: string, query: string = ''): Promise<GmailMessage[]> {
  try {
    let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10';
    if (query) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Gmail API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.messages || data.messages.length === 0) {
      return [];
    }

    // Resolve individual message metadata to show from, subject, and date
    const resolvedMessages = await Promise.all(
      data.messages.map(async (msg: { id: string }) => {
        try {
          const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          if (!detailRes.ok) return null;
          
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || 'Sem Assunto';
          const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Desconhecido';
          const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';
          
          return {
            id: msg.id,
            threadId: detail.threadId,
            snippet: detail.snippet,
            subject,
            from,
            date,
            body: detail.snippet
          };
        } catch {
          return null;
        }
      })
    );

    return resolvedMessages.filter((m): m is GmailMessage => m !== null);
  } catch (error) {
    console.error('Error fetching Gmail messages:', error);
    throw error;
  }
}

/**
 * Send a simple MIME email message.
 */
export async function sendEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<{ id: string } | null> {
  try {
    const emailMime = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset="UTF-8"',
      'MIME-Version: 1.0',
      '',
      `<div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">`,
      `  <h2 style="color: #1e3a8a; margin-top: 0;">IMSTUD - Aprendizagem Digital</h2>`,
      `  <p style="font-size: 14px; line-height: 1.6;">${body.replace(/\n/g, '<br>')}</p>`,
      `  <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;">`,
      `  <span style="font-size: 11px; color: #64748b; font-weight: bold;">Innovation Through Learning • IAM_IM</span>`,
      `</div>`
    ].join('\r\n');

    const base64Raw = toBase64Url(emailMime);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: base64Raw
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
