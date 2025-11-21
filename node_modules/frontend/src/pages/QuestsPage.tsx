import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
}

export function QuestsPage() {
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        // Hardcode the API URL for now since env vars aren't working
        const apiUrl = 'http://localhost:4000/api';
        console.log('Fetching from:', `${apiUrl}/chapters`);
        const response = await fetch(`${apiUrl}/chapters`);

        if (response.ok) {
          const result = await response.json();
          // Handle both {success: true, data: [...]} and direct array responses
          const chaptersData = result.data || result;
          setChapters(Array.isArray(chaptersData) ? chaptersData : []);
        } else {
          const errorText = await response.text();
          console.error('Failed to load chapters:', response.status, errorText);
          setError(`Failed to load chapters: ${response.status}`);
        }
      } catch (err) {
        console.error('Error loading chapters:', err);
        setError(`Error loading chapters: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e'
      }}>
        <h2 style={{ color: '#fff' }}>Loading chapters...</h2>
        <p style={{ color: '#aaa' }}>Please wait while we fetch your adventure...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e'
      }}>
        <h2 style={{ color: '#ff6b6b' }}>Error: {error}</h2>
        <p style={{ color: '#aaa', marginBottom: '1rem' }}>
          Unable to load chapters. Please check the console for details.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#fff',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>GitQuest Chapters</h1>
          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
          >
            ← Back to Dashboard
          </button>
        </div>

        {chapters.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            backgroundColor: '#16213e',
            borderRadius: '12px'
          }}>
            <p style={{ fontSize: '1.2rem', color: '#aaa' }}>No chapters available yet.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {chapters.map((chapter) => (
              <div
                key={chapter.id}
                style={{
                  border: '2px solid #6366f1',
                  borderRadius: '12px',
                  padding: '2rem',
                  backgroundColor: '#16213e',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#6366f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}>
                    {chapter.order}
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
                    {chapter.title}
                  </h2>
                </div>
                <p style={{ color: '#ccc', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  {chapter.description}
                </p>
                <button
                  onClick={() => navigate(`/chapter/${chapter.id}`)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
                >
                  View Quests →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
