# GitHub Actions EC2 Deployment Setup

This document explains how to set up the GitHub Actions workflow for deploying the backend to EC2.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### Secrets to Add

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `EC2_BACKEND_HOST` | EC2 instance IP address or hostname | `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com` |
| `EC2_BACKEND_USER` | SSH username for EC2 instance | `ubuntu` |
| `EC2_BACKEND_SSH_KEY` | Private SSH key for authentication | Contents of your `.pem` file |
| `EC2_BACKEND_PORT` | SSH port (optional, defaults to 22) | `22` |

### How to Get Your SSH Key

If you have a `.pem` file (like `fame.pem` in your backend directory):

```bash
# Display the contents of your private key
cat backend/fame.pem
```

Copy the entire output (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`) and paste it as the value for `EC2_BACKEND_SSH_KEY`.

> [!WARNING]
> **Never commit your private SSH key to the repository!** Only add it as a GitHub secret.

## Workflow Triggers

The deployment workflow will automatically run when:

1. **Push to main branch** - Only if files in `backend/` directory or the workflow file itself are changed
2. **Manual trigger** - You can manually trigger the deployment from the GitHub Actions tab

## Deployment Process

When triggered, the workflow will:

1. ✅ Checkout the code
2. 🔐 Set up SSH connection to EC2
3. 📥 Pull latest code from the `main` branch
4. 🐍 Activate Python virtual environment
5. 📦 Install/update Python dependencies
6. 🗄️ Run database migrations
7. 📁 Collect static files
8. 🔄 Restart the gunicorn service
9. ✅ Verify the service is running

## Testing the Deployment

### Manual Trigger

1. Go to your repository on GitHub
2. Click on **Actions** tab
3. Select **Deploy Backend to EC2** workflow
4. Click **Run workflow** → **Run workflow**
5. Monitor the deployment progress

### Automatic Trigger

1. Make a change to any file in the `backend/` directory
2. Commit and push to the `main` branch
3. The workflow will automatically start
4. Monitor progress in the **Actions** tab

## Troubleshooting

### SSH Connection Issues

If you see SSH connection errors:
- Verify `EC2_BACKEND_HOST` is correct
- Ensure the EC2 security group allows SSH (port 22) from GitHub Actions IPs
- Verify the SSH key is correct and has proper permissions

### Permission Issues

If you see permission errors when restarting services:
- Ensure the `ubuntu` user has sudo privileges
- Verify the user is in the correct groups (e.g., `www-data`)
- Check that the gunicorn service file has correct permissions

### Service Restart Fails

If gunicorn fails to restart:
- SSH into the EC2 instance manually
- Check service status: `sudo systemctl status gunicorn`
- Check logs: `sudo journalctl -u gunicorn -n 50`
- Verify the virtual environment path is correct

## EC2 Instance Requirements

Your EC2 instance should have:

1. **Git installed** - For pulling code
2. **Python virtual environment** - Located at `/home/ubuntu/shell/bin/activate`
3. **Gunicorn service** - Configured as a systemd service
4. **Project directory** - Located at `/home/ubuntu/famesync`
5. **Sudo privileges** - For the deployment user to restart services

## Customization

### Restart Nginx

If you need to restart nginx after deployment, uncomment these lines in the workflow:

```yaml
# Restart nginx (optional, uncomment if needed)
# echo "🔄 Restarting nginx..."
# sudo systemctl restart nginx
```

### Change Project Directory

If your project is in a different location, update the path in the workflow file:

```yaml
cd /home/ubuntu/famesync  # Change this to your project path
```

### Additional Deployment Steps

You can add additional steps in the SSH section of the workflow, such as:
- Running tests
- Creating backups
- Clearing caches
- Sending notifications

## Security Best Practices

1. ✅ Use SSH keys instead of passwords
2. ✅ Store sensitive data in GitHub Secrets
3. ✅ Limit SSH access to specific IP ranges (GitHub Actions IPs)
4. ✅ Use a dedicated deployment user with minimal privileges
5. ✅ Regularly rotate SSH keys
6. ✅ Enable two-factor authentication on GitHub
