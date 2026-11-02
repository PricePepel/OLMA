# OLMA Gamification System

This document provides comprehensive documentation for the Gamification System implemented in the OLMA MVP, including currency earning, achievements, levels, streaks, and leaderboards.

## Overview

The gamification system is designed to encourage user engagement and participation through a comprehensive reward system that includes:

- **Personal Currency**: Earned through various activities
- **Experience Points (XP)**: Lead to level progression
- **Achievements**: Milestone-based rewards
- **Streaks**: Daily activity bonuses
- **Leaderboards**: Competitive rankings
- **Shop**: Cosmetic items and features

## Core Components

### 1. Currency System

#### Personal Currency Earning Rules
- **Post Creation**: +5 currency
- **Meetup Completion**: +10 currency
- **Daily Streak**: +1 currency per day
- **First Post**: +25 currency (one-time)
- **First Meetup**: +50 currency (one-time)
- **Achievement Earned**: +15 currency
- **Level Up**: +20 currency

#### Club Currency Earning Rules
- **Event Organized**: +5 currency
- **Event Attended**: +5 currency
- **Club Created**: +25 currency

### 2. Experience Points (XP) System

#### XP Earning Rules
- **Post Creation**: +10 XP
- **Meetup Completion**: +25 XP
- **Achievement Earned**: +50 XP
- **Event Organized**: +15 XP
- **Event Attended**: +10 XP
- **Skill Offer Created**: +5 XP
- **Skill Offer Accepted**: +20 XP

#### Level Calculation
- **Formula**: `level = 1 + floor(sqrt(xp / 50))`
- **Level 1**: 0 XP
- **Level 2**: 100 XP
- **Level 3**: 250 XP
- **Level 4**: 400 XP
- And so on...

#### Level Titles
- **Levels 1-10**: Newcomer
- **Levels 11-20**: Explorer
- **Levels 21-30**: Learner
- **Levels 31-40**: Enthusiast
- **Levels 41-50**: Contributor
- **Levels 51-60**: Helper
- **Levels 61-70**: Mentor
- **Levels 71-80**: Expert
- **Levels 81-90**: Master
- **Levels 91+**: Legend

### 3. Achievement System

#### Available Achievements

| Achievement | Type | Requirement | XP Reward | Currency Reward |
|-------------|------|-------------|-----------|-----------------|
| First Post | Teaching | Create 1 post | 25 | 25 |
| First Meetup | Learning | Complete 1 meetup | 50 | 50 |
| Week Warrior | Consistency | 7-day streak | 100 | 15 |
| Monthly Master | Consistency | 30-day streak | 500 | 15 |
| Club Creator | Community | Create 1 club | 75 | 15 |
| Event Organizer | Events | Organize 1 event | 60 | 15 |
| Skill Master | Teaching | Create 10 skill offers | 150 | 15 |
| Currency Collector | Economy | Earn 1000 currency | 200 | 15 |
| Social Butterfly | Events | Join 5 clubs | 80 | 15 |
| Helper | Learning | Complete 5 meetups | 120 | 15 |

#### Achievement Categories
- **Teaching**: Skill-related achievements
- **Learning**: Learning and participation achievements
- **Community**: Club and social achievements
- **Events**: Event participation achievements
- **Consistency**: Streak-based achievements
- **Economy**: Currency-related achievements

### 4. Streak System

#### Streak Calculation
- **Daily Activity**: Any post, meetup, or event participation
- **Streak Continuation**: Activity within 24 hours of last activity
- **Streak Reset**: More than 24 hours gap in activity
- **Daily Bonus**: +1 currency for maintaining streak

#### Streak Rewards
- **Daily**: +1 currency
- **7 Days**: Week Warrior achievement
- **30 Days**: Monthly Master achievement

### 5. Leaderboard System

#### Categories
- **Overall**: Combined score (XP + currency + level bonus)
- **Experience**: XP-based ranking
- **Currency**: Personal currency ranking
- **Achievements**: Number of achievements earned
- **Streak**: Current streak length

#### Time Periods
- **Weekly**: Last 7 days
- **Monthly**: Last 30 days
- **All Time**: Complete history

#### Ranking Calculation
- **Overall**: `XP + currency + (level * 100)`
- **Experience**: Total XP earned
- **Currency**: Total personal currency
- **Achievements**: Count of earned achievements
- **Streak**: Current streak days

### 6. Shop System

#### Item Types
- **Profile Frames**: Decorative borders for profiles
- **Badges**: Achievement-style badges
- **Backgrounds**: Profile background images

#### Purchase Process
1. User selects item from shop
2. System checks sufficient currency
3. Atomic transaction deducts currency
4. Item is added to user's inventory
5. Purchase is recorded in ledger

## Database Schema

### Core Tables

#### `currency_wallets`
```sql
CREATE TABLE currency_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  club_id UUID REFERENCES clubs(id),
  type currency_type NOT NULL,
  balance INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `currency_ledger`
```sql
CREATE TABLE currency_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES currency_wallets(id),
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ref_table TEXT,
  ref_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `achievements`
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type achievement_type NOT NULL,
  points INTEGER DEFAULT 0,
  icon_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `achievements_user`
```sql
CREATE TABLE achievements_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  achievement_id UUID REFERENCES achievements(id),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, achievement_id)
);
```

#### `shop_items`
```sql
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  currency_type currency_type DEFAULT 'personal',
  item_type TEXT DEFAULT 'cosmetic',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `purchases`
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  item_id UUID REFERENCES shop_items(id),
  wallet_id UUID REFERENCES currency_wallets(id),
  amount_paid INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `leaderboard_snapshots`
```sql
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  club_id UUID REFERENCES clubs(id),
  points INTEGER NOT NULL,
  rank INTEGER,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Endpoints

