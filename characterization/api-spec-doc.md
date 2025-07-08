# API Specification - מערכת השאלת משחקי זוגיות

## מבנה כללי

### Base URL
```
Production: https://api.gamerentals.org.il
Development: http://localhost:3000/api
```

### Headers
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN}
```

### Response Format
```json
{
  "success": boolean,
  "data": object | array | null,
  "error": {
    "code": string,
    "message": string
  } | null,
  "meta": {
    "page": number,
    "limit": number,
    "total": number
  } | null
}
```

### Error Codes
- `AUTH_REQUIRED` - נדרשת הזדהות
- `FORBIDDEN` - אין הרשאה
- `NOT_FOUND` - משאב לא נמצא
- `VALIDATION_ERROR` - שגיאת ולידציה
- `INTERNAL_ERROR` - שגיאת שרת

---

## Authentication

### POST /api/auth/google
**תיאור**: התחברות עם Google OAuth
```json
// Request
{
  "googleToken": "string"
}

// Response
{
  "success": true,
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "phone": "string",
      "roles": ["USER", "CENTER_COORDINATOR"],
      "managedCenterIds": ["center1"],
      "supervisedCenterIds": []
    }
  }
}
```

### GET /api/auth/me
**תיאור**: קבלת פרטי המשתמש הנוכחי
```json
// Response
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "phone": "string",
    "roles": ["USER"],
    "managedCenterIds": [],
    "supervisedCenterIds": []
  }
}
```

### PUT /api/auth/profile
**תיאור**: עדכון פרטי משתמש
```json
// Request
{
  "name": "string",
  "phone": "string"
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "name": "string",
    "phone": "string"
  }
}
```

---

## Games - משחקים

### GET /api/games
**תיאור**: רשימת כל המשחקים
```json
// Query Parameters
?showInCatalog=true // רק משחקים לקטלוג הכללי
&category=COMMUNICATION
&targetAudience=MARRIED

// Response
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "משחק הזוגיות",
      "description": "תיאור קצר",
      "longDescription": "תיאור מפורט",
      "category": "COMMUNICATION",
      "targetAudience": "MARRIED",
      "minAge": 18,
      "duration": "30-60 דקות",
      "imageUrl": "string",
      "showInGeneralCatalog": true
    }
  ]
}
```

### GET /api/games/:id
**תיאור**: פרטי משחק בודד
```json
// Response
{
  "success": true,
  "data": {
    "id": "string",
    "name": "משחק הזוגיות",
    "description": "תיאור קצר",
    "longDescription": "תיאור מפורט",
    "category": "COMMUNICATION",
    "targetAudience": "MARRIED",
    "minAge": 18,
    "duration": "30-60 דקות",
    "imageUrl": "string",
    "reviews": [
      {
        "id": "string",
        "rating": 5,
        "comment": "משחק מעולה!",
        "createdAt": "2025-01-12T10:00:00Z"
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 23
  }
}
```

### POST /api/games
**תיאור**: הוספת משחק חדש (רכז/אדמין)
**הרשאה**: CENTER_COORDINATOR, ADMIN
```json
// Request
{
  "name": "string",
  "description": "string",
  "longDescription": "string",
  "category": "COMMUNICATION",
  "targetAudience": "MARRIED",
  "minAge": 18,
  "duration": "string",
  "imageUrl": "string"
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    // ... כל השדות
  }
}
```

---

## Centers - מוקדים

### GET /api/centers
**תיאור**: רשימת כל המוקדים הפעילים
```json
// Query Parameters
?area=JERUSALEM
&city=ירושלים

// Response
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "מוקד ירושלים",
      "city": "ירושלים",
      "area": "JERUSALEM",
      "address": "רחוב יפו 50",
      "phone": "02-5551234",
      "latitude": 31.7767,
      "longitude": 35.2345,
      "coordinator": {
        "id": "string",
        "name": "יוסי כהן",
        "phone": "050-1234567"
      }
    }
  ]
}
```

### GET /api/centers/:id
**תיאור**: פרטי מוקד מלאים
```json
// Response
{
  "success": true,
  "data": {
    "id": "string",
    "name": "מוקד ירושלים",
    "city": "ירושלים",
    "area": "JERUSALEM",
    "address": "רחוב יפו 50",
    "phone": "02-5551234",
    "email": "jerusalem@org.il",
    "latitude": 31.7767,
    "longitude": 35.2345,
    "coordinator": {
      "id": "string",
      "name": "יוסי כהן",
      "phone": "050-1234567"
    },
    "superCoordinator": {
      "id": "string",
      "name": "מרים לוי",
      "phone": "050-8888888"
    },
    "isActive": true
  }
}
```

### GET /api/centers/:id/games
**תיאור**: משחקים זמינים במוקד
```json
// Query Parameters
?status=AVAILABLE // AVAILABLE | BORROWED | UNAVAILABLE

