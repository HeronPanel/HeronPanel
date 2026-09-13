# ?? HeronPanel Production & Security Guide

## ?? Security Hardening
To ensure HeronPanel is production-ready, the following hardening steps must be applied:

### 1. API Security
- **JWT Secret**: Change JWT_SECRET in .env to a 64-character random string.
- **CORS**: Restrict cors origins in ackend/src/index.ts to your actual domain.
- **Rate Limiting**: Implement astify-rate-limit to prevent Brute Force attacks on /auth/login.

### 2. Daemon Security
- **API Key**: Generate a unique UUID for every Node. Never use the default key.
- **Firewall**: Open ONLY ports 3000 (API) and 8080 (Daemon - restricted to API IP).
- **User Permissions**: Run the heron-daemon as a dedicated heron user, NOT as root.

### 3. Database Security
- **PostgreSQL**: Use a dedicated user for HeronPanel instead of the postgres superuser.
- **SSL**: Enable SSL for database connections if the DB is on a separate server.

## ?? Scaling Strategy
- **Horizontal Scaling**: Add more Nodes by installing heron-daemon on new Linux servers and registering them in the Admin Panel.
- **Database**: Use a managed PostgreSQL instance (like RDS or DigitalOcean DB) for high availability.
- **Load Balancing**: Place Nginx in front of the API to handle SSL termination and load balancing across multiple API instances.

## ?? Operational Maintenance
- **Logs**: Monitor logs via journalctl -u heron-api and journalctl -u heron-daemon.
- **Backups**: Ensure /var/backups/heron is mounted on a separate volume or synced to S3.
