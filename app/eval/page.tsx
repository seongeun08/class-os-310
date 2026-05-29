"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface EvalNotice {
  id: number;
  title: string;
  img: string;
}

export default function EvalPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [notices, setNotices] = useState<EvalNotice[]>([]);
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // [수정] 메인 홈 화면과 동일한 키("class_admin")를 바라보도록 연동했습니다.
    const adminStatus = localStorage.getItem("class_admin") === "true";
    setIsAdmin(adminStatus);

    const saved = localStorage.getItem("class_evals");
    if (saved) setNotices(JSON.parse(saved));

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddNotice = () => {
    if (!title.trim() || !image) return alert("제목과 이미지를 모두 등록해 주세요.");
    const newNotice = { id: Date.now(), title, img: image };
    const updated = [newNotice, ...notices];
    setNotices(updated);
    localStorage.setItem("class_evals", JSON.stringify(updated));
    setTitle("");
    setImage("");
  };

  const handleDelete = (id: number) => {
    // [추가] 안전하게 한 번 더 물어보는 얼럿창을 추가했습니다.
    if (!confirm("정말 이 수행평가 공지를 삭제하시겠습니까?")) return;
    
    const updated = notices.filter(n => n.id !== id);
    setNotices(updated);
    localStorage.setItem("class_evals", JSON.stringify(updated));
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <header className="flex justify-between items-center aero-window p-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">수행평가</h1>
          {/* [수정] 관리자 상태에 따라 상단 서브 타이틀이 변경되도록 연동 */}
          <p className="text-xs font-bold text-sky-800/80 mt-0.5">
            {isAdmin ? "Admin Mode" : "View Mode"}
          </p>
        </div>
      </header>

      {/* 관리자 사진 업로드 제어 패널 */}
      {isAdmin && (
        <section className="aero-window p-5 space-y-3 bg-white/40">
          <h3 className="text-sm font-black text-[#003366]">수행평가 파일 업로드</h3>
          <div className="grid grid-cols-1 md:flex gap-3 items-center">
            <input 
              type="text" 
              placeholder="과목 및 수행평가 명칭 입력" 
              className="bg-white px-3 py-2 rounded-xl text-xs border outline-none flex-1 shadow-inner"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="text-xs text-sky-900 font-bold"
            />
            <button onClick={handleAddNotice} className="bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-md cursor-pointer">
              공지 업로드
            </button>
          </div>
          {image && <img src={image} alt="미리보기" className="h-20 rounded-lg border-2 border-white object-cover" />}
        </section>
      )}

      {/* 에어로 컴퓨터 시스템 배열 뷰어 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {notices.map(notice => (
          <div key={notice.id} className="aero-window p-3 flex flex-col justify-between bg-white/20 hover:scale-[1.02] transition duration-200">
            <div className="w-full aspect-[4/3] bg-black/5 rounded-xl overflow-hidden border border-white/60 mb-3 relative group">
              <img src={notice.img} alt={notice.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2 text-center text-white text-xs font-bold backdrop-blur-[2px]">
                클릭하여 확대 가능
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="font-black text-sm text-[#003366] truncate flex-1 mr-2">{notice.title}</span>
              {isAdmin && (
                <button 
                  onClick={() => handleDelete(notice.id)}
                  className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {notices.length === 0 && (
          <div className="col-span-full aero-window p-12 text-center text-sky-800/50 font-bold text-sm">
            등록된 수행평가 공지 파일이 존재하지 않습니다.
          </div>
        )}
      </section>

      <footer className="fixed bottom-0 left-0 w-full h-12 bg-white/30 backdrop-blur-lg border-t border-white/80 flex items-center justify-between px-6 z-50">
        <Link href="/"><button className="bg-gradient-to-b from-sky-400 to-sky-600 text-white font-black px-6 py-1.5 rounded-xl shadow-md text-xs border border-white/40">Home</button></Link>
        <div className="bg-white/70 px-4 py-1 rounded-xl text-xs font-bold text-sky-900 border border-white">{currentTime || "Loading..."}</div>
      </footer>
    </main>
  );
}

NEXT_PUBLIC_SUPABASE_URL=https://gnxnjrjawopmspiutnpf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4-c8DIJwAdgXmMjepNIKtg_f9JwHLj2