// Response
{
  "success": true,
  "data": [
    {
      "instanceId": "string",
      "gameId": "string",
      "game": {
        "id": "string",
        "name": "משחק הזוגיות",
        "category": "COMMUNICATION",
        "imageUrl": "string"
      },
      "status": "AVAILABLE",
      "condition": "GOOD",
      "expectedReturnDate": null
    }
  ]
}
```

---

## Rentals - השאלות

### POST /api/rentals
**תיאור**: יצירת בקשת השאלה
```json
// Request
{
  "gameInstanceId": "string",
  "centerId": "string",
  "notes": "string" // אופציונלי
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "requestNumber": "#1234",
    "status": "PENDING",
    "game": {
      "name": "משחק הזוגיות"
    },
    "center": {
      "name": "מוקד ירושלים",
      "coordinator": {
        "name": "יוסי כהן",
        "phone": "050-1234567"
      }
    },
    "createdAt": "2025-01-12T10:00:00Z"
  }
}
```

### GET /api/rentals/my
**תיאור**: ההשאלות שלי
```json
// Query Parameters
?status=PENDING // PENDING | ACTIVE | RETURNED | REJECTED

// Response
{
  "success": true,
  "data": [
    {
      "id": "string",
      "status": "ACTIVE",
      "game": {
        "id": "string",
        "name": "משחק הזוגיות",
        "imageUrl": "string"
      },
      "center": {
        "id": "string",
        "name": "מוקד ירושלים",
        "coordinator": {
          "name": "יוסי כהן",
          "phone": "050-1234567"
        }
      },
      "requestDate": "2025-01-10T10:00:00Z",
      "borrowDate": "2025-01-11T15:00:00Z",
      "expectedReturnDate": "2025-01-18T15:00:00Z",
      "returnDate": null,
      "isOverdue": false
    }
  ]
}
```

### DELETE /api/rentals/:id
**תיאור**: ביטול בקשת השאלה (רק PENDING)
```json
// Response
{
  "success": true,
  "data": {
    "message": "הבקשה בוטלה בהצלחה"
  }
}
```

---

## Center Management - ניהול מוקד

### GET /api/coordinator/rentals
**תיאור**: השאלות במוקד שלי (לרכז)
**הרשאה**: CENTER_COORDINATOR
```json
// Query Parameters
?status=PENDING
&centerId=center1 // אם מנהל כמה מוקדים

