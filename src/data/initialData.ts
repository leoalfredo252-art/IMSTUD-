/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, PaymentRecord, Device, RoadmapItem, DatabaseTable } from '../types';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Plano Básico',
    price: 500,
    period: 'Mês',
    classes: ['5ª Classe', '6ª Classe'],
    description: 'Acesso completo aos livros do Ensino Primário.',
    features: ['Acesso a todos os livros do Primário', 'Leitura offline em 1 dispositivo', 'Marcação de favoritos', 'Sem anúncios'],
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'secondary',
    name: 'Plano Secundário',
    price: 1000,
    period: 'Mês',
    classes: ['7ª Classe', '8ª Classe', '9ª Classe'],
    description: 'Acesso completo aos livros do I Ciclo do Ensino Secundário.',
    features: ['Acesso a todos os livros do I Ciclo', 'Leitura offline em 2 dispositivos', 'Marcação de favoritos e notas', 'Sem anúncios'],
    color: 'from-cyan-600 to-blue-700'
  },
  {
    id: 'high_school',
    name: 'Plano Ensino Médio',
    price: 3000,
    period: 'Mês',
    classes: ['10ª Classe', '11ª Classe', '12ª Classe'],
    description: 'Acesso completo aos manuais do II Ciclo do Ensino Secundário e Técnico Profissional.',
    features: ['Acesso total aos livros do II Ciclo', 'Leitura offline em 2 dispositivos', 'Fórmulas interativas e resumos', 'Acesso prioritário'],
    color: 'from-amber-600 to-amber-700'
  },
  {
    id: 'university',
    name: 'Plano Universitário',
    price: 5000,
    period: 'Mês',
    classes: ['Universitário'],
    description: 'Acesso completo à biblioteca académica universitária angolana.',
    features: ['Acesso a teses, manuais e e-books académicos', 'Leitura offline em 3 dispositivos', 'Exportação de citações no padrão ABNT', 'Suporte prioritário'],
    color: 'from-purple-600 to-indigo-800'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    title: 'Manuais de Matemática - 7ª Classe',
    author: 'Ministério da Educação de Angola',
    classLevel: '7ª Classe',
    subject: 'Matemática',
    coverBg: 'bg-indigo-900',
    accentColor: '#3b82f6',
    summary: 'Este manual cobre os conceitos fundamentais de números inteiros, frações, equações simples, geometria plana e introdução à estatística, seguindo o programa oficial curricular de Angola.',
    pages: [
      'Capítulo 1: Introdução aos Números Inteiros e Racionais.\n\nEm Angola, o estudo da matemática no I Ciclo do Ensino Secundário estabelece as bases para o desenvolvimento do raciocínio lógico. \n\nDefinição:\nOs números inteiros (Z) englobam os números naturais (0, 1, 2, ...), bem como os seus correspondentes negativos (-1, -2, -3, ...).\n\nExemplo Prático:\nSe a temperatura na província do Huambo está a 18 graus Celsius e desce 5 graus durante a noite, a temperatura passa a ser de 13 graus. Se descesse 20 graus, a temperatura seria de -2 graus Celsius.',
      'Capítulo 2: Frações e Proporções.\n\nA divisão de terras na província do Bengo ou a partilha de recursos na agricultura familiar ilustra perfeitamente o conceito de frações.\n\nUma fração representa uma ou mais partes iguais em que uma unidade foi dividida. O número superior chama-se NUMERADOR, e o inferior chame-se DENOMINADOR.\n\nExercício de Aplicação:\nSe uma cooperativa de milho em Malanje tem 4 partes de terreno cultivável e decide plantar mandioca em 3 dessas partes, a fração representativa do cultivo é de 3/4 (três quartos) do terreno total.',
      'Capítulo 3: Geometria Plana - Triângulos e Quadriláteros.\n\nO desenho geométrico é visível no artesanato tradicional angolano, como nas cestarias dos povos do leste de Angola (Lunda e Moxico).\n\nTeorema Fundamental dos Triângulos:\nA soma dos ângulos internos de qualquer triângulo é sempre igual a 180 graus.\n\nPropriedade dos Retângulos:\nUm retângulo possui lados opostos paralelos e iguais, com quatro ângulos retos (90º). A sua área é calculada multiplicando o comprimento pela largura (A = c * l).',
      'Capítulo 4: Equações do 1º Grau.\n\nUma equação é uma igualdade matemática que envolve uma ou mais incógnitas (valores desconhecidos representados por letras como x, y, z).\n\nExemplo de Resolução:\nNo mercado do Roque Santeiro ou do Catinton, um vendedor vende 3 pacotes de fuba mais 200 Kz por um total de 800 Kz. Qual o preço de cada pacote de fuba?\n\nExpressão: 3x + 200 = 800\n3x = 800 - 200\n3x = 600\nx = 600 / 3\nx = 200 Kz por pacote.'
    ],
    isPremium: false,
    rating: 4.8,
    downloads: 1240,
    offlineStatus: 'none',
    isbn: '978-972-0-31234-1',
    publisher: 'Editora Escolar Angola',
    year: 2024
  },
  {
    id: 'book-2',
    title: 'Manual de Língua Portuguesa - 10ª Classe',
    author: 'António Agostinho Neto Filho',
    classLevel: '10ª Classe',
    subject: 'Língua Portuguesa',
    coverBg: 'bg-emerald-950',
    accentColor: '#10b981',
    summary: 'Estudo da literatura angolana moderna, sintaxe do período composto, semântica e técnicas de redação para exames nacionais.',
    pages: [
      'Capítulo 1: A Literatura Angolana e a Identidade Nacional.\n\nA literatura de Angola desempenhou um papel fundamental na luta pela independência nacional. Autores de renome como Dr. António Agostinho Neto, Luandino Vieira e Pepetela usaram a palavra escrita como instrumento de consciencialização e emancipação social.\n\nAnálise do Poema "Sagrada Esperança":\nO poema retrata o sofrimento do povo angolano sob a opressão colonial, mas projeta uma visão de esperança radiosa no futuro da nação e da reconstrução social.',
      'Capítulo 2: Coesão e Coerência Textual.\n\nPara que um texto seja compreendido e cumpra o seu papel de comunicação no ambiente académico ou profissional, ele precisa apresentar coesão (conexão gramatical) e coerência (conexão de sentido).\n\nConectores Concessivos e Adversativos:\n- Adversativos: mas, porém, todavia, contudo.\n- Concessivos: embora, ainda que, apesar de.\n\nExemplo:\n"Embora a escassez de recursos didáticos físicos seja real em Luanda, os estudantes buscam o conhecimento com determinação."',
      'Capítulo 3: Sintaxe - O Período Composto por Subordinação.\n\nO período composto por subordinação ocorre quando as orações dependem sintaticamente uma das outras.\n\nOrações Subordinadas Adjectivas:\nDividem-se em:\n1. Explicativas (vêm entre vírgulas):\nEx: Os estudantes de Angola, que utilizam o IMSTUD, têm melhores resultados.\n2. Restritivas (não vêm entre vírgulas):\nEx: Os estudantes que se preparam com manuais oficiais obtêm excelentes notas nos exames nacionais.'
    ],
    isPremium: true,
    rating: 4.9,
    downloads: 852,
    offlineStatus: 'none',
    isbn: '978-989-1-12435-2',
    publisher: 'Texto Editores Angola',
    year: 2023
  },
  {
    id: 'book-3',
    title: 'Manual de Física Curricular - 11ª Classe',
    author: 'Dra. Albertina Cassanga',
    classLevel: '11ª Classe',
    subject: 'Física',
    coverBg: 'bg-amber-950',
    accentColor: '#d97706',
    summary: 'Cinemática, Dinâmica, Leis de Newton, Conservação de Energia e Trabalho Mecânico com exercícios práticos aplicados ao quotidiano angolano.',
    pages: [
      'Capítulo 1: Cinemática - O Movimento Retilíneo Uniformemente Variado (MRUV).\n\nO estudo do movimento estuda o deslocamento de corpos ao longo do tempo sem se preocupar com as suas causas físicas directas.\n\nEquações Fundamentais:\n- Função Horária do Espaço: s = s0 + v0*t + (1/2)*a*t²\n- Equação de Torricelli: v² = v0² + 2*a*Δs\n\nAplicação Prática:\nUm comboio da Linha de Benguela (CFB) parte da estação do Lobito e acelera uniformemente a 0.5 m/s² durante 20 segundos. Qual a velocidade final atingida?',
      'Capítulo 2: Dinâmica - As Três Leis de Isaac Newton.\n\nAs forças governam o equilíbrio e a movimentação de tudo, desde as pontes sobre o rio Kwanza até a queda de mangas das árvores de Luanda.\n\n1ª Lei (Inércia): Todo corpo permanece em repouso ou MRU a menos que uma força resultante actue sobre ele.\n\n2ª Lei (Princípio Fundamental): F = m * a\n\n3ª Lei (Ação e Reação): Para toda força de acção aplicada, existe uma força de reacção de mesma intensidade, mesma direcção e sentido oposto.'
    ],
    isPremium: true,
    rating: 4.7,
    downloads: 610,
    offlineStatus: 'none',
    isbn: '978-989-5-11223-9',
    publisher: 'Editora Pedagógica Luanda',
    year: 2024
  },
  {
    id: 'book-4',
    title: 'História de Angola: Da Resistência à Independência',
    author: 'Dr. Simão Luvualo',
    classLevel: '12ª Classe',
    subject: 'História',
    coverBg: 'bg-red-950',
    accentColor: '#ef4444',
    summary: 'Uma análise profunda dos reinos pré-coloniais (Congo, Ndongo, Matamba), a resistência contra a ocupação colonial, o início da luta armada de libertação nacional em 4 de Fevereiro de 1961, e a conquista da independência.',
    pages: [
      'Capítulo 1: Os Reinos Africanos e a Rainha Nzinga Mbandi.\n\nAntes da penetração colonial, o território que hoje constitui Angola albergava reinos soberanos estruturados. O Reino do Ndongo e o Reino de Matamba destacaram-se sob a liderança da Rainha Nzinga Mbandi (1583-1663).\n\nA Rainha Nzinga foi uma diplomata exímia e estratega militar formidável que unificou forças para lutar contra o monopólio e o tráfico de escravos, defendendo o seu povo de forma incansável.',
      'Capítulo 2: O 4 de Fevereiro e a Luta de Libertação Nacional.\n\nA data histórica de 4 de Fevereiro de 1961 marca o início da Luta Armada de Libertação Nacional em Angola, com o ataque às prisões de Luanda de forma a libertar presos políticos.\n\nEste ato heroico acendeu o estopim revolucionário liderado por movimentos nacionalistas como o MPLA, a FNLA e posteriormente a UNITA, culminando com o Acordo de Alvor e a proclamação da Independência Nacional em 11 de Novembro de 1975 pelo Dr. António Agostinho Neto.'
    ],
    isPremium: false,
    rating: 4.9,
    downloads: 1450,
    offlineStatus: 'none',
    isbn: '978-972-8-34199-0',
    publisher: 'Edições Kulonga',
    year: 2022
  },
  {
    id: 'book-5',
    title: 'Introdução aos Sistemas Operativos e Redes',
    author: 'Prof. Eng. Alfredo Leopoldino',
    classLevel: 'Universitário',
    subject: 'Informática',
    coverBg: 'bg-zinc-900',
    accentColor: '#d97706',
    summary: 'Manual universitário sobre arquitectura de computadores, conceitos de kernel, paginação de memória, topologias de rede, protocolos TCP/IP e segurança informática.',
    pages: [
      'Capítulo 1: Arquitetura de Sistemas Operativos Modernos.\n\nUm Sistema Operativo actua como o intermediário crucial entre o utilizador/software de aplicação e o hardware físico de computação.\n\nEstrutura do Kernel:\nO kernel (núcleo) é o componente central que detém controlo total sobre tudo o que ocorre no sistema. Responsável pela gestão de processos, gestão de memória RAM, sistemas de ficheiros e drivers de dispositivos periféricos.\n\nModelos de Kernel:\n- Monolítico: Todos os serviços executam no espaço de endereçamento do kernel (rápido, mas vulnerável).\n- Microkernel: Serviços mínimos no kernel; o resto corre em espaço de utilizador (seguro, mas com overhead de IPC).',
      'Capítulo 2: Pilha de Protocolos TCP/IP e Roteamento de Redes.\n\nA Internet e as redes modernas que interligam as instituições de ensino em Angola baseiam-se na pilha de protocolos TCP/IP, dividida em quatro camadas principais:\n\n1. Camada de Aplicação (HTTP, FTP, DNS, SMTP)\n2. Camada de Transporte (TCP para conexões fiáveis, UDP para velocidade)\n3. Camada de Internet/Rede (IP, ICMP, roteamento de pacotes)\n4. Camada de Ligação de Dados/Física (Ethernet, Wi-Fi, fibra óptica)'
    ],
    isPremium: true,
    rating: 5.0,
    downloads: 412,
    offlineStatus: 'none',
    isbn: '978-989-9-99901-0',
    publisher: 'IAM_IM Academic Press',
    year: 2025
  },
  {
    id: 'book-6',
    title: 'Química Geral e Orgânica - 12ª Classe',
    author: 'Prof. Laurindo Camilo',
    classLevel: '12ª Classe',
    subject: 'Química',
    coverBg: 'bg-violet-950',
    accentColor: '#8b5cf6',
    summary: 'Nomenclatura orgânica IUPAC, hidrocarbonetos, álcoois, funções orgânicas, termoquímica e equilíbrio químico para exames de acesso universitários.',
    pages: [
      'Capítulo 1: Introdução à Química do Carbono.\n\nA química orgânica estuda os compostos que contêm carbono na sua estrutura elementar. O carbono possui a propriedade singular de formar cadeias estáveis através de ligações covalentes simples, duplas ou triplas.\n\nHibridização do Carbono:\n- sp³: Geometria tetraédrica (ex: Metano, CH4)\n- sp²: Geometria trigonal plana (ex: Eteno, C2H4)\n- sp: Geometria linear (ex: Etino, C2H2)',
      'Capítulo 2: Funções Oxigenadas e Nomenclatura IUPAC.\n\nOs compostos oxigenados desempenham papéis biológicos e industriais cruciais na nossa sociedade.\n\nPrincipais Famílias:\n- Álcoois: Possuem o grupo hidroxilo (-OH) ligado a carbono saturado. Nomenclatura termina em "-ol". Ex: Etanol (álcool comum).\n- Ácidos Carboxílicos: Possuem o grupo carboxilo (-COOH). Nomenclatura inicia com "ácido" e termina em "-oico". Ex: Ácido acético (vinagre).'
    ],
    isPremium: true,
    rating: 4.6,
    downloads: 720,
    offlineStatus: 'none',
    isbn: '978-989-4-11234-5',
    publisher: 'Texto Editores Angola',
    year: 2023
  }
];

