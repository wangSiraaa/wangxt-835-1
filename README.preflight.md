# Trae Preflight

This folder is prepared for `wangxt-835-1`.

Use `.env` for stable local ports and compose project identity:

- APP_PORT: 18135
- API_PORT: 19135
- WEB_PORT: 20135
- DB_PORT: 21135
- REDIS_PORT: 22135

Smoke entry:

```bash
bash scripts/smoke.sh
```

The preflight files are environment scaffolding only. The generated business
project can replace or extend them when needed.
