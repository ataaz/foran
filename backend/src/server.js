import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

let leads = [];

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'draftly-site-backend' });
});

app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'name, email and message are required' });
  }
  const item = { id: String(Date.now()), name, email, message, createdAt: new Date().toISOString() };
  leads.unshift(item);
  if (leads.length > 200) leads = leads.slice(0, 200);
  return res.json({ success: true, item });
});

app.get('/api/leads', (_req, res) => {
  res.json({ items: leads });
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log('API running on http://localhost:' + port);
});