// Response
{
  "success": true,
  "data": [
    {
      "id": "string",
      "status": "PENDING",
      "user": {
        "id": "string",
        "name": "דוד לוי",
        "phone": "052-9876543",
        "email": "david@gmail.com"
      },
      "game": {
        "id": "string",
        "name": "משחק הזוגיות"
      },
      "requestDate": "2025-01-12T10:00:00Z",
      "notes": "אשמח לקחת היום"
    }
  ]
}
```

### PUT /api/coordinator/rentals/:id/approve
**תיאור**: אישור השאלה
**הרשאה**: CENTER_COORDINATOR
```json
// Request
{
  "expectedReturnDate": "2025-01-19T12:00:00Z" // אופציונלי, ברירת מחדל שבוע
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "status": "ACTIVE",
    "borrowDate": "2025-01-12T15:00:00Z",
    "expectedReturnDate": "2025-01-19T15:00:00Z"
  }
}
```

### PUT /api/coordinator/rentals/:id/reject
**תיאור**: דחיית בקשה
**הרשאה**: CENTER_COORDINATOR
```json
// Request
{
  "reason": "string" // אופציונלי
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "status": "REJECTED"
  }
}
```

### PUT /api/coordinator/rentals/:id/return
**תיאור**: סימון החזרה
**הרשאה**: CENTER_COORDINATOR
```json
// Request
{
  "condition": "GOOD" // GOOD | DAMAGED | LOST
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "status": "RETURNED",
    "returnDate": "2025-01-17T16:00:00Z"
  }
}
```

### POST /api/coordinator/rentals/manual
**תיאור**: יצירת השאלה ידנית
**הרשאה**: CENTER_COORDINATOR
```json
// Request
{
  "userId": "string",
  "gameInstanceId": "string",
  "expectedReturnDate": "2025-01-19T12:00:00Z"
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "status": "ACTIVE",
    "borrowDate": "2025-01-12T15:00:00Z"
  }
}
```

### PUT /api/coordinator/games/:instanceId
**תיאור**: עדכון סטטוס משחק במוקד
**הרשאה**: CENTER_COORDINATOR
```json
// Request
{
  "status": "UNAVAILABLE",
  "condition": "DAMAGED"
}

// Response
{
  "success": true,
  "data": {
    "instanceId": "string",
    "status": "UNAVAILABLE",
    "condition": "DAMAGED"
  }
}
```

### POST /api/coordinator/games
**תיאור**: הוספת משחק למוקד
**הרשאה**: CENTER_COORDINATOR
```json
// Request
{
  "gameId": "string", // משחק קיים
  "centerId": "string"
}
// או
{
  "newGame": {
    "name": "string",
    "description": "string",
    // ... כל השדות של משחק חדש
  },
  "centerId": "string"
}

// Response
{
  "success": true,
  "data": {
    "instanceId": "string",
    "gameId": "string",
    "status": "AVAILABLE"
  }
}
```

---

## Super Coordinator - רכז-על

### GET /api/super/centers
**תיאור**: המוקדים שאני מפקח עליהם
**הרשאה**: SUPER_COORDINATOR
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "מוקד ירושלים",
      "coordinator": {
        "name": "יוסי כהן",
        "phone": "050-1234567"
      },
      "stats": {
        "pendingRentals": 3,
        "activeRentals": 12,
        "overdueRentals": 2
      }
    }
  ]
}
```

### GET /api/super/rentals
**תיאור**: כל ההשאלות במוקדים שלי
**הרשאה**: SUPER_COORDINATOR
```json
// Query Parameters
?status=PENDING
&centerId=center1

// Response - כמו coordinator/rentals אבל לכל המוקדים
```

---

## Admin - מנהל מערכת

### GET /api/admin/users
**תיאור**: רשימת כל המשתמשים
**הרשאה**: ADMIN
```json
// Query Parameters
?search=יוסי
&role=CENTER_COORDINATOR
&page=1
&limit=20

// Response
{
  "success": true,
  "data": [
    {
      "id": "string",
      "email": "string",
      "name": "string",
      "phone": "string",
      "roles": ["USER", "CENTER_COORDINATOR"],
      "managedCenters": ["מוקד ירושלים"],
      "isActive": true,
      "createdAt": "2025-01-01T10:00:00Z",
      "lastLogin": "2025-01-12T09:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 523
  }
}
```

### PUT /api/admin/users/:id
**תיאור**: עדכון משתמש
**הרשאה**: ADMIN
```json
// Request
{
  "name": "string",
  "phone": "string",
  "roles": ["USER", "CENTER_COORDINATOR"],
  "managedCenterIds": ["center1"],
  "supervisedCenterIds": [],
  "isActive": true
}
```

### POST /api/admin/centers
**תיאור**: הוספת מוקד חדש
**הרשאה**: ADMIN
```json
// Request
{
  "name": "string",
  "city": "string",
  "area": "JERUSALEM",
  "address": "string",
  "phone": "string",
  "email": "string",
  "coordinatorId": "string",
  "superCoordinatorId": "string",
  "latitude": 0,
  "longitude": 0
}
```

