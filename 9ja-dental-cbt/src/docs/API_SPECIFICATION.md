# Unified Progress API Specification

## Overview

This document defines the unified API endpoints for the 9ja Dental CBT application's progress tracking system. The API provides consistent data structures across all dashboard components.

## Base URL

```
https://api.9ja-dental-cbt.com/v1
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Unified Progress Endpoint

### GET /users/{userId}/progress

Retrieves comprehensive user progress data with standardized field names.

#### Parameters

- `userId` (string, required): The unique identifier for the user

#### Query Parameters

- `includeHistory` (boolean, optional): Include detailed history data (default: false)
- `limit` (number, optional): Limit for recent activities (default: 10, max: 50)

#### Response Format

```typescript
interface UnifiedProgressResponse {
  success: boolean;
  data: UnifiedProgressData;
  timestamp: string;
}

interface UnifiedProgressData {
  userId: string;

  // Core quiz statistics (standardized naming)
  totalQuizzes: number; // Total number of quizzes available
  completedQuizzes: number; // Number of quizzes completed by user
  totalQuestionsAnswered: number; // Total questions answered across all quizzes
  correctAnswers: number; // Total correct answers
  incorrectAnswers: number; // Total incorrect answers
  averageScore: number; // Average score as percentage (0-100)

  // Time tracking
  totalStudyTime: number; // Total study time in minutes

  // Streak data
  currentStreak: number; // Current consecutive days streak
  longestStreak: number; // Longest streak ever achieved
  lastActivityDate: string | null; // ISO date string of last activity
  streakHistory?: StreakDay[]; // Optional detailed streak history

  // Leveling system
  currentLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  experiencePoints: number; // Current experience points
  pointsToNextLevel: number; // Points needed for next level
  userRank: number; // Current rank among all users
  totalUsers: number; // Total number of users for ranking context

  // Specialty coverage
  specialtyCoverage: SpecialtyCoverage;

  // Recent activity
  recentQuizzes: QuizAttempt[];
  recentStudySessions?: StudySession[];

  // Additional data
  bookmarkedQuestions?: BookmarkedQuestion[];
  performanceCharts?: PerformanceChart[];
  badges: Badge[];
}
```

#### Supporting Interfaces

```typescript
interface StreakDay {
  date: string; // ISO date string (YYYY-MM-DD)
  active: boolean; // Whether user was active on this day
}

interface SpecialtyCoverage {
  [specialty: string]: {
    questionsAttempted: number;
    accuracy: string; // Percentage as string (e.g., "85%")
    mastery: "Beginner" | "Intermediate" | "Advanced" | "Expert";
    lastAttempted: string; // ISO date string
  };
}

interface QuizAttempt {
  id: string;
  date: string; // ISO date string
  mode: "Study Mode" | "Exam Mode" | "Practice Mode" | "Challenge Mode";
  specialty: string;
  questionsAttempted: number;
  correct: number;
  incorrect: number;
  score: string; // Percentage as string (e.g., "85%")
  timeSpent: number; // Minutes
}

interface StudySession {
  id: string;
  date: string; // ISO date string
  specialty: string;
  timeSpent: number; // Minutes
  topicsStudied: string[];
  completionPercentage: number; // 0-100
}

interface BookmarkedQuestion {
  id: string;
  question: string;
  specialty: string;
  dateBookmarked: string; // ISO date string
  difficulty: "Easy" | "Medium" | "Hard";
  isReviewed: boolean;
}

