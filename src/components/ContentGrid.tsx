import React, { useState } from 'react';
import Modal from './ui/modal';
import ResearchDetail from './ResearchDetail';
// DataSourceToggle удален - используем только Notion
import { useNotionData } from '../hooks/useNotionData';
import { NotionResearchItem } from '../config/notion';

interface ResearchItem {
  id: string;
  title: string;
  institution: string;
  summary: string;
  domain: string[];
  focus: string[];
  timeAgo: string;
  publishedAt?: string | null;
  publicationType: string;
  source: {
    titleOriginal: string;
    authorsOrOrg: string;
    year: number;
    doiOrHandle?: string | null;
    url: string;
    pdfUrl?: string | null;
    language?: string | null;
    license?: string | null;
    pages?: number | null;
  };
  body: {
    lede: string;
    analysis: string;
    keyFindings: string[];
    limitations: string[];
    applications: string[];
    impactHorizon?: string | null;
  };
  metadata: {
    methods: string[];
    metrics: string[];
    geography: string[];
    sectors: string[];
    personas: string[];
    keywords: string[];
  };
  visual: {
    coverImage?: string | null;
    alt?: string | null;
  };
  links: Array<{label: string, url: string}>;
  citationAPA: string;
  tags: string[];
  rating: {
    evidenceStrength: number;
    actionability: number;
  };
  notes?: string | null;
}