export const ROADMAP_DATA: RoadmapItem[] = [
  {
    phase: 'Fase 1 (MVP - Atual)',
    timeframe: 'Ano 1',
    title: 'Biblioteca Escolar Digital',
    objectives: [
      'Lançar a biblioteca digital focada nos manuais escolares nacionais do 5º ao 12º ano e ensino universitário.',
      'Garantir sistema de subscrição ultra-económico integrado com pagamentos tradicionais angolanos (Multicaixa Express).',
      'Disponibilizar leitor e-pub/PDF digital otimizado com DRM e modo offline para mitigar a barreira de internet cara.'
    ],
    capabilities: [
      'Autenticação de Estudantes',
      'Leitor Digital Inteligente (DRM Protegido)',
      'Gestão Offline de Livros',
      'Filtros por Classe, Disciplina e Favoritos',
      'Integração de Pagamentos Localizados (Kz)',
      'Painel Administrativo da IAM_IM'
    ],
    status: 'current'
  },
  {
    phase: 'Fase 2',
    timeframe: 'Ano 2',
    title: 'Aprendizagem Ativa e Gamificação',
    objectives: [
      'Integrar exercícios práticos e simulados de exames nacionais com correção automatizada.',
      'Lançar sistema de conquistas, medalhas e incentivo à leitura diária inspirado em dinâmicas de gamificação (estilo Duolingo).',
      'Implementar dicionário integrado e anotações colaborativas entre colegas da mesma classe.'
    ],
    capabilities: [
      'Banco de Exercícios Resolvidos',
      'Gamificação e Streaks de Aprendizagem',
      'Simulados Temáticos e Anotações no E-Reader',
      'Fórum de Dúvidas Moderado'
    ],
    status: 'future'
  },
  {
    phase: 'Fase 3',
    timeframe: 'Ano 5',
    title: 'Inteligência Artificial Tutora (Tutor IA)',
    objectives: [
      'Integrar o primeiro tutor de Inteligência Artificial adaptativa para estudantes em Angola, utilizando APIs do Gemini.',
      'Gerar explicações personalizadas com base nos livros didáticos oficiais, adaptando o ritmo e estilo de aprendizagem de cada estudante.',
      'Identificar lacunas de conhecimento automaticamente e recomendar livros e capítulos específicos.'
    ],
    capabilities: [
      'Tutor IA integrado no E-Reader para dúvidas instantâneas',
      'Gerador Inteligente de Fichas de Estudo',
      'Análise de Desempenho Preditiva',
      'Voice Reader (Acessibilidade de Áudio por IA)'
    ],
    status: 'future'
  },
  {
    phase: 'Fase 4',
    timeframe: 'Ano 10',
    title: 'Ecossistema Nacional de Educação Integrada',
    objectives: [
      'Expandir a plataforma para suporte oficial de escolas públicas e privadas de Angola, integrando cadernetas digitais.',
      'Parceria com provedores de telecomunicações para tarifa zero de dados (Zero-Rating) na plataforma IMSTUD em todo o país.',
      'Criar biblioteca aberta de criadores de conteúdo educativo, permitindo a professores publicar as suas apostilas e receber royalties.'
    ],
    capabilities: [
      'Ambiente Escolar Conectado (Escolas, Professores, Encarregados de Educação)',
      'Acesso Zero-Rating (Sem custo de internet)',
      'Plataforma de Self-Publishing para Professores Angolanos',
      'Certificados de Competência com Registo na Blockchain'
    ],
    status: 'future'
  }
];

