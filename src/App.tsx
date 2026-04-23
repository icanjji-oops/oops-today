import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 
import { Button, Text, Spacing } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import './App.css';

function App() {
  const [tab, setTab] = useState('daily');
  const [content, setContent] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) setPosts(data);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    if (!score) return alert("지수를 먼저 측정해주세요!");
    
    const { error } = await supabase
      .from('posts')
      .insert([{
        tab: tab, 
        user: '나의 앗차',
        text: content,
        score: score,
        hearts: 0,
        photo_url: photoUrl,
        comments: []
      }]);

    if (!error) {
      setContent('');
      setScore(null);
      setPhotoUrl(null);
      fetchPosts();
      alert("글이 등록되었습니다! 🤪");
    } else {
      console.error("등록 에러 상세:", error);
      alert(`등록 실패: ${error.message}`);
    }
  };

  const toggleHeart = async (postId: number, currentHearts: number) => {
    const { error } = await supabase
      .from('posts')
      .update({ hearts: (currentHearts || 0) + 1 })
      .eq('id', postId);

    if (!error) fetchPosts();
  };

  const addComment = async (postId: number, currentComments: string[]) => {
    const text = commentInputs[postId];
    if (!text) return;
    const updatedComments = currentComments ? [...currentComments, text] : [text];
    const { error } = await supabase
      .from('posts')
      .update({ comments: updatedComments })
      .eq('id', postId);

    if (!error) {
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchPosts();
    }
  };

  const hallOfFame = [...posts].filter(p => p.hearts > 0).sort((a, b) => b.hearts - a.hearts).slice(0, 3);

  return (
    <div className="toss-wrapper">
      <div className="toss-container">
        <header className="header">
          <Text typography="t3" fontWeight="bold">오늘의 앗차! 🤪</Text>
          <span className="safe-badge">🛡️ 실시간 DB 연동 중</span>
        </header>

        <nav className="tabs">
          <button className={tab === 'economic' ? 'active' : ''} onClick={() => setTab('economic')}>💸 경제</button>
          <button className={tab === 'love' ? 'active' : ''} onClick={() => setTab('love')}>💔 이불킥</button>
          <button className={tab === 'daily' ? 'active' : ''} onClick={() => setTab('daily')}>🤪 우당탕</button>
        </nav>

        <section className="main-content">
          {hallOfFame.length > 0 && (
            <div className="hall-of-fame-section">
              <Text typography="t6" fontWeight="bold" color={colors.grey700} style={{ marginBottom: 12, paddingLeft: 4 }}>
                🏆 실시간 앗차 전당
              </Text>
              <div className="hall-scroll-container">
                {hallOfFame.map(post => (
                  <div key={post.id} className="hall-card">
                    <div className="hall-tag">TOP</div>
                    <Text typography="t7" color={colors.grey800} style={{ height: 36, overflow: 'hidden', marginBottom: 12 }}>
                      {post.text.substring(0, 25)}...
                    </Text>
                    <div className="hall-info">❤️ {post.hearts}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="input-card">
            <textarea 
              placeholder="실수 사연을 적어주세요..." 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
            />
            
            <div className="input-photo-container">
                <label className="btn-photo">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="input-file-hidden" />
                  📷 사진 첨부
                </label>
                {photoUrl && <img src={photoUrl} alt="미리보기" className="photo-preview" />}
            </div>

            <Spacing size={16} />

            <div className="button-group">
              <Button 
                type="light" 
                style={{ flex: 1 }} 
                onClick={() => setScore(Math.floor(Math.random() * 40) + 60)}
              >
                {score ? `측정완료 (${score}점)` : '지수 측정'}
              </Button>
              <Button 
                type="primary" 
                style={{ flex: 1.5 }} 
                onClick={handleRegister}
              >
                등록하기
              </Button>
            </div>
          </div>

          <Spacing size={24} />
          <Text typography="t6" fontWeight="bold" color={colors.grey700} style={{ textAlign: 'center', marginBottom: 20 }}>
            최근 올라온 이야기
          </Text>
          
          {posts.filter(p => p.tab === tab).map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <Text typography="t7" color={colors.grey500}>{post.user}</Text>
                <span className="post-score-badge">{post.score}점</span>
              </div>
              <Text typography="t5" color={colors.grey800} style={{ marginBottom: 20, textAlign: 'center', lineHeight: 1.6 }}>
                {post.text}
              </Text>
              
              {post.photo_url && <img src={post.photo_url} alt="실수 사진" className="post-photo" />}

              <div className="post-actions">
                <button className="action-item" onClick={() => toggleHeart(post.id, post.hearts)}>
                  ❤️ 웃퍼요 <span className="count">{post.hearts || 0}</span>
                </button>
                <button className="action-item">💬 댓글 {post.comments?.length || 0}</button>
              </div>
              <div className="comment-box">
                {post.comments?.map((c: string, i: number) => (
                  <Text key={i} typography="t7" color={colors.grey700} style={{ marginBottom: 6 }}>
                    💬 {c}
                  </Text>
                ))}
              </div>
              <div className="comment-input-row">
                <input 
                  placeholder="댓글 입력..." 
                  value={commentInputs[post.id] || ''} 
                  onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                  onKeyDown={(e) => e.key === 'Enter' && addComment(post.id, post.comments)}
                />
                <button onClick={() => addComment(post.id, post.comments)}>게시</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;