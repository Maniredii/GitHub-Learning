import React, { useEffect, useState } from 'react';
import { analyticsApi, AnalyticsSummary, QuestCompletionRate, QuestAverageTime, CommonError, RetentionData } from '../services/analyticsApi';
import './AnalyticsDashboard.css';

const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [completionRates, setCompletionRates] = useState<QuestCompletionRate[]>([]);
  const [averageTimes, setAverageTimes] = useState<QuestAverageTime[]>([]);
  const [commonErrors, setCommonErrors] = useState<CommonError[]>([]);
  const [retention, setRetention] = useState<RetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryData, ratesData, timesData, errorsData, retentionData] = await Promise.all([
        analyticsApi.getSummary(dateRange.start || undefined, dateRange.end || undefined),
        analyticsApi.getQuestCompletionRates(),
        analyticsApi.getQuestAverageTimes(),
        analyticsApi.getCommonErrors(undefined, 10),
        analyticsApi.getRetentionRates(dateRange.start || undefined, dateRange.end || undefined),
      ]);

      setSummary(summaryData);
      setCompletionRates(ratesData);
      setAverageTimes(timesData);
      setCommonErrors(errorsData);
      setRetention(retentionData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load analytics');
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const applyDateFilter = () => {
    loadAnalytics();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <h1>Analytics Dashboard</h1>

      {/* Date Range Filter */}
      <div className="date-filter">
        <label>
          Start Date:
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
          />
        </label>
        <button onClick={applyDateFilter}>Apply Filter</button>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="summary-section">
          <h2>Overview</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-value">{summary.totalUsers}</div>
              <div className="card-label">Total Users</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{summary.totalQuestStarts}</div>
              <div className="card-label">Quest Starts</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{summary.totalQuestCompletions}</div>
              <div className="card-label">Quest Completions</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{summary.overallCompletionRate.toFixed(1)}%</div>
              <div className="card-label">Completion Rate</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{summary.totalCommands}</div>
              <div className="card-label">Commands Executed</div>
            </div>
            <div className="summary-card">
              <div className="card-value">{summary.totalHintsUsed}</div>
              <div className="card-label">Hints Used</div>
            </div>
          </div>
        </div>
      )}

      {/* Quest Completion Funnel */}
      <div className="completion-section">
        <h2>Quest Completion Rates</h2>
        <div className="completion-table">
          <table>
            <thead>
              <tr>
                <th>Quest ID</th>
                <th>Total Attempts</th>
                <th>Completions</th>
                <th>Failures</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {completionRates.map((rate) => (
                <tr key={rate.questId}>
                  <td>{rate.questId}</td>
                  <td>{rate.totalAttempts}</td>
                  <td>{rate.completions}</td>
                  <td>{rate.failures}</td>
                  <td>
                    <div className="rate-bar">
                      <div
                        className="rate-fill"
                        style={{ width: `${rate.completionRate}%` }}
                      />
                      <span>{rate.completionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Average Time Per Quest */}
      <div className="time-section">
        <h2>Average Time Per Quest</h2>
        <div className="time-table">
          <table>
            <thead>
              <tr>
                <th>Quest ID</th>
                <th>Sessions</th>
                <th>Average Time</th>
                <th>Median Time</th>
              </tr>
            </thead>
            <tbody>
              {averageTimes.map((time) => (
                <tr key={time.questId}>
                  <td>{time.questId}</td>
                  <td>{time.totalSessions}</td>
                  <td>{formatTime(time.averageTimeSeconds)}</td>
                  <td>{formatTime(time.medianTimeSeconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Common Errors */}
      <div className="errors-section">
        <h2>Most Common Errors</h2>
        <div className="errors-table">
          <table>
            <thead>
              <tr>
                <th>Quest ID</th>
                <th>Command</th>
                <th>Error Message</th>
                <th>Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {commonErrors.map((error, index) => (
                <tr key={index}>
                  <td>{error.questId}</td>
                  <td><code>{error.command}</code></td>
                  <td className="error-message">{error.errorMessage}</td>
                  <td>{error.occurrences}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retention Cohort Analysis */}
      {retention && (
        <div className="retention-section">
          <h2>Retention Cohort Analysis</h2>
          
          <div className="retention-subsection">
            <h3>1-Day Retention</h3>
            <table>
              <thead>
                <tr>
                  <th>Cohort Date</th>
                  <th>Total Users</th>
                  <th>Returned Users</th>
                  <th>Retention Rate</th>
                </tr>
              </thead>
              <tbody>
                {retention.day1.slice(0, 10).map((cohort) => (
                  <tr key={cohort.cohortDate}>
                    <td>{cohort.cohortDate}</td>
                    <td>{cohort.totalUsers}</td>
                    <td>{cohort.returnedUsers}</td>
                    <td>{cohort.retentionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="retention-subsection">
            <h3>7-Day Retention</h3>
            <table>
              <thead>
                <tr>
                  <th>Cohort Date</th>
                  <th>Total Users</th>
                  <th>Returned Users</th>
                  <th>Retention Rate</th>
                </tr>
              </thead>
              <tbody>
                {retention.day7.slice(0, 10).map((cohort) => (
                  <tr key={cohort.cohortDate}>
                    <td>{cohort.cohortDate}</td>
                    <td>{cohort.totalUsers}</td>
                    <td>{cohort.returnedUsers}</td>
                    <td>{cohort.retentionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="retention-subsection">
            <h3>30-Day Retention</h3>
            <table>
              <thead>
                <tr>
                  <th>Cohort Date</th>
                  <th>Total Users</th>
                  <th>Returned Users</th>
                  <th>Retention Rate</th>
                </tr>
              </thead>
              <tbody>
                {retention.day30.slice(0, 10).map((cohort) => (
                  <tr key={cohort.cohortDate}>
                    <td>{cohort.cohortDate}</td>
                    <td>{cohort.totalUsers}</td>
                    <td>{cohort.returnedUsers}</td>
                    <td>{cohort.retentionRate.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