### GET /api/admin/reports
**תיאור**: דוחות מערכת
**הרשאה**: ADMIN
```json
// Query Parameters
?type=rentals // rentals | games | centers | users
&from=2025-01-01
&to=2025-01-31
&centerId=all
&format=json // json | csv | excel

// Response
{
  "success": true,
  "data": {
    "summary": {
      "totalRentals": 1234,
      "activeRentals": 156,
      "overdueRentals": 23,
      "returnRate": 0.87
    },
    "byCenter": [
      {
        "centerId": "string",
        "centerName": "מוקד ירושלים",
        "rentals": 234,
        "activeUsers": 89
      }
    ],
    "topGames": [
      {
        "gameId": "string",
        "gameName": "משחק הזוגיות",
        "rentals": 156
      }
    ]
  }
}
```

---

## Notifications - התראות

### POST /api/notifications/send
**תיאור**: שליחת התראה ידנית
**הרשאה**: CENTER_COORDINATOR, ADMIN
```json
// Request
{
  "userId": "string",
  "type": "RENTAL_REMINDER",
  "channel": "EMAIL", // EMAIL | WHATSAPP | BOTH
  "data": {
    "gameName": "משחק הזוגיות",
    "returnDate": "2025-01-19"
  }
}
```

### GET /api/notifications/templates
**תיאור**: תבניות הודעות
**הרשאה**: ADMIN
```json
// Response
{
  "success": true,
  "data": [
    {
      "id": "string",
      "type": "RENTAL_APPROVED",
      "name": "אישור השאלה",
      "subject": "השאלתך אושרה!",
      "body": "שלום {{userName}}, השאלת {{gameName}} אושרה...",
      "channels": ["EMAIL", "WHATSAPP"]
    }
  ]
}
```

---

## Reviews - משובים

### POST /api/reviews
**תיאור**: הוספת משוב על משחק
```json
// Request
{
  "gameId": "string",
  "centerId": "string",
  "rating": 5,
  "experienceRating": 5,
  "closenessRating": 5,
  "comment": "משחק מעולה!",
  "gameType": "HOT_ZONE", // ICE_BREAKER | HOT_ZONE | REGULAR
  "source": "FRIEND", // FRIEND | SOCIAL_MEDIA | SEARCH | OTHER
  "improvements": "string",
  "tips": "string"
}

// Response
{
  "success": true,
  "data": {
    "id": "string",
    "message": "תודה על המשוב!"
  }
}
```

---

## Search - חיפוש

### GET /api/search
**תיאור**: חיפוש כללי
```json
// Query Parameters
?q=זוגיות
&type=games // games | centers | users (לאדמין)

// Response
{
  "success": true,
  "data": {
    "games": [
      {
        "id": "string",
        "name": "משחק הזוגיות",
        "category": "COMMUNICATION"
      }
    ],
    "centers": [
      {
        "id": "string",
        "name": "מוקד זוגיות ירושלים"
      }
    ]
  }
}
```

---

## WebSocket Events (עתידי)

### Connection
```javascript
const socket = io('wss://api.gamerentals.org.il', {
  auth: {
    token: JWT_TOKEN
  }
});
```

### Events
```javascript
// השאלה חדשה (לרכז)
socket.on('rental:new', (data) => {
  // {rentalId, userName, gameName}
});

// סטטוס השאלה השתנה (למשתמש)
socket.on('rental:statusChanged', (data) => {
  // {rentalId, oldStatus, newStatus}
});

// תזכורת החזרה (למשתמש)
socket.on('rental:reminder', (data) => {
  // {rentalId, gameName, daysOverdue}
});
```

---

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- Public endpoints: 60 requests per minute
- Admin endpoints: 120 requests per minute

## Pagination

כל endpoint שמחזיר רשימה תומך ב:
- `?page=1` - מספר עמוד (default: 1)
- `?limit=20` - פריטים בעמוד (default: 20, max: 100)

## Versioning

- Current version: v1
- Version in URL: `/api/v1/...`
- Deprecation notice: 6 months