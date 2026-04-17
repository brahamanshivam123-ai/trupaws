import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabase';

function timeLabel(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  const prev = new Date(today);
  prev.setDate(today.getDate() - 1);
  if (d.toDateString() === prev.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function MessageBubble({ msg, isMine }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '2px' }}
    >
      <div
        style={{
          maxWidth: '78%',
          background: isMine ? 'rgba(212,168,83,0.14)' : 'rgba(245,240,232,0.06)',
          border: `1px solid ${isMine ? 'rgba(212,168,83,0.24)' : 'rgba(245,240,232,0.08)'}`,
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '0.55rem 0.85rem',
        }}
      >
        <div style={{ fontSize: '0.88rem', color: '#F5F0E8', lineHeight: 1.55, wordBreak: 'break-word' }}>
          {msg.body}
        </div>
        <div
          style={{
            fontSize: '0.66rem',
            color: 'rgba(245,240,232,0.28)',
            marginTop: '0.18rem',
            textAlign: isMine ? 'right' : 'left',
          }}
        >
          {timeLabel(msg.created_at)}
        </div>
      </div>
    </motion.div>
  );
}

// ChatPanel — slide-in messaging drawer
// Props:
//   currentUser       — { id, name }
//   initialRecipient  — { id, name } | null  (pre-select a conversation)
//   onClose           — () => void
//   onUnreadCleared   — () => void  (called when messages are marked read)
export default function ChatPanel({ currentUser, initialRecipient, onClose, onUnreadCleared }) {
  const [convs, setConvs] = useState([]);
  const [activeId, setActiveId] = useState(initialRecipient?.id ?? null);
  const [activeName, setActiveName] = useState(initialRecipient?.name ?? '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const channelRef = useRef(null);

  // "Latest ref" pattern: update during render (not in an effect) so these
  // values are always current when referenced inside callbacks/effects,
  // without being listed as deps that would cause spurious re-runs.
  const onUnreadClearedRef = useRef(onUnreadCleared);
  onUnreadClearedRef.current = onUnreadCleared;

  // Stable refs for loadMessages and subscribe so the activeId effect
  // doesn't need to list them as deps — prevents spurious re-runs when
  // the parent re-renders and recreates inline callback props.
  const loadMessagesRef = useRef(null);
  const subscribeRef = useRef(null);

  // Scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load distinct conversation partners
  const loadConvs = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, body, created_at')
      .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    // Gracefully handle missing table or RLS errors
    if (error) {
      console.warn('[ChatPanel] loadConvs error (table may not exist yet):', error.message);
      // Still show initialRecipient if provided so users can start a new conversation
      if (initialRecipient) {
        setConvs([{ id: initialRecipient.id, name: initialRecipient.name, preview: null }]);
        setActiveId(initialRecipient.id);
        setActiveName(initialRecipient.name);
      }
      setLoadingConvs(false);
      return;
    }

    const seen = new Map();
    for (const m of data || []) {
      const other = m.sender_id === currentUser.id ? m.receiver_id : m.sender_id;
      if (!seen.has(other)) seen.set(other, m.body);
    }

    // Ensure initialRecipient always appears even with no messages yet
    if (initialRecipient && !seen.has(initialRecipient.id)) {
      seen.set(initialRecipient.id, null);
    }

    const ids = [...seen.keys()];
    if (ids.length === 0) {
      setLoadingConvs(false);
      return;
    }

    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', ids);

    if (profErr) {
      console.warn('[ChatPanel] profiles fetch error:', profErr.message);
    }

    const nm = Object.fromEntries((profiles || []).map((p) => [p.id, p.name]));

    const list = ids.map((id) => ({
      id,
      name: nm[id] || (id === initialRecipient?.id ? initialRecipient.name : 'Unknown'),
      preview: seen.get(id),
    }));

    setConvs(list);

    // Auto-select only if nothing is selected yet
    setActiveId((prev) => {
      if (prev) return prev;
      const pick = initialRecipient
        ? list.find((c) => c.id === initialRecipient.id) || list[0]
        : list[0];
      if (pick) setActiveName(pick.name);
      return pick?.id ?? null;
    });

    setLoadingConvs(false);
  }, [currentUser.id, initialRecipient?.id, initialRecipient?.name]); // eslint-disable-line

  // Load messages for the active conversation
  const loadMessages = useCallback(
    async (otherId) => {
      setLoadingMsgs(true);
      // Fetch all messages involving current user, then filter client-side.
      // This avoids complex nested or() syntax that can cause 400 errors.
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('[ChatPanel] loadMessages error:', error.message);
        setLoadingMsgs(false);
        return;
      }

      const filtered = (data || []).filter(
        (m) =>
          (m.sender_id === currentUser.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === currentUser.id)
      );
      setMessages(filtered);
      setLoadingMsgs(false);

      // Mark incoming messages from this sender as read
      supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('receiver_id', currentUser.id)
        .eq('sender_id', otherId)
        .is('read_at', null)
        .then(() => onUnreadClearedRef.current?.());

      setTimeout(() => inputRef.current?.focus(), 80);
    },
    [currentUser.id] // onUnreadCleared is accessed via ref — no dep needed
  );

  // Supabase real-time: listen for new incoming messages
  const subscribe = useCallback(
    (otherId) => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);

      channelRef.current = supabase
        .channel(`chat-panel-${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${currentUser.id}`,
          },
          ({ new: msg }) => {
            if (msg.sender_id === otherId) {
              setMessages((prev) => [...prev, msg]);
              // Auto-mark as read since the panel is open
              supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', msg.id)
                .then(() => {});
            }
            loadConvs();
          }
        )
        .subscribe();
    },
    [currentUser.id, loadConvs]
  );

  // Keep refs pointing at the latest versions so the activeId effect below
  // can call them without listing them as deps (which would cause the effect
  // to re-run — and re-fetch messages — on every parent render).
  loadMessagesRef.current = loadMessages;
  subscribeRef.current = subscribe;

  useEffect(() => {
    loadConvs();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [loadConvs]);

  useEffect(() => {
    if (activeId) {
      loadMessagesRef.current(activeId);
      subscribeRef.current(activeId);
    }
  }, [activeId]); // only re-run when the selected conversation changes

  const selectConv = (conv) => {
    setActiveId(conv.id);
    setActiveName(conv.name);
    setMessages([]);
  };

  const send = async () => {
    const body = input.trim();
    if (!body || !activeId || sending) return;
    setInput('');
    setSending(true);

    // _key is a stable React list key that survives the optimistic → confirmed swap.
    // If we used msg.id as the key it would change (temp string → real UUID) and
    // React would unmount + remount the bubble, causing a visible flicker.
    const stableKey = `t-${Date.now()}`;
    const temp = {
      id: stableKey,
      _key: stableKey,
      sender_id: currentUser.id,
      receiver_id: activeId,
      body,
      created_at: new Date().toISOString(),
    };
    setMessages((p) => [...p, temp]);

    const { data: saved, error } = await supabase
      .from('messages')
      .insert({ sender_id: currentUser.id, receiver_id: activeId, body })
      .select()
      .single();

    if (error) {
      setMessages((p) => p.filter((m) => m._key !== stableKey));
      setInput(body);
    } else {
      // Merge real fields onto the optimistic entry, keeping _key so React
      // reuses the existing DOM node without triggering the entry animation.
      setMessages((p) =>
        p.map((m) => (m._key === stableKey ? { ...saved, _key: stableKey } : m))
      );
      loadConvs();
    }
    setSending(false);
  };

  // Group messages by day for date separators.
  // Use _key (stable across optimistic→confirmed swap) as the React key.
  const grouped = [];
  let lastDay = '';
  for (const m of messages) {
    const d = dayLabel(m.created_at);
    if (d !== lastDay) {
      grouped.push({ type: 'sep', label: d, key: `sep-${m._key ?? m.id}` });
      lastDay = d;
    }
    grouped.push({ type: 'msg', data: m, key: m._key ?? m.id });
  }

  const noConvs = !loadingConvs && convs.length === 0;
  const showSidebar = convs.length > 1;

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(460px, 100vw)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        background: '#080F05',
        borderLeft: '1px solid rgba(212,168,83,0.12)',
        boxShadow: '-12px 0 50px rgba(0,0,0,0.6)',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: '64px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          borderBottom: '1px solid rgba(245,240,232,0.07)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
          <span style={{ fontSize: '1.05rem', flexShrink: 0 }}>💬</span>
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '1.05rem',
              color: '#F5F0E8',
              flexShrink: 0,
            }}
          >
            Messages
          </span>
          {activeName && (
            <>
              <span style={{ color: 'rgba(245,240,232,0.2)', flexShrink: 0 }}>·</span>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: '#D4A853',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeName}
              </span>
            </>
          )}
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(245,240,232,0.4)',
            fontSize: '1.4rem',
            lineHeight: 1,
            padding: '0.2rem 0.3rem',
            flexShrink: 0,
          }}
        >
          ×
        </motion.button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Conversation sidebar (only shown when > 1 conversation) */}
        {showSidebar && (
          <div
            style={{
              width: '164px',
              flexShrink: 0,
              borderRight: '1px solid rgba(245,240,232,0.06)',
              overflowY: 'auto',
              padding: '0.4rem 0',
            }}
          >
            {convs.map((c) => (
              <div
                key={c.id}
                onClick={() => selectConv(c)}
                style={{
                  padding: '0.7rem 0.85rem',
                  cursor: 'pointer',
                  background: activeId === c.id ? 'rgba(212,168,83,0.08)' : 'transparent',
                  borderLeft: `2px solid ${activeId === c.id ? '#D4A853' : 'transparent'}`,
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    fontSize: '0.83rem',
                    fontWeight: 600,
                    color: activeId === c.id ? '#F5F0E8' : 'rgba(245,240,232,0.6)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {c.name}
                </div>
                {c.preview && (
                  <div
                    style={{
                      fontSize: '0.7rem',
                      color: 'rgba(245,240,232,0.28)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginTop: '0.14rem',
                    }}
                  >
                    {c.preview}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          {noConvs ? (
            /* Empty state */
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '2.8rem', marginBottom: '0.85rem', opacity: 0.4 }}>💬</div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1.05rem',
                  color: 'rgba(245,240,232,0.45)',
                  marginBottom: '0.5rem',
                }}
              >
                No messages yet
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(245,240,232,0.25)',
                  fontWeight: 300,
                  lineHeight: 1.65,
                  maxWidth: '220px',
                }}
              >
                Messages from pet owners will appear here once your profile is live.
              </div>
            </div>
          ) : !activeId ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'rgba(245,240,232,0.28)' }}>
                Select a conversation
              </div>
            </div>
          ) : (
            <>
              {/* Message thread */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem 1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {loadingMsgs ? (
                  <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '3rem' }}>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '22px',
                        height: '22px',
                        border: '2px solid rgba(212,168,83,0.2)',
                        borderTop: '2px solid #D4A853',
                        borderRadius: '50%',
                      }}
                    />
                  </div>
                ) : (
                  <>
                    {grouped.map((item) =>
                      item.type === 'sep' ? (
                        <div
                          key={item.key}
                          style={{
                            textAlign: 'center',
                            padding: '0.7rem 0 0.4rem',
                            fontSize: '0.68rem',
                            color: 'rgba(245,240,232,0.22)',
                            letterSpacing: '0.06em',
                          }}
                        >
                          {item.label}
                        </div>
                      ) : (
                        <MessageBubble
                          key={item.key}
                          msg={item.data}
                          isMine={item.data.sender_id === currentUser.id}
                        />
                      )
                    )}
                    {messages.length === 0 && (
                      <div
                        style={{
                          textAlign: 'center',
                          paddingTop: '3rem',
                          fontSize: '0.82rem',
                          color: 'rgba(245,240,232,0.22)',
                        }}
                      >
                        Start the conversation with {activeName} 👋
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <div
                style={{
                  padding: '0.8rem 1rem',
                  borderTop: '1px solid rgba(245,240,232,0.07)',
                  display: 'flex',
                  gap: '0.55rem',
                  alignItems: 'flex-end',
                  flexShrink: 0,
                }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  placeholder={`Message ${activeName}…`}
                  rows={1}
                  style={{
                    flex: 1,
                    background: 'rgba(245,240,232,0.05)',
                    border: '1px solid rgba(245,240,232,0.1)',
                    borderRadius: '12px',
                    padding: '0.65rem 0.85rem',
                    color: '#F5F0E8',
                    fontSize: '0.88rem',
                    fontFamily: "'Inter', sans-serif",
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.5,
                    maxHeight: '100px',
                    overflowY: 'auto',
                  }}
                />
                <motion.button
                  onClick={send}
                  disabled={!input.trim() || sending}
                  whileHover={input.trim() && !sending ? { scale: 1.04, boxShadow: '0 4px 16px rgba(212,168,83,0.35)' } : {}}
                  whileTap={input.trim() && !sending ? { scale: 0.96 } : {}}
                  style={{
                    height: '40px',
                    paddingLeft: '1.1rem',
                    paddingRight: '1.1rem',
                    borderRadius: '10px',
                    background:
                      input.trim() && !sending
                        ? 'linear-gradient(135deg, #D4A853, #B8892E)'
                        : 'rgba(245,240,232,0.06)',
                    border: `1px solid ${input.trim() && !sending ? 'transparent' : 'rgba(245,240,232,0.1)'}`,
                    cursor: input.trim() && !sending ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    flexShrink: 0,
                    transition: 'background 0.2s, border-color 0.2s',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: "'Inter', sans-serif",
                    color:
                      input.trim() && !sending ? '#1A1A1A' : 'rgba(245,240,232,0.25)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
                      style={{
                        width: '13px',
                        height: '13px',
                        border: '1.5px solid rgba(245,240,232,0.2)',
                        borderTop: '1.5px solid rgba(245,240,232,0.6)',
                        borderRadius: '50%',
                      }}
                    />
                  ) : (
                    <>Send ↑</>
                  )}
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
