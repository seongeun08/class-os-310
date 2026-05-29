"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// 1️⃣ Supabase 연결 열쇠 장착 (자유게시판과 동일!)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  // 2️⃣ Supabase에서 수행평가 목록 불러오기
  const fetchEvals = async () => {
    const { data, error } = await supabase
      .from("evals")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("데이터를 불러오지 못했습니다:", error);
    } else {
      setNotices(data || []);
    }
  };

  useEffect(() => {
    const adminStatus = localStorage.getItem("class_admin") === "true";
    setIsAdmin(adminStatus);

    // localStorage 대신 Supabase에서 가져오는 함수 실행
    fetchEvals();

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

  // 3️⃣ Supabase로 수행평가 데이터 전송하기
  const handleAddNotice = async () => {
    if (!title.trim() || !image) return alert("제목과 이미지를 모두 등록해 주세요.");
    
    const newNotice = { 
      id: Date.now(), 
      title, 
      img: image 
    };
    
    // Supabase의 'evals' 표에 새 데이터 넣기
    const { error } = await supabase.from("evals").insert([newNotice]);

    if (error) {
      alert("업로드 중 오류가 발생했습니다 😭");
      console.error(error);
    } else {
      setNotices([newNotice, ...notices]); // 화면 즉시 반영
      setTitle("");
      setImage("");
    }
  };

  // 4️⃣ Supabase에서 수행평가 삭제하기
  const handleDelete = async (id: number) => {
    if (!confirm("정말 이 수행평가 공지를 삭제하시겠습니까?")) return;
    
    // DB에서 해당 id를 가진 줄 삭제
    const { error } = await supabase.from("evals").delete().eq("id", id);
    
    if (error) {
      alert("삭제 중 오류가 발생했습니다 😭");
      console.error(error);
    } else {
      setNotices(notices.filter(n => n.id !== id)); // 화면에서도 지우기
    }
  };

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-6 pb-24">
      <header className="flex justify-between items-center aero-window p-6">
        <div>
          <h1 className="text-3xl font-black text-[#003366] tracking-tight">수행평가</h1>
          <p className="text-xs font-bold text-sky-800/80 mt-0.5">
            {isAdmin ? "Admin Mode" : "View Mode"}
          </p>
        </div>
      </header>

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