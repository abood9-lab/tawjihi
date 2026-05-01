# Firebase Security Rules Documentation - TawjihiGuide

## Overview
توثيق شامل لقواعس الأمان في Firebase (Firestore) لتطبيق TawjihiGuide

---

## 1️⃣ Collections Structure & Rules

### 📚 **study-rooms** Collection

#### Database Schema:
```json
{
  "roomId": "room_abc123_1234567890",
  "createdBy": "uid_user_1",
  "ownerId": "uid_user_1",
  "ownerName": "أحمد محمد",
  "createdAt": "timestamp",
  "videoId": "dQw4w9WgXcQ",
  "videoTitle": "شرح درس الفيزياء",
  "videoChannel": "قناة العلوم",
  "videoDescription": "شرح مفصل...",
  "subject": "physics",
  "adminIds": ["uid_user_1", "uid_user_2"],
  "participants": [
    {
      "uid": "uid_user_1",
      "name": "أحمد محمد",
      "photoURL": "https://..."
    },
    {
      "uid": "uid_user_3",
      "name": "فاطمة علي",
      "photoURL": "https://..."
    }
  ],
  "activeCount": 2,
  "videoState": {
    "isPlaying": true,
    "currentTime": 120,
    "lastUpdated": "timestamp"
  }
}
```

#### Permissions:

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Any signed-in user |
| **Create** | ✅ Allowed | Creator must set themselves as owner & admin |
| **Update** | ✅ Allowed | Room owner OR admins (but cannot change creator/owner) |
| **Delete** | ✅ Allowed | Room owner only |

#### Subcollection: **messages**

Database Schema:
```json
{
  "senderId": "uid_user_3",
  "senderName": "فاطمة علي",
  "senderAvatar": "https://api.dicebear.com/...",
  "text": "السلام عليكم ورحمة الله",
  "timestamp": "timestamp"
}
```

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Room participants only |
| **Create** | ✅ Allowed | Room participants (must be sender) |
| **Update** | ✅ Allowed | Message author only |
| **Delete** | ✅ Allowed | Message author OR room admins |

---

### 👤 **users** Collection

#### Database Schema:
```json
{
  "uid": "uid_user_1",
  "email": "student@example.com",
  "displayName": "أحمد محمد",
  "photoURL": "https://...",
  "role": "student",
  "createdAt": "timestamp",
  "lastLogin": "timestamp",
  "points": 450,
  "badges": ["first-lesson", "5-quizzes"],
  "completedQuizzes": 5,
  "bestAccuracy": 87.5
}
```

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Any signed-in user (view other profiles) |
| **Create** | ✅ Allowed | User creating their own profile only |
| **Update** | ✅ Allowed | User updating own profile only |
| **Delete** | ✅ Allowed | User deleting own profile only |

---

### 📊 **users/{userId}/progress** Subcollection

#### Database Schema:
```json
{
  "subject": "physics",
  "completed": 5,
  "total": 10,
  "percentage": 50,
  "lastUpdated": "timestamp"
}
```

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | User reading own progress only |
| **Create** | ✅ Allowed | User creating own progress only |
| **Update** | ✅ Allowed | User updating own progress only |
| **Delete** | ✅ Allowed | User deleting own progress only |

---

### 💬 **conversations** Collection

#### Database Schema:
```json
{
  "participantIds": ["uid_user_1", "uid_user_2"],
  "participants": ["uid_user_1", "uid_user_2"],
  "ownerId": "uid_user_1",
  "lastMessage": "آخر رسالة...",
  "lastMessageTime": "timestamp",
  "createdAt": "timestamp"
}
```

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Conversation participants only |
| **Create** | ✅ Allowed | User must be in participants array |
| **Update** | ✅ Allowed | Participants only |
| **Delete** | ✅ Allowed | Owner only |

#### Subcollection: **messages**

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Conversation participants only |
| **Create** | ✅ Allowed | Participants (must be sender) |
| **Delete** | ✅ Allowed | Message sender only |

---

### 📢 **notifications** Collection

#### Database Schema:
```json
{
  "userId": "uid_user_1",
  "type": "room-invitation",
  "title": "دعوة للانضمام لغرفة دراسية",
  "message": "أحمد يدعوك للدراسة معه",
  "data": {
    "roomId": "room_abc123",
    "senderId": "uid_user_2"
  },
  "read": false,
  "createdAt": "timestamp"
}
```

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | User reading own notifications |
| **Create** | ❌ Denied | Backend only (Cloud Functions) |
| **Update** | ✅ Allowed | User marking as read |
| **Delete** | ✅ Allowed | User deleting own notification |

---

### 🎓 **admin-teachers** Collection

#### Database Schema:
```json
{
  "uid": "teacher_uid_1",
  "name": "أ.د أحمد محمد",
  "email": "teacher@example.com",
  "subjects": ["physics", "chemistry"],
  "bio": "أستاذ فيزياء بخبرة 15 سنة",
  "photoURL": "https://...",
  "verified": true,
  "createdAt": "timestamp"
}
```

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Any signed-in user |
| **Create** | ❌ Denied | Backend/Admin only |
| **Update** | ✅ Allowed | Teacher updating own profile |
| **Delete** | ❌ Denied | Backend/Admin only |

---

### 🏆 **leaderboard** Collection

