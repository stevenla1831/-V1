/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  WashingMachine, 
  Wind, 
  Waves, 
  ShoppingBasket, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Coins,
  User,
  Plus,
  Minus,
  Trash2,
  Droplets,
  Sparkles,
  ShieldCheck,
  Sun,
  Trees,
  Flower2,
  Thermometer,
  Flame,
  Bed,
  Baby,
  Shirt,
  Heart,
  Zap,
  Cloud,
  Search,
  ArrowUpCircle,
  ArrowRight,
  QrCode,
  X,
  Package,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/// --- Types ---

type ServiceType = 'wash_dry' | 'wash' | 'dry' | 'special';
type MachineSize = 'small' | 'medium' | 'large';
type TempLevel = 'low' | 'mid' | 'high';
type WaterLevel = 'large' | 'standard' | 'small';

interface LaundryConfig {
  temp: TempLevel;
  water: WaterLevel;
  detergents: string[];
  scent: string;
  hotWater: 'none' | 'warm' | 'hot';
  dryTime: number;
}

// --- Constants ---

const SERVICES = [
  { 
    id: 'wash_dry', 
    name: '洗脫烘', 
    icon: <div className="w-40 h-40 rounded-full bg-[#10b981] flex items-center justify-center text-white shadow-lg border-4 border-white"><Wind className="w-20 h-20" /></div>, 
    color: 'text-[#10b981]' 
  },
  { 
    id: 'wash', 
    name: '洗衣', 
    icon: <div className="w-40 h-40 rounded-full bg-[#3b82f6] flex items-center justify-center text-white shadow-lg border-4 border-white"><Droplets className="w-20 h-20" /></div>, 
    color: 'text-[#3b82f6]' 
  },
  { 
    id: 'dry', 
    name: '烘衣', 
    icon: <div className="w-40 h-40 rounded-full bg-[#f97316] flex items-center justify-center text-white shadow-lg border-4 border-white"><Sun className="w-20 h-20" /></div>, 
    color: 'text-[#f97316]' 
  },
  { 
    id: 'special', 
    name: '特殊洗程', 
    icon: <div className="w-40 h-40 rounded-full bg-[#8b5cf6] flex items-center justify-center text-white shadow-lg border-4 border-white"><Sparkles className="w-20 h-20" /></div>, 
    color: 'text-[#8b5cf6]' 
  },
];

const SIZES = [
  { id: 'small', name: '小型 (10kg)', price: { wash_dry: 100, wash: 60, dry: 50, special: 120 }, desc: '適合單人一週衣物' },
  { id: 'medium', name: '中型 (15kg)', price: { wash_dry: 140, wash: 80, dry: 70, special: 160 }, desc: '適合家庭日常換洗' },
  { id: 'large', name: '大型 (20kg)', price: { wash_dry: 180, wash: 100, dry: 90, special: 200 }, desc: '適合被單、大型織物' },
];

const DRY_TIMES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90];
const ADD_DRY_TIMES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const SPECIAL_MODES = [
  { id: 'bedding', name: '床單被單', description: '適合床單、被套、枕頭套等大型織物', icon: <Bed className="w-10 h-10" />, price: 200 },
  { id: 'plush', name: '絨毛娃娃', description: '溫和洗滌，保護絨毛材質不變形', icon: <Cloud className="w-10 h-10" />, price: 160 },
  { id: 'down', name: '羽絨外套', description: '專業洗劑，保持羽絨蓬鬆度', icon: <Shirt className="w-10 h-10" />, price: 220 },
  { id: 'infant', name: '幼兒衣物', description: '加強洗淨，去除過敏原', icon: <Baby className="w-10 h-10" />, price: 150 },
  { id: 'delicate', name: '精緻內衣', description: '柔和水流，防止內衣變形', icon: <Heart className="w-10 h-10" />, price: 140 },
  { id: 'stain', name: '超級去汙', description: '強力去汙，適合重度髒污衣物', icon: <Zap className="w-10 h-10" />, price: 180 },
];

const TIPS = [
  "衣物放置過久容易有反潮異味",
  "若前位客人還未取衣,後位客人可先將衣物放置洗衣籃並開始使用",
  "取出衣物時請檢察桶內避免遺漏衣物",
  "桶內剛運轉完成桶內溫度較高請小心取衣"
];

const VENDING_ITEMS = Array.from({ length: 12 }, (_, i) => ({
  id: String(i + 1).padStart(2, '0'),
  name: '洗衣袋',
  price: 10,
  stock: 'in_stock',
  icon: <ShoppingBag className="w-16 h-16" />,
  color: 'bg-emerald-500'
}));

// --- Components ---

