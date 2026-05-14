export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    version: '4.0.0',
    runtime: 'vercel-serverless',
    stripe: !!process.env.STRIPE_SECRET_KEY,
    supabase: !!(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.VITE_SUPABASE_URL),
    ai: !!process.env.ANTHROPIC_API_KEY,
    ts: new Date().toISOString()
  });
}
