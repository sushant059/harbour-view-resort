/*
 * Text messages through ClickSend (an Australian SMS service, about 8–9c per message, pay as you go).
 * Set CLICKSEND_USERNAME and CLICKSEND_API_KEY in Vercel to switch it on.
 * Optional CLICKSEND_FROM: a dedicated number or an approved sender name.
 * Without them, the admin page falls back to opening each text in the phone's messages app.
 */

export function smsEnabled() {
  return Boolean(process.env.CLICKSEND_USERNAME && process.env.CLICKSEND_API_KEY);
}

/** 0401647545 → +61401647545. */
export function toInternational(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("61")) return `+${digits}`;
  if (digits.startsWith("0")) return `+61${digits.slice(1)}`;
  return `+${digits}`;
}

type ClickSendReply = { response_code?: string; response_msg?: string; data?: { messages?: { to: string; status: string; custom_string?: string }[] } };

export async function sendSms(messages: { to: string; body: string; id: string }[]): Promise<{ sent: string[]; failed: string[]; error?: string }> {
  if (!smsEnabled()) return { sent: [], failed: messages.map((message) => message.id), error: "Text messaging isn't set up yet." };
  const auth = Buffer.from(`${process.env.CLICKSEND_USERNAME}:${process.env.CLICKSEND_API_KEY}`).toString("base64");
  const from = process.env.CLICKSEND_FROM || undefined;
  try {
    const response = await fetch("https://rest.clicksend.com/v3/sms/send", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages.map((message) => ({ source: "harbour-view", to: toInternational(message.to), body: message.body, from, custom_string: message.id })) }),
      signal: AbortSignal.timeout(30_000),
    });
    const reply = (await response.json().catch(() => ({}))) as ClickSendReply;
    if (!response.ok) {
      const error = response.status === 401 ? "ClickSend didn't accept the username or API key." : reply.response_msg || `ClickSend error (HTTP ${response.status}).`;
      return { sent: [], failed: messages.map((message) => message.id), error };
    }
    const results = reply.data?.messages ?? [];
    const sent = results.filter((item) => item.status === "SUCCESS").map((item) => item.custom_string || "");
    const failedResults = results.filter((item) => item.status !== "SUCCESS");
    const failed = messages.filter((message) => !sent.includes(message.id)).map((message) => message.id);
    const error = failedResults[0] ? `Some texts weren't sent (${failedResults[0].status.replace(/_/g, " ").toLowerCase()}). If it says insufficient credit, top up in ClickSend.` : undefined;
    return { sent, failed, error };
  } catch {
    return { sent: [], failed: messages.map((message) => message.id), error: "Couldn't reach ClickSend. Try again in a minute." };
  }
}
