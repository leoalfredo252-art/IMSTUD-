/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Check, 
  Trash2, 
  Building, 
  CreditCard, 
  Search, 
  DollarSign,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { Book, UserProfile, PaymentRecord } from '../types';

interface AdminPanelProps {
  books: Book[];
  users: UserProfile[];
  payments: PaymentRecord[];
  onAddBook: (newBook: Book) => void;
  onApprovePayment: (paymentId: string) => void;
  onDeleteBook: (bookId: string) => void;
}

export default function AdminPanel({ books, users, payments, onAddBook, onApprovePayment, onDeleteBook }: AdminPanelProps) {
  // Tabs within Admin
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'users' | 'books' | 'payments'>('overview');
  
  // State for Add Book Form
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newClassLevel, setNewClassLevel] = useState('10ª Classe');
  const [newSubject, setNewSubject] = useState('Matemática');
  const [newSummary, setNewSummary] = useState('');
  const [newPage1, setNewPage1] = useState('');

  // Search filter inside tables
  const [searchTerm, setSearchTerm] = useState('');

  // Handle book insertion
  const handleSubmitBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAuthor || !newSummary || !newPage1) {
      alert('Por favor preencha todos os campos do livro!');
      return;
    }

    const createdBook: Book = {
      id: `book-${Date.now()}`,
      title: newTitle,
      author: newAuthor,
      classLevel: newClassLevel,
      subject: newSubject,
      coverBg: 'bg-indigo-950',
      accentColor: '#d97706',
      summary: newSummary,
      pages: [
        `Capítulo 1: Introdução ao Estudo\n\n${newPage1}`,
        `Capítulo 2: Exercícios de Fixação\n\nManuais produzidos e licenciados pela IAM_IM para o estudante angolano.`
      ],
      isPremium: true,
      rating: 5.0,
      downloads: 0,
      offlineStatus: 'none',
      isbn: `978-989-9-${Math.floor(10000 + Math.random() * 90000)}`,
      publisher: 'IAM_IM Academic Press',
      year: 2026
    };

    onAddBook(createdBook);
    
    // Reset Form
    setNewTitle('');
    setNewAuthor('');
    setNewSummary('');
    setNewPage1('');
    setShowAddForm(false);
  };

  // Calculations for dashboard
  const totalRevenue = payments
    .filter(p => p.status === 'Confirmado')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pendingPaymentsCount = payments.filter(p => p.status === 'Pendente').length;
  const activeSubscribers = users.filter(u => u.subscriptionStatus === 'active').length;

  // Filtered Users
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.classLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Books
  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.classLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtered Payments
  const filteredPayments = payments.filter(p => 
    p.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen p-4 md:p-8">
      {/* Title */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="p-1 bg-amber-500 text-slate-950 rounded-lg"><TrendingUp className="w-5 h-5" /></span>
            Painel Administrativo IAM_IM
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Gestão operacional de subscrições, validação de comprovativos bancários e publicação de manuais digitais.
          </p>
        </div>

        {/* Action tabs buttons */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
          <button
            onClick={() => { setActiveSubTab('overview'); setSearchTerm(''); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'overview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => { setActiveSubTab('users'); setSearchTerm(''); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estudantes ({users.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('books'); setSearchTerm(''); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeSubTab === 'books' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Catálogo ({books.length})
          </button>
          <button
            onClick={() => { setActiveSubTab('payments'); setSearchTerm(''); }}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all relative ${
              activeSubTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pagamentos
            {pendingPaymentsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-[9px] text-white rounded-full flex items-center justify-center font-bold animate-pulse">
                {pendingPaymentsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* OVERVIEW SCREEN */}
      {activeSubTab === 'overview' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Key Metrics cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Receita Confirmada</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">
                  {totalRevenue.toLocaleString('pt-AO')} Kz
                </span>
                <span className="text-[10px] text-emerald-600 font-bold">↑ 100% este mês</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Alunos Premium</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{activeSubscribers}</span>
                <span className="text-[10px] text-slate-500">Subscrições Ativas</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Manuais no Catálogo</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{books.length}</span>
                <span className="text-[10px] text-slate-500">Angolan Curriculum</span>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Comprovativos Pendentes</span>
                <span className="text-xl font-black text-slate-900 mt-1 block text-red-600">{pendingPaymentsCount}</span>
                <span className="text-[10px] text-red-500 font-semibold animate-pulse">Aguardando Aprovação</span>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Graphical Analytics & Partnerships */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Custom SVG chart inside overview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-md font-bold text-slate-900">Curva de Adesão Estudantil</h3>
                  <p className="text-xs text-slate-500">Crescimento simulado de leituras efetuadas por semana em Angola.</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded">Métricas Ativas</span>
              </div>

              {/* Responsive SVG Chart */}
              <div className="h-48 w-full bg-slate-50 rounded-xl p-2 relative flex flex-col justify-between">
                <div className="flex-1 flex items-end justify-between px-6 pt-6">
                  {/* Bars representing weeks */}
                  {[
                    { label: 'Sem 1', val: 35, count: '350 acessos' },
                    { label: 'Sem 2', val: 55, count: '550 acessos' },
                    { label: 'Sem 3', val: 40, count: '400 acessos' },
                    { label: 'Sem 4', val: 78, count: '780 acessos' },
                    { label: 'Sem 5', val: 95, count: '950 acessos' },
                    { label: 'Sem 6', val: 120, count: '1.200 acessos' }
                  ].map((bar, index) => (
                    <div key={index} className="flex flex-col items-center flex-1 group">
                      <span className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-mono">
                        {bar.count}
                      </span>
                      {/* Bar fill */}
                      <div 
                        style={{ height: `${(bar.val / 130) * 100}%` }} 
                        className="w-8 bg-blue-900 group-hover:bg-amber-500 transition-colors rounded-t-md min-h-[5px]" 
                      />
                      <span className="text-[10px] font-medium text-slate-400 mt-2">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Partner institutions list */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-amber-500" /> Instituições Associadas (B2B)
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Complexo Escolar Cardeal Dom Alexandre</span>
                    <span className="text-[10px] text-slate-500 block">Luanda • 340 Contas</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Ativo</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Colégio Sol Nascente</span>
                    <span className="text-[10px] text-slate-500 block">Huambo • 210 Contas</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">Ativo</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Instituto Politécnico do Bengo</span>
                    <span className="text-[10px] text-slate-500 block">Caxito • Em negociação</span>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">Análise</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS TABLE */}
      {activeSubTab === 'users' && (
        <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-800">Registos de Estudantes</span>
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Pesquisar por nome ou classe..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-blue-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono tracking-wider">
                  <th className="p-4 font-bold">Nome / E-mail</th>
                  <th className="p-4 font-bold">Classe</th>
                  <th className="p-4 font-bold">Plano</th>
                  <th className="p-4 font-bold">Estado Subscrição</th>
                  <th className="p-4 font-bold">Data Adesão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      Nenhum estudante encontrado com o termo de pesquisa.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center space-x-2.5">
                          <img src={u.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-slate-150" />
                          <div>
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">{u.classLevel}</td>
                      <td className="p-4">
                        <span className="font-bold text-slate-900 uppercase">{u.plan}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          u.subscriptionStatus === 'active' 
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.subscriptionStatus === 'pending'
                              ? 'bg-red-100 text-red-800 animate-pulse'
                              : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.subscriptionStatus === 'active' ? 'Ativo (Premium)' : u.subscriptionStatus === 'pending' ? 'Pendente Aprovação' : 'Sem Plano'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono">{u.joinedDate}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATALOG MANAGEMENT (Add manual) */}
      {activeSubTab === 'books' && (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-md font-bold text-slate-900">Manuais Didáticos Publicados</h3>
                <p className="text-xs text-slate-500">Edite, delete ou insira novos livros no currículo nacional.</p>
              </div>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-900 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancelar Edição' : 'Publicar Novo Livro'}</span>
              </button>
            </div>

            {/* Expandable book form */}
            {showAddForm && (
              <form onSubmit={handleSubmitBook} className="border border-amber-200/60 bg-amber-50/20 p-5 rounded-2xl mb-6 space-y-4 animate-fade-in text-xs text-slate-700">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest block">Novo Manual de Ensino - Formulário Oficial</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Título do Livro</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Manual de Biologia Celular"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Autor / Ministério</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Prof. Dr. Ismael Diogo"
                      value={newAuthor}
                      onChange={e => setNewAuthor(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Classe Curricular</label>
                    <select
                      value={newClassLevel}
                      onChange={e => setNewClassLevel(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="5ª Classe">5ª Classe</option>
                      <option value="6ª Classe">6ª Classe</option>
                      <option value="7ª Classe">7ª Classe</option>
                      <option value="8ª Classe">8ª Classe</option>
                      <option value="9ª Classe">9ª Classe</option>
                      <option value="10ª Classe">10ª Classe</option>
                      <option value="11ª Classe">11ª Classe</option>
                      <option value="12ª Classe">12ª Classe</option>
                      <option value="Universitário">Universitário</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Disciplina</label>
                    <select
                      value={newSubject}
                      onChange={e => setNewSubject(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                    >
                      <option value="Matemática">Matemática</option>
                      <option value="Língua Portuguesa">Língua Portuguesa</option>
                      <option value="Física">Física</option>
                      <option value="Química">Química</option>
                      <option value="Biologia">Biologia</option>
                      <option value="História">História</option>
                      <option value="Informática">Informática</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Ano Letivo de Homologação</label>
                    <input
                      type="number"
                      disabled
                      value={2026}
                      className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Sinopse Curta (Resumo)</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Breve descrição dos temas pedagógicos abordados no livro didático..."
                    value={newSummary}
                    onChange={e => setNewSummary(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Conteúdo do Capítulo 1 (Para o Leitor E-book)</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Insira as páginas do primeiro capítulo..."
                    value={newPage1}
                    onChange={e => setNewPage1(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl bg-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-900 text-white font-bold rounded-xl shadow-xs hover:bg-blue-950 transition-all"
                >
                  Confirmar e Lançar Manual
                </button>
              </form>
            )}

            {/* Books table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono tracking-wider">
                    <th className="p-3 font-bold">Título / Autor</th>
                    <th className="p-3 font-bold">Classe</th>
                    <th className="p-3 font-bold">Disciplina</th>
                    <th className="p-3 font-bold">Downloads Offline</th>
                    <th className="p-3 font-bold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div>
                          <span className="font-bold text-slate-900 block">{b.title}</span>
                          <span className="text-[10px] text-slate-400">{b.author} • ISBN {b.isbn}</span>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{b.classLevel}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-semibold">{b.subject}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-500">{b.downloads.toLocaleString()} vezes</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            if (confirm(`Tem a certeza que deseja excluir o livro "${b.title}"?`)) {
                              onDeleteBook(b.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex"
                          title="Remover Livro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENTS APPROVAL LIST */}
      {activeSubTab === 'payments' && (
        <div className="max-w-7xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-xs p-6">
          <div className="mb-6">
            <h3 className="text-md font-bold text-slate-900">Histórico de Transações e Comprovativos</h3>
            <p className="text-xs text-slate-500">Valide depósitos, referências de transferência e libere os planos pendentes dos estudantes.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-mono tracking-wider">
                  <th className="p-3 font-bold">Referência / Plano</th>
                  <th className="p-3 font-bold">Valor Kz</th>
                  <th className="p-3 font-bold">Canal de Pagamento</th>
                  <th className="p-3 font-bold">Data</th>
                  <th className="p-3 font-bold">Estado</th>
                  <th className="p-3 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">{p.reference}</span>
                        <span className="text-[10px] text-slate-400">Assinatura: {p.planName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{p.amount.toLocaleString('pt-AO')} Kz</td>
                    <td className="p-3 text-slate-600 font-semibold">{p.method}</td>
                    <td className="p-3 text-slate-500 font-mono">{p.date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.status === 'Confirmado' 
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Pendente'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-slate-100 text-slate-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'Pendente' ? (
                        <button
                          onClick={() => onApprovePayment(p.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-[10px]"
                        >
                          Confirmar Depósito
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold font-mono">Liberado ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
