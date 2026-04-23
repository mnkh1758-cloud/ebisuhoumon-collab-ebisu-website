import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Bot, X, MessageCircle, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, LoadingState } from '../types';

export const AIConsultant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'こんにちは。「えびす鍼灸整骨院」のAI健康相談員です。\nお身体のどこに痛みや違和感がありますか？具体的に教えていただければ、適切な施術メニューやセルフケアをご提案します。',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || !process.env.API_KEY) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoadingState(LoadingState.LOADING);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const chat = ai.chats.create({
        model: model,
        history: history,
        config: {
          systemInstruction: `
            あなたは「えびす鍼灸整骨院（佐世保市）」のベテラン受付兼カウンセラーです。
            ユーザーの身体の悩みや痛みの相談に対し、共感を示しながら、以下の観点でアドバイスを行ってください。
            1. 痛みの原因の可能性（医療的な診断は避け、「可能性」として伝える）
            2. 当院で提供できそうな施術（整体、鍼灸、骨盤矯正など）の提案
            3. 今すぐできる簡単なセルフケア（ストレッチや温める/冷やすなど）
            
            トーン＆マナー：
            - 丁寧で落ち着いた、安心感を与える口調（デスマス調）。
            - 専門用語はなるべく噛み砕く。
            - 深刻な症状と思われる場合は、すぐに医療機関への受診を促す。
            - 最後に「お近くの院（大塔院・早岐院・矢峰院）にて詳しく見させていただくことをお勧めします」と誘導する。
            
            回答は200文字〜300文字程度で簡潔にまとめてください。
          `,
        },
      });

      const result = await chat.sendMessageStream({ message: userMessage.text });

      let fullResponseText = '';
      const responseId = (Date.now() + 1).toString();
      
      // Initialize empty model message
      setMessages((prev) => [
        ...prev,
        {
          id: responseId,
          role: 'model',
          text: '',
          timestamp: new Date(),
        },
      ]);

      for await (const chunk of result) {
        const chunkText = chunk.text || '';
        fullResponseText += chunkText;
        
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === responseId ? { ...msg, text: fullResponseText } : msg
          )
        );
      }
      setLoadingState(LoadingState.SUCCESS);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: '申し訳ありません。現在アクセスが集中しており応答できません。お電話にてお問い合わせください。',
          timestamp: new Date(),
        },
      ]);
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center
          ${isOpen ? 'bg-stone-800 rotate-90' : 'bg-emerald-700 hover:bg-emerald-600'} text-white`}
        aria-label="AI相談を開く"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl z-40 flex flex-col transition-all duration-300 transform origin-bottom-right border border-stone-200
        ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="bg-emerald-800 text-white p-4 rounded-t-2xl flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles size={20} className="text-emerald-100" />
          </div>
          <div>
            <h3 className="font-bold text-lg">AI健康相談室</h3>
            <p className="text-xs text-emerald-100">24時間受付中 / Gemini Pro</p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm
                ${
                  msg.role === 'user'
                    ? 'bg-emerald-700 text-white rounded-br-none'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loadingState === LoadingState.LOADING && (
             <div className="flex justify-start">
               <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-stone-200 flex items-center gap-2">
                 <Loader2 size={16} className="animate-spin text-emerald-600" />
                 <span className="text-xs text-stone-500">AIが考え中...</span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-200 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="例：腰が痛くて立ち上がるのが辛い..."
              className="flex-1 resize-none border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm h-[50px] bg-stone-50"
            />
            <button
              onClick={handleSend}
              disabled={loadingState === LoadingState.LOADING || !inputText.trim()}
              className="bg-emerald-700 text-white p-3 rounded-xl hover:bg-emerald-800 disabled:bg-stone-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-[10px] text-stone-400 mt-2 text-center">
            AIの回答は医療アドバイスではありません。正確な診断は医師にご相談ください。
          </p>
        </div>
      </div>
    </>
  );
};