#### Database Schema:
```json
{
  "userId": "uid_user_1",
  "userName": "أحمد محمد",
  "userPhoto": "https://...",
  "totalPoints": 1250,
  "rank": 1,
  "completedQuizzes": 12,
  "bestAccuracy": 92.5,
  "lastUpdated": "timestamp"
}
```

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Any signed-in user |
| **Create** | ❌ Denied | Backend only |
| **Update** | ❌ Denied | Backend only |
| **Delete** | ❌ Denied | Backend only |

---

### 📁 **public-data** Collection

For static content like courses list, etc.

| Operation | Permission | Allowed For |
|-----------|-----------|------------|
| **Read** | ✅ Allowed | Everyone (no auth needed) |
| **Write** | ❌ Denied | Backend only |

---

## 2️⃣ Role-Based Access Control (RBAC)

### User Roles:

| Role | Study Room | Admin in Room | Read Messages | Send Messages | Delete Message | Promote User |
|------|-----------|--------------|--------------|--------------|----------------|--------------|
| **Creator** | Create, Read, Update, Delete | ✅ Always | ✅ | ✅ | ✅ | ✅ |
| **Admin** | Read, Update | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Participant** | Read, Join | ❌ | ✅ | ✅ | Own only | ❌ |
| **Visitor** | Read | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3️⃣ Security Features Implemented

### ✅ Authentication
- All operations require `request.auth != null`
- User must be authenticated via Firebase Auth
- Email verification recommended for production

### ✅ Authorization
- **Creator Protection**: Only creator can set ownership
- **Admin Management**: Room admins control who joins
- **Message Privacy**: Messages visible only to room members
- **Profile Privacy**: Users control their own data

### ✅ Data Validation
- String fields validated as `is string`
- Timestamp fields validated as `is timestamp`
- List fields validated as `is list`
- Admin IDs and participants must be valid arrays

### ✅ Ownership Verification
- Creator must match `request.auth.uid`
- Admin changes cannot remove original creator
- Users cannot modify others' profiles

### ✅ Subcollection Protection
- Messages only accessible to room participants
- Direct messages only for conversation members
- Notifications only for intended user

---

## 4️⃣ Deployment Instructions

### Step 1: Access Firebase Console
1. Go to https://console.firebase.google.com
2. Select project: **tawj-d1f01**
3. Navigate to **Firestore Database → Rules**

### Step 2: Deploy Rules
```bash
# Using Firebase CLI
firebase deploy --only firestore:rules
```

Or copy-paste the rules from `firestore.rules` file directly in Firebase Console.

### Step 3: Test Rules
Use Firestore Emulator Suite:
```bash
firebase emulators:start --only firestore
```

---

## 5️⃣ Common Operations & Permissions

### Creating a Study Room
```javascript
// ✅ ALLOWED: User is owner
await setDoc(doc(db, 'study-rooms', roomId), {
  createdBy: currentUser.uid,
  ownerId: currentUser.uid,
  adminIds: [currentUser.uid],
  // ...
});

// ❌ NOT ALLOWED: createdBy != currentUser.uid
// ❌ NOT ALLOWED: ownerId != currentUser.uid
```

### Joining a Room (as Participant)
```javascript
// ✅ ALLOWED: Room document exists and user is participant
await updateDoc(doc(db, 'study-rooms', roomId), {
  participants: arrayUnion({uid: currentUser.uid, name: '...'})
});
```

### Promoting Participant to Admin
```javascript
// ✅ ALLOWED: Current user is admin
await updateDoc(doc(db, 'study-rooms', roomId), {
  adminIds: arrayUnion(participantUid)
});

// ❌ NOT ALLOWED: Current user is not admin
```

### Sending Message
```javascript
// ✅ ALLOWED: User is room participant
await addDoc(collection(db, 'study-rooms', roomId, 'messages'), {
  senderId: currentUser.uid,
  text: 'Hello everyone',
  timestamp: serverTimestamp()
});

// ❌ NOT ALLOWED: User is not participant
```

---

## 6️⃣ Important Notes

### ⚠️ Limitations
- Rules cannot read all documents at once (performance)
- Batch operations need individual permission checks
- Admin functions should be handled in Cloud Functions for security

### 🔐 Best Practices
1. **Never** expose sensitive data in Firestore (API keys, passwords)
2. **Always** validate data on backend before writing
3. **Use** Cloud Functions for critical operations
4. **Monitor** Firestore usage patterns
5. **Test** rules thoroughly in emulator before production

### 🚀 Performance Tips
1. Index frequently queried fields
2. Use pagination for large result sets
3. Cache leaderboard data
4. Limit listener subscriptions

---

## 7️⃣ Troubleshooting

### "Permission Denied" Error
- Check if user is authenticated
- Verify user ID matches UID in document
- Check if user is room participant
- Ensure admin status is set correctly

### "Document Not Found" in Rules
- Make sure document exists before accessing
- Use `get()` function to check existence
- Verify path is correct

### Slow Queries
- Add Firestore indexes
- Use smaller collections
- Implement pagination

---

## Database URLs (Firebase)

- **Project**: tawj-d1f01
- **Auth Domain**: tawj-d1f01.firebaseapp.com
- **Firestore**: firestore.googleapis.com
- **Database URL**: https://tawj-d1f01.firebaseapp.com

---

Last Updated: April 30, 2026
Version: 1.0