### Currency & Wallets
- `GET /api/currency/wallets/personal` - Get user's personal wallet
- `POST /api/currency/purchase` - Purchase shop item

### Achievements
- `GET /api/achievements/user` - Get user's achievements

### User Stats
- `GET /api/user/stats` - Get comprehensive user statistics

### Shop
- `GET /api/shop/items` - Get available shop items
- `GET /api/shop/purchases` - Get user's purchases

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard rankings
- `GET /api/leaderboard/rank` - Get user's current rank

## Implementation Details

### Core Functions

#### Currency Awarding
```typescript
export async function awardPersonalCurrency(
  userId: string,
  amount: number,
  reason: string,
  refTable?: string,
  refId?: string
): Promise<boolean>
```

#### Experience Points
```typescript
export async function awardExperiencePoints(
  userId: string,
  amount: number,
  reason: string
): Promise<{ newLevel: number; leveledUp: boolean; xpToNext: number }>
```

#### Achievement Checking
```typescript
export async function checkAndAwardAchievements(userId: string): Promise<string[]>
```

#### Streak Management
```typescript
export async function updateUserStreak(userId: string): Promise<{ newStreak: number; streakBonus: number }>
```

### Activity Rewards

#### Post Creation
```typescript
export async function rewardPostCreation(userId: string, postId: string): Promise<void>
```

#### Meetup Completion
```typescript
export async function rewardMeetupCompletion(
  userId: string,
  meetupId: string,
  isOrganizer: boolean = false
): Promise<void>
```

#### Event Participation
```typescript
export async function rewardEventParticipation(
  userId: string,
  eventId: string,
  clubId: string,
  isOrganizer: boolean = false
): Promise<void>
```

## UI Components

### Shop Component
- **Features**: Item browsing, purchase confirmation, wallet display
- **Categories**: Profile frames, badges, backgrounds
- **Functionality**: Currency checking, purchase processing, inventory management

### Achievements Component
- **Features**: Achievement progress tracking, category filtering, stats display
- **Categories**: Teaching, Learning, Community, Events, Consistency, Economy
- **Functionality**: Progress bars, earned badges, achievement details

### Leaderboard Component
- **Features**: Multi-category rankings, time period filtering, user stats
- **Categories**: Overall, Experience, Currency, Achievements, Streak
- **Functionality**: Rank display, category switching, period selection

## Security & Validation

### Currency Transactions
- **Atomic Operations**: All currency transactions are atomic
- **Balance Validation**: Prevents negative balances
- **Ledger Tracking**: All transactions are logged
- **Rate Limiting**: Prevents abuse

### Achievement Validation
- **Progress Tracking**: Real-time achievement progress
- **Duplicate Prevention**: Achievements can only be earned once
- **Activity Verification**: Achievements based on actual user activity

### Leaderboard Integrity
- **Snapshot System**: Regular leaderboard snapshots
- **Category Filtering**: Accurate category-based rankings
- **Period Validation**: Proper time period calculations

## Performance Considerations

### Database Optimization
- **Indexes**: Optimized indexes for leaderboard queries
- **Caching**: Leaderboard data caching for performance
- **Pagination**: Efficient pagination for large datasets

### Real-time Updates
- **WebSocket Integration**: Real-time achievement notifications
- **Background Jobs**: Automated leaderboard updates
- **Event-driven**: Activity-based reward triggers

## Future Enhancements

### Planned Features
- **Seasonal Events**: Time-limited achievements and rewards
- **Team Challenges**: Group-based achievements
- **Advanced Streaks**: Multi-activity streak tracking
- **Achievement Sharing**: Social achievement sharing
- **Custom Badges**: User-created achievement badges

### Technical Improvements
- **Machine Learning**: Personalized reward suggestions
- **Analytics**: Detailed engagement analytics
- **A/B Testing**: Reward system optimization
- **Mobile Push**: Achievement notifications

## Configuration

### Environment Variables
```env
# Gamification Settings
GAMIFICATION_ENABLED=true
ACHIEVEMENT_NOTIFICATIONS=true
LEADERBOARD_UPDATE_INTERVAL=3600
STREAK_RESET_HOURS=24
```

### Feature Flags
- `GAMIFICATION_ENABLED`: Enable/disable gamification system
- `ACHIEVEMENT_NOTIFICATIONS`: Enable achievement notifications
- `SHOP_ENABLED`: Enable shop functionality
- `LEADERBOARD_ENABLED`: Enable leaderboard system

## Monitoring & Analytics

### Key Metrics
- **Engagement Rate**: User participation in gamified activities
- **Achievement Completion**: Achievement unlock rates
- **Currency Circulation**: Currency earning and spending patterns
- **Streak Retention**: User streak maintenance rates
- **Leaderboard Activity**: Leaderboard participation rates

### Error Tracking
- **Transaction Failures**: Currency transaction errors
- **Achievement Bugs**: Achievement calculation issues
- **Leaderboard Errors**: Ranking calculation problems
- **Shop Issues**: Purchase processing errors

## Conclusion

The OLMA gamification system provides a comprehensive framework for user engagement through multiple reward mechanisms. The system is designed to be scalable, secure, and user-friendly while providing meaningful incentives for community participation and skill development.

The modular design allows for easy extension and customization, while the robust database schema ensures data integrity and performance. The UI components provide an intuitive user experience for interacting with all gamification features.





















