# Project Instructions & Deployment Commands

## Server Deployment
This project is deployed and live on a VPS server. Whenever providing deployment, update, or server execution commands to the user, always provide this exact command:

```bash
cd /home/malaysianbd/htdocs/malaysianbd.shop && git pull && npm run build && pm2 restart malaysianbd-shop
```

- **Domain/Folder Path**: `/home/malaysianbd/htdocs/malaysianbd.shop`
- **PM2 Process Name**: `malaysianbd-shop`
- **Workflow**: `cd` into the app directory, pull latest changes from Git, rebuild with `npm run build`, and restart the PM2 daemon.
