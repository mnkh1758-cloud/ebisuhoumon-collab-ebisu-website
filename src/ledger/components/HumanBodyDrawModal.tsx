import React, { useRef, useEffect, useState } from 'react';
import { X, Save, Eraser, Pen, Trash2, Undo, AlertCircle } from 'lucide-react';

import { BODY_IMAGES } from '../../constants/bodyImages';

interface Props {
  initialImage?: string;
  onSave: (base64Image: string) => void;
  onClose: () => void;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1600;

export const HumanBodyDrawModal: React.FC<Props> = ({ initialImage, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'front' | 'back' | 'handFoot'>('front');
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const handFootCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgFrontCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgBackCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgHandFootCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const frontImgRef = useRef<HTMLImageElement | null>(null);
  const backImgRef = useRef<HTMLImageElement | null>(null);
  const handFootImgRef = useRef<HTMLImageElement | null>(null);
  const initialImgRef = useRef<HTMLImageElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'pen' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState('#000000');
  const [thickness, setThickness] = useState<'thin' | 'medium' | 'thick'>('medium');

  const [frontUndoState, setFrontUndoState] = useState<ImageData | null>(null);
  const [backUndoState, setBackUndoState] = useState<ImageData | null>(null);
  const [handFootUndoState, setHandFootUndoState] = useState<ImageData | null>(null);

  const initCanvas = (type: 'front' | 'back' | 'handFoot', drawInitial = true) => {
    const canvas = type === 'front' ? frontCanvasRef.current : type === 'back' ? backCanvasRef.current : handFootCanvasRef.current;
    const bgCanvas = type === 'front' ? bgFrontCanvasRef.current : type === 'back' ? bgBackCanvasRef.current : bgHandFootCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    bgCanvas.width = CANVAS_WIDTH;
    bgCanvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    const bgCtx = bgCanvas.getContext('2d');
    if (!ctx || !bgCtx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    const bgImg = type === 'front' ? frontImgRef.current : type === 'back' ? backImgRef.current : handFootImgRef.current;
    if (bgImg) {
      const scale = Math.min(canvas.width / bgImg.width, canvas.height / bgImg.height);
      const w = bgImg.width * scale;
      const h = bgImg.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;
      bgCtx.drawImage(bgImg, x, y, w, h);
    }

    if (drawInitial && initialImgRef.current && (type === 'front' || type === 'back')) {
      const initImg = initialImgRef.current;
      const halfWidth = initImg.width / 2;
      
      const scale = Math.min(canvas.width / halfWidth, canvas.height / initImg.height);
      const w = halfWidth * scale;
      const h = initImg.height * scale;
      const x = (canvas.width - w) / 2;
      const y = (canvas.height - h) / 2;

      if (type === 'front') {
        ctx.drawImage(initImg, 0, 0, halfWidth, initImg.height, x, y, w, h);
      } else {
        ctx.drawImage(initImg, halfWidth, 0, halfWidth, initImg.height, x, y, w, h);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;
    
    const loadImages = async () => {
      const loadImage = (src: string) => new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.error(`Failed to load image: ${src}`);
          setImageLoadError(true);
          resolve(null);
        };
        img.src = src;
      });

      const [frontImg, backImg, handFootImg, initImg] = await Promise.all([
        loadImage(BODY_IMAGES.front),
        loadImage(BODY_IMAGES.back),
        loadImage(BODY_IMAGES.handFoot),
        initialImage ? loadImage(initialImage) : Promise.resolve(null)
      ]);

      if (!isMounted) return;

      frontImgRef.current = frontImg;
      backImgRef.current = backImg;
      handFootImgRef.current = handFootImg;
      initialImgRef.current = initImg;

      initCanvas('front');
      initCanvas('back');
      initCanvas('handFoot');
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, [initialImage]);

  const getActiveCanvas = () => activeTab === 'front' ? frontCanvasRef.current : activeTab === 'back' ? backCanvasRef.current : handFootCanvasRef.current;

  const saveUndoState = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
    if (activeTab === 'front') {
      setFrontUndoState(state);
    } else if (activeTab === 'back') {
      setBackUndoState(state);
    } else {
      setHandFootUndoState(state);
    }
  };

  const handleUndo = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const state = activeTab === 'front' ? frontUndoState : activeTab === 'back' ? backUndoState : handFootUndoState;
    if (state) {
      ctx.putImageData(state, 0, 0);
      if (activeTab === 'front') setFrontUndoState(null);
      else if (activeTab === 'back') setBackUndoState(null);
      else setHandFootUndoState(null);
    }
  };

  const getPointerOnBodyCanvas = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    
    const pointerX = clientX - rect.left;
    const pointerY = clientY - rect.top;

    // CANVAS_WIDTH, CANVAS_HEIGHT 基準の座標に変換
    const x = (pointerX / rect.width) * CANVAS_WIDTH;
    const y = (pointerY / rect.height) * CANVAS_HEIGHT;

    return { x, y, inside: true };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y, inside } = getPointerOnBodyCanvas(clientX, clientY, canvas);
    if (!inside) return;

