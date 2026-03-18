
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { KNOWLEDGE_BASE } from './services/knowledgeBase';
import { Message } from './types';
import { 
    BotIcon, 
    SendIcon, 
    AgentIcon, 
    PhoneIcon,
    XMarkIcon, 
    CheckIcon, 
    CalculatorIcon, 
    SettingsIcon, 
    UploadIcon, 
    SparklesIcon,
    SupportIcon,
    GlobeIcon,
    FacebookIcon,
    ZaloIcon,
    EnvelopeIcon
} from './components/Icons';

declare const marked: any;

const SUGGESTED_QUESTIONS = [
    { text: "Dự tính mức đóng BHXH & BHYT năm 2026" },
    { text: "Điều kiện hưởng hưu trí khi đóng 15 năm BHXH?" },
    { text: "Quyền lợi thai sản mới dành cho người tự nguyện" },
    { text: "Tiết kiệm khi đóng gộp 5 năm BHXH?" },
    { text: "Tìm điểm thu BHXH gần nhất tại Quảng Ngãi" }
];

const BACKGROUND_OPTIONS = [
    { id: 'default', name: 'Mặc định', value: 'url(https://i.postimg.cc/FKHzrZxy/z7318496499677-ffe8f305310d7aef3e14e158d49949f2.jpg)' },
    { id: 'modern', name: 'Hiện đại', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'ocean', name: 'Đại dương', value: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' },
    { id: 'minimal', name: 'Tối giản', value: '#f4f7f9' }
];

const AVATAR_PRESETS = [
    "https://i.postimg.cc/3N7wks3P/z7482296341644-7f59540d74133517530433cf6418b613.jpg",
    "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
    "https://cdn-icons-png.flaticon.com/512/2044/2044805.png",
    "https://cdn-icons-png.flaticon.com/512/6134/6134346.png"
];

const SUPPORT_CATEGORIES = [
    { id: 'other', name: 'Đối tượng khác', rate: 0.20, description: 'Hỗ trợ 20%' },
    { id: 'poor', name: 'Hộ nghèo', rate: 0.50, description: 'Hỗ trợ 50%' },
    { id: 'near_poor', name: 'Hộ cận nghèo', rate: 0.40, description: 'Hỗ trợ 40%' },
    { id: 'minority', name: 'Dân tộc thiểu số', rate: 0.30, description: 'Hỗ trợ 30%' },
];

const DISTRICTS = ['Tất cả', 'TP Quảng Ngãi', 'TX Đức Phổ', 'Huyện Bình Sơn', 'Huyện Sơn Tịnh', 'Huyện Tư Nghĩa', 'Huyện Nghĩa Hành', 'Huyện Mộ Đức', 'Huyện Trà Bồng', 'Huyện Sơn Hà', 'Huyện Sơn Tây', 'Huyện Ba Tơ', 'Huyện Minh Long', 'Đặc khu Lý Sơn'];

const STANDARD_POVERTY = 1500000;
const BHXH_RATE = 0.22;
const BASE_SALARY_2025 = 2340000;
const BHYT_MONTHLY_RATE = 0.045;
const DEFAULT_BHXH_LOGO = "https://i.postimg.cc/3N7wks3P/z7482296341644-7f59540d74133517530433cf6418b613.jpg";

const Typewriter: React.FC<{ text: string; isInit?: boolean; onSelectQuestion?: (q: string) => void; useAnimations: boolean }> = ({ text, isInit, onSelectQuestion, useAnimations }) => {
    const [displayedText, setDisplayedText] = useState(useAnimations ? '' : text);
    const [currentIndex, setCurrentIndex] = useState(useAnimations ? 0 : text.length);
    const [showSuggestions, setShowSuggestions] = useState(!useAnimations);

    useEffect(() => {
        if (!useAnimations) {
            setDisplayedText(text);
            setCurrentIndex(text.length);
            setShowSuggestions(true);
            return;
        }

        if (currentIndex < text.length) {
            const step = text.length > 300 ? 15 : 5;
            const timeout = setTimeout(() => {
                setDisplayedText(prev => prev + text.substring(currentIndex, currentIndex + step));
                setCurrentIndex(prev => prev + step);
            }, 10);
            return () => clearTimeout(timeout);
        } else {
            setShowSuggestions(true);
        }
    }, [currentIndex, text, useAnimations]);

    const htmlContent = useMemo(() => {
        if (typeof marked === 'undefined') return displayedText;
        return marked.parse(displayedText);
    }, [displayedText]);

    if (isInit) {
        return (
            <div className="space-y-6 md:space-y-8">
                <div className="relative overflow-hidden bg-white/50 backdrop-blur-xl border border-white/50 rounded-[30px] p-6 md:p-8 shadow-2xl animate-reveal">
                    <div className="absolute top-0 left-0 w-full h-1 bg-bhxh-500"></div>
                    <h2 className="text-2xl md:text-3xl font-black mb-4 text-bhxh-800 uppercase leading-tight tracking-tighter">Xin chào quý khách!</h2>
                    <div className="markdown-container text-gray-700 font-medium" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                </div>
                {showSuggestions && (
                    <div className="animate-reveal [animation-delay:300ms] grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SUGGESTED_QUESTIONS.map((q, idx) => (
                            <button 
                                key={idx} 
                                onClick={() => onSelectQuestion?.(q.text)}
                                className="p-4 bg-white/80 hover:bg-bhxh-600 hover:text-white border border-white rounded-2xl shadow-sm transition-all text-left text-[11px] font-black uppercase tracking-tight"
                            >
                                {q.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return <div className="markdown-container" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      text: 'Chào mừng bạn đến với Hệ thống tư vấn Bảo hiểm xã hội & Bảo hiểm y tế của BHXH tỉnh Quảng Ngãi. Tôi là Trợ lý ảo AI được huấn luyện trên nền tảng pháp luật mới nhất. Tôi có thể giúp bạn dự tính mức đóng, giải thích quyền lợi hưu trí, thai sản và tìm kiếm điểm thu gần nhất. Bạn muốn bắt đầu từ đâu?',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(window.navigator.onLine);
  
  const [customBg, setCustomBg] = useState<string>(localStorage.getItem('app_bg') || BACKGROUND_OPTIONS[0].value);
  const [botAvatar, setBotAvatar] = useState<string>(localStorage.getItem('bot_avatar') || DEFAULT_BHXH_LOGO);
  const [useAnimations, setUseAnimations] = useState<boolean>(localStorage.getItem('use_animations') !== 'false');
  
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const [calcTab, setCalcTab] = useState<'bhxh' | 'bhyt'>('bhxh');
  const [bhxhMethod, setBhxhMethod] = useState<'monthly' | 'future'>('monthly');
  const [bhxhFutureYears, setBhxhFutureYears] = useState(2);
  const [calcIncome, setCalcIncome] = useState(1500000);
  const [calcCategory, setCalcCategory] = useState('other');
  const [bhytPeople, setBhytPeople] = useState(1);
  const [bhytMonths, setBhytMonths] = useState(12);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const bhxhResult = useMemo(() => {
    const support = SUPPORT_CATEGORIES.find(c => c.id === calcCategory);
    const supportRate = support ? support.rate : 0.2;
    const baseMonthlyContribution = calcIncome * BHXH_RATE;
    const supportAmountPerMonth = STANDARD_POVERTY * BHXH_RATE * supportRate;
    const netMonthly = baseMonthlyContribution - supportAmountPerMonth;
    
    if (bhxhMethod === 'monthly') {
        return { total: netMonthly, supportAmount: supportAmountPerMonth, discount: 0, months: 1, rawTotal: netMonthly, breakdown: [] };
    }
    
    const n = bhxhFutureYears * 12;
    const r = 0.0031; 
    let totalDiscounted = 0;
    const breakdown = [];
    for (let i = 1; i <= n; i++) {
        const monthlyDiscounted = baseMonthlyContribution / Math.pow(1 + r, i - 1);
        totalDiscounted += monthlyDiscounted;
        breakdown.push({ month: i, amount: monthlyDiscounted - supportAmountPerMonth });
    }
    const finalTotal = totalDiscounted - (supportAmountPerMonth * n);
    return { total: finalTotal, supportAmount: supportAmountPerMonth * n, discount: (netMonthly * n) - finalTotal, months: n, rawTotal: netMonthly * n, breakdown };
  }, [calcIncome, calcCategory, bhxhMethod, bhxhFutureYears]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading || !isOnline) return;
    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, userMsg].map(m => ({ role: m.sender === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
        config: {
            systemInstruction: `Bạn là trợ lý AI chuyên gia về BHXH và BHYT tại Quảng Ngãi. Sử dụng kiến thức: ${KNOWLEDGE_BASE}. Trả lời thân thiện, chuyên nghiệp, sử dụng Markdown.`
        }
      });
      setMessages(prev => [...prev, { id: Date.now().toString(), text: response.text || "Tôi không nhận được phản hồi.", sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: 'Xin lỗi, tôi gặp sự cố kết nối. Hãy thử lại sau!', sender: 'bot' }]);
    } finally { setIsLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: customBg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <header className="bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-2 flex items-center justify-between z-40 shadow-sm">
        <button onClick={() => setIsAboutModalOpen(true)} className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity">
            <img src={botAvatar} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100" />
            <p className="text-[9px] font-black text-bhxh-800 uppercase tracking-tighter leading-none">BHXH tỉnh Quảng Ngãi</p>
        </button>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsCalculatorOpen(true)} className="p-2.5 bg-bhxh-50 text-bhxh-600 rounded-xl border border-bhxh-100 shadow-sm hover:bg-bhxh-600 hover:text-white transition-all"><CalculatorIcon className="w-5 h-5" /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-2.5 bg-gray-50 text-gray-400 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-800 hover:text-white transition-all"><SettingsIcon className="w-5 h-5" /></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-reveal`}>
                    <div className={`max-w-[90%] md:max-w-[80%] ${msg.id === 'init' ? 'w-full' : 'px-5 py-3 rounded-3xl'} ${
                        msg.sender === 'user' ? 'bg-bhxh-600 text-white rounded-tr-none shadow-lg font-bold' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-md'
                    }`}>
                        <Typewriter text={msg.text} isInit={msg.id === 'init'} onSelectQuestion={q => handleSendMessage(q)} useAnimations={useAnimations} />
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start animate-pulse">
                    <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border flex gap-1">
                        <div className="w-1.5 h-1.5 bg-bhxh-300 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-bhxh-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        <div className="w-1.5 h-1.5 bg-bhxh-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                </div>
            )}
            <div ref={chatEndRef} className="h-4" />
        </div>
      </main>

      <footer className="bg-white/95 backdrop-blur-3xl border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto p-4">
            <form onSubmit={e => { e.preventDefault(); handleSendMessage(input); }} className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-bhxh-500"><SparklesIcon className="w-5 h-5 animate-pulse" /></div>
                <input 
                    type="text" 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder="Hỏi Trợ lý AI về chính sách bảo hiểm..." 
                    className="w-full h-12 pl-12 pr-14 bg-gray-50 border-2 border-bhxh-100 rounded-2xl focus:border-bhxh-500 focus:bg-white outline-none transition-all font-bold text-gray-700 shadow-inner text-sm"
                    disabled={isLoading}
                />
                <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-bhxh-600 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-20"><SendIcon className="w-5 h-5" /></button>
            </form>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 py-4 border-t border-gray-100">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <AgentIcon className="w-4 h-4 text-bhxh-600" />
                        <h4 className="text-[11px] font-black uppercase text-bhxh-800 tracking-tight">BHXH tỉnh Quảng Ngãi</h4>
                    </div>
                    <p className="text-[10px] text-gray-500 font-medium">Số 08 Cao Bá Quát, P. Cẩm Thành, TP. Quảng Ngãi</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                        <PhoneIcon className="w-3 h-3 text-bhxh-500" /> 0255.383.7171
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600">
                        <EnvelopeIcon className="w-3 h-3 text-bhxh-500" /> bhxh@quangngai.vss.gov.vn
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <a href="https://baohiemxahoi.gov.vn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-bhxh-50 text-bhxh-700 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-bhxh-600 hover:text-white transition-all border border-bhxh-100">
                        <GlobeIcon className="w-3 h-3" /> BHXH Việt Nam
                    </a>
                    <a href="https://dichvucong.baohiemxahoi.gov.vn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-tighter hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100">
                        <GlobeIcon className="w-3 h-3" /> Cổng DVC
                    </a>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[9px] text-gray-400 font-bold pt-4 border-t border-gray-50">
                <div className="flex items-center gap-4">
                    <p>© 2026 BHXH Quảng Ngãi</p>
                    <div className="flex gap-3">
                        <a href="https://facebook.com/bhxhquangngai" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors"><FacebookIcon className="w-3.5 h-3.5" /></a>
                        <a href="https://zalo.me/..." target="_blank" rel="noopener noreferrer" className="hover:text-bhxh-600 transition-colors"><ZaloIcon className="w-3.5 h-3.5" /></a>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    Hệ thống AI trực tuyến
                </div>
            </div>
        </div>
      </footer>

      {isCalculatorOpen && (
        <div className="fixed inset-0 bg-bhxh-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-reveal">
                <div className="bg-bhxh-600 p-6 text-white flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-3"><CalculatorIcon className="w-7 h-7" /> Dự tính mức đóng 2026</h3>
                    <button onClick={() => setIsCalculatorOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><XMarkIcon className="w-8 h-8" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50 custom-scrollbar space-y-8">
                    <div className="grid grid-cols-2 gap-3 bg-gray-100 p-1.5 rounded-2xl">
                        <button onClick={() => setBhxhMethod('monthly')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${bhxhMethod === 'monthly' ? 'bg-white shadow-sm text-bhxh-700' : 'text-gray-400'}`}>Hằng tháng</button>
                        <button onClick={() => setBhxhMethod('future')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${bhxhMethod === 'future' ? 'bg-white shadow-sm text-bhxh-700' : 'text-gray-400'}`}>Đóng gộp tương lai</button>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400">Mức thu nhập chọn đóng (VNĐ/tháng)</label>
                        <div className="flex items-center justify-between bg-white p-5 rounded-3xl border shadow-sm">
                            <button onClick={() => setCalcIncome(p => Math.max(1500000, p-100000))} className="w-10 h-10 bg-gray-50 rounded-xl font-black text-xl">-</button>
                            <span className="text-2xl font-black text-bhxh-800">{new Intl.NumberFormat('vi-VN').format(calcIncome)}</span>
                            <button onClick={() => setCalcIncome(p => Math.min(36000000, p+100000))} className="w-10 h-10 bg-bhxh-600 text-white rounded-xl font-black text-xl">+</button>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400">Đối tượng hỗ trợ</label>
                        <div className="grid grid-cols-2 gap-3">
                            {SUPPORT_CATEGORIES.map(c => (
                                <button key={c.id} onClick={() => setCalcCategory(c.id)} className={`p-4 border-2 rounded-2xl transition-all flex flex-col items-center ${calcCategory === c.id ? 'bg-bhxh-50 border-bhxh-500' : 'bg-white border-gray-100'}`}>
                                    <span className="text-[11px] font-black uppercase tracking-tight">{c.name}</span>
                                    <span className="text-[9px] font-bold text-gray-400 mt-1">{c.description}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-bhxh-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <p className="text-[10px] font-black uppercase opacity-60 mb-2">Thành tiền thực đóng dự kiến ({bhxhResult.months} tháng):</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tracking-tighter">{new Intl.NumberFormat('vi-VN').format(bhxhResult.total)}</span>
                            <span className="text-xl font-bold opacity-80">VNĐ</span>
                        </div>
                        {bhxhResult.discount > 0 && <p className="mt-4 text-[11px] font-bold text-emerald-300 italic">★ Tiết kiệm được {new Intl.NumberFormat('vi-VN').format(bhxhResult.discount)} VNĐ nhờ chiết khấu 0,31%!</p>}
                    </div>
                </div>
            </div>
        </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-bhxh-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[35px] shadow-2xl max-w-sm w-full p-8 animate-reveal">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-xl uppercase tracking-tighter text-gray-800">Cài đặt trợ lý</h3>
                    <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 block">Avatar Trợ lý AI</label>
                        <div className="grid grid-cols-4 gap-3">
                            {AVATAR_PRESETS.map((url, i) => (
                                <button key={i} onClick={() => { setBotAvatar(url); localStorage.setItem('bot_avatar', url); }} className={`h-14 rounded-xl overflow-hidden border-2 transition-all ${botAvatar === url ? 'border-bhxh-500 scale-110 shadow-md' : 'border-transparent opacity-60'}`}><img src={url} className="w-full h-full object-cover" /></button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 block">Hình nền ứng dụng</label>
                        <div className="grid grid-cols-2 gap-3">
                            {BACKGROUND_OPTIONS.map(bg => (
                                <button key={bg.id} onClick={() => { setCustomBg(bg.value); localStorage.setItem('app_bg', bg.value); }} className={`h-12 rounded-xl border-2 transition-all text-[9px] font-black uppercase ${customBg === bg.value ? 'border-bhxh-500 bg-bhxh-50' : 'border-gray-100'}`} style={{ background: bg.value, backgroundSize: 'cover' }}>{bg.name}</button>
                            ))}
                        </div>
                    </div>
                    <button onClick={() => setIsSettingsOpen(false)} className="w-full py-4 bg-bhxh-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">Lưu cài đặt</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
