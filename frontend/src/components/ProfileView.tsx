import { useEffect, useState } from 'react';
import { getUserProfile } from '../services/userApi';
import type { UserProfile } from '../services/userApi';
import './ProfileView.css';

interface ProfileViewProps {
  token: string;
  onNavigateBack?: () => void;
}

export function ProfileView({ token, onNavigateBack }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfile(token);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-view">
        <div className="profile-loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-view">
        <div className="profile-error">
          <p>{error}</p>
          <button onClick={loadProfile}>Retry</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const xpToNextLevel = (profile.progress.level + 1) * 100;
  const xpProgress = (profile.progress.xp % 100) / 100;

  return (
    <div className="profile-view">
      {onNavigateBack && (
        <button className="profile-back-button" onClick={onNavigateBack}>
          ← Back
        </button>
      )}

      <div className="profile-header">
        <div className="profile-avatar">
          <span className="profile-avatar-text">
            {profile.user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{profile.user.username}</h1>
          <p className="profile-rank">{profile.progress.rank}</p>
          <div className="profile-level-badge">Level {profile.progress.level}</div>
        </div>
      </div>

      <div className="profile-xp-section">
        <div className="profile-xp-header">
          <span className="profile-xp-label">Experience Points</span>
          <span className="profile-xp-value">
            {profile.progress.xp} / {xpToNextLevel} XP
          </span>
        </div>
        <div className="profile-xp-bar">
          <div className="profile-xp-fill" style={{ width: `${xpProgress * 100}%` }} />
        </div>
      </div>

      <div className="profile-statistics">
        <h2 className="profile-section-title">Progress Statistics</h2>
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value">{profile.statistics.questsCompleted}</div>
            <div className="profile-stat-label">Quests Completed</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{profile.statistics.chaptersUnlocked}</div>
            <div className="profile-stat-label">Chapters Unlocked</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{profile.statistics.achievementsEarned}</div>
            <div className="profile-stat-label">Achievements Earned</div>
          </div>
        </div>
      </div>

      <div className="profile-achievements">
        <h2 className="profile-section-title">Achievement Badges</h2>
        {profile.achievements.length === 0 ? (
          <p className="profile-no-achievements">
            No achievements yet. Complete quests to earn badges!
          </p>
        ) : (
          <div className="profile-achievements-grid">
            {profile.achievements.map((achievement) => (
              <div key={achievement.id} className="profile-achievement-card">
                <div className="profile-achievement-icon">{achievement.badgeIcon}</div>
                <div className="profile-achievement-info">
                  <h3 className="profile-achievement-name">{achievement.name}</h3>
                  <p className="profile-achievement-description">{achievement.description}</p>
                  <p className="profile-achievement-date">
                    Earned: {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
