
import React, { useState, useEffect, useRef } from 'react';
import { Agent, Language, Message, UserProfile, Post, Comment } from './types';
import { AGENTS, INITIAL_GREETINGS, DEFAULT_USER, INITIAL_POSTS, NPC_USERS } from './constants';
import ChatInterface from './components/ChatInterface';
import AgentSelector from './components/AgentSelector';
import PersonalProfile from './components/PersonalProfile';
import AgentCreator from './components/AgentCreator';
import MessageList from './components/MessageList';
import ForumInterface from './components/ForumInterface';
import { generateSpeech, getLoverResponse, getProactiveMessage, generateAgentPost } from './services/geminiService';

const HOUR = 3600000;
const RANDOM_DELAYS = [HOUR, 3 * HOUR, 5 * HOUR];
const THREE_DAYS = 3 * 24 * HOUR;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'destiny' | 'community' | 'personal' | 'create'>('messages');
  const [viewingChatId, setViewingChatId] = useState<string | null>(null);
  const [isEditingFromChat, setIsEditingFromChat] = useState(false);
  
  const [agents, setAgents] = useState<Agent[]>(() => {
    try {
      const saved = localStorage.getItem('lianyu_custom_agents');
      return saved ? [...AGENTS, ...JSON.parse(saved)] : AGENTS;
    } catch (e) {
      return AGENTS;
    }
  });
  
  const [targetLanguage, setTargetLanguage] = useState<Language>(Language.CHINESE);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>({});
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem('lianyu_posts');
      return saved ? JSON.parse(saved).map((p: any) => ({
        ...p, 
        timestamp: new Date(p.timestamp),
        comments: p.comments.map((c: any) => ({...c, timestamp: new Date(c.timestamp)}))
      })) : INITIAL_POSTS;
    } catch (e) {
      return INITIAL_POSTS;
    }
  });

  const [editingAgent, setEditingAgent] = useState<Agent | undefined>(undefined);
  const [isTyping, setIsTyping] = useState(false);

  const [nextProactiveDelay, setNextProactiveDelay] = useState(() => 
    RANDOM_DELAYS[Math.floor(Math.random() * RANDOM_DELAYS.length)]
  );

  const lastActivityRef = useRef<number>(Date.now());
  const proactiveTimerRef = useRef<number | null>(null);
  const forumTimerRef = useRef<number | null>(null);
  const currentAgent = agents.find(a => a.id === viewingChatId);

  useEffect(() => {
    const customAgents = agents.filter(a => !AGENTS.some(preset => preset.id === a.id));
    localStorage.setItem('lianyu_custom_agents', JSON.stringify(customAgents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('lianyu_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    const initialHistories: Record<string, Message[]> = {};
    agents.forEach(agent => {
      if (!chatHistories[agent.id]) {
        const greetingText = INITIAL_GREETINGS[agent.id] || `你好，我是${agent.name}。`;
        initialHistories[agent.id] = [{
          id: 'init-' + agent.id + '-' + Date.now(),
          sender: 'agent',
          text: greetingText,
          timestamp: new Date()
        }];
      }
    });
    if (Object.keys(initialHistories).length > 0) {
      setChatHistories(prev => ({ ...prev, ...initialHistories }));
    }
  }, [agents]);

  const refreshNextDelay = () => {
    const newDelay = RANDOM_DELAYS[Math.floor(Math.random() * RANDOM_DELAYS.length)];
    setNextProactiveDelay(newDelay);
  };

  // --- Real-time Forum Simulation ---
  useEffect(() => {
    const scheduleNextPost = () => {
      // Random interval between 2 to 5 minutes for demo purposes
      const nextDelay = Math.floor(Math.random() * (300000 - 120000 + 1) + 120000);
      
      forumTimerRef.current = window.setTimeout(async () => {
        try {
          // 40% chance for a known Agent, 60% chance for a random NPC
          const isAgent = Math.random() > 0.6;
          
          let authorId, authorName, authorAvatar, content;

          if (isAgent && agents.length > 0) {
            const randomAgent = agents[Math.floor(Math.random() * agents.length)];
            authorId = randomAgent.id;
            authorName = randomAgent.name;
            authorAvatar = randomAgent.avatarUrl;
            content = await generateAgentPost(randomAgent.name, randomAgent.personality);
          } else {
            const randomNPC = NPC_USERS[Math.floor(Math.random() * NPC_USERS.length)];
            authorId = `npc-${Date.now()}`;
            authorName = randomNPC.name;
            authorAvatar = randomNPC.avatar;
            content = await generateAgentPost(randomNPC.name, randomNPC.personality);
          }
          
          if (content) {
            const newPost: Post = {
              id: `p-auto-${Date.now()}`,
              authorId: authorId || 'unknown',
              authorName: authorName || '神秘人',
              authorAvatar: authorAvatar || '',
              content: content,
              imageUrl: undefined,
              likes: Math.floor(Math.random() * 50),
              isLiked: false,
              comments: [],
              timestamp: new Date()
            };
            setPosts(prev => [newPost, ...prev]);
          }
        } catch (e) {
          console.error("Auto-post generation failed", e);
        }
        scheduleNextPost(); // Schedule the next one
      }, nextDelay);
    };

    scheduleNextPost();

    return () => {
      if (forumTimerRef.current) clearTimeout(forumTimerRef.current);
    };
  }, [agents]);

  useEffect(() => {
    const checkProactive = async () => {
      const now = Date.now();
      if (now - lastActivityRef.current < 60000 || isTyping) return;
      
      const targetAgentId = viewingChatId || (agents.length > 0 ? agents[Math.floor(Math.random() * agents.length)].id : null);
      if (!targetAgentId) return;

      const agentObj = agents.find(a => a.id === targetAgentId);
      const history = chatHistories[targetAgentId] || [];
      const userMessages = history.filter(m => m.sender === 'user');
      if (userMessages.length === 0) return;
      
      const lastUserMsg = userMessages[userMessages.length - 1];
      const lastMsg = history[history.length - 1];
      
      if (!lastUserMsg) return;

      const timeSinceLastReply = now - new Date(lastUserMsg.timestamp).getTime();
      if (timeSinceLastReply > THREE_DAYS) return;
      if (lastMsg.sender === 'agent') return;
      
      if (timeSinceLastReply > nextProactiveDelay) {
        if (agentObj) {
          setIsTyping(true);
          try {
            const text = await getProactiveMessage(agentObj, targetLanguage);
            const agentMsgId = `proactive-${Date.now()}`;
            setChatHistories(prev => ({
              ...prev,
              [targetAgentId]: [...(prev[targetAgentId] || []), { id: agentMsgId, sender: 'agent', text, timestamp: new Date() }]
            }));
            refreshNextDelay();
            lastActivityRef.current = Date.now(); 
          } catch (e) { console.error(e); } finally { setIsTyping(false); }
        }
      }
    };
    proactiveTimerRef.current = window.setInterval(checkProactive, 30000);
    return () => { if (proactiveTimerRef.current) clearInterval(proactiveTimerRef.current); };
  }, [viewingChatId, agents, targetLanguage, isTyping, chatHistories, nextProactiveDelay]);

  const recordActivity = () => { lastActivityRef.current = Date.now(); };

  const handleSendMessage = async (text: string, audioBlob?: Blob, imageBlob?: Blob) => {
    recordActivity();
    refreshNextDelay();
    if (!viewingChatId || !currentAgent) return;
    
    let audioUrl, audioBase64, imageUrl, imageBase64;
    if (audioBlob) { audioUrl = URL.createObjectURL(audioBlob); audioBase64 = await blobToBase64(audioBlob); }
    if (imageBlob) { imageUrl = URL.createObjectURL(imageBlob); imageBase64 = await blobToBase64(imageBlob); }
    
    const newUserMsg: Message = { 
      id: 'user-' + Date.now(), 
      sender: 'user', 
      text: text || (imageBlob ? "[照片]" : "[语音]"), 
      audioUrl, 
      imageUrl, 
      timestamp: new Date() 
    };
    
    setChatHistories(prev => ({ ...prev, [viewingChatId]: [...(prev[viewingChatId] || []), newUserMsg] }));
    setIsTyping(true);
    
    try {
      const history = chatHistories[viewingChatId] || [];
      const responseData = await getLoverResponse(currentAgent, [...history, newUserMsg], text, targetLanguage, userProfile, audioBase64, imageBase64);
      const agentMsgId = `agent-${Date.now()}`;
      
      let aiAudioUrl: string | undefined = undefined;
      
      if (audioBlob) {
        try {
          aiAudioUrl = await generateSpeech(responseData.text, currentAgent.voiceName);
        } catch (err) {
          console.error("Failed to generate speech", err);
        }
      }

      setChatHistories(prev => {
        const currentChat = prev[viewingChatId] || [];
        const updatedChat = currentChat.map(m => 
          m.id === newUserMsg.id ? { ...m, userTranscription: responseData.userTranscription } : m
        );
        
        const aiMsg: Message = { 
          id: agentMsgId, 
          sender: 'agent', 
          text: responseData.text, 
          correction: responseData.correction, 
          audioUrl: aiAudioUrl,
          timestamp: new Date() 
        };
        
        return { ...prev, [viewingChatId]: [...updatedChat, aiMsg] };
      });
      
      if (responseData.newSignature && responseData.newSignature !== currentAgent.signature) {
        setAgents(prev => prev.map(a => a.id === currentAgent.id ? { ...a, signature: responseData.newSignature! } : a));
      }

    } catch (e) { 
      console.error(e); 
    } finally {
      setIsTyping(false);
      recordActivity();
    }
  };

  const handleRecallMessage = (messageId: string) => {
    if (!viewingChatId) return;
    setChatHistories(prev => {
      const currentHistory = prev[viewingChatId] || [];
      return {
        ...prev,
        [viewingChatId]: currentHistory.filter(msg => msg.id !== messageId)
      };
    });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSaveAgent = (updatedAgent: Agent) => {
    const exists = agents.some(a => a.id === updatedAgent.id);
    if (exists) {
      setAgents(prev => prev.map(a => a.id === updatedAgent.id ? updatedAgent : a));
    } else {
      setAgents(prev => [...prev, updatedAgent]);
    }
    
    if (isEditingFromChat) {
      setIsEditingFromChat(false);
    } else {
      setActiveTab('destiny');
    }
  };

  const handleAvatarClick = () => {
    if (currentAgent) {
      setEditingAgent(currentAgent);
      setIsEditingFromChat(true);
      setActiveTab('create');
    }
  };

  const handleCancelCreate = () => {
    if (isEditingFromChat) {
      setIsEditingFromChat(false);
    } else {
      setActiveTab('destiny');
    }
  };

  // --- Forum Handlers ---
  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, text: string) => {
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: 'user',
      authorName: userProfile.nickname,
      authorAvatar: userProfile.avatarUrl,
      text,
      timestamp: new Date()
    };

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const handleCreatePost = (content: string, image?: string) => {
    const newPost: Post = {
      id: `p-${Date.now()}`,
      authorId: 'user',
      authorName: userProfile.nickname,
      authorAvatar: userProfile.avatarUrl,
      content,
      imageUrl: image,
      likes: 0,
      isLiked: false,
      comments: [],
      timestamp: new Date()
    };
    setPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-[#F8F9FA]">
      <main className="flex-1 relative z-10 overflow-hidden flex flex-col">
        {viewingChatId && currentAgent && !isEditingFromChat ? (
          <div className="h-full flex flex-col">
            <header className="px-4 h-28 flex flex-col justify-center relative">
              <div className="flex items-center justify-between w-full">
                <button 
                  onClick={() => {
                    setViewingChatId(null);
                    setActiveTab('messages');
                  }} 
                  className="p-2 text-slate-400 active:scale-90 transition-transform"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <div className="w-10"></div>
              </div>
              <div className="absolute inset-x-0 bottom-4 flex flex-col items-center pointer-events-none">
                <h1 className="text-[#000000] text-xl font-bold tracking-tight">{currentAgent.name}</h1>
                <p className="text-[#666666] text-xs mt-1 font-medium tracking-wide">“{currentAgent.signature}”</p>
              </div>
              <div className="absolute top-8 right-14">
                <select 
                  value={targetLanguage} 
                  onChange={(e) => setTargetLanguage(e.target.value as Language)}
                  className="bg-white/60 backdrop-blur-md text-slate-600 border-none rounded-full px-2 py-0.5 text-[9px] outline-none font-bold shadow-sm"
                >
                  {Object.values(Language).map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
            </header>

            <ChatInterface 
              agent={currentAgent}
              messages={chatHistories[viewingChatId] || []}
              targetLanguage={targetLanguage}
              userProfile={userProfile}
              onSendMessage={handleSendMessage}
              onRecallMessage={handleRecallMessage}
              isTyping={isTyping}
              onAgentAvatarClick={handleAvatarClick}
            />
          </div>
        ) : (
          <div className="h-full flex flex-col pt-12">
            {activeTab === 'messages' && <MessageList agents={agents} chatHistories={chatHistories} onOpenChat={setViewingChatId} />}
            {activeTab === 'destiny' && <AgentSelector agents={agents} currentAgentId={""} onSelectAgent={(a) => setViewingChatId(a.id)} onCreateNew={() => { setEditingAgent(undefined); setActiveTab('create'); }} />}
            {activeTab === 'community' && <ForumInterface posts={posts} userProfile={userProfile} onLikePost={handleLikePost} onAddComment={handleAddComment} onCreatePost={handleCreatePost} />}
            {activeTab === 'personal' && <PersonalProfile userProfile={userProfile} onUpdate={(p) => setUserProfile(p)} />}
            {activeTab === 'create' && <AgentCreator initialAgent={editingAgent} onSave={handleSaveAgent} onCancel={handleCancelCreate} />}
          </div>
        )}
      </main>

      {!viewingChatId && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg h-16 bg-white/90 backdrop-blur-2xl rounded-full border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-20 flex justify-between items-center px-6">
          <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'messages' ? 'text-rose-400 scale-105' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
            <span className="text-[9px] font-bold">信息</span>
          </button>
          
          <button onClick={() => setActiveTab('destiny')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'destiny' ? 'text-rose-400 scale-105' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span className="text-[9px] font-bold">羁绊</span>
          </button>

          <button onClick={() => setActiveTab('community')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'community' ? 'text-rose-400 scale-105' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
            <span className="text-[9px] font-bold">广场</span>
          </button>

          <button onClick={() => setActiveTab('personal')} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'personal' ? 'text-rose-400 scale-105' : 'text-slate-300'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            <span className="text-[9px] font-bold">我的</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
