import React, { useState, useEffect } from 'react';
import { supabase } from './supabase'; 
import { Button, Text, Spacing } from '@toss/tds-mobile';
import { colors } from '@toss/tds-colors';
import { useInAppAds } from './hooks/useInAppAds';
import './App.css';

function App() {
  const [tab, setTab] = useState('daily');
  const [content, setContent] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🚀 전면 광고 훅 사용
  const { showInterstitialAd } = useInAppAds();

  const badWords = ['바보', '멍청이', '나쁜놈', '욕설1', '비방1'];

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

  const generateNickname = (content: string, category: string) => {
    if (content.includes('주식') || content.includes('코인') || content.includes('돈') || content.includes('삼성')) return '자본주의가낳은괴물';
    if (content.includes('지하철') || content.includes('버스') || content.includes('택시') || content.includes('지각')) return '대중교통유랑자';
    if (content.includes('남친') || content.includes('여친') || content.includes('고백') || content.includes('사랑')) return '고백공격수';
    if (content.includes('넘어') || content.includes('쏟') || content.includes('깨') || content.includes('우당탕')) return '인간우당탕';
    if (content.includes('술') || content.includes('맥주') || content.includes('회식')) return '만취인멜로디';

    const nicknames: Record<string, string[]> = {
      economic: ['텅장수호자', '마이너스손', '파산1초전'],
      love: ['이불킥마스터', '흑역사제조기', '추억조작범'],
      daily: ['프로실수러', '덤벙이', '앗차봇']
    };
    return nicknames[category]?.[Math.floor(Math.random() * (nicknames[category].length))] || '덤벙이';
  };

  const handleRegister = async (finalScore: number) => {
    const randomUser = generateNickname(content, tab);

    const { error } = await supabase
      .from('posts')
      .insert([{
        tab: tab,
        user: randomUser,
        text: content,
        score: finalScore,
        hearts: 0,
        photo_url: photoUrl,
        comments: []
      }]);

    if (!error) {
      setContent('');
      setScore(null);
      setPhotoUrl(null);
      fetchPosts();
      alert(`[${randomUser}] 님으로 등록 완료! 🤪`);
    } else {
      alert(`등록 실패: ${error.message}`);
    }
  };

  const handleAdRegister = async () => {
    if (!score) return alert("지수를 먼저 측정해주세요!");
    if (badWords.some(word => content.includes(word))) return alert("부적절한 단어가 포함되어 사연을 등록할 수 없습니다. 🤫");

    try {
 // 🚀 showRewardedAd 대신 showInterstitialAd(전면 광고) 함수를 사용합니다!
 //await showInterstitialAd('ait-ad-test-interstitial-id');

       await showInterstitialAd('ait.v2.live.984daa383aa54cf6');
      const boostedScore = score * 2;
      alert(`🎉 잭팟! 실수 지수가 ${boostedScore}점으로 2배 뻥튀기 되었습니다! 명예의 전당을 노려보세요!`);
      await handleRegister(boostedScore);
    } catch (error) {
      console.warn("광고 시청 실패:", error);
      const isConfirm = window.confirm("광고를 끝까지 시청해야 점수가 2배가 됩니다. 일반 등록으로 진행할까요?");
      if (isConfirm) await handleRegister(score);
    }
  };

const handleShare = async (post: any) => {
    try {
      // 1. 토스 미니앱 초대 링크
      const appUrl = "https://minion.toss.im/RmlwqKmD";

      // 2. 선택한 게시물(post)에서 정보 빼오기
      const nickname = post.user;
      const score = post.score;
      const mistake = post.text;

      // 3. 텍스트 조립하기
      const shareText = `🤪 오늘의 앗차!\n[${nickname}]님의 아찔한 실수 지수는 무려 ${score}점!\n\n"${mistake}"\n\n나의 실수 지수도 측정해보러 가기 👇\n${appUrl}`;

      // 4. 공유 실행
      if (navigator.share) {
        await navigator.share({
          title: '오늘의 앗차!',
          text: shareText,
          url: appUrl
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert("내용과 링크가 복사되었습니다! 카카오톡에 붙여넣기 해보세요. 📋");
      }
    } catch (error) {
      console.error("공유 취소 또는 오류:", error);
    }
  };

  const toggleAdminMode = () => {
    if (isAdmin) {
      setIsAdmin(false);
      alert("관리자 모드가 종료되었습니다.");
    } else {
      const pw = prompt("관리자 비밀번호를 입력하세요. (초기비밀번호: 9523)");
      if (pw === "9523") {
        setIsAdmin(true);
        alert("👑 관리자 권한이 활성화되었습니다!");
      }
    }
  };

  const deletePost = async (postId: number) => {
    if (!window.confirm("정말로 이 사연을 삭제하시겠어요? 🗑️")) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) fetchPosts();
  };

  const handleAdClick = async (currentTab: string) => {
    const adUrl = currentTab === 'economic' ? 'https://link.coupang.com/a/evkVt9' :
                  currentTab === 'love' ? 'https://link.coupang.com/a/evkYOO' : 'https://link.coupang.com/a/evk1q7';
    window.open(adUrl, '_blank');
  };

  const toggleHeart = async (postId: number, currentHearts: number) => {
    await supabase.from('posts').update({ hearts: (currentHearts || 0) + 1 }).eq('id', postId);
    fetchPosts();
  };

  const addComment = async (postId: number, currentComments: string[]) => {
    const text = commentInputs[postId];
    if (!text || badWords.some(word => text.includes(word))) return alert("비방이나 욕설은 작성할 수 없습니다. 🚫");

    await supabase.from('posts').update({ comments: currentComments ? [...currentComments, text] : [text] }).eq('id', postId);
    setCommentInputs({ ...commentInputs, [postId]: '' });
    fetchPosts();
  };

  const deleteComment = async (postId: number, commentIndex: number, currentComments: string[]) => {
    if (!window.confirm("이 댓글을 삭제하시겠어요?")) return;
    const updatedComments = currentComments.filter((_, i) => i !== commentIndex);
    await supabase.from('posts').update({ comments: updatedComments }).eq('id', postId);
    fetchPosts();
  };

  const hallOfFame = [...posts].filter(p => p.hearts > 0).sort((a, b) => b.hearts - a.hearts).slice(0, 3);

  return (
    <div className="toss-wrapper">
      <div className="toss-container">
        <header className="header">
          <Text typography="t3" fontWeight="bold">오늘의 앗차! 🤪</Text>
          <span className="safe-badge" onClick={toggleAdminMode} style={{ cursor: 'pointer' }}>
            {isAdmin ? '👑 관리자 켜짐' : '🛡️ 실시간 DB 연동 중'}
          </span>
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
            <textarea placeholder="실수 사연을 적어주세요..." value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="input-photo-container">
                <label className="btn-photo">
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="input-file-hidden" />
                  📷 사진 첨부
                </label>
                {photoUrl && <img src={photoUrl} alt="미리보기" className="photo-preview" />}
            </div>
            <Spacing size={16} />
            <div className="button-group">
              <Button type="light" style={{ flex: 1 }} onClick={() => setScore(Math.floor(Math.random() * 40) + 60)}>
                {score ? `지수: ${score}점` : '지수 측정'}
              </Button>
              {score ? (
                <>
                  <Button type="primary" style={{ flex: 1 }} onClick={() => handleRegister(score)}>그냥 등록</Button>
                  <button className="btn-ad-boost" onClick={handleAdRegister}>📺 점수 2배 뻥튀기!</button>
                </>
              ) : (
                <Button type="primary" style={{ flex: 1.5 }} onClick={() => alert("지수를 먼저 측정해주세요!")}>등록하기</Button>
              )}
            </div>
          </div>

          <Spacing size={24} />

          {posts.filter(p => p.tab === tab).map((post, index) => (
            <React.Fragment key={post.id}>
              <div className="post-card">
                <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text typography="t7" color={colors.grey500}>{post.user}</Text>
                    <span className="post-score-badge">{post.score}점</span>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deletePost(post.id)} style={{ border: 'none', background: 'transparent', color: '#F04452', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
                      삭제
                    </button>
                  )}
                </div>
                <Text typography="t5" color={colors.grey800} style={{ marginBottom: 20, textAlign: 'center', lineHeight: 1.6 }}>{post.text}</Text>
                {post.photo_url && <img src={post.photo_url} alt="실수 사진" className="post-photo" />}

                <div className="post-actions">
                  <button className="action-item" onClick={() => toggleHeart(post.id, post.hearts)}>❤️ 웃퍼요 <span className="count">{post.hearts || 0}</span></button>
                  <button className="action-item">💬 댓글 {post.comments?.length || 0}</button>
                  <button className="action-item share" onClick={() => handleShare(post)} style={{ marginLeft: 'auto' }}>🔗 공유하기</button>
                </div>

                <div className="comment-box">
                  {post.comments?.map((c: string, i: number) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text typography="t7" color={colors.grey700}>💬 {c}</Text>
                      {isAdmin && (
                        <button onClick={() => deleteComment(post.id, i, post.comments)} style={{ border: 'none', background: 'transparent', color: '#B0B8C1', fontSize: '11px', cursor: 'pointer' }}>
                          삭제
                        </button>
                      )}
                    </div>
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

              {(index + 1) % 2 === 0 && (
                <div className="ad-card" onClick={() => handleAdClick(tab)}>
                  <span className="ad-badge">앗차! 맞춤 추천</span>
                  <Text typography="t5" fontWeight="bold" color={colors.grey900} style={{ marginBottom: 4 }}>
                    {tab === 'economic' ? '📈 내 텅장 살리기, 재테크 베스트셀러 구경하기' :
                     tab === 'love' ? '🛌 이불킥 사연엔? 포근한 극세사 이불이 정답' :
                     '🩹 우당탕탕 실수 대비! 필수 구급상자 챙기기'}
                  </Text>
                  <Text typography="t7" color={colors.grey600}>지금 바로 확인해보기 〉</Text>
                </div>
              )}
            </React.Fragment>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;