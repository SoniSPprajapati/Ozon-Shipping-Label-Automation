# Ozon Label Dashboard Phase 2 - Web App

## Architecture

* **Frontend**: Next.js (React), TailwindCSS, Shadcn, fully accessible responsive web UI.
* **Backend**: Next.js App Router API Routes.
* **Processing Engine**: The original Bun + Node CLI pipeline has been preserved in `/barcode-pipeline` and is executed via child process logic without breaking the existing TUI setup.
* **Database**: Ready for Supabase migration (`database_schema.sql`).

## Local Development
1. Start the Next.js server:
   ```bash
   cd dashboard
   npm run dev
   ```
2. Open `http://localhost:3000` in your browser.
3. Use the **Generate Labels** view to upload your shipping label PDF and product list PDF. The backend transparently talks to `bun src/api_wrapper.js` in the `barcode-pipeline` folder.

## Deployment (Railway / Render / VPS)

### Production Build
1. In the root, deploy the directory. If you are using continuous deployment (like Vercel or Railway):
2. Your Build Command: `cd dashboard && npm install && npm run build`
3. Start Command: `cd dashboard && npm run start`

**Note on Bun**: The Next.js API route executing the pipeline expects `bun` to be installed on the deployment server. If deploying to Railway/Render, ensure you use an environment (like a Dockerfile) that has both `Node.js` installed for your Next.js project and `Bun`.

If replacing Bun with Node: 
Alternatively, adjust `dashboard/src/app/api/process/route.ts` to run `node` instead of `bun` if you strictly deploy on a Node.js-only container.

### Supabase Integration
1. Go to [Supabase](https://supabase.com).
2. Create a new project.
3. Paste the contents of `database_schema.sql` into the SQL Editor and run it.
4. Fill in standard Supabase keys inside the `dashboard/.env.local` to integrate Auth directly into Next.js.
