import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styless/CommentsPage.css';

export default function CommentsPage({ profileId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const [userId, setUserId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      if (!profileId) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        checkIfUserCanComment(user.id);
      }
      console.log('profileId:', profileId);
      console.log('Fetching user...');

    };
    getUser();
  }, [profileId]);

  const checkIfUserCanComment = async (currentUserId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .eq('sender_id', currentUserId)
      .eq('receiver_id', profileId)
      .eq('paid', true)
      .limit(1);

    if (data && data.length > 0) {
      setCanComment(true);
    }
    console.log('Checking canComment for user:', currentUserId, '-> profile:', profileId);
    console.log('Querying messages with conditions...');
    console.log('sender_id =', currentUserId);
    console.log('receiver_id =', profileId);
    console.log('Supabase response:', data, error);

  };

  const fetchComments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('comments')
      .select('content, created_at, author:author_id(real_name, avatar)')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (!error) setComments(data);
    else console.error('Error loading comments:', error);
    setLoading(false);
  };

  useEffect(() => {
    if (profileId) fetchComments();
  }, [profileId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    const { error } = await supabase.from('comments').insert([
      {
        profile_id: profileId,
        author_id: userId,
        content: newComment.trim(),
      },
    ]);

    if (!error) {
      setNewComment('');
      fetchComments();
    }

    setSubmitting(false);
  };

  return (
    <div className="comments-container">
      <h2 className="comments-title">Отзывы</h2>

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : comments.length === 0 ? (
        <div className="no-comments">Нет комментариев</div>
      ) : (
        <ul className="comments-list">
          {comments.map((comment, idx) => (
            <li key={idx} className="comment">
              <img
                src={comment.author.avatar || '/default-avatar.png'}
                alt="avatar"
                className="comment-avatar"
              />
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-author">{comment.author.real_name}</span>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleDateString()}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canComment && (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Оставьте отзыв..."
            className="comment-input"
          />
          <button type="submit" className="comment-submit" disabled={submitting}>
            {submitting ? 'Отправка...' : 'Оставить отзыв'}
          </button>
        </form>
      )}
    </div>
  );
}