export default function App() {
  const [step, setStep] = useState<'home' | 'machine' | 'mode_select' | 'special_select' | 'mode_detail' | 'checkout' | 'washing' | 'success' | 'member_home' | 'member_new' | 'member_auth_method' | 'member_physical_ask' | 'member_topup_scan' | 'member_topup_payment' | 'member_balance_scan' | 'member_balance_result' | 'vending'>('home');
  const [selectedMachine, setSelectedMachine] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [selectedSpecialMode, setSelectedSpecialMode] = useState<string | null>(null);
  const [selectedVendingItem, setSelectedVendingItem] = useState<typeof VENDING_ITEMS[0] | null>(null);
  const [showAddDryModal, setShowAddDryModal] = useState(false);
  const [selectedAddDryTime, setSelectedAddDryTime] = useState(0);
  const [isFlowAddDry, setIsFlowAddDry] = useState(false);
  const [showMobilePaymentOptions, setShowMobilePaymentOptions] = useState(false);
  const [showMemberPaymentOptions, setShowMemberPaymentOptions] = useState(false);
  const [insertedAmount, setInsertedAmount] = useState(0);
  const [showMemberMobilePaymentOptions, setShowMemberMobilePaymentOptions] = useState(false);
  const [isNewCardFlow, setIsNewCardFlow] = useState(false);
  const [needsPhysicalCard, setNeedsPhysicalCard] = useState<boolean | null>(null);
  const [memberAuthMethod, setMemberAuthMethod] = useState<'card' | 'qr' | null>(null);
  const [nextStepAfterAuth, setNextStepAfterAuth] = useState<'member_topup_scan' | 'member_balance_scan' | null>(null);
  const [topupPaymentMethod, setTopupPaymentMethod] = useState<'credit' | 'mobile' | 'cash' | null>(null);
  const [selectedTopupProvider, setSelectedTopupProvider] = useState<string | null>(null);
  const [showPaymentPrompt, setShowPaymentPrompt] = useState<'credit' | 'barcode' | 'nfc' | 'cash' | null>(null);
  const [lastPaymentMethod, setLastPaymentMethod] = useState<'credit' | 'mobile' | 'cash' | 'member' | null>(null);
  const [successType, setSuccessType] = useState<'laundry' | 'member_new' | 'member_topup' | 'member_payment' | null>(null);
  const [countdown, setCountdown] = useState(20);
  const [showAddDryPayment, setShowAddDryPayment] = useState(false);
  const [isMachineDoorOpen, setIsMachineDoorOpen] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const [isDrumCleaning, setIsDrumCleaning] = useState(false);
  const [showDrumCleanConfirm, setShowDrumCleanConfirm] = useState(false);

  // Tip rotation effect
  React.useEffect(() => {
    if (step === 'success' && successType === 'laundry') {
      const interval = setInterval(() => {
        setCurrentTipIndex(prev => (prev + 1) % TIPS.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [step, successType]);

  // Washing progress state
  const [washingStage, setWashingStage] = useState(0);
  const [washingTimeLeft, setWashingTimeLeft] = useState(0);

  // Kiosk logic: Disable right-click and context menu
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('dragstart', handleDragStart);
    
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  const resetMemberTopupState = () => {
    setInsertedAmount(0);
    setTopupPaymentMethod(null);
    setSelectedTopupProvider(null);
    setShowPaymentPrompt(null);
    setShowMemberMobilePaymentOptions(false);
    setShowMemberPaymentOptions(false);
  };

  const bonusPoints = useMemo(() => {
    if (insertedAmount >= 10000) return 1500;
    if (insertedAmount >= 5000) return 600;
    if (insertedAmount >= 3000) return 300;
    if (insertedAmount >= 2000) return 150;
    if (insertedAmount >= 1000) return 50;
    return 0;
  }, [insertedAmount]);
  
  // Configuration state
  const [config, setConfig] = useState<LaundryConfig>({
    temp: 'mid',
    water: 'standard',
    detergents: ['detergent', 'softener'],
    scent: 'sun',
    hotWater: 'none',
    dryTime: 0
  });

  const WASHING_STAGES = useMemo(() => {
    if (isDrumCleaning) {
      return [
        { id: 1, name: '清洗空筒', duration: 40, icon: <Droplets className="w-12 h-12" /> },
      ];
    }
    return [
      { id: 1, name: '主洗', duration: 10, icon: <Droplets className="w-12 h-12" /> },
      { id: 2, name: '脫水', duration: 10, icon: <Shirt className="w-12 h-12" /> },
      { id: 3, name: '主洗', duration: 10, icon: <Droplets className="w-12 h-12" /> },
      { id: 4, name: '脫水', duration: 10, icon: <Shirt className="w-12 h-12" /> },
      { id: 5, name: '烘衣', duration: 10, icon: <Sun className="w-12 h-12" /> },
    ];
  }, [isDrumCleaning]);

  const totalWashingTimeLeft = useMemo(() => {
    let timeLeft = washingTimeLeft;
    for (let i = washingStage + 1; i < WASHING_STAGES.length; i++) {
      timeLeft += WASHING_STAGES[i].duration;
    }
    return timeLeft;
  }, [washingStage, washingTimeLeft, WASHING_STAGES]);

  const [machines, setMachines] = useState([
    { id: 1, name: '機台 1', status: 'available' },
    { id: 2, name: '機台 2', status: 'in_use', remaining: '29:41' },
    { id: 3, name: '機台 3', status: 'available' },
    { id: 4, name: '機台 4', status: 'collect', completed: '05:19' },
    { id: 5, name: '機台 5', status: 'in_use', remaining: '09:41' },
    { id: 6, name: '機台 6', status: 'available' },
    { id: 7, name: '機台 7', status: 'available' },
    { id: 8, name: '機台 8', status: 'in_use', remaining: '15:20' },
  ]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev => prev.map(m => {
        if (m.status === 'in_use' && m.remaining) {
          const [min, sec] = m.remaining.split(':').map(Number);
          let totalSec = min * 60 + sec;
          if (totalSec > 0) {
            totalSec--;
            const newMin = Math.floor(totalSec / 60);
            const newSec = totalSec % 60;
            return { ...m, remaining: `${String(newMin).padStart(2, '0')}:${String(newSec).padStart(2, '0')}` };
          } else {
            return { ...m, status: 'collect', remaining: undefined, completed: '00:00' };
          }
        }
        return m;
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentPrice = useMemo(() => {
    if (selectedVendingItem) return selectedVendingItem.price;
    if (!selectedService) return 0;
    
    let price = 0;
    
    if (selectedService === 'wash_dry') {
      if (config.water === 'large') price = 180;
      else if (config.water === 'standard') price = 150;
      else price = 120;
    } else if (selectedService === 'wash') {
      if (config.water === 'large') price = 100;
      else if (config.water === 'standard') price = 80;
      else price = 60;
    } else if (selectedService === 'special' && selectedSpecialMode) {
      const mode = SPECIAL_MODES.find(m => m.id === selectedSpecialMode);
      const base = mode?.price || 160;
      if (config.water === 'large') price = base + 20;
      else if (config.water === 'standard') price = base;
      else price = base - 20;
    } else {
      // Use medium size as default base price
      const size = SIZES.find(s => s.id === 'medium');
      price = size?.price[selectedService] || 0;
    }

    // Add extras for wash/wash_dry
    if (selectedService === 'wash_dry' || selectedService === 'wash' || selectedService === 'special') {
      if (config.detergents.includes('disinfectant')) price += 10;
      if (config.scent === 'wood') price += 10;
      if (config.scent === 'freesia') price += 20;
      if (config.hotWater === 'warm') price += 10;
      if (config.hotWater === 'hot') price += 20;
    }
    
    // For dry mode, price is purely time-based in this logic
    if (selectedService === 'dry') {
      price = config.dryTime * 2; 
    }

    // Always add the selected add-on drying time price from config
    if (selectedService === 'wash_dry' || selectedService === 'special') {
      price += config.dryTime * 2;
    }

    // Also add the temporary selection in modal if it's open (for real-time price update)
    price += selectedAddDryTime * 2;

    return price;
  }, [config, selectedService, selectedSpecialMode, selectedAddDryTime]);

  const reset = () => {
    setStep('home');
    setSelectedMachine(null);
    setSelectedService(null);
    setSelectedSpecialMode(null);
    setSelectedVendingItem(null);
    setSelectedAddDryTime(0);
    setIsFlowAddDry(false);
    setShowMobilePaymentOptions(false);
    setShowMemberPaymentOptions(false);
    setShowPaymentPrompt(null);
    setLastPaymentMethod(null);
    setSuccessType(null);
    setNeedsPhysicalCard(null);
    setCountdown(20);
    setWashingStage(0);
    setWashingTimeLeft(0);
    setShowAddDryPayment(false);
    setIsMachineDoorOpen(false);
    setIsDrumCleaning(false);
    setConfig({
      temp: 'mid',
      water: 'standard',
      detergents: ['detergent', 'softener'],
      scent: 'sun',
      hotWater: 'none',
      dryTime: 0
    });
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'success') {
      // For laundry, only start countdown if door is open
      if (successType === 'laundry' && !isMachineDoorOpen) {
        return;
      }

      setCountdown(20);
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            reset();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, successType, isMachineDoorOpen]);

  React.useEffect(() => {
    if (step === 'checkout') {
      setShowPaymentPrompt(null);
      setShowMobilePaymentOptions(false);
    }
  }, [step]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'washing') {
      timer = setInterval(() => {
        setWashingTimeLeft(prev => {
          if (prev <= 1) {
            if (washingStage < WASHING_STAGES.length - 1) {
              const nextStage = washingStage + 1;
              setWashingStage(nextStage);
              return WASHING_STAGES[nextStage].duration;
            } else {
              setStep('success');
              setSuccessType('laundry');
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, washingStage, WASHING_STAGES]);

  React.useEffect(() => {
    if (step === 'washing') {
      setWashingStage(0);
      setWashingTimeLeft(WASHING_STAGES[0].duration);
    }
  }, [step, WASHING_STAGES]);

  const prevStep = () => {
    if (step === 'machine') setStep('home');
    else if (step === 'mode_select') setStep('machine');
    else if (step === 'special_select') setStep('mode_select');
    else if (step === 'mode_detail') {
      if (selectedService === 'special') setStep('special_select');
      else setStep('mode_select');
    }
    else if (step === 'checkout') {
      if (showMobilePaymentOptions) {
        setShowMobilePaymentOptions(false);
      } else {
        setStep('mode_detail');
      }
    }
    else if (step === 'washing') setStep('checkout');
    else if (step === 'member_home') setStep('home');
    else if (step === 'member_new') setStep('member_home');
    else if (step === 'member_topup_scan') setStep('member_home');
    else if (step === 'member_topup_payment') {
      if (showPaymentPrompt) {
        setShowPaymentPrompt(null);
      } else if (showMemberMobilePaymentOptions) {
        setShowMemberMobilePaymentOptions(false);
      } else if (topupPaymentMethod) {
        setTopupPaymentMethod(null);
      } else {
        resetMemberTopupState();
        setStep('member_home');
      }
    }
    else if (step === 'member_balance_scan') setStep('member_home');
    else if (step === 'member_balance_result') setStep('member_home');
    else if (step === 'vending') setStep('home');
  };

  return (
    <div className="w-full h-screen overflow-hidden kiosk-mode-bg">
      <div className="kiosk-frame-container">
        <div className="kiosk-screen">
          <div className="h-full flex flex-col bg-stone-100 text-stone-900 font-sans selection:bg-emerald-100">
            {/* Header - Only show if not on home screen */}
            {step !== 'home' && (
              <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <button onClick={prevStep} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {step === 'machine' && '選擇機台'}
                    {step === 'mode_select' && '選擇服務'}
                    {step === 'special_select' && '特殊洗程選擇'}
                    {step === 'mode_detail' && (
                      selectedService === 'wash_dry' ? '洗脫烘模式' :
                      selectedService === 'wash' ? '洗衣模式' :
                      selectedService === 'dry' ? '烘衣模式' : 
                      SPECIAL_MODES.find(m => m.id === selectedSpecialMode)?.name || '特殊洗程'
                    )}
                    {step === 'checkout' && (showPaymentPrompt === 'cash' ? '洗衣付款 - 現金' : '確認訂單')}
                    {step === 'washing' && '正在洗衣'}
                    {step === 'member_home' && '會員卡主畫面'}
                    {step === 'member_new' && '新購會員卡'}
                    {step === 'member_topup_scan' && '會員卡儲值 - 確認身分'}
                    {step === 'member_topup_payment' && (topupPaymentMethod === 'cash' ? '會員儲值付款 - 現金' : '會員儲值付款')}
                    {step === 'member_balance_scan' && '會員餘額查詢'}
                    {step === 'member_balance_result' && '會員餘額查詢'}
                    {step === 'vending' && '販賣機'}
                  </h1>
                </div>
                <button 
                  onClick={reset}
                  className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-full text-stone-600 font-bold transition-all active:scale-95"
                >
                  <WashingMachine className="w-5 h-5" />
                  <span>回主頁</span>
                </button>
              </header>
            )}

            <main className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 relative">
        <AnimatePresence mode="wait">
          {/* Step 0: Home Screen */}
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[80vh] gap-8"
            >
              <button 
                onClick={() => {
                  setIsDrumCleaning(false);
                  setStep('mode_select');
                }}
                className="bg-white rounded-[3rem] p-16 sm:p-24 flex flex-col items-center gap-8 shadow-xl hover:shadow-2xl transition-all active:scale-95 group w-full max-w-2xl border border-stone-100"
              >
                <div className="text-[#10b981] group-hover:scale-110 transition-transform">
                  <WashingMachine className="w-32 h-32 sm:w-48 sm:h-48 stroke-[1.5]" />
                </div>
                <span className="text-4xl sm:text-6xl font-bold tracking-wider text-stone-700">開始洗衣</span>
              </button>
              <div className="text-orange-500 text-4xl font-black">
                現金付款請至後方點餐機操作
              </div>
              <button 
                onClick={() => setShowDrumCleanConfirm(true)}
                className="bg-[#10b981] text-white px-20 py-8 rounded-full font-bold text-4xl hover:bg-[#059669] transition-all active:scale-95 flex items-center gap-4 shadow-xl"
              >
                <Droplets className="w-10 h-10" />
                桶內清洗
              </button>
            </motion.div>
          )}

          {/* Drum Clean Confirmation Modal */}
          {showDrumCleanConfirm && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[3rem] p-12 max-w-2xl w-full shadow-2xl flex flex-col items-center gap-10"
              >
                <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-[#10b981]">
                  <Droplets className="w-12 h-12" />
                </div>
                <div className="text-center space-y-4">
                  <h3 className="text-5xl font-black text-stone-800">是否要桶內清洗？</h3>
                  <p className="text-stone-500 text-2xl font-bold">清洗空筒大約需要 40 秒</p>
                </div>
                <div className="grid grid-cols-2 gap-6 w-full">
                  <button 
                    onClick={() => {
                      setShowDrumCleanConfirm(false);
                      setIsDrumCleaning(true);
                      setStep('washing');
                    }}
                    className="bg-[#10b981] text-white py-8 rounded-[2rem] font-black text-4xl shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
                  >
                    是
                  </button>
                  <button 
                    onClick={() => setShowDrumCleanConfirm(false)}
                    className="bg-stone-100 text-stone-500 py-8 rounded-[2rem] font-black text-4xl shadow-md hover:bg-stone-200 transition-all active:scale-95"
                  >
                    否
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Step 1: Vending Selection */}
          {step === 'vending' && (
            <motion.div
              key="vending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center gap-12 max-w-[1200px] w-full mx-auto"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black text-stone-800">商品選擇</h2>
                <p className="text-stone-500 text-2xl font-bold">請選擇您需要的洗劑或備品</p>
              </div>

              <div className="grid grid-cols-4 gap-8 w-full">
                {VENDING_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    disabled={item.stock === 'sold_out'}
                    onClick={() => {
                      setSelectedVendingItem(item);
                      setStep('checkout');
                    }}
                    className={`bg-white p-10 rounded-[3.5rem] shadow-xl border-4 border-transparent flex flex-col items-center gap-6 transition-all active:scale-95 ${item.stock === 'sold_out' ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-emerald-500 hover:bg-emerald-50'}`}
                  >
                    <div className={`${item.color} p-8 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      {item.icon}
                    </div>
                    <div className="text-center space-y-2">
                      <div className="text-stone-400 font-bold text-xl">編號 {item.id}</div>
                      <div className="text-3xl font-black text-stone-800">{item.name}</div>
                      <div className="flex items-center justify-center gap-3 mt-2">
                        <span className={`px-4 py-1 rounded-full text-lg font-bold ${item.stock === 'in_stock' ? 'bg-emerald-100 text-emerald-600' : 'bg-stone-200 text-stone-500'}`}>
                          {item.stock === 'in_stock' ? '販售中' : '售完'}
                        </span>
                        <span className="text-3xl font-black text-red-500">${item.price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={reset}
                className="text-stone-400 font-bold text-2xl hover:text-stone-600 transition-colors"
              >
                返回首頁
              </button>
            </motion.div>
          )}

          {/* Step 1: Machine Selection */}
          {step === 'machine' && (
            <motion.div
              key="machine"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center gap-12 max-w-[1200px] w-full mx-auto"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black text-stone-800">選擇機台</h2>
                <p className="text-stone-500 text-2xl font-bold">請選擇您要使用的洗衣機或烘衣機</p>
              </div>

              <div className="grid grid-cols-4 gap-6 w-full">
                {machines.map((m) => (
                  <button 
                    key={m.id} 
                    onClick={() => {
                      setSelectedMachine(m.id);
                      if (m.status === 'available') setStep('mode_select');
                      else if (m.status === 'in_use') {
                        setIsFlowAddDry(true);
                        setSelectedAddDryTime(0);
                        setShowAddDryModal(true);
                      }
                    }}
                    className={`bg-white p-8 rounded-[3rem] shadow-xl border-4 border-transparent flex flex-col items-center gap-6 transition-all active:scale-95 group ${m.status === 'available' ? 'hover:border-emerald-500 hover:bg-emerald-50' : 'opacity-80'}`}
                  >
                    <div className="text-3xl font-black text-stone-700 group-hover:text-emerald-600 transition-colors">
                      {m.name}
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      {m.status === 'in_use' && (
                        <div className="text-center">
                          <div className="text-sm text-stone-400 font-bold uppercase tracking-widest">剩餘時間</div>
                          <div className="text-4xl font-black text-stone-400 font-mono">
                            {m.remaining}
                          </div>
                        </div>
                      )}
                      {m.status === 'collect' && (
                        <div className="text-center">
                          <div className="text-2xl text-stone-500 font-black">請取出衣物</div>
                        </div>
                      )}
                      
                      <div
                        className={`px-8 py-3 rounded-2xl font-black text-xl transition-all ${
                          m.status === 'available' 
                            ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white' 
                            : m.status === 'in_use' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {m.status === 'available' ? '可使用' : m.status === 'in_use' ? '使用中' : '待取出'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={reset}
                className="text-stone-400 font-bold text-2xl hover:text-stone-600 transition-colors"
              >
                返回首頁
              </button>
            </motion.div>
          )}

          {/* Step 2: Mode Selection (A4) */}
          {step === 'mode_select' && (
            <motion.div
              key="mode_select"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-12 w-full h-full justify-center px-4"
            >
              <div className="text-stone-500 font-bold text-5xl mb-4">A4 洗衣模式選擇</div>
              <div className="bg-[#e5e5e5] p-12 rounded-[5rem] w-full max-w-[1600px] grid grid-cols-4 gap-12 shadow-inner">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedService(s.id as ServiceType);
                      if (s.id === 'dry') setConfig(prev => ({ ...prev, dryTime: 30 }));
                      if (s.id === 'special') setStep('special_select');
                      else setStep('mode_detail');
                    }}
                    className="bg-white rounded-[4rem] p-16 flex flex-col items-center justify-center gap-12 shadow-md hover:shadow-2xl transition-all active:scale-95 group aspect-[4/5]"
                  >
                    <div className="group-hover:scale-110 transition-transform">
                      {s.icon}
                    </div>
                    <span className="text-6xl font-black text-stone-700">{s.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2.5: Special Mode Selection (B1) */}
          {step === 'special_select' && (
            <motion.div
              key="special_select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col items-center justify-center gap-8 max-w-[1200px] w-full mx-auto"
            >
              <div className="text-stone-400 font-bold text-xl sm:text-2xl">B1 特殊模式選擇</div>
              <div className="grid grid-cols-3 gap-6 sm:gap-8 w-full max-w-6xl">
                {SPECIAL_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedSpecialMode(m.id);
                      setStep('mode_detail');
                    }}
                    className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 flex flex-col items-center gap-4 sm:gap-6 shadow-sm hover:shadow-md transition-all active:scale-95 group border-2 border-transparent hover:border-emerald-500"
                  >
                    <div className="text-emerald-500 group-hover:scale-110 transition-transform scale-125 sm:scale-150">
                      {m.icon}
                    </div>
                    <div className="flex flex-col items-center gap-1 sm:gap-2">
                      <span className="text-xl sm:text-3xl font-bold text-stone-700">{m.name}</span>
                      <span className="text-xs sm:text-base text-stone-400 font-medium text-center leading-tight">{m.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Mode Detail (A5, A6, A7) */}
          {step === 'mode_detail' && (
            <motion.div
              key="mode_detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-row items-stretch justify-center gap-6 max-w-[1400px] w-full mx-auto h-[85vh]"
            >
              {/* Main Configuration Card */}
              <div className="flex-[3] bg-[#e5e5e5] p-10 rounded-[3rem] flex flex-col gap-8 shadow-inner overflow-hidden">
                <div className="text-stone-500 font-bold text-2xl border-b border-stone-300 pb-4 mb-2">
                  {selectedService === 'wash_dry' && 'A5 洗脫烘模式設定'}
                  {selectedService === 'wash' && 'A6 洗衣模式設定'}
                  {selectedService === 'dry' && 'A7 烘衣模式設定'}
                  {selectedService === 'special' && '特殊洗程模式設定'}
                </div>

                <div className="flex-1 flex flex-row gap-12 overflow-hidden">
                  {/* Left Column: Temp & Water */}
                  <div className="flex-[1.2] flex flex-col">
                    {/* Temperature */}
                    {(selectedService === 'wash_dry' || selectedService === 'dry' || selectedService === 'special') && (
                      <div className="space-y-4 mb-8">
                        <div className="text-stone-500 font-bold text-xl px-2">烘溫衣度</div>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'low', label: '低溫', color: 'bg-blue-500' },
                            { id: 'mid', label: '中溫', color: 'bg-[#f97316]' },
                            { id: 'high', label: '高溫', color: 'bg-red-500' }
                          ].map(t => (
                            <button
                              key={t.id}
                              onClick={() => setConfig(prev => ({ ...prev, temp: t.id as TempLevel }))}
                              className={`py-6 rounded-2xl flex flex-col items-center justify-center font-black text-3xl transition-all shadow-md ${
                                config.temp === t.id 
                                  ? `${t.color} text-white scale-105`
                                  : 'bg-white text-stone-400'
                              }`}
                            >
                              <span>{t.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Water Level */}
                    {(selectedService === 'wash_dry' || selectedService === 'wash' || selectedService === 'special') && (
                      <div className="flex-1 flex flex-col min-h-0">
                        <div className="text-stone-500 font-bold text-xl px-2 mb-4">水量</div>
                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                          {[
                            { id: 'large', label: '多量', waves: 3 },
                            { id: 'standard', label: '標準', waves: 2 },
                            { id: 'small', label: '少量', waves: 1 }
                          ].map(w => {
                            let displayPrice = 0;
                            if (selectedService === 'wash_dry') {
                              displayPrice = w.id === 'large' ? 180 : w.id === 'standard' ? 150 : 120;
                            } else if (selectedService === 'wash') {
                              displayPrice = w.id === 'large' ? 100 : w.id === 'standard' ? 80 : 60;
                            } else if (selectedService === 'special') {
                              const base = SPECIAL_MODES.find(m => m.id === selectedSpecialMode)?.price || 160;
                              displayPrice = w.id === 'large' ? base + 20 : w.id === 'standard' ? base : base - 20;
                            }

                            return (
                              <button
                                key={w.id}
                                onClick={() => setConfig(prev => ({ ...prev, water: w.id as WaterLevel }))}
                                className={`w-full rounded-[2.5rem] flex items-center justify-between px-10 transition-all shadow-md flex-1 min-h-0 ${
                                  config.water === w.id 
                                    ? 'bg-[#10b981] text-white scale-[1.02] z-10' 
                                    : 'bg-white text-stone-600'
                                }`}
                              >
                                <div className="flex items-center gap-6">
                                  <div className={`flex gap-1 w-24 justify-center ${config.water === w.id ? 'text-white' : 'text-[#10b981]'}`}>
                                    {Array.from({ length: w.waves }).map((_, i) => (
                                      <Waves key={i} className="w-12 h-12" />
                                    ))}
                                  </div>
                                  <span className="text-4xl font-bold">{w.label}</span>
                                </div>
                                <span className={`text-5xl font-black ${config.water === w.id ? 'text-white' : 'text-red-500'}`}>
                                  ${displayPrice}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Add-ons */}
                  <div className="flex-[1.5] flex flex-col">
                    {/* Drying Time Button for wash_dry and special */}
                    {(selectedService === 'wash_dry' || selectedService === 'special') && (
                      <div className="space-y-3 mb-6">
                        <div className="text-stone-500 font-bold text-xl px-2">烘衣時間</div>
                        <button
                          onClick={() => {
                            setIsFlowAddDry(false);
                            setSelectedAddDryTime(0);
                            setShowAddDryModal(true);
                          }}
                          className="w-full bg-white rounded-[2rem] p-5 shadow-md border-2 border-transparent hover:border-orange-500 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-100 p-3 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                              <Sun className="w-8 h-8" />
                            </div>
                            <div className="text-left">
                              <div className="text-2xl font-black text-stone-800">
                                {(selectedService === 'wash_dry' || selectedService === 'special') ? (30 + config.dryTime) : (config.dryTime || 30)} 分鐘
                              </div>
                              {config.dryTime > 0 && (
                                <div className="text-orange-500 font-bold text-base">已加烘 {config.dryTime} 分鐘</div>
                              )}
                            </div>
                          </div>
                          <div className="bg-orange-500 text-white px-6 py-2 rounded-2xl font-black text-lg shadow-sm group-hover:bg-orange-600 transition-colors">
                            加烘時間
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Direct Drying Time Grid for 'dry' service (A7) */}
                    {selectedService === 'dry' && (
                      <div className="space-y-3 mb-6 flex-1 flex flex-col min-h-0">
                        <div className="text-stone-500 font-bold text-xl px-2">烘衣時間</div>
                        <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-2 flex-1 scrollbar-hide">
                          {DRY_TIMES.filter(t => t > 0).map(t => (
                            <button
                              key={t}
                              onClick={() => setConfig(prev => ({ ...prev, dryTime: t }))}
                              className={`py-6 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all shadow-md ${
                                config.dryTime === t 
                                  ? 'bg-orange-500 text-white scale-105' 
                                  : 'bg-white text-stone-600'
                              }`}
                            >
                              <span className="text-3xl font-black">{t}</span>
                              <span className="text-sm font-bold opacity-80">分鐘</span>
                              <span className={`text-lg font-bold ${config.dryTime === t ? 'text-white/80' : 'text-red-500'}`}>${t * 2}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detergent */}
                    {(selectedService === 'wash_dry' || selectedService === 'wash' || selectedService === 'special') && (
                      <div className="space-y-3 mb-6">
                        <div className="text-stone-500 font-bold text-xl px-2">洗劑</div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'detergent', label: '洗衣精', icon: <Droplets className="w-10 h-10" />, isFree: true },
                            { id: 'softener', label: '柔軟精', icon: <Sparkles className="w-10 h-10" />, isFree: true },
                            { id: 'disinfectant', label: '除菌素', icon: <ShieldCheck className="w-10 h-10" />, price: '+10' }
                          ].map(d => (
                            <button
                              key={d.id}
                              onClick={() => setConfig(prev => ({
                                ...prev,
                                detergents: prev.detergents.includes(d.id) 
                                  ? prev.detergents.filter(i => i !== d.id) 
                                  : [...prev.detergents, d.id]
                              }))}
                              className={`py-6 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all shadow-md relative ${
                                config.detergents.includes(d.id) 
                                  ? 'bg-[#10b981] text-white scale-105' 
                                  : 'bg-white text-stone-600'
                              }`}
                            >
                              <div className={config.detergents.includes(d.id) ? 'text-white' : 'text-[#10b981]'}>{d.icon}</div>
                              <span className="text-3xl font-black">{d.label}</span>
                              {d.isFree ? (
                                <span className="bg-amber-400 text-stone-800 text-xs px-3 py-1 rounded-full font-black">免費</span>
                              ) : (
                                <span className={`text-lg font-bold ${config.detergents.includes(d.id) ? 'text-white/80' : 'text-red-500'}`}>{d.price}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fragrance */}
                    {(selectedService === 'wash_dry' || selectedService === 'wash' || selectedService === 'special') && (
                      <div className="space-y-3 mb-6">
                        <div className="text-stone-500 font-bold text-xl px-2">氣味</div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'sun', label: '陽光', icon: <Sun className="w-8 h-8" />, price: '+0' },
                            { id: 'wood', label: '木質', icon: <Trees className="w-8 h-8" />, price: '+10' },
                            { id: 'freesia', label: '小蒼蘭', icon: <Flower2 className="w-8 h-8" />, price: '+20' }
                          ].map(s => (
                            <button
                              key={s.id}
                              onClick={() => setConfig(prev => ({ ...prev, scent: s.id }))}
                              className={`py-4 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all shadow-md ${
                                config.scent === s.id 
                                  ? 'bg-[#10b981] text-white scale-105' 
                                  : 'bg-white text-stone-600'
                              }`}
                            >
                              <div className={config.scent === s.id ? 'text-white' : 'text-amber-500'}>{s.icon}</div>
                              <span className="text-3xl font-black">{s.label}</span>
                              <span className={`text-lg font-bold ${config.scent === s.id ? 'text-white/80' : 'text-red-500'}`}>{s.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Hot Water Wash */}
                    {(selectedService === 'wash_dry' || selectedService === 'wash' || selectedService === 'special') && (
                      <div className="space-y-3">
                        <div className="text-stone-500 font-bold text-xl px-2">熱洗水衣</div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { id: 'warm', label: '溫水', icon: <Thermometer className="w-8 h-8" />, price: '+10' },
                            { id: 'hot', label: '熱水', icon: <Flame className="w-8 h-8" />, price: '+20' }
                          ].map(h => (
                            <button
                              key={h.id}
                              onClick={() => setConfig(prev => ({ ...prev, hotWater: prev.hotWater === h.id ? 'none' : h.id as any }))}
                              className={`py-5 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all shadow-md ${
                                config.hotWater === h.id 
                                  ? 'bg-[#10b981] text-white scale-105' 
                                  : 'bg-white text-stone-600'
                              }`}
                            >
                              <div className={config.hotWater === h.id ? 'text-white' : 'text-stone-300'}>{h.icon}</div>
                              <span className="text-3xl font-black">{h.label}</span>
                              <span className={`text-lg font-bold ${config.hotWater === h.id ? 'text-white/80' : 'text-red-500'}`}>{h.price}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Summary & Confirm */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white p-10 rounded-[3rem] shadow-lg flex flex-col gap-8 flex-1">
                  <div className="text-stone-400 font-bold text-xl">您的選擇</div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl text-stone-500">服務項目</span>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-bold text-stone-700">
                          {SERVICES.find(s => s.id === selectedService)?.name}
                        </span>
                        {(selectedService === 'wash_dry' || selectedService === 'wash' || selectedService === 'special') && (
                          <span className="text-lg text-stone-400 font-bold">洗衣 30 分鐘</span>
                        )}
                        {(selectedService === 'wash_dry' || selectedService === 'dry' || selectedService === 'special') && (
                          <span className="text-lg text-orange-400 font-bold">
                            烘衣 {(selectedService === 'wash_dry' || selectedService === 'special') ? (30 + config.dryTime) : (config.dryTime || 30)} 分鐘
                          </span>
                        )}
                        <span className="text-lg text-emerald-500 font-black mt-1">
                          總共 {
                            ((selectedService === 'wash_dry' || selectedService === 'special') ? 60 + config.dryTime : 
                             selectedService === 'wash' ? 30 : 
                             selectedService === 'dry' ? (config.dryTime || 30) : 30)
                          } 分鐘
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-2xl text-stone-500">設定細節</span>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-4 py-1 bg-stone-100 rounded-lg text-xl font-bold text-stone-600">
                          {config.temp === 'low' ? '低溫' : config.temp === 'mid' ? '中溫' : '高溫'}
                        </span>
                        <span className="px-4 py-1 bg-stone-100 rounded-lg text-xl font-bold text-stone-600">
                          {config.water === 'large' ? '多量' : config.water === 'standard' ? '標準' : '少量'}
                        </span>
                        {config.scent !== 'sun' && (
                          <span className="px-4 py-1 bg-amber-50 rounded-lg text-xl font-bold text-amber-600">
                            {config.scent === 'wood' ? '木質' : '小蒼蘭'}
                          </span>
                        )}
                        {config.hotWater !== 'none' && (
                          <span className="px-4 py-1 bg-red-50 rounded-lg text-xl font-bold text-red-600">
                            {config.hotWater === 'warm' ? '溫水' : '熱水'}
                          </span>
                        )}
                        {config.dryTime > 0 && (
                          <span className="px-4 py-1 bg-orange-50 rounded-lg text-xl font-bold text-orange-600">
                            加烘 {config.dryTime} 分
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-100 pt-8 mt-auto">
                    <div className="text-stone-400 font-bold text-xl mb-2">合計金額</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-red-500">$</span>
                      <span className="text-8xl font-black text-red-500 leading-none">{currentPrice}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setStep('checkout')}
                  className="bg-[#10b981] text-white rounded-[3rem] py-10 flex items-center justify-center gap-6 shadow-xl hover:bg-[#059669] transition-all active:scale-95"
                >
                  <span className="text-6xl font-black tracking-widest">確認</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Checkout & Success steps remain similar but with updated styling */}
          {/* Step 4: Checkout (A8) */}
          {step === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-row items-stretch justify-center gap-8 max-w-[1300px] w-full mx-auto h-[75vh]"
            >
              <div className="flex-1 bg-white p-12 rounded-[3.5rem] shadow-xl flex flex-col items-center justify-center text-center gap-8 border-2 border-stone-100">
                <div className="space-y-2 mb-4">
                  <h2 className="text-5xl font-black text-stone-800">確認訂單</h2>
                  <p className="text-stone-500 text-2xl font-bold">請掃碼付款</p>
                </div>
                
                <div 
                  onClick={() => setStep('washing')}
                  className="relative p-8 bg-white rounded-3xl shadow-inner border-2 border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors"
                >
                  <QrCode className="w-64 h-64 text-stone-800" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                    <CheckCircle2 className="w-32 h-32 text-emerald-500" />
                  </div>
                </div>

                <div className="flex items-center gap-4 text-stone-400 font-bold text-xl">
                  <Smartphone className="w-8 h-8" />
                  <span>支援 Line Pay / Apple Pay / 街口支付</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-lg flex flex-col gap-8 flex-1 border-2 border-stone-100">
                  <div className="text-stone-400 font-bold text-2xl">消費項目明細</div>
                  
                  <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex justify-between items-start text-2xl">
                      <span className="text-stone-500 font-bold">服務項目</span>
                      <div className="flex flex-col items-end">
                        <span className="text-stone-800 font-black">
                          {selectedVendingItem ? selectedVendingItem.name : (
                            selectedService === 'special' 
                              ? SPECIAL_MODES.find(m => m.id === selectedSpecialMode)?.name 
                              : SERVICES.find(s => s.id === selectedService)?.name
                          )}
                        </span>
                        {!selectedVendingItem && (
                          <div className="flex flex-col items-end mt-1">
                            {(selectedService === 'wash_dry' || selectedService === 'wash' || selectedService === 'special') && (
                              <div className="flex items-center gap-4 text-xl">
                                <span className="text-stone-400 font-bold">洗衣時間</span>
                                <span className="text-stone-400 font-bold">20 分鐘</span>
                              </div>
                            )}
                            {(selectedService === 'wash_dry' || selectedService === 'dry') && (
                              <div className="flex items-center gap-4 text-xl">
                                <span className="text-orange-400 font-bold">烘衣時間</span>
                                <span className="text-orange-400 font-bold">
                                  {selectedService === 'wash_dry' ? (30 + config.dryTime) : (config.dryTime || 30)} 分鐘
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-stone-100 pt-6">
                      <div className="flex justify-between items-center text-xl">
                        <span className="text-stone-400">洗滌溫度</span>
                        <span className="text-stone-700 font-bold">{config.temp === 'low' ? '低溫' : config.temp === 'mid' ? '中溫' : '高溫'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xl">
                        <span className="text-stone-400">洗滌水量</span>
                        <span className="text-stone-700 font-bold">{config.water === 'large' ? '多量' : config.water === 'standard' ? '標準' : '少量'}</span>
                      </div>
                      {config.detergents.length > 0 && (
                        <div className="flex justify-between items-start text-xl">
                          <span className="text-stone-400">添加洗劑</span>
                          <div className="flex flex-col items-end gap-1">
                            {config.detergents.map(d => (
                              <span key={d} className="text-stone-700 font-bold">
                                {d === 'detergent' ? '洗衣精' : d === 'softener' ? '柔軟精' : '除菌素'}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-xl">
                        <span className="text-stone-400">氣味選擇</span>
                        <span className="text-stone-700 font-bold">{config.scent === 'sun' ? '陽光' : config.scent === 'wood' ? '木質' : '小蒼蘭'}</span>
                      </div>
                      {config.hotWater !== 'none' && (
                        <div className="flex justify-between items-center text-xl">
                          <span className="text-stone-400">熱水洗衣</span>
                          <span className="text-stone-700 font-bold">{config.hotWater === 'warm' ? '溫水' : '熱水'}</span>
                        </div>
                      )}
                      {selectedService === 'dry' && (
                        <div className="flex justify-between items-center text-xl">
                          <span className="text-stone-400">烘衣時間</span>
                          <span className="text-stone-700 font-bold">{config.dryTime} 分鐘</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-3xl border-t-2 border-stone-100 pt-8 mt-auto">
                      <span className="text-stone-800 font-black">合計金額</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-red-500">$</span>
                        <span className="text-8xl font-black text-red-500 leading-none">{currentPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={prevStep}
                  className="bg-white border-2 border-stone-200 text-stone-500 rounded-[2.5rem] py-8 font-bold text-2xl hover:bg-stone-50 transition-all active:scale-95 shadow-sm"
                >
                  返回修改
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Payment Selection (A9) */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-12 max-w-[1200px] w-full mx-auto"
            >
              {!showMobilePaymentOptions && !showMemberPaymentOptions && !showPaymentPrompt ? (
                <>
                  <div className="text-center space-y-4">
                    <h2 className="text-6xl font-black text-stone-800">選擇付款方式</h2>
                    <p className="text-stone-500 text-2xl font-bold">請選擇您偏好的支付工具</p>
                  </div>

                  <div className="grid grid-cols-4 gap-8 w-full">
                    <button 
                      onClick={() => {
                        setSuccessType('laundry');
                        setShowPaymentPrompt('credit');
                        setLastPaymentMethod('credit');
                      }} 
                      className="bg-white p-10 rounded-[3.5rem] shadow-xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-6 active:scale-95"
                    >
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-12 h-12" />
                      </div>
                      <span className="text-3xl font-black text-stone-700">信用卡</span>
                    </button>

                    <button 
                      onClick={() => setShowMobilePaymentOptions(true)} 
                      className="bg-white p-10 rounded-[3.5rem] shadow-xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-6 active:scale-95"
                    >
                      <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                        <Smartphone className="w-12 h-12" />
                      </div>
                      <span className="text-3xl font-black text-stone-700">行動支付</span>
                    </button>

                    <button 
                      onClick={() => {
                        setSuccessType('laundry');
                        setShowPaymentPrompt('cash');
                        setInsertedAmount(0);
                        setLastPaymentMethod('cash');
                      }} 
                      className="bg-white p-10 rounded-[3.5rem] shadow-xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-6 active:scale-95"
                    >
                      <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                        <Coins className="w-12 h-12" />
                      </div>
                      <span className="text-3xl font-black text-stone-700">現金付款</span>
                    </button>

                    <button 
                      onClick={() => setShowMemberPaymentOptions(true)} 
                      className="bg-white p-10 rounded-[3.5rem] shadow-xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-6 active:scale-95"
                    >
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <User className="w-12 h-12" />
                      </div>
                      <span className="text-3xl font-black text-stone-700">會員卡</span>
                    </button>
                  </div>

                  <button 
                    onClick={prevStep}
                    className="text-stone-400 font-bold text-2xl hover:text-stone-600 transition-colors"
                  >
                    返回訂單
                  </button>
                </>
              ) : showMobilePaymentOptions && !showPaymentPrompt ? (
                <div className="w-full space-y-12">
                  <div className="flex items-center justify-between">
                    <h2 className="text-5xl font-black text-stone-800">選擇行動支付</h2>
                    <button 
                      onClick={() => setShowMobilePaymentOptions(false)}
                      className="text-stone-400 hover:text-stone-600 font-bold text-2xl"
                    >
                      返回
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-8">
                    {[
                      { id: 'apple', name: 'Apple Pay', color: 'bg-black text-white', type: 'nfc' },
                      { id: 'google', name: 'Google Pay', color: 'bg-white text-stone-800 border-stone-200', type: 'nfc' },
                      { id: 'line', name: 'LINE Pay', color: 'bg-[#00c300] text-white', type: 'barcode' },
                      { id: 'jko', name: '街口支付', color: 'bg-[#ee3e44] text-white', type: 'barcode' }
                    ].map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSuccessType('laundry');
                          setShowPaymentPrompt(p.type as any);
                          setLastPaymentMethod('mobile');
                        }}
                        className={`p-10 rounded-[3rem] font-black text-3xl shadow-xl active:scale-95 transition-all border-4 border-transparent hover:border-emerald-500 ${p.color}`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : showMemberPaymentOptions && !showPaymentPrompt ? (
                <div className="w-full space-y-12">
                  <div className="flex items-center justify-between">
                    <h2 className="text-5xl font-black text-stone-800">選擇會員卡支付方式</h2>
                    <button 
                      onClick={() => setShowMemberPaymentOptions(false)}
                      className="text-stone-400 hover:text-stone-600 font-bold text-2xl"
                    >
                      返回
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-12">
                    <button
                      onClick={() => {
                        setSuccessType('member_payment');
                        setShowPaymentPrompt('barcode');
                        setLastPaymentMethod('member');
                      }}
                      className="bg-white p-12 rounded-[4rem] shadow-xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-8 active:scale-95"
                    >
                      <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                        <QrCode className="w-16 h-16" />
                      </div>
                      <span className="text-4xl font-black text-stone-700">掃描 Code 支付</span>
                    </button>
                    <button
                      onClick={() => {
                        setSuccessType('member_payment');
                        setShowPaymentPrompt('credit');
                        setLastPaymentMethod('member');
                      }}
                      className="bg-white p-12 rounded-[4rem] shadow-xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-8 active:scale-95"
                    >
                      <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-16 h-16" />
                      </div>
                      <span className="text-4xl font-black text-stone-700">靠卡感應支付</span>
                    </button>
                  </div>
                </div>
              ) : showPaymentPrompt === 'cash' ? (
                <div className="flex flex-row items-stretch justify-center gap-12 w-full max-w-[1200px] h-[60vh]">
                  <div className="flex-1 bg-white p-12 rounded-[4rem] shadow-xl flex flex-col justify-between border border-stone-100">
                    <div className="space-y-8">
                      <div className="flex justify-between items-center pb-6 border-b border-stone-100">
                        <span className="text-stone-500 text-2xl font-bold">應付金額</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-stone-400">$</span>
                          <span className="text-6xl font-black text-stone-800">{currentPrice}</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <span className="text-stone-400 text-xl font-bold uppercase tracking-widest">目前投入</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-red-500">NT$</span>
                          <span className="text-9xl font-black text-red-500 font-mono leading-none">{insertedAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setShowPaymentPrompt(null)}
                        className="flex-1 py-6 bg-stone-100 text-stone-500 rounded-[2.5rem] text-2xl font-black hover:bg-stone-200 transition-all"
                      >
                        返回
                      </button>
                      <button 
                        onClick={() => {
                          setStep('success');
                          setShowPaymentPrompt(null);
                        }}
                        disabled={insertedAmount < currentPrice}
                        className={`flex-[2] py-6 rounded-[2.5rem] text-3xl font-black shadow-xl transition-all ${
                          insertedAmount >= currentPrice 
                            ? 'bg-[#10b981] text-white hover:bg-[#059669]' 
                            : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        確認付款
                      </button>
                    </div>
                  </div>

                  <div className="w-[400px] flex flex-col gap-6">
                    <div className="bg-stone-800 p-10 rounded-[4rem] shadow-2xl flex-1 flex flex-col justify-center items-center text-center gap-8">
                      <div className="w-24 h-24 bg-stone-700 rounded-full flex items-center justify-center text-amber-400 animate-pulse">
                        <Coins className="w-12 h-12" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-stone-400 font-bold text-xl">請投入現金</p>
                        <p className="text-white text-2xl font-black">支援硬幣與紙鈔</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 w-full">
                        {[10, 50, 100, 500].map(val => (
                          <button
                            key={val}
                            onClick={() => setInsertedAmount(prev => prev + val)}
                            className="py-4 bg-stone-700 rounded-2xl text-white font-black hover:bg-stone-600 active:scale-95 transition-all border border-stone-600"
                          >
                            +${val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-12 py-12">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                    <div className="relative bg-white p-16 rounded-full shadow-2xl border-8 border-emerald-50">
                      {showPaymentPrompt === 'credit' && <CreditCard className="w-32 h-32 text-emerald-500" />}
                      {showPaymentPrompt === 'barcode' && <QrCode className="w-32 h-32 text-emerald-500" />}
                      {showPaymentPrompt === 'nfc' && <Smartphone className="w-32 h-32 text-emerald-500" />}
                    </div>
                  </div>
                  
                  <div className="text-center space-y-6">
                    <h3 className="text-6xl font-black text-stone-800">
                      {showPaymentPrompt === 'credit' && '請靠卡感應'}
                      {showPaymentPrompt === 'barcode' && '請掃描 QR Code'}
                      {showPaymentPrompt === 'nfc' && '請靠近刷卡機'}
                    </h3>
                    <p className="text-3xl font-bold text-stone-400 max-w-2xl">
                      {showPaymentPrompt === 'credit' && (lastPaymentMethod === 'member' ? '請將會員卡靠近讀卡機感應區' : '請將信用卡靠近讀卡機感應區')}
                      {showPaymentPrompt === 'barcode' && '請使用手機掃描螢幕上的 QR Code'}
                      {showPaymentPrompt === 'nfc' && '請開啟感應支付並靠近讀卡機'}
                    </p>
                  </div>

                  <div className="flex gap-8 mt-8">
                    <button
                      onClick={() => setShowPaymentPrompt(null)}
                      className="px-16 py-6 bg-stone-100 text-stone-500 rounded-full text-2xl font-black hover:bg-stone-200 transition-all"
                    >
                      返回選項
                    </button>
                    <button
                      onClick={() => {
                        if (successType === 'laundry') {
                          setStep('washing');
                        } else {
                          setStep('success');
                        }
                        setShowPaymentPrompt(null);
                      }}
                      className="px-16 py-6 bg-[#10b981] text-white rounded-full text-2xl font-black shadow-xl hover:bg-[#059669] transition-all active:scale-95"
                    >
                      模擬支付成功
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step: Washing in Progress */}
          {step === 'washing' && (
            <motion.div
              key="washing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-12 max-w-[1000px] w-full mx-auto h-[75vh]"
            >
              <div className="bg-white p-16 rounded-[4rem] shadow-2xl w-full flex flex-col items-center gap-12 border-2 border-stone-50">
                <div className="text-center space-y-4">
                  <h2 className="text-6xl font-black text-stone-800">
                    {isDrumCleaning ? '正在清洗空筒' : '正在洗衣'}
                  </h2>
                  <p className="text-stone-500 text-2xl font-bold">
                    {isDrumCleaning ? '請稍候，正在為您清潔桶內' : '請稍候，您的衣物正在處理中'}
                  </p>
                </div>

                {/* Current Stage Display */}
                <div className="flex flex-col items-center gap-12 w-full">
                  <div className="relative">
                    <motion.div 
                      className={`w-64 h-64 rounded-full flex items-center justify-center shadow-inner border-8 transition-colors duration-500 ${
                        WASHING_STAGES[washingStage].name === '烘衣' 
                          ? 'bg-orange-50 text-orange-500 border-orange-100' 
                          : 'bg-emerald-50 text-[#10b981] border-emerald-100'
                      }`}
                      animate={
                        WASHING_STAGES[washingStage].name === '主洗' 
                          ? { 
                              y: [0, -15, 0],
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }
                          : WASHING_STAGES[washingStage].name === '脫水'
                          ? { 
                              rotate: [0, 360],
                              scale: [1, 0.95, 1]
                            }
                          : { 
                              scale: [1, 1.15, 1],
                              opacity: [0.8, 1, 0.8]
                            }
                      }
                      transition={
                        WASHING_STAGES[washingStage].name === '脫水'
                          ? { repeat: Infinity, duration: 6, ease: "linear" }
                          : WASHING_STAGES[washingStage].name === '主洗'
                          ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                          : { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                      }
                    >
                      <motion.div
                        animate={
                          WASHING_STAGES[washingStage].name === '脫水'
                            ? { rotate: [0, 360] }
                            : {}
                        }
                        transition={
                          WASHING_STAGES[washingStage].name === '脫水'
                            ? { repeat: Infinity, duration: 6, ease: "linear" }
                            : {}
                        }
                      >
                        {WASHING_STAGES[washingStage].icon}
                      </motion.div>
                    </motion.div>
                    <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-8 py-2 rounded-full font-black text-2xl shadow-lg whitespace-nowrap text-white transition-colors duration-500 ${
                      WASHING_STAGES[washingStage].name === '烘衣' ? 'bg-orange-500' : 'bg-[#10b981]'
                    }`}>
                      {WASHING_STAGES[washingStage].name}
                    </div>
                  </div>

                  <div className="flex justify-center w-full">
                    <div className="text-center">
                      <div className="text-[10rem] font-black text-stone-800 tabular-nums leading-none">
                        {Math.floor(totalWashingTimeLeft / 60)}:{String(totalWashingTimeLeft % 60).padStart(2, '0')}
                      </div>
                      <div className="text-stone-400 font-bold text-3xl mt-4">總剩餘時間</div>
                    </div>
                  </div>
                </div>

                {/* Controls during washing */}
                {!isDrumCleaning && (
                  <div className="w-full flex justify-between items-end gap-12 px-8">
                    <div className="flex-1 space-y-6">
                      <div className="text-stone-500 font-bold text-2xl px-2">烘溫衣度</div>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'low', label: '低溫', color: 'bg-blue-500' },
                          { id: 'mid', label: '中溫', color: 'bg-[#f97316]' },
                          { id: 'high', label: '高溫', color: 'bg-red-500' }
                        ].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setConfig(prev => ({ ...prev, temp: t.id as TempLevel }))}
                            className={`py-6 rounded-3xl flex flex-col items-center justify-center font-bold text-2xl transition-all shadow-md ${
                              config.temp === t.id 
                                ? `${t.color} text-white scale-105`
                                : 'bg-white text-stone-400'
                            }`}
                          >
                            <span>{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setIsFlowAddDry(true);
                        setSelectedAddDryTime(0);
                        setShowAddDryModal(true);
                      }}
                      className="bg-orange-500 text-white px-16 py-8 rounded-[2.5rem] font-black text-4xl shadow-xl hover:bg-orange-600 transition-all active:scale-95 h-fit"
                    >
                      加烘時間
                    </button>
                  </div>
                )}

                {/* Stages Progress List */}
                <div className={`w-full flex ${WASHING_STAGES.length > 1 ? 'justify-between' : 'justify-center'} items-center px-8 relative`}>
                  {/* Progress Line */}
                  {WASHING_STAGES.length > 1 && (
                    <>
                      <div className="absolute top-1/2 left-16 right-16 h-2 bg-stone-100 -translate-y-1/2 z-0" />
                      <div 
                        className="absolute top-1/2 left-16 h-2 bg-[#10b981] -translate-y-1/2 z-0 transition-all duration-1000" 
                        style={{ 
                          width: `${(washingStage / (WASHING_STAGES.length - 1)) * 100}%`,
                          maxWidth: 'calc(100% - 8rem)'
                        }}
                      />
                    </>
                  )}

                  {WASHING_STAGES.map((s, idx) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                        idx < washingStage ? 'bg-[#10b981] text-white' : 
                        idx === washingStage ? 'bg-[#10b981] text-white scale-125 ring-8 ring-emerald-50' : 
                        'bg-white text-stone-300 border-4 border-stone-100'
                      }`}>
                        {idx < washingStage ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-black text-xl">{s.id}</span>}
                      </div>
                      <span className={`font-bold text-lg ${idx === washingStage ? 'text-[#10b981]' : 'text-stone-400'}`}>
                        {s.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 6: Success (A10) */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center gap-16 max-w-[1200px] w-full mx-auto h-[70vh]"
            >
              <div className="flex flex-col items-center gap-12">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                  <div className="relative bg-[#10b981] p-16 rounded-full shadow-2xl">
                    <CheckCircle2 className="w-32 h-32 text-white" />
                  </div>
                </div>
                <div className="text-center space-y-4">
                  {lastPaymentMethod === 'member' && (
                    <div className="bg-amber-100 text-amber-700 px-6 py-2 rounded-full font-black text-xl mb-4 inline-block shadow-sm border border-amber-200">
                      尊貴的鑽石會員 您好
                    </div>
                  )}
                  <h2 className="text-7xl font-black text-stone-800">
                    {isDrumCleaning ? '桶內清洗完成！' : 
                     successType === 'member_new' ? '購卡成功！' : 
                     successType === 'member_topup' ? '儲值成功！' : 
                     successType === 'laundry' ? '運轉完成請取出衣物' : '付款成功！'}
                  </h2>
                  <p className="text-3xl font-bold text-stone-400 h-24 flex items-center justify-center">
                    {isDrumCleaning ? '感謝您的使用，桶內已清潔完畢' : 
                     successType === 'laundry' ? (
                      <div className="relative w-full overflow-hidden h-full flex items-center justify-center">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={currentTipIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="text-orange-500 absolute text-center px-4"
                          >
                            小提示：{TIPS[currentTipIndex]}
                          </motion.span>
                        </AnimatePresence>
                      </div>
                    ) : (
                      selectedVendingItem 
                        ? `請從販賣機取出口領取您的 ${selectedVendingItem.name}` 
                        : `請前往 ${selectedMachine?.toString().padStart(2, '0') || '01'} 號機台`
                    )}
                  </p>
                  <p className="text-2xl font-bold text-stone-400 pt-4">感謝您的使用</p>
                </div>

                {successType === 'laundry' && (
                  <button 
                    onClick={reset}
                    className="mt-8 px-24 py-8 bg-[#10b981] text-white rounded-[2.5rem] text-4xl font-black shadow-xl hover:bg-[#059669] transition-all active:scale-95"
                  >
                    模擬打開機門
                  </button>
                )}
                
                {successType !== 'laundry' && (
                  <button 
                    onClick={reset}
                    className="mt-8 px-24 py-8 bg-stone-800 text-white rounded-[2.5rem] text-4xl font-black shadow-xl hover:bg-stone-900 transition-all active:scale-95"
                  >
                    返回首頁
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Membership Section */}
          {step === 'member_home' && (
            <motion.div
              key="member_home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center gap-12 max-w-[1200px] w-full mx-auto"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black text-stone-800">會員卡專區</h2>
                <p className="text-stone-500 text-2xl font-bold">請選擇您要進行的服務</p>
              </div>

              <div className="grid grid-cols-4 gap-8 w-full">
                {[
                  { id: 'member_new', name: '新購會員卡', icon: <Plus className="w-16 h-16" />, color: 'bg-emerald-100 text-emerald-500' },
                  { id: 'member_topup_scan', name: '會員卡儲值', icon: <ArrowUpCircle className="w-16 h-16" />, color: 'bg-blue-100 text-blue-500' },
                  { id: 'member_balance_scan', name: '餘額查詢', icon: <Search className="w-16 h-16" />, color: 'bg-amber-100 text-amber-500' },
                  { id: 'member_coming_soon', name: '會員卡專區\n(建置中)', icon: <User className="w-16 h-16" />, color: 'bg-stone-100 text-stone-300', disabled: true }
                ].map(item => (
                  <button
                    key={item.id}
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.id === 'member_topup_scan' || item.id === 'member_balance_scan') {
                        setNextStepAfterAuth(item.id as any);
                        setStep('member_auth_method');
                      } else {
                        setStep(item.id as any);
                      }
                    }}
                    className={`bg-white p-10 rounded-[3.5rem] shadow-xl border-4 border-transparent flex flex-col items-center gap-8 transition-all active:scale-95 ${item.disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-emerald-500 hover:bg-emerald-50'}`}
                  >
                    <div className={`p-8 rounded-full ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="text-3xl font-black text-stone-700 text-center whitespace-pre-line leading-relaxed">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>

              <button 
                onClick={reset}
                className="text-stone-400 font-bold text-2xl hover:text-stone-600 transition-colors"
              >
                返回首頁
              </button>
            </motion.div>
          )}

          {step === 'member_auth_method' && (
            <motion.div
              key="member_auth_method"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-12 pt-12"
            >
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-black text-stone-800">請選擇確認身分方式</h2>
                <p className="text-xl text-stone-500">請選擇您要使用的卡片感應或掃描方式</p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 w-full max-w-2xl">
                <button
                  onClick={() => {
                    setMemberAuthMethod('card');
                    setNeedsPhysicalCard(true);
                    setStep(nextStepAfterAuth!);
                  }}
                  className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center gap-6 shadow-xl border-4 border-transparent hover:border-emerald-500 transition-all active:scale-95"
                >
                  <div className="bg-emerald-100 p-8 rounded-full text-emerald-600">
                    <CreditCard className="w-16 h-16" />
                  </div>
                  <span className="text-3xl font-black text-stone-700">實體卡感應</span>
                </button>
                
                <button
                  onClick={() => {
                    setMemberAuthMethod('qr');
                    setStep(nextStepAfterAuth!);
                  }}
                  className="bg-white rounded-[2.5rem] p-12 flex flex-col items-center gap-6 shadow-xl border-4 border-transparent hover:border-emerald-500 transition-all active:scale-95"
                >
                  <div className="bg-emerald-100 p-8 rounded-full text-emerald-600">
                    <QrCode className="w-16 h-16" />
                  </div>
                  <span className="text-3xl font-black text-stone-700">掃描 QR Code</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === 'member_new' && (
            <motion.div
              key="member_new"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-row items-center justify-center gap-16 max-w-[1000px] w-full mx-auto"
            >
              <div className="bg-white p-12 rounded-[4rem] shadow-2xl border-8 border-stone-100">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=NEW_MEMBER" 
                  alt="QR Code"
                  className="w-80 h-80 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => {
                    setStep('member_physical_ask');
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="flex flex-col items-start gap-8 max-w-md">
                <div className="space-y-4">
                  <h2 className="text-6xl font-black text-stone-800 leading-tight">請掃描<br/>新購會員</h2>
                  <p className="text-2xl text-stone-400 font-bold">掃描 QR Code 即可開始註冊流程</p>
                </div>
                
                <div className="flex items-center gap-4 p-6 bg-stone-100 rounded-3xl text-stone-500">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <span className="text-xl font-bold">點擊 QR Code 模擬掃描成功</span>
                </div>

                <button 
                  onClick={reset}
                  className="text-stone-400 font-bold text-2xl hover:text-stone-600 transition-colors mt-4"
                >
                  返回首頁
                </button>
              </div>
            </motion.div>
          )}

          {step === 'member_physical_ask' && (
            <motion.div
              key="member_physical_ask"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-12 max-w-[1000px] w-full mx-auto"
            >
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-black text-stone-800">是否需要實體卡片？</h2>
                <p className="text-2xl text-stone-500 font-bold">實體卡片可用於感應支付，亦可使用 QR Code 支付</p>
              </div>
              
              <div className="grid grid-cols-2 gap-12 w-full">
                <button
                  onClick={() => {
                    setNeedsPhysicalCard(true);
                    resetMemberTopupState();
                    setIsNewCardFlow(true);
                    setStep('member_topup_payment');
                  }}
                  className="bg-white rounded-[4rem] p-16 flex flex-col items-center gap-8 shadow-2xl border-4 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all active:scale-95 group"
                >
                  <div className="bg-emerald-100 p-10 rounded-full text-emerald-600 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-24 h-24" />
                  </div>
                  <span className="text-5xl font-black text-stone-700">是，我需要</span>
                </button>
                
                <button
                  onClick={() => {
                    setNeedsPhysicalCard(false);
                    resetMemberTopupState();
                    setIsNewCardFlow(true);
                    setStep('member_topup_payment');
                  }}
                  className="bg-white rounded-[4rem] p-16 flex flex-col items-center gap-8 shadow-2xl border-4 border-transparent hover:border-red-500 hover:bg-red-50 transition-all active:scale-95 group"
                >
                  <div className="bg-red-100 p-10 rounded-full text-red-500 group-hover:scale-110 transition-transform">
                    <X className="w-24 h-24" />
                  </div>
                  <span className="text-5xl font-black text-stone-700">否，不需要</span>
                </button>
              </div>

              <button 
                onClick={() => setStep('member_new_scan')}
                className="text-stone-400 font-bold text-2xl hover:text-stone-600 transition-colors"
              >
                返回上一步
              </button>
            </motion.div>
          )}

          {step === 'member_topup_scan' && (
            <motion.div
              key="member_topup_scan"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-12 pt-12"
            >
              <div className="bg-stone-200 p-16 rounded-[3rem] shadow-inner flex flex-col items-center gap-8">
                {memberAuthMethod === 'qr' ? (
                  <>
                    <div className="bg-white p-6 rounded-3xl shadow-sm">
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TOPUP_MEMBER" 
                        alt="QR Code"
                        className="w-64 h-64"
                        onClick={() => {
                          resetMemberTopupState();
                          setIsNewCardFlow(false);
                          setStep('member_topup_payment');
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl font-bold text-stone-600">請掃描會員卡 QR Code</span>
                      <p className="text-stone-400 font-medium">(點擊 QR Code 模擬掃描成功)</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-12 rounded-full shadow-sm relative">
                      <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                      <CreditCard className="w-40 h-40 text-emerald-500 relative z-10" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl font-bold text-stone-600">請將實體卡片靠近感應區</span>
                      <button 
                        onClick={() => {
                          resetMemberTopupState();
                          setIsNewCardFlow(false);
                          setStep('member_topup_payment');
                        }}
                        className="mt-4 px-8 py-3 bg-emerald-500 text-white rounded-full font-bold active:scale-95 transition-all"
                      >
                        模擬感應成功
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {step === 'member_topup_payment' && (
            <motion.div
              key="member_topup_payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-8 max-w-[1200px] w-full mx-auto"
            >
              <div className="bg-white rounded-[4rem] p-12 shadow-2xl border-8 border-stone-100 w-full flex flex-row gap-12">
                {/* Left Column: Summary & Status */}
                <div className="w-1/3 flex flex-col gap-8 border-r-4 border-stone-50 pr-12">
                  <div className="space-y-2">
                    <h3 className="text-stone-400 font-black text-2xl uppercase tracking-widest">儲值卡號</h3>
                    <div className="text-5xl font-black text-stone-800">{isNewCardFlow ? '新購卡片' : 'M019103'}</div>
                  </div>

                  <div className="bg-stone-50 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500 text-xl font-bold">儲值金額</span>
                      <span className="text-4xl font-black text-red-600 font-mono">NT$ {insertedAmount || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                      <span className="text-stone-400 text-lg font-bold">贈送點數</span>
                      <span className="text-3xl font-black text-orange-500">{bonusPoints} pts</span>
                    </div>
                  </div>

                  <button 
                    onClick={reset}
                    className="mt-auto text-stone-400 font-bold text-2xl hover:text-stone-600 transition-colors text-left"
                  >
                    取消並返回
                  </button>
                </div>

                {/* Right Column: Interaction Area */}
                <div className="flex-1 flex flex-col justify-center min-h-[500px]">
                  {/* Step 1: Select Payment Method */}
                  {!topupPaymentMethod && (
                    <div className="space-y-10">
                      <h3 className="text-4xl font-black text-stone-700 text-center">請選擇付款方式</h3>
                      <div className="grid grid-cols-3 gap-8">
                        <button 
                          onClick={() => {
                            setTopupPaymentMethod('credit');
                            setLastPaymentMethod('credit');
                          }} 
                          className="flex flex-col items-center gap-6 p-10 rounded-[3rem] border-4 border-stone-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group active:scale-95"
                        >
                          <div className="bg-stone-100 p-8 rounded-full text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-colors">
                            <CreditCard className="w-16 h-16" />
                          </div>
                          <span className="font-black text-2xl text-stone-600">信用卡</span>
                        </button>
                        <button 
                          onClick={() => {
                            setTopupPaymentMethod('mobile');
                            setLastPaymentMethod('mobile');
                          }} 
                          className="flex flex-col items-center gap-6 p-10 rounded-[3rem] border-4 border-stone-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group active:scale-95"
                        >
                          <div className="bg-stone-100 p-8 rounded-full text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-colors">
                            <Smartphone className="w-16 h-16" />
                          </div>
                          <span className="font-black text-2xl text-stone-600">行動支付</span>
                        </button>
                        <button 
                          onClick={() => {
                            setTopupPaymentMethod('cash');
                            setInsertedAmount(0);
                            setLastPaymentMethod('cash');
                          }} 
                          className="flex flex-col items-center gap-6 p-10 rounded-[3rem] border-4 border-stone-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group active:scale-95"
                        >
                          <div className="bg-stone-100 p-8 rounded-full text-stone-400 group-hover:bg-emerald-100 group-hover:text-emerald-500 transition-colors">
                            <Coins className="w-16 h-16" />
                          </div>
                          <span className="font-black text-2xl text-stone-600">現金付款</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Mobile Pay Selection */}
                  {topupPaymentMethod === 'mobile' && !showMemberMobilePaymentOptions && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-4xl font-black text-stone-700">選擇行動支付</h3>
                        <button 
                          onClick={() => setTopupPaymentMethod(null)}
                          className="text-stone-400 hover:text-stone-600 p-2"
                        >
                          <ChevronLeft className="w-12 h-12" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          { name: 'LINE Pay', color: 'bg-[#00B900]', type: 'barcode' },
                          { name: 'Apple Pay', color: 'bg-black', type: 'nfc' },
                          { name: 'Google Pay', color: 'bg-white border-4 border-stone-100', type: 'nfc' },
                          { name: '街口支付', color: 'bg-[#ED1C24]', type: 'barcode' }
                        ].map((pay, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedTopupProvider(pay.type);
                              setShowMemberMobilePaymentOptions(true);
                            }}
                            className={`py-8 rounded-[2.5rem] flex items-center justify-center text-white font-black text-3xl shadow-xl active:scale-95 transition-all ${pay.color}`}
                          >
                            <span className={pay.name === 'Google Pay' ? 'text-stone-800' : ''}>{pay.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Amount Selection (Credit/Mobile) */}
                  {(topupPaymentMethod === 'credit' || (topupPaymentMethod === 'mobile' && showMemberMobilePaymentOptions)) && !showPaymentPrompt && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <h3 className="text-4xl font-black text-stone-700">請選擇儲值金額</h3>
                        <button 
                          onClick={() => {
                            if (topupPaymentMethod === 'mobile') setShowMemberMobilePaymentOptions(false);
                            else setTopupPaymentMethod(null);
                          }}
                          className="text-stone-400 hover:text-stone-600 p-2"
                        >
                          <ChevronLeft className="w-12 h-12" />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { amount: 500 },
                          { amount: 1000, bonus: 50 },
                          { amount: 2000, bonus: 150 },
                          { amount: 3000, bonus: 300 },
                          { amount: 5000, bonus: 600 },
                          { amount: 10000, bonus: 1500 }
                        ].map((item, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSuccessType(isNewCardFlow ? 'member_new' : 'member_topup');
                              if (topupPaymentMethod === 'credit') {
                                setShowPaymentPrompt('credit');
                              } else {
                                setShowPaymentPrompt(selectedTopupProvider as any);
                              }
                            }}
                            className="bg-white border-4 border-stone-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center gap-2 hover:border-orange-400 hover:bg-orange-50 transition-all active:scale-95 group shadow-md"
                          >
                            <span className="text-3xl font-black text-stone-800">NT$ {item.amount}</span>
                            {item.bonus && (
                              <span className="text-lg font-bold text-orange-500">+ 贈送 {item.bonus} 點</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Payment Prompts */}
                  {showPaymentPrompt && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-10 py-6"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-20" />
                        <div className="relative bg-emerald-50 p-12 rounded-full shadow-inner">
                          {showPaymentPrompt === 'credit' && <CreditCard className="w-32 h-32 text-emerald-600" />}
                          {showPaymentPrompt === 'barcode' && <QrCode className="w-32 h-32 text-emerald-600" />}
                          {showPaymentPrompt === 'nfc' && <Smartphone className="w-32 h-32 text-emerald-600" />}
                        </div>
                      </div>
                      
                      <div className="text-center space-y-4">
                        <h3 className="text-5xl font-black text-stone-800">
                          {showPaymentPrompt === 'credit' && '請靠卡感應'}
                          {showPaymentPrompt === 'barcode' && '請掃描 QR Code'}
                          {showPaymentPrompt === 'nfc' && '請靠近刷卡機'}
                        </h3>
                        <p className="text-2xl font-bold text-stone-400 max-w-md mx-auto">
                          {showPaymentPrompt === 'credit' && '請將信用卡靠近讀卡機感應區'}
                          {showPaymentPrompt === 'barcode' && '請使用手機掃描螢幕上的 QR Code'}
                          {showPaymentPrompt === 'nfc' && '請開啟感應支付並靠近讀卡機'}
                        </p>
                      </div>

                      <div className="flex gap-6">
                        <button
                          onClick={() => setShowPaymentPrompt(null)}
                          className="px-12 py-5 bg-stone-200 text-stone-600 rounded-3xl text-2xl font-black shadow-lg active:scale-95 transition-all"
                        >
                          返回選項
                        </button>
                        <button
                          onClick={() => {
                            setSuccessType(isNewCardFlow ? 'member_new' : 'member_topup');
                            setStep('success');
                            setShowPaymentPrompt(null);
                          }}
                          className="px-12 py-5 bg-emerald-600 text-white rounded-3xl text-2xl font-black shadow-lg active:scale-95 transition-all"
                        >
                          模擬支付成功
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Cash Insertion UI */}
                  {topupPaymentMethod === 'cash' && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-4xl font-black text-stone-700">請投入現金</h3>
                        <button 
                          onClick={() => setTopupPaymentMethod(null)}
                          className="text-stone-400 hover:text-stone-600 p-2"
                        >
                          <ChevronLeft className="w-12 h-12" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        {[100, 500, 1000].map(val => (
                          <button
                            key={val}
                            onClick={() => setInsertedAmount(prev => prev + val)}
                            className="py-12 bg-white border-4 border-stone-100 rounded-[3rem] text-stone-600 font-black text-4xl shadow-xl hover:border-emerald-500 hover:bg-emerald-50 active:scale-95 transition-all"
                          >
                            投入 ${val}
                          </button>
                        ))}
                      </div>

                      <div className="flex justify-center pt-6">
                        <button
                          disabled={insertedAmount === 0}
                          onClick={() => {
                            setSuccessType(isNewCardFlow ? 'member_new' : 'member_topup');
                            setStep('success');
                          }}
                          className={`px-24 py-6 rounded-[2.5rem] text-3xl font-black shadow-2xl transition-all active:scale-95 ${
                            insertedAmount > 0 
                              ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          確認儲值 NT$ {insertedAmount}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'member_balance_result' && (
            <motion.div
              key="member_balance_result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-8 max-w-[1200px] w-full mx-auto"
            >
              <div className="bg-white rounded-[4rem] p-12 shadow-2xl border-8 border-stone-100 w-full flex flex-row gap-12">
                {/* Left Column: Card Info */}
                <div className="w-1/2 bg-orange-400 rounded-[3rem] p-12 flex flex-col justify-between text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <CreditCard className="w-48 h-48" />
                  </div>
                  
                  <div className="space-y-10 relative z-10">
                    <div className="flex justify-between items-center border-b border-white/20 pb-8">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-2xl">
                          <CreditCard className="w-10 h-10" />
                        </div>
                        <span className="text-2xl font-bold opacity-90">儲值餘額</span>
                      </div>
                      <span className="text-6xl font-black">NT$ 4479</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-2xl">
                          <Coins className="w-10 h-10" />
                        </div>
                        <span className="text-2xl font-bold opacity-90">贈送點數</span>
                      </div>
                      <span className="text-6xl font-black">520 pts</span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/20 w-full flex justify-between items-center">
                    <span className="text-2xl font-medium opacity-80 uppercase tracking-widest">Member Card</span>
                    <span className="text-2xl font-black">M367789</span>
                  </div>
                </div>

                {/* Right Column: User Info & Actions */}
                <div className="w-1/2 flex flex-col gap-8">
                  <div className="bg-stone-50 rounded-[3rem] p-10 space-y-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-8 p-6 bg-white rounded-[2rem] shadow-sm">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                        <User className="w-10 h-10" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-stone-400">會員姓名</span>
                        <span className="text-4xl font-black text-stone-700">李美華</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8 p-6 bg-white rounded-[2rem] shadow-sm">
                      <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-500">
                        <Smartphone className="w-10 h-10" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-stone-400">聯絡電話</span>
                        <span className="text-4xl font-black text-stone-700">0909102461</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <button 
                      onClick={() => setStep('member_home')}
                      className="py-8 bg-stone-200 text-stone-600 rounded-[2rem] text-3xl font-black shadow-lg active:scale-95 transition-all hover:bg-stone-300"
                    >
                      返回
                    </button>
                    <button 
                      onClick={() => {
                        resetMemberTopupState();
                        setIsNewCardFlow(false);
                        setStep('member_topup_payment');
                      }}
                      className="py-8 bg-orange-500 text-white rounded-[2rem] text-3xl font-black shadow-lg active:scale-95 transition-all hover:bg-orange-600"
                    >
                      立即儲值
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Drying Time Modal (A3-1) */}
      <AnimatePresence>
        {showAddDryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDryModal(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-stone-100 rounded-[3rem] p-10 w-full max-w-xl shadow-2xl border border-white"
            >
              {showAddDryPayment ? (
                <div className="text-center space-y-8 py-4">
                  <div className="space-y-2">
                    <h3 className="text-4xl font-black text-stone-800">加烘支付</h3>
                    <p className="text-xl text-stone-500 font-bold">請掃描 QR Code 支付加烘費用 ${selectedAddDryTime * 2}</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl shadow-inner inline-block relative group cursor-pointer"
                    onClick={() => {
                      setWashingTimeLeft(prev => prev + (selectedAddDryTime * 60));
                      setShowAddDryModal(false);
                      setShowAddDryPayment(false);
                      setSelectedAddDryTime(0);
                    }}
                  >
                    <QrCode className="w-48 h-48 text-stone-800" />
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                      <CheckCircle2 className="w-24 h-24 text-emerald-500" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-stone-400 font-bold">點擊 QR Code 模擬支付成功</p>
                    <button
                      onClick={() => setShowAddDryPayment(false)}
                      className="px-12 py-4 bg-stone-200 text-stone-600 rounded-full font-bold text-xl hover:bg-stone-300 transition-all"
                    >
                      返回選擇
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-bold text-stone-600">
                      加烘時間
                    </h3>
                    <p className="text-stone-400 font-medium">請選擇您想要增加的烘衣時間</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {ADD_DRY_TIMES.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedAddDryTime(t)}
                        className={`py-4 rounded-xl border-2 text-xl font-bold transition-all ${
                          selectedAddDryTime === t 
                            ? 'bg-emerald-500 text-white border-emerald-600' 
                            : 'bg-white text-stone-500 border-stone-200 hover:border-emerald-500'
                        }`}
                      >
                        {t}分 <span className={`text-base sm:text-lg block mt-1 font-bold ${selectedAddDryTime === t ? 'text-emerald-100' : 'text-red-500'}`}>+{t * 2}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-6 pt-6">
                    <button
                      onClick={() => {
                        setShowAddDryModal(false);
                        setShowAddDryPayment(false);
                        if (!isFlowAddDry) {
                          setSelectedAddDryTime(0);
                        }
                      }}
                      className="flex-1 py-5 bg-orange-400 text-white rounded-full font-bold text-2xl hover:bg-orange-500 transition-all active:scale-95 shadow-md"
                    >
                      返回
                    </button>
                    <button
                      onClick={() => {
                        if (isFlowAddDry) {
                          if (selectedAddDryTime > 0) {
                            setShowAddDryPayment(true);
                          } else {
                            setShowAddDryModal(false);
                          }
                        } else {
                          // Opened from mode_detail or machine list
                          if (step === 'mode_detail') {
                            setConfig(prev => ({ ...prev, dryTime: selectedAddDryTime }));
                            setShowAddDryModal(false);
                          } else {
                            // Direct from machine list
                            if (selectedAddDryTime > 0) {
                              setSelectedService('dry');
                              setConfig(prev => ({ ...prev, dryTime: selectedAddDryTime }));
                              setStep('checkout');
                              setShowAddDryModal(false);
                            }
                          }
                        }
                      }}
                      className="flex-1 py-5 bg-emerald-600 text-white rounded-full font-bold text-2xl hover:bg-emerald-700 transition-all active:scale-95 shadow-md"
                    >
                      確認
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Footer Info */}
      <footer className="bg-white border-t border-stone-100 px-4 sm:px-6 py-3 sm:py-4 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-stone-400 font-medium">
          <div className="flex gap-3 sm:gap-4">
            <span>客服電話：0800-123-456</span>
            <span>門市編號：A042</span>
          </div>
          <div className="text-center sm:text-right">© 2026 Smart Laundry Systems</div>
        </div>
      </footer>
      </div>
    </div>
  </div>
</div>
);
}

