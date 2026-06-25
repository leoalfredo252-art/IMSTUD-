/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  BookOpen, 
  TrendingUp, 
  Database, 
  Layers, 
  Award, 
  Info, 
  Cpu, 
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { Book, UserProfile, PaymentRecord } from './types';
import { INITIAL_BOOKS } from './data/initialData';
import Logo from './components/Logo';
import AppFlow from './components/AppFlow';
import AdminPanel from './components/AdminPanel';
import StrategyDesk from './components/StrategyDesk';

export default function App() {
  // Global Shared States (Real-time synchronization between Student App & Admin Panel)
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 'pay-101',
      planName: 'Plano Universitário',
      amount: 5000,
      date: '2026-06-20',
      method: 'Multicaixa Express',
      status: 'Confirmado',
      reference: '9001238491'
    },
    {
      id: 'pay-102',
      planName: 'Plano Ensino Médio',
      amount: 3000,
      date: '2026-06-24',
      method: 'Transferência Bancária',
      status: 'Pendente',
      reference: 'TX-BFA-98401'
    }
  ]);

  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'user-01',
    name: 'Estudante Convidado',
    email: 'estudante@imstud.co.ao',
    phone: '924111222',
    classLevel: '10ª Classe',
    plan: 'free',
    subscriptionStatus: 'none',
    joinedDate: '2026-06-24',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    devices: [
      { id: 'dev-1', name: 'Telemóvel do Aluno (Este)', type: 'Android', lastActive: 'Hoje', isAuthorized: true }
    ]
  });

  // Offline status simulation inside student applet
  const [isOfflineSystemMode, setIsOfflineSystemMode] = useState<boolean>(false);

  // Administrative / Consulting Desk active screen
  const [executiveDeskTab, setExecutiveDeskTab] = useState<'branding' | 'strategy' | 'admin'>( 'branding');

  // Multi-device frame preview state
  const [simulatorFrame, setSimulatorFrame] = useState<'iphone' | 'android'>('android');

  // Core functions to sync back-office changes with student catalog
  const handleAddBook = (newBook: Book) => {
    setBooks(prev => [newBook, ...prev]);
    alert(`Sucesso! O livro "${newBook.title}" foi publicado com sucesso e injetado de imediato na biblioteca escolar móvel do aluno!`);
  };

  const handleDeleteBook = (bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
  };

  const handleApprovePayment = (paymentId: string) => {
    // Approve transaction
    setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'Confirmado' } : p));
    
    // Unlock subscription for user
    const invoice = payments.find(p => p.id === paymentId);
    if (invoice) {
      // Deduce the matching plan code
      let planCode: 'basic' | 'secondary' | 'high_school' | 'university' = 'high_school';
      if (invoice.planName.includes('Básico')) planCode = 'basic';
      else if (invoice.planName.includes('Secundário')) planCode = 'secondary';
      else if (invoice.planName.includes('Universitário')) planCode = 'university';

      setCurrentUser(prev => ({
        ...prev,
        plan: planCode,
        subscriptionStatus: 'active'
      }));
      alert(`Depósito Bancário de ${invoice.amount} Kz confirmado! O plano Premium "${invoice.planName}" foi ativado de imediato no telemóvel do estudante.`);
    }
  };

  const handleUpdateUser = (updated: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...updated }));
  };

  const handleAddPayment = (payment: PaymentRecord) => {
    setPayments(prev => [payment, ...prev]);
  };

  const handleUpdateBookOfflineStatus = (bookId: string, status: 'none' | 'downloading' | 'downloaded') => {
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, offlineStatus: status } : b));
  };

  return (
    <div id="master-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden antialiased">
      
      {/* GLOBAL TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-amber-950 p-3 text-center border-b border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-center gap-2">
        <span className="font-bold text-amber-500 uppercase tracking-widest text-[10px] bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          PROTOTIPAGEM DE ALTA FIDELIDADE
        </span>
        <span className="text-slate-200">
          Experiência interativa completa do <strong>IMSTUD</strong>. Os dados introduzidos no Painel de Controlo são sincronizados em tempo-real com a aplicação!
        </span>
      </div>

      {/* WORKSPACE CONTENT SPLIT */}
      <div className="flex-1 flex flex-col lg:flex-row h-full">
        
        {/* LEFT COMPONENT: HIGH-FIDELITY MOBILE PHONE SIMULATOR FRAME */}
        <div className="lg:w-[460px] bg-slate-950/80 border-b lg:border-b-0 lg:border-r border-slate-900 flex flex-col items-center justify-center p-6 shrink-0 relative">
          
          {/* Subtle decoration elements in background */}
          <div className="absolute top-10 left-10 w-48 h-48 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Device configuration tags */}
          <div className="mb-4 text-center z-10">
            <h4 className="text-sm font-black text-slate-100 tracking-tight flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Simulador IMSTUD</span>
            </h4>
            <p className="text-[10px] text-slate-500 mt-1">
              Dispositivo móvel do estudante angolano. {isOfflineSystemMode ? 'Sem Internet.' : 'Com Internet.'}
            </p>
          </div>

          {/* Interactive Mobile Device container shell */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* The smartphone rendering */}
            <AppFlow
              books={books}
              user={currentUser}
              payments={payments}
              onUpdateUser={handleUpdateUser}
              onAddPayment={handleAddPayment}
              onUpdateBookOfflineStatus={handleUpdateBookOfflineStatus}
              isOfflineSystemMode={isOfflineSystemMode}
              setIsOfflineSystemMode={setIsOfflineSystemMode}
            />
          </motion.div>

          {/* Simulator tips */}
          <div className="mt-4 text-center text-[10px] text-slate-500 max-w-xs z-10 space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800/40">
            <span className="font-bold text-amber-500 block">Dica de Avaliação:</span>
            <p>
              Descarregue um livro no leitor digital. Depois desligue a rede no botão do telemóvel para ver o DRM bloquear livros não descarregados!
            </p>
          </div>
        </div>

        {/* RIGHT COMPONENT: IAM_IM STAFF PORTAL & STRATEGY CENTER */}
        <div className="flex-1 flex flex-col bg-slate-950/20">
          
          {/* STAFF DESK ACTION BAR */}
          <div className="bg-slate-900/90 border-b border-slate-900 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <Logo variant="horizontal" size="sm" />
                <span className="text-[10px] font-mono bg-blue-900/40 border border-blue-800 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">
                  Corporate Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Workspace com a visão estratégica das equipas de produto e engenharia da IAM_IM.
              </p>
            </div>

            {/* TAB SELECTORS */}
            <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setExecutiveDeskTab('branding')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-all ${
                  executiveDeskTab === 'branding' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Identidade Visual</span>
              </button>

              <button
                onClick={() => setExecutiveDeskTab('strategy')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-all ${
                  executiveDeskTab === 'strategy' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Estratégia & PM</span>
              </button>

              <button
                onClick={() => setExecutiveDeskTab('admin')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg font-bold text-xs transition-all relative ${
                  executiveDeskTab === 'admin' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Painel IAM_IM</span>
                {payments.filter(p => p.status === 'Pendente').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                )}
              </button>
            </div>
          </div>

          {/* ACTIVE EXECUTIVE VIEWPORT */}
          <div className="flex-1 overflow-y-auto">
            {executiveDeskTab === 'branding' && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
                {/* Brand overview card */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="shrink-0 scale-110">
                    <Logo variant="vertical" size="lg" showSlogan={true} />
                  </div>

                  <div className="space-y-4 text-center md:text-left">
                    <div>
                      <span className="text-xs text-amber-500 font-extrabold uppercase tracking-widest font-mono">CONCEITO DA MARCA</span>
                      <h2 className="text-2xl font-black text-slate-100 tracking-tight mt-1">Innovation through Learning</h2>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      O logotipo oficial do <strong>IMSTUD</strong> foi meticulosamente desenhado para unificar a ciência moderna e a acessibilidade de conhecimento nacional em Angola. Ele integra perfeitamente as letras <strong className="text-blue-400">"IM"</strong> (Innovation and Mastery) com o dinamismo de um livro aberto na base e um sutil chapéu académico estilizado no topo que inspira a ascensão profissional.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-md text-slate-300 border border-slate-700/50">Estilo Premium</span>
                      <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-md text-slate-300 border border-slate-700/50">Internacional</span>
                      <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-md text-slate-300 border border-slate-700/50">Tecnológico</span>
                    </div>
                  </div>
                </div>

                {/* Sublogo varieties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-slate-200 mb-4 font-mono uppercase tracking-widest">Variantes e Assinaturas Visuais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-900 min-h-[90px]">
                        <Logo variant="horizontal" size="sm" showSlogan={false} />
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-900 min-h-[90px]">
                        <Logo variant="vertical" size="sm" showSlogan={false} />
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-900 min-h-[90px]">
                        <Logo variant="icon" size="sm" />
                      </div>
                      <div className="p-4 bg-slate-950 rounded-xl flex items-center justify-center border border-slate-900 min-h-[90px] text-slate-400">
                        <Logo variant="monochrome" size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Brand guidelines card */}
                  <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 mb-3 font-mono uppercase tracking-widest">Diretrizes de Cores e Tipografia</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        A cor principal da marca é o <strong>Azul Escuro</strong> (#1E3A8A) que simboliza a solidez, segurança e estabilidade educacional necessária no ensino. A cor secundária é o <strong>Dourado Imperial</strong> (#D97706), retratando a luz do saber, valor e inovação tecnológica sustentável proporcionados pela IAM_IM.
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs flex items-center space-x-2.5">
                      <Info className="w-5 h-5 shrink-0" />
                      <span>Inspirado na precisão tipográfica de <strong>Notion</strong> e no rigor pedagógico de <strong>Coursera</strong>.</span>
                    </div>
                  </div>
                </div>

                {/* Team composition presentation */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-200 mb-4 text-center">Fórmula Multidisciplinar IAM_IM</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                      <span className="text-xs font-bold text-blue-400 block">Product Manager</span>
                      <span className="text-[9px] text-slate-500">Escopo do MVP e Prontidão</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                      <span className="text-xs font-bold text-blue-400 block">UX/UI Designer</span>
                      <span className="text-[9px] text-slate-500">Conforto Kindle & Apple</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                      <span className="text-xs font-bold text-blue-400 block">Software Architect</span>
                      <span className="text-[9px] text-slate-500">PostgreSQL Schema & DRM</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                      <span className="text-xs font-bold text-blue-400 block">Startup Consultant</span>
                      <span className="text-[9px] text-slate-500">Preços Democráticos (Kz)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {executiveDeskTab === 'strategy' && (
              <StrategyDesk />
            )}

            {executiveDeskTab === 'admin' && (
              <AdminPanel
                books={books}
                users={[
                  currentUser,
                  {
                    id: 'user-02',
                    name: 'Alfredo Leopoldino',
                    email: 'alfredo.leopoldino@iamim.com',
                    phone: '924888999',
                    classLevel: 'Universitário',
                    plan: 'university',
                    subscriptionStatus: 'active',
                    joinedDate: '2026-06-20',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
                    devices: []
                  },
                  {
                    id: 'user-03',
                    name: 'Beatriz Kassanga',
                    email: 'beatriz.k@hotmail.com',
                    phone: '934222333',
                    classLevel: '12ª Classe',
                    plan: 'high_school',
                    subscriptionStatus: 'pending',
                    joinedDate: '2026-06-24',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
                    devices: []
                  }
                ]}
                payments={payments}
                onAddBook={handleAddBook}
                onApprovePayment={handleApprovePayment}
                onDeleteBook={handleDeleteBook}
              />
            )}
          </div>

          {/* PORTAL FOOTER */}
          <div className="bg-slate-900/60 border-t border-slate-900 p-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>© 2026 <strong>IAM_IM (Innovation and Mastery Study by Alfredo Leopoldino)</strong>.</span>
            <span className="text-amber-500/80 font-bold font-mono text-[10px]">Slogan: Innovation Through Learning</span>
          </div>

        </div>

      </div>

    </div>
  );
}
