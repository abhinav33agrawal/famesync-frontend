# Credit Reset Setup Guide

This document explains how to set up automatic credit resets for Free and Pro subscription plans.

## Credit Reset Logic

### Free Plan
- **Reset Cycle**: 1st day of each month to the last day of each month
- **Behavior**: Credits are reset to the credit_limit (10 for influencers, 50 for brands) on the 1st of every month
- **Unused Credits**: Unused credits do NOT roll over - they are reset regardless of usage

### Pro Plan
- **Reset Cycle**: Based on subscription purchase date (e.g., if purchased on Jan 15, resets on Feb 15, Mar 15, etc.)
- **Behavior**: Credits are reset to 100 on the renewal_date (30 days from purchase/last renewal)
- **Unused Credits**: Unused credits do NOT roll over - they are reset to 100 on each renewal

## Management Command

A Django management command has been created to handle credit resets:

```bash
python manage.py reset_credits
```

### What it does:

1. **For Free Plans** (runs only on 1st of month):
   - Finds all active free plan subscriptions
   - Resets user credits to their credit_limit
   - Logs each reset action

2. **For Pro Plans** (runs daily):
   - Finds all active pro subscriptions where renewal_date has passed
   - Resets user credits to 100
   - Updates renewal_date to 30 days from now
   - Logs each reset action

## Setting Up Automatic Execution

### Option 1: Linux/Unix Cron Job

Add this to your crontab (`crontab -e`):

```bash
# Run credit reset daily at 12:01 AM
1 0 * * * cd /path/to/backend && /path/to/python manage.py reset_credits >> /var/log/credit_reset.log 2>&1
```

### Option 2: Django Celery Beat (Recommended for Production)

1. Install Celery and Redis:
```bash
pip install celery redis django-celery-beat
```

2. Create a Celery task in `backend/subscriptions/tasks.py`:
```python
from celery import shared_task
from django.core.management import call_command

@shared_task
def reset_user_credits():
    call_command('reset_credits')
```

3. Configure Celery Beat schedule in `settings.py`:
```python
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'reset-credits-daily': {
        'task': 'subscriptions.tasks.reset_user_credits',
        'schedule': crontab(hour=0, minute=1),  # Daily at 12:01 AM
    },
}
```

### Option 3: Heroku Scheduler (for Heroku deployments)

1. Add Heroku Scheduler add-on
2. Create a job with command:
```bash
python manage.py reset_credits
```
3. Set frequency to "Daily" at 00:00 UTC

### Option 4: AWS CloudWatch Events (for AWS deployments)

1. Create a Lambda function that triggers the command
2. Set up CloudWatch Events rule with cron expression: `cron(1 0 * * ? *)`

## Testing the Command

Test the command manually:

```bash
# Run in development
python manage.py reset_credits

# Check the output for success messages
# Check logs for detailed information about each user reset
```

## Monitoring

The command logs each action:
- Success messages show how many users were reset
- Individual user resets are logged with user details
- Errors are logged if any issues occur

Check your logs regularly to ensure the command is running successfully.

## Important Notes

1. **Free Plan Renewal Dates**: Set to 1st of next month
2. **Pro Plan Renewal Dates**: Set to 30 days from purchase/last renewal
3. **Credit Resets**: Always reset to credit_limit, unused credits don't roll over
4. **Timezone**: Uses Django's timezone settings (UTC by default)
5. **Database Transactions**: Each user update is atomic
