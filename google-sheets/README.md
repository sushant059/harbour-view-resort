# Connect the Google Sheet

The website copies **Customers**, **Jobs**, **Leads** and **Bookings** into a Google Sheet every time something changes. Supabase stays the main database; the sheet is an easy-to-read copy you can filter, share or print.

## One-time setup (about 5 minutes)

1. Create a new Google Sheet (sheets.new), for example "Spotless NT – Customers & Jobs".
2. In the sheet: **Extensions → Apps Script**.
3. Delete the sample code, paste in everything from [`Code.gs`](Code.gs), and replace `PASTE-THE-SECRET-HERE` with the `GOOGLE_SHEETS_SECRET` value from Vercel (Project → Settings → Environment Variables).
4. Click **Save** (disk icon).
5. Click **Deploy → New deployment**. Click the gear icon, choose **Web app**, then set:
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**, approve the Google permissions (choose your account → Advanced → Go to project → Allow).
7. Copy the **Web app URL** (it ends in `/exec`).
8. In Vercel, add an environment variable `GOOGLE_SHEETS_WEBHOOK_URL` with that URL, then redeploy.
9. In the website admin go to **Settings → Sync everything now**. The four tabs appear and fill in.

## Notes

- "Anyone" access is needed so the website can reach the script. It only accepts requests carrying your secret, so nobody else can write to the sheet.
- Edits you make directly in the sheet are **not** copied back to the website. Make changes in the admin panel; the sheet updates itself.
- If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
