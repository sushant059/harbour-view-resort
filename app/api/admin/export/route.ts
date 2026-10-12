import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/store";
import { toCsv } from "@/lib/utils";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return new NextResponse("Sign in required", { status: 401 });
  const type = new URL(request.url).searchParams.get("type");
  const db = await getDb();
  const rows = type === "bookings"
    ? db.bookings.map((item) => ({ reference: item.reference, status: item.status, name: item.name, phone: item.phone, email: item.email, suburb: item.suburb, address: item.address, date: item.date, time: item.timeWindow, summary: item.summary, notes: item.notes, promo: item.promoCode, createdAt: item.createdAt }))
    : db.leads.map((item) => ({ reference: item.reference, source: item.source, status: item.status, name: item.name, phone: item.phone, email: item.email, suburb: item.suburb, summary: item.summary, message: item.message, promo: item.promoCode, createdAt: item.createdAt }));
  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type === "bookings" ? "bookings" : "leads"}.csv"`,
    },
  });
}