export const SYSTEM_DATABASE_SCHEMA: DatabaseTable[] = [
  {
    name: 'users',
    description: 'Armazena as informações principais dos estudantes e administradores do IMSTUD.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY, DEFAULT uuid_generate_v4()', description: 'Identificador único do utilizador.' },
      { name: 'name', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Nome completo do estudante ou administrador.' },
      { name: 'email', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL', description: 'E-mail para autenticação.' },
      { name: 'phone', type: 'VARCHAR(20)', constraints: 'NULL', description: 'Telemóvel para recuperação de conta e notificações.' },
      { name: 'password_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Senha encriptada por algoritmos seguros (bcrypt).' },
      { name: 'class_level', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Classe atual do estudante (ex: 10ª Classe, Universitário).' },
      { name: 'avatar', type: 'VARCHAR(255)', constraints: 'NULL', description: 'Link ou código do avatar personalizado do utilizador.' },
      { name: 'is_admin', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', description: 'Flag indicando se o utilizador possui acessos administrativos.' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Data de criação da conta.' }
    ]
  },
  {
    name: 'subscriptions',
    description: 'Controla as assinaturas pagas e o acesso temporário aos livros didáticos.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Identificador único da subscrição.' },
      { name: 'user_id', type: 'UUID', constraints: 'FOREIGN KEY REFERENCES users(id) ON DELETE CASCADE', description: 'Relacionamento com o utilizador.' },
      { name: 'plan_id', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Plano contratado (basic, secondary, high_school, university).' },
      { name: 'status', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'Estado actual: active, pending, expired, cancelled.' },
      { name: 'amount', type: 'DECIMAL(10, 2)', constraints: 'NOT NULL', description: 'Preço em Kwanzas (Kz) pago no período.' },
      { name: 'start_date', type: 'TIMESTAMP', constraints: 'NOT NULL', description: 'Início do período da assinatura.' },
      { name: 'end_date', type: 'TIMESTAMP', constraints: 'NOT NULL', description: 'Término do período de assinatura (renovação mensal).' },
      { name: 'payment_ref', type: 'VARCHAR(100)', constraints: 'UNIQUE, NULL', description: 'Referência do pagamento associado.' }
    ]
  },
  {
    name: 'books',
    description: 'Tabela de metadados e conteúdos indexados dos livros escolares autorizados.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Identificador único do livro.' },
      { name: 'title', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Título completo da obra.' },
      { name: 'author', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Nome do autor ou entidade pedagógica.' },
      { name: 'class_level', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Classe associada ao currículo nacional.' },
      { name: 'subject', type: 'VARCHAR(100)', constraints: 'NOT NULL', description: 'Disciplina ou matéria letiva.' },
      { name: 'cover_bg', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Cor ou estilo visual da capa.' },
      { name: 'isbn', type: 'VARCHAR(20)', constraints: 'UNIQUE', description: 'Código internacional do livro.' },
      { name: 'publisher', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Editora do livro (ex: Editora Escolar Angola).' },
      { name: 'year', type: 'INTEGER', constraints: 'NOT NULL', description: 'Ano de publicação oficial.' },
      { name: 'is_premium', type: 'BOOLEAN', constraints: 'DEFAULT TRUE', description: 'Informa se o livro exige uma subscrição ativa.' },
      { name: 'drm_key_hash', type: 'VARCHAR(255)', constraints: 'NOT NULL', description: 'Hash da chave de encriptação AES para visualização offline.' }
    ]
  },
  {
    name: 'user_devices',
    description: 'Tabela crucial para DRM, limitando o acesso a livros offline a apenas dispositivos autorizados (máx. 2 ou 3 conforme o plano).',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'ID do dispositivo registado.' },
      { name: 'user_id', type: 'UUID', constraints: 'FOREIGN KEY REFERENCES users(id)', description: 'Utilizador proprietário.' },
      { name: 'device_name', type: 'VARCHAR(150)', constraints: 'NOT NULL', description: 'Nome legível do dispositivo (ex: iPhone do Alfredo).' },
      { name: 'device_type', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Tipo: PC, iPhone, Android, Tablet.' },
      { name: 'drm_token', type: 'VARCHAR(255)', constraints: 'UNIQUE, NOT NULL', description: 'Token de segurança exclusivo do dispositivo.' },
      { name: 'is_authorized', type: 'BOOLEAN', constraints: 'DEFAULT TRUE', description: 'Permissão de download ativa ou revogada.' },
      { name: 'last_active', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Última sincronização.' }
    ]
  },
  {
    name: 'payment_logs',
    description: 'Histórico auditável de todas as transações, depósitos por Multicaixa Express e transferências bancárias.',
    columns: [
      { name: 'id', type: 'UUID', constraints: 'PRIMARY KEY', description: 'Identificador único do pagamento.' },
      { name: 'user_id', type: 'UUID', constraints: 'FOREIGN KEY REFERENCES users(id)', description: 'Utilizador que efetuou a compra.' },
      { name: 'plan_id', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Identificador do plano.' },
      { name: 'amount', type: 'DECIMAL(10, 2)', constraints: 'NOT NULL', description: 'Valor processado em Kz.' },
      { name: 'payment_method', type: 'VARCHAR(50)', constraints: 'NOT NULL', description: 'Método (Multicaixa Express, Transferência Bancária, GPO).' },
      { name: 'reference', type: 'VARCHAR(100)', constraints: 'UNIQUE, NOT NULL', description: 'Código de confirmação de transferência ou transação.' },
      { name: 'status', type: 'VARCHAR(20)', constraints: 'NOT NULL', description: 'Estado: Pendente, Confirmado, Falhado.' },
      { name: 'proof_url', type: 'VARCHAR(255)', constraints: 'NULL', description: 'Caminho para o comprovativo de transferência carregado pelo utilizador.' },
      { name: 'processed_by', type: 'UUID', constraints: 'FOREIGN KEY REFERENCES users(id)', description: 'ID do administrador que validou a transação.' },
      { name: 'created_at', type: 'TIMESTAMP', constraints: 'DEFAULT CURRENT_TIMESTAMP', description: 'Data de início.' }
    ]
  }
];