interface PerformanceChart {
  date: string; // ISO date string (YYYY-MM-DD)
  accuracy: number; // 0-100
  questionsAnswered: number;
  timeSpent: number; // Minutes
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon identifier
  earnedOn: string; // ISO date string
  category: "Achievement" | "Streak" | "Accuracy" | "Specialty";
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "userId": "user-123",
    "totalQuizzes": 50,
    "completedQuizzes": 45,
    "totalQuestionsAnswered": 450,
    "correctAnswers": 383,
    "incorrectAnswers": 67,
    "averageScore": 85.1,
    "totalStudyTime": 1250,
    "currentStreak": 5,
    "longestStreak": 12,
    "lastActivityDate": "2025-09-08T10:30:00Z",
    "currentLevel": "Advanced",
    "experiencePoints": 2450,
    "pointsToNextLevel": 550,
    "userRank": 23,
    "totalUsers": 1284,
    "specialtyCoverage": {
      "Oral Pathology": {
        "questionsAttempted": 45,
        "accuracy": "82%",
        "mastery": "Advanced",
        "lastAttempted": "2025-09-08T10:30:00Z"
      }
    },
    "recentQuizzes": [
      {
        "id": "q1",
        "date": "2025-09-08T10:30:00Z",
        "mode": "Study Mode",
        "specialty": "Oral Pathology",
        "questionsAttempted": 10,
        "correct": 8,
        "incorrect": 2,
        "score": "80%",
        "timeSpent": 15
      }
    ],
    "badges": [
      {
        "id": "b1",
        "name": "Streak Master",
        "description": "Maintained a 7-day streak",
        "icon": "🔥",
        "earnedOn": "2025-09-01T00:00:00Z",
        "category": "Streak"
      }
    ]
  },
  "timestamp": "2025-09-20T12:00:00Z"
}
```

#### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User with ID user-123 not found",
    "timestamp": "2025-09-20T12:00:00Z"
  }
}
```

Common error codes:

- `USER_NOT_FOUND`: User ID does not exist
- `UNAUTHORIZED`: Invalid or missing authentication token
- `FORBIDDEN`: User not authorized to access this data
- `RATE_LIMITED`: Too many requests (429)
- `INTERNAL_ERROR`: Server error (500)

## Additional Endpoints

### GET /users/{userId}/progress/summary

Returns a lightweight summary of progress data for quick dashboard loading.

### POST /users/{userId}/progress/refresh

Triggers a manual refresh of cached progress data.

### GET /users/{userId}/progress/history

Returns detailed historical progress data with time-series information.

## Migration Strategy

### Phase 1: Backward Compatibility

- Keep existing endpoints functional
- Introduce new unified endpoint in parallel
- Add feature flags for gradual rollout

### Phase 2: Frontend Migration

- Update frontend components to use unified endpoint
- Maintain fallback to legacy endpoints
- Monitor performance and error rates

### Phase 3: Legacy Deprecation

- Deprecate old endpoints with appropriate warnings
- Remove legacy endpoints after migration completion
- Clean up unused data structures

## Database Schema Recommendations

### Core Tables

- `users`: User account information
- `quizzes`: Available quizzes and metadata
- `quiz_attempts`: User quiz attempt records
- `study_sessions`: User study session tracking
- `user_progress`: Aggregated progress statistics
- `streaks`: Daily activity tracking
- `badges`: Achievement tracking

### Key Indexes

- `quiz_attempts(user_id, created_at)`: For recent activity queries
- `user_progress(user_id)`: For dashboard data retrieval
- `streaks(user_id, date)`: For streak calculations

## Caching Strategy

### Redis Caching

- Cache user progress data for 5 minutes
- Cache leaderboard data for 15 minutes
- Cache specialty statistics for 1 hour

### Cache Keys

- `progress:user:{userId}`: User progress data
- `leaderboard:global`: Global leaderboard
- `stats:specialty:{specialty}`: Specialty statistics

## Rate Limiting

### Limits

- 60 requests per minute per user for progress endpoints
- 10 requests per minute for refresh endpoints
- 100 requests per minute for read-only summary endpoints

## Monitoring & Analytics

### Key Metrics

- Response time percentiles (p50, p95, p99)
- Error rate by endpoint
- Cache hit rate
- Database query performance

### Alerts

- Response time > 500ms (p95)
- Error rate > 1%
- Cache hit rate < 85%

This specification ensures consistent data structures, optimal performance, and seamless frontend integration while maintaining backward compatibility during migration.
