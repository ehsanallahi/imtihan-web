'use client'

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Send, Loader2, User, Sparkles, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { askAiTutor, getDoubtHistory } from "@/actions/aiActions";
import { toast } from "sonner";

export function AiTutor({ mcqId, medium = 'english' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [doubt, setDoubt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(null); // stores index of message being spoken
  const [isHandsFree, setIsHandsFree] = useState(false);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  useEffect(() => {
    if (isOpen && mcqId) {
      loadHistory();
    }
  }, [isOpen, mcqId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle auto-speak and auto-listen in hands-free mode
  useEffect(() => {
    if (isHandsFree && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.senderRole === 'ai' && isSpeaking === null) {
        handleSpeak(lastMsg.content, messages.length - 1, true);
      }
    }
  }, [messages, isHandsFree]);

  async function loadHistory() {
    const thread = await getDoubtHistory(mcqId);
    if (thread) {
      setThreadId(thread.id);
      setMessages(thread.messages);
    }
  }

  async function handleAsk(textOverride) {
    const query = textOverride || doubt;
    if (!query.trim()) return;

    setLoading(true);
    const userMsg = { senderRole: "student", content: query, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setDoubt("");

    try {
      const res = await askAiTutor(mcqId, query, threadId);
      if (res.success) {
        setThreadId(res.threadId);
        const aiMsg = { senderRole: "ai", content: res.aiResponse, createdAt: new Date() };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function toggleRecording() {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = medium === 'urdu' ? 'ur-PK' : 'en-US';

    recognitionRef.current.onstart = () => setIsRecording(true);
    recognitionRef.current.onend = () => setIsRecording(false);
    recognitionRef.current.onerror = () => setIsRecording(false);
    
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleAsk(transcript);
    };

    recognitionRef.current.start();
  }

  function handleSpeak(text, index, triggerListenAfter = false) {
    if (isSpeaking === index && !triggerListenAfter) {
      synthRef.current?.cancel();
      setIsSpeaking(null);
      return;
    }

    synthRef.current?.cancel();
    // Clean text for speech (remove markdown)
    const cleanText = text.replace(/[*#_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = medium === 'urdu' ? 'ur-PK' : 'en-US';
    
    utterance.onend = () => {
      setIsSpeaking(null);
      if (triggerListenAfter && isHandsFree) {
        toggleRecording();
      }
    };
    utterance.onerror = () => setIsSpeaking(null);
    
    setIsSpeaking(index);
    synthRef.current?.speak(utterance);
  }

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 gap-2 font-medium"
      >
        <BrainCircuit className="w-4 h-4" />
        Ask AI Tutor
      </Button>
    );
  }

  return (
    <Card className="mt-4 border-indigo-100 shadow-lg animate-in zoom-in-95 duration-200 overflow-hidden">
      <CardHeader className="bg-indigo-50/50 py-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className={`text-sm font-bold text-indigo-900 flex items-center gap-2 ${medium === 'urdu' ? 'flex-row-reverse' : ''}`}>
            <Sparkles className="w-4 h-4 text-indigo-500" />
            {medium === 'urdu' ? 'اے آئی ٹیوٹر کی مدد' : 'AI Tutor Help'}
          </CardTitle>
          <div className="flex items-center gap-2 border-l border-indigo-200 pl-4">
            <button 
              onClick={() => setIsHandsFree(!isHandsFree)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${isHandsFree ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-indigo-400 border border-indigo-100'}`}
            >
              <Mic className="w-3 h-3" />
              Hands-Free {isHandsFree ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-indigo-400 hover:text-indigo-600" onClick={() => setIsOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={scrollRef}
          className="h-[300px] overflow-y-auto p-4 space-y-4 bg-white"
        >
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 px-4">
              <BrainCircuit className="w-10 h-10 text-indigo-100" />
              <p className="text-sm text-zinc-500 font-medium">
                {medium === 'urdu' ? 'اس سوال میں الجھن ہے؟ مجھ سے کچھ بھی پوچھیں!' : 'Confused about this question? Ask me anything!'}
              </p>
              <div className="flex gap-2">
                <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-100 cursor-pointer" onClick={() => handleAsk("Why is the correct answer better than others?")}>"Why is it correct?"</Badge>
                <Badge variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-600 border-indigo-100 cursor-pointer" onClick={() => handleAsk("Explain this concept simply.")}>"Simplify concept"</Badge>
              </div>
            </div>
          )}
          
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`flex gap-3 ${msg.senderRole === 'student' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.senderRole === 'student' ? 'bg-zinc-100 text-zinc-600' : 'bg-indigo-100 text-indigo-600'}`}>
                {msg.senderRole === 'student' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div 
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.senderRole === 'student' ? 'bg-zinc-100 text-zinc-800 rounded-tr-none' : 'bg-indigo-50 text-indigo-900 rounded-tl-none border border-indigo-100'}`}
                dir={medium === 'urdu' ? 'rtl' : 'ltr'}
              >
                <div className="prose prose-sm prose-indigo max-w-none break-words">
                  <ReactMarkdown 
                    components={{
                      p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-indigo-700" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                {msg.senderRole === 'ai' && (
                  <button 
                    onClick={() => handleSpeak(msg.content, i)}
                    className={`mt-2 p-1 rounded-full transition-colors ${isSpeaking === i ? 'bg-indigo-200 text-indigo-700' : 'hover:bg-indigo-100 text-indigo-400'}`}
                  >
                    {isSpeaking === i ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                <span className="text-xs font-medium text-indigo-600">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-zinc-50 flex gap-2">
          <Input 
            placeholder="Type your doubt here..." 
            value={doubt}
            onChange={(e) => setDoubt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            className="bg-white border-zinc-200 text-sm"
            disabled={loading}
          />
          <Button 
            size="icon" 
            variant={isRecording ? "destructive" : "outline"}
            onClick={toggleRecording}
            disabled={loading}
            className={`flex-shrink-0 ${!isRecording ? 'text-indigo-600 border-indigo-200 hover:bg-indigo-50' : 'animate-pulse'}`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button size="icon" onClick={() => handleAsk()} disabled={loading || !doubt.trim()} className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
