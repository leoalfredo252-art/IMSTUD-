/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Map, 
  TrendingUp, 
  Shield, 
  Cpu, 
  Users, 
  DollarSign, 
  Server, 
  Code, 
  Compass, 
  Layers, 
  CheckCircle,
  FileText,
  Smartphone,
  ChevronRight,
  Eye,
  Lock,
  Globe,
  Award
} from 'lucide-react';
import { ROADMAP_DATA, SYSTEM_DATABASE_SCHEMA } from '../data/initialData';
import Logo from './Logo';

export default function StrategyDesk() {
  const [activeTab, setActiveTab] = useState<'product' | 'architecture' | 'business' | 'roadmap' | 'branding'>('product');
  const [selectedTable, setSelectedTable] = useState<string>('users');

  const selectedTableData = SYSTEM_DATABASE_SCHEMA.find(t => t.name === selectedTable);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-600 font-bold text-xs tracking-widest uppercase mb-1">
            <Award className="w-4 h-4" />
            <span>IAM_IM Executive Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Consultoria Estratégica IMSTUD
          </h1>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Documentação técnica de alto nível e blueprint estratégico elaborado pela equipa multidisciplinar da IAM_IM para revolucionar a educação em Angola.
          </p>
        </div>

        {/* Small branding preview */}
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center space-x-3 self-start md:self-center">
          <Logo variant="horizontal" size="sm" />
          <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-1 rounded-md">MVP Fase 1</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto mb-6 flex overflow-x-auto gap-2 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('product')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'product'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Product Manager (MVP)</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'architecture'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Arquitetura & Dados</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'business'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Business & Startup</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'branding'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Manual de Marca</span>
        </button>

        <button
          onClick={() => setActiveTab('roadmap')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === 'roadmap'
              ? 'bg-blue-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Roadmap Evolutivo (10 Anos)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {/* PRODUCT MANAGER TAB */}
        {activeTab === 'product' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left side: Problem & Solution Card */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Users className="w-5 h-5" /></span>
                  Análise do Problema em Angola
                </h2>
                <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                  <p>
                    O acesso a manuais escolares físicos em Angola enfrenta severos desafios económicos e logísticos:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700">
                    <li>
                      <strong className="text-slate-900">Elevado Custo de Livros Físicos:</strong> O preço médio de um conjunto de manuais escolares para o Ensino Geral ou Médio ultrapassa frequentemente os limites orçamentais de famílias de classe média-baixa.
                    </li>
                    <li>
                      <strong className="text-slate-900">Escassez de Manuais Oficiais:</strong> Fora dos grandes centros urbanos como Luanda, a distribuição logística falha frequentemente, criando especulação de preços no mercado informal.
                    </li>
                    <li>
                      <strong className="text-slate-900">Dependência de Conteúdos Estrangeiros:</strong> Estudantes recorrem a conteúdos de currículos de outros países lusófonos que não refletem a matriz de avaliação angolana.
                    </li>
                  </ul>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl mt-4">
                    <span className="text-xs font-bold text-amber-800 uppercase block mb-1">Métricas de Impacto Social</span>
                    <p className="text-amber-900 text-xs">
                      Aproximadamente 60% das famílias com múltiplos filhos em idade escolar reportam dificuldades críticas para adquirir 100% dos manuais oficiais necessários no início do ano letivo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-green-50 text-green-600 rounded-lg"><BookOpen className="w-5 h-5" /></span>
                  A Solução IMSTUD (Fase 1 MVP)
                </h2>
                <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                  <p>
                    A plataforma IMSTUD foca-se na eliminação de atrito físico, oferecendo uma biblioteca móvel e desktop instantânea com custos até <span className="font-bold text-blue-900">90% menores</span>.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Offline Integrado</h4>
                      <p className="text-xs text-slate-500">Permite descarregar os livros de forma segura em conexões Wi-Fi públicas para ler sem gastar dados móveis adicionais.</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Preço Democrático</h4>
                      <p className="text-xs text-slate-500">Subscrições a partir de 500 Kz/mês, adaptadas ao poder de compra angolano e à classe estudantil do país.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: PM Spec Sheet */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
                <h3 className="text-lg font-bold text-amber-500 mb-4">Especificações do MVP</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 block uppercase font-mono">Público-Alvo</span>
                    <span className="text-sm font-semibold">Estudantes da 5ª Classe ao Ensino Universitário e Encarregados de Educação em Angola.</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-slate-400 block uppercase font-mono">Pilares Técnicos</span>
                    <ul className="mt-1 list-disc pl-4 space-y-1 text-slate-300">
                      <li>Leitor leve compatível com telefones de baixa gama</li>
                      <li>Segurança DRM (Impedir partilha ilegal de ficheiros)</li>
                      <li>Simplicidade de pagamentos locais</li>
                    </ul>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-slate-400 block uppercase font-mono">Restrições Estritas</span>
                    <p className="text-slate-300">Não implementar IA, chats, exercícios ou vídeos nesta Fase 1 para garantir foco total e menor "Time to Market".</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-md font-bold text-slate-900 mb-3">Inspiradores Visuais</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-700">Duolingo</span>
                    <span className="text-slate-400">Gamificação & Progressão intuitiva</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-700">Coursera</span>
                    <span className="text-slate-400">Rigor Académico & Certificados</span>
                  </div>
                  <div className="flex justify-between items-center text-xs border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-700">Kindle / Apple Education</span>
                    <span className="text-slate-400">Foco total na leitura e conforto ocular</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ARCHITECTURE & DATABASE TAB */}
        {activeTab === 'architecture' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Database Explorer */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span className="p-1.5 bg-blue-50 text-blue-900 rounded-lg"><Database className="w-5 h-5" /></span>
                      Dicionário de Dados Relacional
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Clique numa tabela para explorar a sua estrutura PostgreSQL / Cloud SQL.</p>
                  </div>
                  
                  {/* Select dropdown of tables */}
                  <div className="flex gap-1.5 flex-wrap">
                    {SYSTEM_DATABASE_SCHEMA.map(table => (
                      <button
                        key={table.name}
                        onClick={() => setSelectedTable(table.name)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          selectedTable === table.name 
                            ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {table.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table metadata view */}
                {selectedTableData && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-950 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-amber-500">TABLE {selectedTableData.name}</span>
                        <span className="text-xs text-slate-400 font-medium">PostgreSQL Engine</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5">{selectedTableData.description}</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <th className="p-3 font-semibold">Coluna</th>
                            <th className="p-3 font-semibold">Tipo</th>
                            <th className="p-3 font-semibold">Restrições / Modificador</th>
                            <th className="p-3 font-semibold">Descrição do Atributo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono">
                          {selectedTableData.columns.map((col, index) => (
                            <tr key={index} className="hover:bg-slate-50/50">
                              <td className="p-3 font-bold text-slate-900">{col.name}</td>
                              <td className="p-3 text-blue-700 font-semibold">{col.type}</td>
                              <td className="p-3 text-purple-700 text-[11px]">{col.constraints || '-'}</td>
                              <td className="p-3 text-slate-600 font-sans">{col.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* API and DRM Architecture */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Shield className="w-5 h-5" /></span>
                  DRM do Livro & Proteção Contra Partilha
                </h3>
                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <p>
                    Para evitar a pirataria dos livros digitais (um dos maiores receios das editoras angolanas), o IMSTUD implementa uma arquitetura híbrida de DRM (Digital Rights Management) no MVP:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-150 p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                        <Lock className="w-4 h-4 text-blue-900" />
                        <span>Encriptação AES-256 GCM</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        O livro didático nunca é guardado em formato PDF legível no aparelho. É guardado encriptado em blocos binários num banco local IndexedDB. Apenas a chave efémera decifra as páginas na memória RAM do leitor.
                      </p>
                    </div>
                    <div className="border border-slate-150 p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm mb-2">
                        <Smartphone className="w-4 h-4 text-amber-600" />
                        <span>Limite Físico de Dispositivos</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Cada subscrição gera tokens criptográficos vinculados ao Hardware ID do telefone ou PC. O plano restringe o download offline a no máximo 2 ou 3 dispositivos aprovados pelo utilizador nas definições.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture stack list */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
                <h3 className="text-lg font-bold text-amber-500 mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5" /> Stack de Produção
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-mono">BACKEND FRAMEWORK</span>
                    <span className="text-sm font-semibold text-slate-100">Node.js / Express com TypeScript</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-slate-400 block font-mono">DATABASE HOST</span>
                    <span className="text-sm font-semibold text-slate-100">PostgreSQL Cloud SQL / Supabase</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-slate-400 block font-mono">STORAGE SERVICES</span>
                    <span className="text-sm font-semibold text-slate-100">Google Cloud Storage (Ficheiros encriptados)</span>
                  </div>
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-slate-400 block font-mono">SECURE DRM</span>
                    <span className="text-sm font-semibold text-slate-100">JWT + AES-256 + Local Cryptography Service</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Rotas de API Críticas (REST)</h3>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                    <span className="font-bold text-emerald-600">POST</span>
                    <span className="text-slate-700">/api/v1/auth/register</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                    <span className="font-bold text-emerald-600">POST</span>
                    <span className="text-slate-700">/api/v1/auth/login</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                    <span className="font-bold text-blue-600">GET</span>
                    <span className="text-slate-700">/api/v1/books/:id/stream</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between border border-slate-100">
                    <span className="font-bold text-emerald-600">POST</span>
                    <span className="text-slate-700">/api/v1/payments/verify</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BUSINESS & STARTUP TAB */}
        {activeTab === 'business' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Case */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><DollarSign className="w-5 h-5" /></span>
                  Monetização & Realidade Económica Angolana
                </h2>
                <div className="space-y-4 text-slate-600 text-sm leading-relaxed">
                  <p>
                    O mercado educativo angolano possui uma alta densidade populacional jovem (mais de 60% da população tem menos de 25 anos), mas o rendimento familiar médio exige um modelo de subscrição focado em <span className="font-bold text-blue-900">micro-transações</span>.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-slate-150 rounded-xl bg-slate-50">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Preços Sob Medida</h4>
                      <p className="text-xs text-slate-500">
                        Um plano de 500 Kz equivale ao custo de uma viagem de táxi informal em Luanda (Candongeiro). Isso remove a barreira psicológica de preços caros para as famílias.
                      </p>
                    </div>
                    <div className="p-4 border border-slate-150 rounded-xl bg-slate-50">
                      <h4 className="font-bold text-slate-900 text-sm mb-1">Canais Locais de Pagamento</h4>
                      <p className="text-xs text-slate-500">
                        Em vez de exigir cartões Visa/Mastercard internacionais, a plataforma foca-se no Multicaixa Express e em referências de pagamento locais, as opções mais populares no país.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 text-blue-900 rounded-lg"><Globe className="w-5 h-5" /></span>
                  Estratégia de Lançamento e Escalar (B2B2C)
                </h3>
                <div className="space-y-3 text-slate-600 text-sm">
                  <p>
                    Para adquirir utilizadores de forma rápida com um orçamento enxuto, a IAM_IM executará uma estratégia tripla de inserção de mercado:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2 text-slate-700">
                    <li>
                      <strong className="text-slate-900">Parcerias com Colégios Privados:</strong> Integrar o plano IMSTUD diretamente na propina escolar mensal como um valor acrescentado que poupa a compra de livros.
                    </li>
                    <li>
                      <strong className="text-slate-900">Parcerias com Operadoras (Movicel & Unitel):</strong> Criação de pacotes de dados escolares gratuitos para o domínio imstud.co.ao (Zero-Rating), eliminando o gasto de saldo de internet.
                    </li>
                    <li>
                      <strong className="text-slate-900">Incentivo ao Professor:</strong> Permitir que professores publiquem apostilas de exercícios oficiais e ganhem percentagens das subscrições ativas das suas turmas (Fase 4).
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Subscriptions Grid Summary */}
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800">
                <h3 className="text-lg font-bold text-amber-500 mb-4">Matriz de Subscrições (Mensal)</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Básico (Primário)</span>
                    <span className="font-bold text-slate-100">500 Kz</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Secundário (I Ciclo)</span>
                    <span className="font-bold text-slate-100">1.000 Kz</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Ensino Médio (II Ciclo)</span>
                    <span className="font-bold text-slate-100">3.000 Kz</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-2">
                    <span className="text-slate-400">Universitário</span>
                    <span className="font-bold text-slate-100">5.000 Kz</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-2">IAM_IM Business Analyst Insight</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  "O foco no LTV (Lifetime Value) é garantido pela natureza continuada do ano letivo. Ao assinar o IMSTUD, o encarregado de educação tem a garantia de acesso por pelo menos 10 meses de estudo (Fevereiro a Novembro), maximizando a retenção anual da plataforma."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Map className="w-6 h-6" /></span>
                Roadmap de Inovação de Longo Prazo (10 Anos)
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                A visão estratégica da IAM_IM para escalar o IMSTUD de uma biblioteca digital de livros para a maior inteligência pedagógica de Angola.
              </p>
            </div>

            <div className="relative border-l-2 border-blue-900/20 ml-4 md:ml-8 pl-6 md:pl-10 space-y-12">
              {ROADMAP_DATA.map((item, index) => (
                <div key={index} className="relative">
                  {/* Timeline bullet */}
                  <span className={`absolute -left-[35px] md:-left-[51px] top-1.5 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-sm ${
                    item.status === 'current' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </span>

                  {/* Phase Label */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 bg-blue-50 text-blue-900 rounded border border-blue-100">
                        {item.phase}
                      </span>
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        ({item.timeframe})
                      </span>
                    </div>
                    {item.status === 'current' && (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 self-start md:self-auto">
                        Fase Ativa (MVP)
                      </span>
                    )}
                  </div>

                  {/* Card content */}
                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 md:p-6 hover:bg-slate-50 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      {/* Objectives */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Objetivos Estratégicos</h4>
                        <ul className="space-y-1.5 text-xs text-slate-600">
                          {item.objectives.map((obj, oIdx) => (
                            <li key={oIdx} className="flex items-start">
                              <span className="text-blue-900 mr-2 font-bold">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Capabilities */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Funcionalidades Chave</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {item.capabilities.map((cap, cIdx) => (
                            <span key={cIdx} className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-1 rounded-md">
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BRANDING TAB */}
        {activeTab === 'branding' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-900 rounded-lg"><Layers className="w-5 h-5" /></span>
                Manual de Marca IMSTUD
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Identidade visual oficial criada pela IAM_IM (Innovation and Mastery by Alfredo Leopoldino).</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Logo horizontal */}
              <div className="border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-48 bg-slate-50">
                <span className="text-xs text-slate-400 font-mono">1. VERSÃO HORIZONTAL (PRINCIPAL)</span>
                <div className="my-auto self-center">
                  <Logo variant="horizontal" size="md" showSlogan={true} />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed text-center">Para cabeçalhos, websites e documentos oficiais.</p>
              </div>

              {/* Logo vertical */}
              <div className="border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-48 bg-slate-50">
                <span className="text-xs text-slate-400 font-mono">2. VERSÃO VERTICAL (CENTRALIZADA)</span>
                <div className="my-auto self-center">
                  <Logo variant="vertical" size="sm" showSlogan={true} />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed text-center">Para capas de relatórios e ecrãs de carregamento (Splash).</p>
              </div>

              {/* App Icon */}
              <div className="border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-48 bg-slate-50">
                <span className="text-xs text-slate-400 font-mono">3. ÍCONE DE APLICAÇÃO (APP ICON)</span>
                <div className="my-auto self-center">
                  <Logo variant="icon" size="md" />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed text-center">Para a tela inicial do telemóvel (Android/iOS) e Favicon.</p>
              </div>

              {/* Monochrome version */}
              <div className="border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-48 bg-slate-50">
                <span className="text-xs text-slate-400 font-mono">4. VERSÃO MONOCROMÁTICA</span>
                <div className="my-auto self-center text-slate-900">
                  <Logo variant="monochrome" size="md" showSlogan={true} />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed text-center">Para impressos em preto e branco e marca de água.</p>
              </div>

              {/* Color Guidelines */}
              <div className="border border-slate-200 rounded-xl p-6 flex flex-col justify-between h-48 bg-white col-span-1 md:col-span-2">
                <span className="text-xs text-slate-400 font-mono">PALETA DE CORES OFICIAL</span>
                <div className="grid grid-cols-3 gap-2 my-auto">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#1e3a8a] border border-slate-200 shadow-sm" />
                    <span className="text-[11px] font-bold text-slate-900 mt-1">Azul Escuro</span>
                    <span className="text-[9px] font-mono text-slate-400">#1E3A8A</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#d97706] border border-slate-200 shadow-sm" />
                    <span className="text-[11px] font-bold text-slate-900 mt-1">Dourado Imperial</span>
                    <span className="text-[9px] font-mono text-slate-400">#D97706</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-lg bg-[#ffffff] border border-slate-200 shadow-sm" />
                    <span className="text-[11px] font-bold text-slate-900 mt-1">Branco Puro</span>
                    <span className="text-[9px] font-mono text-slate-400">#FFFFFF</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  O <strong className="text-blue-900">Azul Escuro</strong> representa a estabilidade, tecnologia e profundidade académica. O <strong className="text-amber-600">Dourado</strong> traz a inspiração do valor do conhecimento e inovação.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