const ContentGrid = () => {
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  // Всегда используем Notion - переключатель удален
  
  // Хук для работы с Notion
  const { data: notionData, loading: notionLoading, error: notionError } = useNotionData();

  // Функция для преобразования данных Notion в формат ResearchItem
  const convertNotionToResearchItem = (notionItem: any): ResearchItem => {
    // Извлекаем данные из полей Notion
    const title = notionItem.TitleOriginal?.title?.[0]?.text?.content || 
                  notionItem.TitleShort?.rich_text?.[0]?.text?.content || 
                  'Без названия';
    
    const authors = notionItem.Authors?.rich_text?.[0]?.text?.content || 
                   notionItem.Organization?.rich_text?.[0]?.text?.content || 
                   'Не указано';
    
    const summary = notionItem.CentralInsight?.rich_text?.[0]?.text?.content || 
                   notionItem.Rationale?.rich_text?.[0]?.text?.content || 
                   'Описание недоступно';
    
    const detailedContent = notionItem.DetailedContent?.rich_text?.[0]?.text?.content || 
                           notionItem.RawMarkdown?.rich_text?.[0]?.text?.content || 
                           '';
    
    const url = notionItem.URL?.url || '';
    
    const publishedDate = notionItem.DatePublished?.date?.start || null;
    
    const tags = notionItem.Tags?.multi_select?.map((tag: any) => tag.name) || [];
    
    const pubType = notionItem.PubType?.multi_select?.[0]?.name || 'report';
    
    return {
      id: notionItem.id,
      title: title,
      institution: authors,
      summary: summary,
      domain: tags.length > 0 ? tags : ['Notion'],
      focus: ['Applied'], // Можно добавить логику для определения фокуса
      timeAgo: publishedDate ? new Date(publishedDate).toLocaleDateString('ru-RU') : 'недавно',
      publishedAt: publishedDate,
      publicationType: pubType.toLowerCase() as any,
      source: {
        titleOriginal: title,
        authorsOrOrg: authors,
        year: publishedDate ? new Date(publishedDate).getFullYear() : new Date().getFullYear(),
        doiOrHandle: notionItem.DOI?.rich_text?.[0]?.text?.content || null,
        url: url,
        pdfUrl: null,
        language: null,
        license: null,
        pages: notionItem.VolumePages?.rich_text?.[0]?.text?.content || null
      },
      body: {
        lede: summary,
        analysis: detailedContent,
        keyFindings: notionItem.Quote?.rich_text?.[0]?.text?.content ? 
                     [notionItem.Quote.rich_text[0].text.content] : 
                     ['Ключевые выводы не указаны'],
        limitations: notionItem.RisksLimitations?.rich_text?.[0]?.text?.content ? 
                     [notionItem.RisksLimitations.rich_text[0].text.content] : 
                     [],
        applications: notionItem.PotentialApplication?.rich_text?.[0]?.text?.content ? 
                      [notionItem.PotentialApplication.rich_text[0].text.content] : 
                      [],
        impactHorizon: notionItem.ImpactForecast?.['rich_text']?.[0]?.text?.content || null
      },
      metadata: {
        methods: [],
        metrics: [],
        geography: [],
        sectors: [],
        personas: [],
        keywords: tags
      },
      visual: {
        coverImage: null,
        alt: null
      },
      links: url ? [{ title: 'Источник', url: url }] : [],
      citationAPA: notionItem.ReferencesAPA?.rich_text?.[0]?.text?.content || 
                   `${authors} (${publishedDate ? new Date(publishedDate).getFullYear() : new Date().getFullYear()}). ${title}`,
      tags: tags,
      rating: {
        evidenceStrength: 3, // Средняя оценка по умолчанию
        actionability: 3
      },
      notes: notionItem.QuestionsLenses?.rich_text?.[0]?.text?.content || null
    };
  };

  const researchItems: ResearchItem[] = [
    {
      "id": "2025-07-01-msft-seq-dx",
      "title": "Врач-оркестр: Microsoft учит ИИ лечить (и экономить)",
      "institution": "Microsoft AI",
      "summary": "SDBench из 304 клинических кейсов оценивает не просто точность, а $ за верный диагноз при последовательной диагностике. Оркестратор MAI-DxO координирует роли ИИ и снижает стоимость пути к правильному диагнозу.",
      "domain": ["Health","AI"],
      "focus": ["Applied","Experimental"],
      "timeAgo": "июль 2025",
      "publishedAt": null,
      "publicationType": "benchmark",
      "source": {
        "titleOriginal": "Sequential Diagnosis with Language Models",
        "authorsOrOrg": "Microsoft AI",
        "year": 2025,
        "doiOrHandle": null,
        "url": "https://arxiv.org/abs/2407.00000",
        "pdfUrl": null,
        "language": "EN",
        "license": null,
        "pages": null
      },
      "body": {
        "lede": "От «чат-ботов» к агентным оркестраторам с бюджетной логикой.",
        "analysis": "Microsoft собрала SDBench — испытательный полигон последовательной диагностики с ценами по тарифам США и ввела метрику $/correct Dx. Оркестратор MAI-DxO распределяет роли (гипотезы, выбор тестов, бюджет, чек-лист). На ряде режимов повышается точность и/или снижается стоимость пути к диагнозу по сравнению с одиночными LLM и врачами.",
        "keyFindings": [
          "Врачи (n=21): ~19.9% точных диагнозов при ~$2963/случай",
          "GPT-4o: ~49.3%; o3: ~78.6% (дороже из-за большего числа тестов)",
          "MAI-DxO поверх o3: ~81.9% за ~$4735; бюджетный режим ~79.9% за ~$2396",
          "Метрики: $/correct Dx; журнал шагов как «открытие чёрного ящика»"
        ],
        "limitations": [
          "Подборка NEJM — сложные академические кейсы; переносимость на рутину неочевидна",
          "Цены — про США; не учитывают логистику/инвазивность",
          "Нужны проспективные испытания на реальных исходах"
        ],
        "applications": [
          "Триаж/приём в клиниках; симуляторы обучения для врачей",
          "Метрики для страховщиков/регуляторов ($/correct Dx)"
        ],
        "impactHorizon": "1–2 года"
      },
      "metadata": {
        "methods": ["benchmark","agent orchestration"],
        "metrics": ["$/correct Dx"],
        "geography": ["US"],
        "sectors": ["Healthcare"],
        "personas": ["CMO Hospital","Medical Director","AI Lead"],
        "keywords": ["sequential diagnosis","agentic LLM","health economics"]
      },
      "visual": {
        "coverImage": "https://gardendigital.eu/path/to/img14.jpg",
        "alt": "Sequential diagnosis illustration"
      },
      "links": [
        {"label": "Primary (arXiv)", "url": "https://arxiv.org/abs/2407.00000"}
      ],
      "citationAPA": "Microsoft AI. (2025). Sequential Diagnosis with Language Models. arXiv.",
      "tags": ["agentic-ai","benchmark","health-economics"],
      "rating": {"evidenceStrength": 3, "actionability": 4},
      "notes": "Сильная демо-логика, нужна валидация на исходах."
    },
    {
      "id": "2025-07-02-stanford-ai-index",
      "title": "Опять про будущее ИИ (AI Index 2025)",
      "institution": "Stanford HAI",
      "summary": "Инференс подешевел ~в 280 раз (~$0.07 за 1 млн токенов), SLM и on-device ИИ на NPU двигают рынок к «полезности за разумные деньги».",
      "domain": ["AI","Economy"],
      "focus": ["Applied"],
      "timeAgo": "июль 2025",
      "publishedAt": "2025-04-15",
      "publicationType": "report",
      "source": {
        "titleOriginal": "Artificial Intelligence Index Report 2025",
        "authorsOrOrg": "Stanford Human-Centered AI Institute",
        "year": 2025,
        "doiOrHandle": null,
        "url": "https://hai.stanford.edu/research/ai-index-2025",
        "pdfUrl": null,
        "language": "EN",
        "license": null,
        "pages": null
      },
      "body": {
        "lede": "Сдвиг от «самых больших» к «самым полезным» и дешёвым.",
        "analysis": "Отчёт фиксирует драматическое удешевление инференса и рост роли малых специализированных моделей (SLM) и on-device ИИ. Бизнес ищет баланс цены/пользы при ясных правилах безопасности, увеличиваются «объясняющие режимы» и водяные знаки подлинности.",
        "keyFindings": [
          "Инференс ~ $0.07/1M токенов (~−280×)",
          "Рост SLM и NPU-устройств",
          "Внедрение меток подлинности контента"
        ],
        "limitations": [
          "Агрегированный срез; локальные рынки сильно разнятся"
        ],
        "applications": [
          "Стратегии GenAI в продуктах и инфраструктуре",
          "Governance/метрики стоимости"
        ],
        "impactHorizon": "1–3 года"
      },
      "metadata": {
        "methods": ["macro analysis"],
        "metrics": ["inference cost"],
        "geography": ["Global"],
        "sectors": ["Cross-industry"],
        "personas": ["CPO","CTO","Policy"],
        "keywords": ["SLM","on-device AI","watermarking"]
      },
      "visual": {
        "coverImage": "https://gardendigital.eu/path/to/img15.jpg",
        "alt": "AI Index 2025"
      },
      "links": [
        {"label": "Report", "url": "https://hai.stanford.edu"}
      ],
      "citationAPA": "Stanford HAI. (2025). Artificial Intelligence Index Report 2025.",
      "tags": ["governance","costs","strategy"],
      "rating": {"evidenceStrength": 3, "actionability": 4},
      "notes": null
    },
    {
      "id": "2025-07-03-who-whs",
      "title": "Диагноз человечеству от ВОЗ (World Health Statistics 2025)",
      "institution": "World Health Organization",
      "summary": "HALE упал на 1.5 года (до 61.9) в 2019–2021; 13.5% домохозяйств тратят >10% бюджета на медицину; UHC растёт слишком медленно.",
      "domain": ["Health","Policy"],
      "focus": ["Applied"],
      "timeAgo": "июль 2025",
      "publishedAt": "2025-04-30",
      "publicationType": "report",
      "source": {
        "titleOriginal": "World health statistics 2025",
        "authorsOrOrg": "WHO",
        "year": 2025,
        "doiOrHandle": null,
        "url": "https://iris.who.int/",
        "pdfUrl": null,
        "language": "EN",
        "license": "CC BY-NC-SA 3.0 IGO",
        "pages": null
      },
      "body": {
        "lede": "Глобальные тренды застопорились; неравенства растут.",
        "analysis": "Ежегодный отчёт фиксирует стагнацию по НИЗ, падение HALE и финансовую нагрузку OOP. Из «Трёх миллиардов» перевыполнен лишь блок «здоровые жизни», UHC и защита от ЧС отстают.",
        "keyFindings": [
          "HALE: −1.5 года до 61.9 (2019–2021)",
          "344 млн скатились в крайнюю бедность из-за OOP (2019)",
          "Нужен ARR ~2.7%/год по НИЗ, фактически ~0.5–1.3%"
        ],
        "limitations": [
          "Лаг данных 2021–2023; неоднородность регистров; возможное смешение причин смерти"
        ],
        "applications": [
          "UHC-таргетинг, дашборды HALE/ARR, адресные интервенции"
        ],
        "impactHorizon": "2–5 лет"
      },
      "metadata": {
        "methods": ["global statistics","modeling"],
        "metrics": ["HALE","UHC","OOP>10%","ARR NCD"],
        "geography": ["Global"],
        "sectors": ["Public Health"],
        "personas": ["MoH","Donor","NGO"],
        "keywords": ["equity","financial protection","NCDs"]
      },
      "visual": {
        "coverImage": "https://gardendigital.eu/path/to/img16.jpg",
        "alt": "WHO WHS 2025"
      },
      "links": [
        {"label": "IRIS record", "url": "https://iris.who.int/"}
      ],
      "citationAPA": "World Health Organization. (2025). World health statistics 2025.",
      "tags": ["UHC","HALE","equity"],
      "rating": {"evidenceStrength": 4, "actionability": 4},
      "notes": null
    },
    {
      "id": "2025-07-04-oxford-dnr",
      "title": "Не читал, но осуждаю (Digital News Report 2025)",
      "institution": "Reuters Institute, University of Oxford",
      "summary": "Видео и соцсети — главный вход в новости; ИИ-чатботы становятся источником (средне 7%, 15% у <25). Готовность платить ограничена (~18% из 20 стран).",
      "domain": ["Media","AI"],
      "focus": ["Applied"],
      "timeAgo": "июль 2025",
      "publishedAt": "2025-06-19",
      "publicationType": "report",
      "source": {
        "titleOriginal": "Digital News Report 2025",
        "authorsOrOrg": "Reuters Institute",
        "year": 2025,
        "doiOrHandle": null,
        "url": "https://reutersinstitute.politics.ox.ac.uk",
        "pdfUrl": null,
        "language": "EN",
        "license": null,
        "pages": null
      },
      "body": {
        "lede": "Платформенная экосистема и видео-first меняют новостной ландшафт.",
        "analysis": "Ленты соцсетей и короткое видео становятся доминирующим каналом; рост тревоги по дезинформации; аудитория ждёт «быстрее и дешевле» от ИИ при сохранении прозрачности и человеческой ответственности.",
        "keyFindings": [
          "Facebook 36%, YouTube 30%, Instagram/WhatsApp 19%, TikTok 16%, X 12% — еженедельное новостное использование",
          "Видео: 72% еженедельно; соц-видео: 65%",
          "Доверие к медиа ~40%; платят ~18% (20 стран)"
        ],
        "limitations": [
          "Онлайн-панели; недопредставлены группы без стабильного интернета; несравнимость мелких сдвигов"
        ],
        "applications": [
          "Стратегии видео-редакций, бандлы подписок, «human-in-the-loop» ИИ-редактирование"
        ],
        "impactHorizon": "1–2 года"
      },
      "metadata": {
        "methods": ["survey"],
        "metrics": ["weekly usage","trust","payment rate"],
        "geography": ["Global (country panels)"],
        "sectors": ["News Media","Brands"],
        "personas": ["Editor-in-Chief","Head of Audience","CMO"],
        "keywords": ["short video","platforms","AI sourcing"]
      },
      "visual": {
        "coverImage": "https://gardendigital.eu/path/to/img17.jpg",
        "alt": "Digital News Report"
      },
      "links": [
        {"label": "Report page", "url": "https://reutersinstitute.politics.ox.ac.uk"}
      ],
      "citationAPA": "Reuters Institute. (2025). Digital News Report 2025.",
      "tags": ["news","platforms","video"],
      "rating": {"evidenceStrength": 3, "actionability": 4},
      "notes": null
    },
    {
      "id": "2025-07-05-wuerzburg-listening-in",
      "title": "Звук как интерфейс (Listening in…)",
      "institution": "Würzburg University Press (JMU)",
      "summary": "Академический сборник о звуке/голосе как социальном интерфейсе — от резонанса до кодирования поведения платформами; полезен продуктовым/медийным командам для аудио-UX.",
      "domain": ["Sound Studies","Media","Culture"],
      "focus": ["Theoretical","Applied"],
      "timeAgo": "июль 2025",
      "publishedAt": "2025-01-01",
      "publicationType": "edited_volume",
      "source": {
        "titleOriginal": "Listening in: Perspectives on Sound, Voice, and (Popular) Music Studies",
        "authorsOrOrg": "JMU Würzburg University Press",
        "year": 2025,
        "doiOrHandle": "doi:10.xxxx/listening-in",
        "url": "https://doi.org/10.xxxx/listening-in",
        "pdfUrl": null,
        "language": "EN",
        "license": "Open Access (издатель)",
        "pages": null
      },
      "body": {
        "lede": "От универсального тембра — к инклюзивным голосам и метрикам резонанса.",
        "analysis": "Пять секций (RESONATING, HEARING, PERFORMING, GENDERING, DIGITALIZING) показывают, как звук и голос встроены в культуру, интерфейсы и сообщества. Призыв проектировать контекст и отношения вокруг звука, а не только «тембр».",
        "keyFindings": [
          "Переход к ситуативным голосам и метрикам доверия/резонанса",
          "Ко-создание с фанатскими сообществами",
          "Фрейм для аудио-UX и модерации"
        ],
        "limitations": [
          "Неоднородные главы; интерпретативность; мало панорамных данных"
        ],
        "applications": [
          "Аудио-брендинг, голосовые ассистенты, product-tone",
          "Исследовательские протоколы по аудио-UX"
        ],
        "impactHorizon": "12–24 мес."
      },
      "metadata": {
        "methods": ["qualitative","theory"],
        "metrics": [],
        "geography": ["—"],
        "sectors": ["Media","Product"],
        "personas": ["Head of Brand","UX Lead","Audio Producer"],
        "keywords": ["voice","resonance","gendering","platform logics"]
      },
      "visual": {
        "coverImage": "https://gardendigital.eu/path/to/img18.jpg",
        "alt": "Listening in cover"
      },
      "links": [
        {"label": "DOI", "url": "https://doi.org/10.xxxx/listening-in"}
      ],
      "citationAPA": "JMU Würzburg University Press. (2025). Listening in: Perspectives on Sound, Voice, and (Popular) Music Studies.",
      "tags": ["audio-ux","voice","culture"],
      "rating": {"evidenceStrength": 2, "actionability": 3},
      "notes": null
    },
    {
      "id": "2025-07-06-educause-horizon",
      "title": "Университет будущего (EDUCAUSE Horizon Report 2025)",
      "institution": "EDUCAUSE",
      "summary": "ИИ встраивается в учебный процесс с governance-контуром: реестры «одобренных ИИ», бейджи/CLR, смешанное обучение, AI-ассистенты в LMS.",
      "domain": ["Education","AI"],
      "focus": ["Applied"],
      "timeAgo": "июль 2025",
      "publishedAt": "2025-03-20",
      "publicationType": "report",
      "source": {
        "titleOriginal": "2025 EDUCAUSE Horizon Report",
        "authorsOrOrg": "EDUCAUSE",
        "year": 2025,
        "doiOrHandle": null,
        "url": "https://www.educause.edu",
        "pdfUrl": null,
        "language": "EN",
        "license": null,
        "pages": null
      },
      "body": {
        "lede": "От «запрета по умолчанию» — к гибкому управлению ИИ.",
        "analysis": "Границы применения ИИ, прозрачные критерии заданий, цифровые бейджи и CLR, микрообучение, AI-ассистенты с human-in-the-loop и усиление кибергигиены EdTech-периметра.",
        "keyFindings": [
          "Каталоги «одобренных ИИ» и навыко-ориентированный дизайн курсов",
          "Бейджи/CLR как машиночитаемые доказательства компетенций",
          "Усиление защиты связок учебных сервисов и данных"
        ],
        "limitations": [
          "Тренд-отчёт; требуется локальная адаптация"
        ],
        "applications": [
          "Политики ИИ в вузе, дизайн курсов, апгрейды преподавателей"
        ],
        "impactHorizon": "1–3 года"
      },
      "metadata": {
        "methods": ["trend scanning","expert synthesis"],
        "metrics": [],
        "geography": ["Global"],
        "sectors": ["Higher Ed"],
        "personas": ["Provost","CIO","Teaching&Learning Center"],
        "keywords": ["CLR","microlearning","AI governance"]
      },
      "visual": {
        "coverImage": "https://gardendigital.eu/path/to/img19.jpg",
        "alt": "EDUCAUSE Horizon 2025"
      },
      "links": [
        {"label": "Report page", "url": "https://www.educause.edu"}
      ],
      "citationAPA": "EDUCAUSE. (2025). 2025 EDUCAUSE Horizon Report.",
      "tags": ["higher-ed","policy","lms"],
      "rating": {"evidenceStrength": 2, "actionability": 4},
      "notes": null
    },
    {
      "id": "2025-07-07-ets-special-issue",
      "title": "И немного — о школах будущего (ETS спецвыпуск)",
      "institution": "Educational Technology & Society",
      "summary": "Мета-результаты g≈0.57–0.69 по учебным исходам при умной интеграции GenAI; сильнее эффект на поведение (g≈0.70), затем когнитивный (≈0.60) и аффективный (≈0.48) блоки.",
      "domain": ["Education","AI"],
      "focus": ["Applied","Meta-analysis"],
      "timeAgo": "июль 2025",
      "publishedAt": "2025-07-01",
      "publicationType": "special_issue",
      "source": {
        "titleOriginal": "Application and research of generative AI in education (Special Issue)",
        "authorsOrOrg": "Educational Technology & Society, Vol. 28(3)",
        "year": 2025,
        "doiOrHandle": null,
        "url": "https://drive.google.com/...",
        "pdfUrl": null,
        "language": "EN",
        "license": null,
        "pages": null
      },
      "body": {
        "lede": "Human–GenAI симбиоз как новая «норма» курса.",
        "analysis": "11 рецензированных работ: улучшения в знаниях, активности и мотивации; лучший эффект при обёртке в рефлексию и структурированную обратную связь; движение к стандартному оцениванию и безопасной learning analytics.",
        "keyFindings": [
          "Суммарный эффект: g≈0.57–0.69",
          "Поведенческий блок: g≈0.70; когнитивный: ≈0.60; аффективный: ≈0.48",
          "Смена узких «проверялок» на агентных помощников"
        ],
        "limitations": [
          "Короткие исследования, малые выборки, квази-дизайны; переносимость ограничена"
        ],
        "applications": [
          "Дизайн интервенций GenAI в курсах; стандартизация оценивания; учебная аналитика"
        ],
        "impactHorizon": "12–24 мес."
      },
      "metadata": {
        "methods": ["meta-analysis","field experiments"],
        "metrics": ["Hedges g"],
        "geography": ["—"],
        "sectors": ["K-12","Higher Ed"],
        "personas": ["Dean","Instructional Designer","Teacher"],
        "keywords": ["feedback","reflection","learning analytics"]
      },
      "visual": {
        "coverImage": "https://gardendigital.eu/path/to/img20.jpg",
        "alt": "ETS Special Issue"
      },
      "links": [
        {"label": "Issue (PDF bundle)", "url": "https://drive.google.com/…"}
      ],
      "citationAPA": "Educational Technology & Society. (2025). Special Issue: Application and research of generative AI in education, 28(3).",
      "tags": ["meta-analysis","genai-in-education"],
      "rating": {"evidenceStrength": 3, "actionability": 4},
      "notes": "Проверять переносимость на стандартизированных тестах."
    }
  ];

  const handleCardClick = (itemId: string) => {
    setOpenCardId(itemId);
  };

  const handleCloseModal = () => {
    setOpenCardId(null);
  };

  // Используем только данные из Notion
  const currentData = notionData.map(convertNotionToResearchItem);
  const isLoading = notionLoading;
  const error = notionError;

  const selectedResearch = currentData.find(item => item.id === openCardId);

  return (
    <main className="flex-1 p-6">
      {/* Источник данных: только Notion */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Ошибка загрузки из Notion: {error}
        </div>
      )}

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-muted-foreground">Загрузка данных из Notion...</div>
        </div>
      )}

      {/* Сетка исследований */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentData.map((item, index) => (
          <div 
            key={item.id} 
            className="border border-grid-border bg-card hover:bg-hover-subtle transition-colors cursor-pointer group"
            onClick={() => handleCardClick(item.id)}
          >
            <div className="aspect-[4/3] bg-accent flex items-center justify-center relative overflow-hidden p-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
                  {item.domain.join(', ')}
                </div>
                <div className="text-sm text-foreground font-mono">
                  {item.focus.join(', ')}
                </div>
              </div>
            </div>
            <div className="p-4 font-mono space-y-2">
              <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
                {item.title}
              </h3>
              <p className="text-xs text-nav-active font-medium">{item.institution}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {item.summary}
              </p>
              <p className="text-xs text-muted-foreground pt-2">{item.timeAgo}</p>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Modal for research details */}
      <Modal 
        isOpen={!!openCardId} 
        onClose={handleCloseModal}
        title={selectedResearch?.title}
      >
        {selectedResearch && <ResearchDetail research={selectedResearch} />}
      </Modal>
    </main>
  );
};

export default ContentGrid;