    saveUndoState();
    setIsDrawing(true);
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = getActiveCanvas();
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const getLineWidth = () => {
    if (mode === 'eraser') return 40;
    switch (thickness) {
      case 'thin': return 3;
      case 'medium': return 8;
      case 'thick': return 16;
      default: return 8;
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const { x, y, inside } = getPointerOnBodyCanvas(clientX, clientY, canvas);
    if (!inside) return;

    ctx.lineWidth = getLineWidth();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = mode === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = mode === 'eraser' ? 'rgba(0,0,0,1)' : penColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleClear = () => {
    saveUndoState();
    const canvas = getActiveCanvas();
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    const handFootCanvas = handFootCanvasRef.current;
    const bgFrontCanvas = bgFrontCanvasRef.current;
    const bgBackCanvas = bgBackCanvasRef.current;
    const bgHandFootCanvas = bgHandFootCanvasRef.current;
    
    if (!frontCanvas || !backCanvas || !handFootCanvas || !bgFrontCanvas || !bgBackCanvas || !bgHandFootCanvas) return;

    const combinedCanvas = document.createElement('canvas');
    combinedCanvas.width = frontCanvas.width * 3;
    combinedCanvas.height = frontCanvas.height;
    const ctx = combinedCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height);

    // Draw backgrounds
    ctx.drawImage(bgFrontCanvas, 0, 0);
    ctx.drawImage(bgBackCanvas, frontCanvas.width, 0);
    ctx.drawImage(bgHandFootCanvas, frontCanvas.width * 2, 0);

    // Draw drawings
    ctx.drawImage(frontCanvas, 0, 0);
    ctx.drawImage(backCanvas, frontCanvas.width, 0);
    ctx.drawImage(handFootCanvas, frontCanvas.width * 2, 0);

    // WebP形式で保存して軽量化（非対応ブラウザは自動でPNG等にフォールバックされます）
    const dataUrl = combinedCanvas.toDataURL('image/webp', 0.5);
    
    // TODO:
    // 外販前に bodyImage の保存は Storage + URL 管理へ切替
    // Firestore直保存は小規模運用では可だが、外販時は Storage 優先
    onSave(dataUrl);
  };

  const hasUndo = activeTab === 'front' ? !!frontUndoState : activeTab === 'back' ? !!backUndoState : !!handFootUndoState;

  // デバッグ確認用
  console.log('selectedColor:', penColor);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-2 sm:p-4">
      <div className="bg-stone-100 rounded-2xl shadow-2xl w-full h-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden relative border border-white/20">
        
        {/* Toolbar */}
        <div className="p-3 border-b border-stone-200 flex flex-wrap justify-between items-center bg-white gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMode('pen')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-colors ${mode === 'pen' ? 'bg-stone-800 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              <Pen size={18} /> ペン
            </button>
            <button
              onClick={() => setMode('eraser')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold transition-colors ${mode === 'eraser' ? 'bg-stone-800 text-white shadow-sm' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
            >
              <Eraser size={18} /> 消しゴム
            </button>
            
            <div className="hidden sm:block w-px h-8 bg-stone-200 mx-1"></div>
            
            <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-xl">
              <button
                onClick={() => { setPenColor('#000000'); setMode('pen'); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${penColor === '#000000' && mode === 'pen' ? 'border-stone-400 ring-2 ring-offset-2 ring-black scale-110 shadow-md bg-white' : 'border-stone-300 shadow-sm hover:scale-110 bg-white'}`}
                aria-label="黒"
              >
                <div style={{ backgroundColor: '#000000', width: '20px', height: '20px', borderRadius: '9999px' }}></div>
              </button>
              <button
                onClick={() => { setPenColor('#ef4444'); setMode('pen'); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${penColor === '#ef4444' && mode === 'pen' ? 'border-stone-400 ring-2 ring-offset-2 ring-red-500 scale-110 shadow-md bg-white' : 'border-stone-300 shadow-sm hover:scale-110 bg-white'}`}
                aria-label="赤"
              >
                <div className="w-5 h-5 rounded-full bg-red-500"></div>
              </button>
              <button
                onClick={() => { setPenColor('#3b82f6'); setMode('pen'); }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${penColor === '#3b82f6' && mode === 'pen' ? 'border-stone-400 ring-2 ring-offset-2 ring-blue-500 scale-110 shadow-md bg-white' : 'border-stone-300 shadow-sm hover:scale-110 bg-white'}`}
                aria-label="青"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500"></div>
              </button>
            </div>

            <div className="hidden sm:block w-px h-8 bg-stone-200 mx-1"></div>

            <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl">
              <button
                onClick={() => setThickness('thin')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${thickness === 'thin' ? 'bg-white shadow-sm' : 'hover:bg-stone-200'}`}
                aria-label="細い"
              >
                <div className="w-1 h-1 rounded-full bg-stone-800"></div>
              </button>
              <button
                onClick={() => setThickness('medium')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${thickness === 'medium' ? 'bg-white shadow-sm' : 'hover:bg-stone-200'}`}
                aria-label="普通"
              >
                <div className="w-2 h-2 rounded-full bg-stone-800"></div>
              </button>
              <button
                onClick={() => setThickness('thick')}
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${thickness === 'thick' ? 'bg-white shadow-sm' : 'hover:bg-stone-200'}`}
                aria-label="太い"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-stone-800"></div>
              </button>
            </div>

            <div className="hidden sm:block w-px h-8 bg-stone-200 mx-1"></div>

            <button
              onClick={handleUndo}
              disabled={!hasUndo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-white text-stone-600 hover:bg-stone-50 transition-colors border border-stone-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo size={18} /> 戻す
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold bg-white text-red-600 hover:bg-red-50 transition-colors border border-red-200"
            >
              <Trash2 size={18} /> 全消し
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-6 py-2 text-stone-600 font-bold hover:bg-stone-100 rounded-xl transition-colors"
            >
              閉じる
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Save size={18} /> 保存
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-stone-100 border-b border-stone-200">
          <button
            onClick={() => setActiveTab('front')}
            className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'front' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-stone-500 hover:bg-stone-200'}`}
          >
            正面
          </button>
          <button
            onClick={() => setActiveTab('back')}
            className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'back' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-stone-500 hover:bg-stone-200'}`}
          >
            背面
          </button>
          <button
            onClick={() => setActiveTab('handFoot')}
            className={`flex-1 py-3 font-bold text-sm transition-colors ${activeTab === 'handFoot' ? 'bg-white text-emerald-600 border-b-2 border-emerald-600' : 'text-stone-500 hover:bg-stone-200'}`}
          >
            手・足
          </button>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-2 sm:p-4 overflow-hidden bg-stone-50 relative">
          
          <div className="relative w-full h-full bg-white rounded-xl shadow-sm overflow-hidden touch-none border border-stone-200">
            
            {imageLoadError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-stone-100/90 backdrop-blur-sm">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-200 text-center max-w-sm">
                  <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                  <h3 className="text-lg font-bold text-stone-800 mb-2">画像の読み込みに失敗しました</h3>
                  <p className="text-sm text-stone-600 mb-4">
                    一時的なネットワークエラー、またはキャッシュの問題が発生した可能性があります。
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                  >
                    画面を再読み込みする
                  </button>
                </div>
              </div>
            )}

            {/* front */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'front' ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
              <img src={BODY_IMAGES.front} className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-50 z-0" alt="front" />
              <canvas ref={bgFrontCanvasRef} className="hidden" />
              <canvas
                ref={frontCanvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                onTouchMove={draw}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10 mix-blend-multiply"
              />
            </div>

            {/* back */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'back' ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
              <img src={BODY_IMAGES.back} className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-50 z-0" alt="back" />
              <canvas ref={bgBackCanvasRef} className="hidden" />
              <canvas
                ref={backCanvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                onTouchMove={draw}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10 mix-blend-multiply"
              />
            </div>

            {/* handFoot */}
            <div className={`absolute inset-0 transition-opacity duration-200 ${activeTab === 'handFoot' ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'}`}>
              <img src={BODY_IMAGES.handFoot} className="absolute inset-0 w-full h-full object-contain pointer-events-none opacity-50 z-0" alt="handFoot" />
              <canvas ref={bgHandFootCanvasRef} className="hidden" />
              <canvas
                ref={handFootCanvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchCancel={stopDrawing}
                onTouchMove={draw}
                className="absolute inset-0 w-full h-full cursor-crosshair z-10 mix-blend-multiply"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
