# Notifications System Guide

This guide explains how to use the in-app notification system in FameSync.

## Overview

The notification system allows you to send real-time notifications to users that appear when they log in. Notifications are stored in the database and automatically marked as read once viewed.

## Backend Usage

### Creating Notifications

You can create notifications from any view or signal in your Django backend:

```python
from notifications.models import Notification

# Create a notification for a specific user
Notification.objects.create(
    user=user_instance,
    message="Your campaign application has been accepted!"
)
```

### Example Use Cases

#### 1. When a brand accepts an influencer's application:

```python
# In campaigns/views.py or similar
from notifications.models import Notification

def update_application_status(request, application_id):
    # ... existing code ...
    
    if new_status == 'accepted':
        Notification.objects.create(
            user=application.influencer.user,
            message=f"Congratulations! Your application for '{application.campaign.title}' has been accepted."
        )
    elif new_status == 'rejected':
        Notification.objects.create(
            user=application.influencer.user,
            message=f"Your application for '{application.campaign.title}' was not successful this time."
        )
```

#### 2. When an influencer applies to a campaign:

```python
Notification.objects.create(
    user=campaign.brand.user,
    message=f"{influencer.user.first_name} has applied to your campaign '{campaign.title}'."
)
```

#### 3. When credits are reset:

```python
Notification.objects.create(
    user=user,
    message=f"Your monthly credits have been reset! You now have {user.credits} credits available."
)
```

#### 4. When subscription changes:

```python
Notification.objects.create(
    user=user,
    message=f"Welcome to FameSync Pro! You now have access to premium features."
)
```

## Frontend Usage

### Notifications Dropdown Component

The `NotificationsDropdown` component is already integrated into the Navbar and will:
- Display a bell icon with a badge showing unread count
- Show notifications in a dropdown when clicked
- Automatically mark notifications as read when the dropdown is opened
- Display "No new notifications" when there are none

### Using the Notifications Hook

If you need to access notifications in other components:

```typescript
import { useNotifications } from '@/hooks/useNotifications';

function MyComponent() {
  const { notifications, unreadCount, loading, fetchUnread, markAsRead } = useNotifications();
  
  // notifications: array of notification objects
  // unreadCount: number of unread notifications
  // loading: boolean indicating if notifications are being fetched
  // fetchUnread: function to manually refresh notifications
  // markAsRead: function to mark all notifications as read
}
```

## API Endpoints

The following endpoints are available:

### GET `/api/notifications/unread/`
Returns all unread notifications for the authenticated user.

**Response:**
```json
[
  {
    "id": 1,
    "message": "Your application has been accepted!",
    "created_at": "2025-01-15T10:30:00Z",
    "status": "unread"
  }
]
```

### POST `/api/notifications/mark-as-read/`
Marks all unread notifications as read for the authenticated user.

**Response:**
```json
{
  "message": "5 notification(s) marked as read",
  "count": 5
}
```

### GET `/api/notifications/all/`
Returns all notifications (read and unread) for the authenticated user.

## Database Schema

The notifications table has the following structure:

| Field | Type | Description |
|-------|------|-------------|
| id | BigInteger | Primary key |
| user_id | Foreign Key | Reference to the user |
| message | Text | Notification message content |
| created_at | DateTime | When the notification was created |
| status | Enum | Either 'unread' or 'read' |

## Best Practices

1. **Keep messages concise**: Notifications should be short and actionable
2. **Use clear language**: Make it obvious what action was taken or what the user needs to do
3. **Include relevant details**: Campaign names, usernames, dates, etc.
4. **Don't spam users**: Only send notifications for important events
5. **Consider notification preferences**: In the future, you may want to add settings for users to control what notifications they receive

## Future Enhancements

Consider adding:
- Notification preferences/settings
- Email notifications for important events
- Push notifications (requires PWA setup)
- Notification categories (info, warning, success, error)
- Bulk delete or clear all functionality
- Pagination for notification history
- Action buttons within notifications (e.g., "View Campaign")
