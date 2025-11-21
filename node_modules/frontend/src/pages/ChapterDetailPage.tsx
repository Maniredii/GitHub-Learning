import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QuestList } from '../components/QuestList';
import { QuestView } from '../components/QuestView';
import type { Quest } from '../../../shared/src/types';
import { questApi } from '../services/questApi';

interface Chapter {
  id: string;
  title: string;
  description: string;
  order: number;
}

export function ChapterDetailPage() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!chapterId) return;
      
      try {
        const apiUrl = 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/chapters/${chapterId}`);
        
        if (response.ok) {
          const result = await response.json();
          setChapter(result.data || result);
        }
      } catch (err) {
        console.error('Error loading chapter:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [chapterId]);

  const handleQuestSelect = async (questId: string) => {
    try {
      const quest = await questApi.getQuestById(questId);
      setSelectedQuest(quest);
    } catch (err) {
      console.error('Error loading quest:', err);
    }
  };

  const handleQuestComplete = () => {
    setSelectedQuest(null);
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
        color: '#fff'
      }}>
        <h2>Loading chapter...</h2>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#fff'
      }}>
        <h2>Chapter not found</h2>
        <button 
          onClick={() => navigate('/quests')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Back to Chapters
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#fff'
    }}>
      {selectedQuest ? (
        <div>
          <div style={{ 
            padding: '1rem 2rem',
            backgroundColor: '#16213e',
            borderBottom: '2px solid #6366f1'
          }}>
            <button 
              onClick={() => setSelectedQuest(null)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              ← Back to Quest List
            </button>
          </div>
          <QuestView 
            quest={selectedQuest} 
            onComplete={handleQuestComplete}
          />
        </div>
      ) : (
        <div style={{ padding: '2rem' }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto',
            marginBottom: '2rem'
          }}>
            <button 
              onClick={() => navigate('/quests')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1.5rem'
              }}
            >
              ← Back to Chapters
            </button>
            
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {chapter.title}
            </h1>
            <p style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '2rem' }}>
              {chapter.description}
            </p>
          </div>

          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {chapterId && (
              <QuestList 
                chapterId={chapterId}
                onQuestSelect={handleQuestSelect}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
