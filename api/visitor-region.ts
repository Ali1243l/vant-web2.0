import { normalizeApproximateRegion } from '../src/lib/approximateRegion.ts';

export const config = { runtime: 'nodejs' };

export default function handler(req: any, res: any) {
  // Never cache one visitor's result for another visitor or return the original IP/coordinates.
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  return res.status(200).json(normalizeApproximateRegion(process.env.VERCEL === '1' ? {
    country: req.headers?.['x-vercel-ip-country'],
    region: req.headers?.['x-vercel-ip-country-region'],
  } : null));
}
