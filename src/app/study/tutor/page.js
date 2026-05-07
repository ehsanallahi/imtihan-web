'use client'

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { 
  getChatSessions, 
  getChatHistory, 
  createNewChat, 
  sendTutorMessage, 
  deleteChatSession 
} from "@/actions/aiActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BrainCircuit, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Send, 
  Sparkles, 
  User, 
  Loader2, 
  ChevronLeft,
  Search,
  MoreVertical,
  History
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function TutorPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function loadSessions() {
    setSessionsLoading(true);
    const data = await getChatSessions();
    setSessions(data);
    setSessionsLoading(false);
    
    if (data.length > 0 && !currentSessionId) {
      handleSelectSession(data[0].id);
    }
  }

  async function handleSelectSession(id) {
    setCurrentSessionId(id);
    const history = await getChatHistory(id);
    if (history) {
      setMessages(history.messages);
    }
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  async function handleNewChat(lang = 'english') {
    const res = await createNewChat(lang);
    if (res.success) {
      setCurrentSessionId(res.chat.id);
      setMessages([]);
      loadSessions();
    } else {
      toast.error(res.error);
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || !currentSessionId || loading) return;

    const userMsg = { role: "student", content: input, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await sendTutorMessage(currentSessionId, userMsg.content);
      if (res.success) {
        setMessages(prev => [...prev, { role: "ai", content: res.response, createdAt: new Date() }]);
        // Refresh sessions to get updated title if it was first message
        loadSessions();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSession(id, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    const res = await deleteChatSession(id);
    if (res.success) {
      toast.success("Conversation deleted");
      if (currentSessionId === id) {
        setCurrentSessionId(null);
        setMessages([]);
      }
      loadSessions();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`bg-slate-50 border-r border-slate-200 transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-teal-600" />
            History
          </h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-3 gap-1">
                <Plus className="w-4 h-4" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleNewChat('english')}>English Chat</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleNewChat('urdu')}>Urdu Chat (اردو)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {sessionsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-slate-200 animate-pulse m-2" />
              ))
            ) : sessions.length === 0 ? (
              <div className="text-center py-10 px-4">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No conversations yet.</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 flex flex-col gap-1 ${
                    currentSessionId === session.id 
                      ? 'bg-teal-50 border-teal-100 border' 
                      : 'hover:bg-slate-200/50 border-transparent border'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-sm font-semibold truncate ${currentSessionId === session.id ? 'text-teal-900' : 'text-slate-700'}`}>
                      {session.title || 'Untitled Conversation'}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{format(new Date(session.updatedAt), 'MMM d, h:mm a')}</span>
                    <span className="bg-slate-200 px-1.5 rounded text-slate-500 uppercase">{session.language}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-white">
        {/* Chat Header */}
        <div className="h-14 border-b border-slate-200 flex items-center px-4 justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-slate-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <MessageSquare className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight">Imtihan AI Tutor</h1>
                <p className="text-[10px] text-teal-600 font-medium uppercase tracking-wider">Always learning</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-slate-400">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-slate-400">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
        >
          {!currentSessionId ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-teal-50 flex items-center justify-center animate-bounce">
                <Sparkles className="w-10 h-10 text-teal-600" />
              </div>
              <div className="max-w-md">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Hello! I'm your AI Study Companion</h2>
                <p className="text-slate-500 mb-6 text-sm">
                  Choose a previous conversation from the history or start a new session to begin learning together.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => handleNewChat('english')} className="bg-teal-600 hover:bg-teal-700">Start English Chat</Button>
                  <Button onClick={() => handleNewChat('urdu')} variant="outline" className="border-teal-200 text-teal-700">اردو میں بات کریں</Button>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
              <div className="p-4 rounded-full bg-slate-50">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-400">Send your first message to begin!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-4 ${msg.role === 'student' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform hover:scale-105 ${
                  msg.role === 'student' ? 'bg-slate-100 text-slate-600' : 'bg-teal-600 text-white'
                }`}>
                  {msg.role === 'student' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div className={`flex flex-col space-y-1 max-w-[85%] md:max-w-[70%] ${msg.role === 'student' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`rounded-2xl px-5 py-3 text-sm shadow-sm border ${
                      msg.role === 'student' 
                        ? 'bg-slate-50 text-slate-800 rounded-tr-none border-slate-200' 
                        : 'bg-white text-slate-900 rounded-tl-none border-teal-50'
                    }`}
                  >
                    <div className="prose prose-sm prose-teal max-w-none break-words">
                      <ReactMarkdown 
                        components={{
                          p: ({node, ...props}) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-bold text-teal-800" {...props} />,
                          code: ({node, ...props}) => <code className="bg-slate-100 px-1 rounded text-teal-700 font-mono" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {msg.createdAt && (
                    <span className="text-[10px] text-slate-400 px-2 uppercase font-semibold tracking-tighter">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center animate-bounce shadow-lg shadow-teal-100">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="bg-white border border-teal-50 rounded-2xl rounded-tl-none px-5 py-3 flex items-center gap-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span className="text-xs font-semibold text-teal-600 tracking-wide uppercase">AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentSessionId && (
          <div className="p-4 md:p-6 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute inset-0 bg-teal-100 rounded-2xl blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity" />
              <div className="relative flex gap-3 bg-white border-2 border-slate-100 rounded-2xl p-2 group-focus-within:border-teal-100 transition-all shadow-sm">
                <Input 
                  placeholder="Ask your study companion anything..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-transparent border-none focus-visible:ring-0 text-base py-6 px-4"
                  disabled={loading}
                />
                <Button 
                  size="icon" 
                  onClick={handleSendMessage} 
                  disabled={loading || !input.trim()} 
                  className="bg-teal-600 hover:bg-teal-700 h-12 w-12 rounded-xl transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <p className="text-center mt-3 text-[10px] text-slate-400 font-medium">
              Powered by Llama 3.3 & Gemini Flash • Multilingual Support
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
