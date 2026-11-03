// Realistic sample viva questions and rubrics for VivaMate
// Structured to match the payload contract for Gemini API integration

export const SAMPLE_SUBJECTS = [
  {
    id: 'os',
    name: 'Operating Systems',
    icon: 'Cpu',
    description: 'Process scheduling, deadlocks, paging, and synchronization',
    popularTopics: [
      'Deadlocks & Banker\'s Algorithm',
      'Virtual Memory & Paging',
      'Process Synchronization & Semaphores',
      'CPU Scheduling Algorithms',
    ],
  },
  {
    id: 'dbms',
    name: 'Database Management Systems',
    icon: 'Database',
    description: 'ACID properties, normalization, indexing, and transactions',
    popularTopics: [
      'ACID Properties & Transactions',
      'Normalization (1NF to BCNF)',
      'B+ Tree Indexing & Query Optimization',
      'SQL vs NoSQL & CAP Theorem',
    ],
  },
  {
    id: 'cn',
    name: 'Computer Networks',
    icon: 'Network',
    description: 'OSI model, TCP/IP, DNS, routing, and HTTP/HTTPS',
    popularTopics: [
      'TCP 3-Way Handshake & Flow Control',
      'OSI vs TCP/IP Protocol Stack',
      'DNS Resolution & HTTP vs HTTPS',
      'Subnetting & Routing Protocols',
    ],
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    icon: 'Layers',
    description: 'Trees, graphs, dynamic programming, and complexity',
    popularTopics: [
      'Binary Search Trees & AVL Balancing',
      'Graph Traversals (BFS vs DFS)',
      'Dynamic Programming vs Greedy Approach',
      'Hash Tables & Collision Resolution',
    ],
  },
  {
    id: 'web',
    name: 'Web Engineering & System Design',
    icon: 'Globe',
    description: 'REST APIs, authentication, microservices, and caching',
    popularTopics: [
      'RESTful Architecture & HTTP Methods',
      'JWT Authentication & OAuth2',
      'Web Security (XSS, CSRF, SQL Injection)',
      'Caching Strategies & CDN',
    ],
  },
];

export const MOCK_QUESTIONS_DATABASE = {
  // Operating Systems
  'os-deadlocks': [
    {
      id: 'os-d-1',
      subject: 'Operating Systems',
      topic: 'Deadlocks & Banker\'s Algorithm',
      difficulty: 'Intermediate',
      question: 'Explain the four Coffman conditions necessary for a deadlock to occur in an operating system. How does an OS prevent deadlock by breaking one of them?',
      context: 'The examiner wants to verify if you understand fundamental resource allocation conditions and how deadlock prevention differs from deadlock avoidance.',
      keyConcepts: [
        'Mutual Exclusion',
        'Hold and Wait',
        'No Preemption',
        'Circular Wait',
        'Resource ordering or preemption strategy',
      ],
      sampleAnswer: 'Deadlocks require four simultaneous Coffman conditions: 1) Mutual Exclusion (resources cannot be shared), 2) Hold and Wait (processes holding resources can request new ones), 3) No Preemption (resources cannot be forcefully taken), and 4) Circular Wait (a closed cycle of processes waiting on each other). An OS can prevent deadlocks by invalidating any one condition—for example, preventing Circular Wait by imposing a strict global ordering on resource types so that processes only request resources in increasing numerical order.',
      sampleRubric: {
        allFourNamed: 4,
        explanationOfConditions: 3,
        preventionMechanism: 3,
      },
    },
    {
      id: 'os-d-2',
      subject: 'Operating Systems',
      topic: 'Deadlocks & Banker\'s Algorithm',
      difficulty: 'Advanced',
      question: 'What is the Banker\'s Algorithm? Explain the difference between a Safe State and an Unsafe State. Does an unsafe state always mean a deadlock has occurred?',
      context: 'Examiners frequently test whether students confuse an unsafe state with an active deadlock.',
      keyConcepts: [
        'Safe State definition',
        'Unsafe state definition',
        'Unsafe state does not imply immediate deadlock',
        'Need matrix calculation (Max - Allocation)',
        'Safety algorithm iteration',
      ],
      sampleAnswer: 'The Banker\'s algorithm is a deadlock avoidance algorithm that tests for safety by simulating the allocation of predetermined maximum possible amounts of all resources. A safe state is one where there exists at least one sequence of process execution such that every process can finish without entering deadlock. An unsafe state is not necessarily a deadlock—it simply means the OS can no longer guarantee that a deadlock will be avoided if processes simultaneously request their maximum resource claims.',
      sampleRubric: {
        bankersPurpose: 3,
        safeVsUnsafe: 4,
        unsafeNotDeadlockClarity: 3,
      },
    },
    {
      id: 'os-d-3',
      subject: 'Operating Systems',
      topic: 'Deadlocks & Banker\'s Algorithm',
      difficulty: 'Beginner',
      question: 'What is the difference between Deadlock, Starvation, and Livelock? Give a simple real-life analogy for each.',
      context: 'Tests your conceptual grasp of concurrency issues and communication clarity.',
      keyConcepts: [
        'Deadlock definition (mutual blocking)',
        'Starvation definition (indefinite waiting/unfair scheduling)',
        'Livelock definition (active state changes without progress)',
        'Real-world analogy (traffic gridlock, polite corridor walking)',
      ],
      sampleAnswer: 'In Deadlock, processes are blocked indefinitely waiting for events only another blocked process can trigger (like two cars facing each other on a single-lane bridge). In Starvation, a runnable process is repeatedly bypassed because higher priority processes consume resources (like a quiet student never getting called on by a teacher). In Livelock, processes actively change state in response to each other but make no forward progress (like two polite people constantly stepping to the same side in a narrow hallway).',
      sampleRubric: {
        deadlockConcept: 3,
        starvationConcept: 3,
        livelockConcept: 2,
        analogies: 2,
      },
    },
  ],

  // DBMS
  'dbms-acid': [
    {
      id: 'dbms-a-1',
      subject: 'Database Management Systems',
      topic: 'ACID Properties & Transactions',
      difficulty: 'Beginner',
      question: 'What are the ACID properties of a database transaction? Explain each property using a bank balance transfer of $100 from Account A to Account B.',
      context: 'Classic viva question. The examiner is checking whether you can tie each letter of ACID to concrete transaction behavior.',
      keyConcepts: [
        'Atomicity (all or nothing rollback)',
        'Consistency (invariants and valid balance constraints)',
        'Isolation (concurrent transactions don\'t see intermediate states)',
        'Durability (committed data survives power crash via WAL)',
      ],
      sampleAnswer: 'ACID stands for: Atomicity means either both debit of Account A and credit of Account B succeed, or neither does; if power fails halfway, changes roll back. Consistency ensures total money across A and B remains conserved before and after. Isolation means another user querying Account A or B while the transfer is occurring sees only the pre-transfer or post-transfer balance, never an intermediate missing $100. Durability guarantees that once commit is acknowledged, the transaction is written to persistent storage (like Write-Ahead Log) and will not be lost even in a system crash.',
      sampleRubric: {
        atomicityWithExample: 2.5,
        consistencyWithExample: 2.5,
        isolationWithExample: 2.5,
        durabilityWithExample: 2.5,
      },
    },
    {
      id: 'dbms-a-2',
      subject: 'Database Management Systems',
      topic: 'ACID Properties & Transactions',
      difficulty: 'Intermediate',
      question: 'What are the dirty read, non-repeatable read, and phantom read anomalies? Which transaction isolation level prevents all of them?',
      context: 'Tests deep knowledge of SQL-92 isolation levels and concurrency control.',
      keyConcepts: [
        'Dirty Read (reading uncommitted data)',
        'Non-repeatable Read (row values change between reads)',
        'Phantom Read (new rows appear in range query)',
        'Serializable isolation level',
      ],
      sampleAnswer: 'A dirty read occurs when Transaction 1 reads data modified by Transaction 2 that has not yet been committed. A non-repeatable read happens when Transaction 1 reads the same row twice and finds different values because Transaction 2 modified and committed that row in between. A phantom read occurs when Transaction 1 executes a query with a range condition (e.g. balance > 1000) twice and finds new rows added by Transaction 2. The Serializable isolation level prevents all three anomalies by enforcing strict serial execution semantics.',
      sampleRubric: {
        dirtyReadExplained: 2.5,
        nonRepeatableReadExplained: 2.5,
        phantomReadExplained: 2.5,
        serializableNamed: 2.5,
      },
    },
    {
      id: 'dbms-a-3',
      subject: 'Database Management Systems',
      topic: 'ACID Properties & Transactions',
      difficulty: 'Advanced',
      question: 'How does Write-Ahead Logging (WAL) and the ARIES algorithm ensure Durability and Atomicity in relational databases?',
      context: 'Advanced technical question on database storage engine internals.',
      keyConcepts: [
        'Write-Ahead Logging rule (log flushed before data page)',
        'Undo and Redo phases',
        'Checkpointing',
        'Log Sequence Numbers (LSN)',
      ],
      sampleAnswer: 'Write-Ahead Logging (WAL) dictates that any modification to a data page in memory must be written to stable storage in an append-only log record before the modified data page itself is flushed to disk. ARIES uses this log through three phases after a crash: 1) Analysis (scans forward from the last checkpoint to identify active transactions and dirty pages), 2) Redo (repeats history forward to restore the database to the exact crash state), and 3) Undo (scans backward to undo the changes of transactions that were active when the crash occurred, thus preserving atomicity).',
      sampleRubric: {
        walCoreRule: 3,
        ariesThreePhases: 5,
        durabilityAndAtomicityConnection: 2,
      },
    },
  ],

  // Computer Networks
  'cn-tcp': [
    {
      id: 'cn-t-1',
      subject: 'Computer Networks',
      topic: 'TCP 3-Way Handshake & Flow Control',
      difficulty: 'Beginner',
      question: 'Explain the TCP 3-way handshake process. What packets and flags are exchanged between client and server?',
      context: 'Core network fundamentals viva question.',
      keyConcepts: [
        'SYN from client with Initial Sequence Number (ISN)',
        'SYN-ACK from server with server ISN and client ACK',
        'ACK from client establishing connection',
        'State transitions (SYN_SENT, SYN_RCVD, ESTABLISHED)',
      ],
      sampleAnswer: 'The TCP 3-way handshake establishes a reliable, full-duplex byte-stream connection: Step 1 (SYN): The client sends a packet with the SYN flag set and a randomly chosen Initial Sequence Number (seq = x) to request a connection. Step 2 (SYN-ACK): The server replies with SYN and ACK flags set, acknowledging the client\'s sequence number (ack = x + 1) and providing its own sequence number (seq = y). Step 3 (ACK): The client sends an ACK packet (ack = y + 1, seq = x + 1), at which point both sides transition into the ESTABLISHED state and data transfer can begin.',
      sampleRubric: {
        threeStepsDetailed: 4,
        synAckFlagsCorrect: 3,
        seqAndAckNumbers: 3,
      },
    },
    {
      id: 'cn-t-2',
      subject: 'Computer Networks',
      topic: 'TCP 3-Way Handshake & Flow Control',
      difficulty: 'Intermediate',
      question: 'What is the difference between TCP Flow Control and TCP Congestion Control? Which mechanisms are used for each?',
      context: 'Checks whether you distinguish end-to-end receiver protection from network transit protection.',
      keyConcepts: [
        'Flow Control protects the receiver buffer',
        'Sliding Window / Receiver Window (rwnd)',
        'Congestion Control protects network routers and intermediate links',
        'Congestion Window (cwnd), Slow Start, Congestion Avoidance',
      ],
      sampleAnswer: 'Flow Control is an end-to-end mechanism designed to prevent a fast sender from overwhelming a slow receiver\'s receive buffer. It uses the Sliding Window protocol where the receiver continuously advertises its available buffer space (rwnd) in TCP header packets. In contrast, Congestion Control prevents senders from overloading intermediate routers and network links. It dynamically adjusts the congestion window (cwnd) using algorithms like Slow Start, Congestion Avoidance (AIMD), Fast Retransmit, and Fast Recovery.',
      sampleRubric: {
        flowControlPurposeAndRwnd: 5,
        congestionControlPurposeAndCwnd: 5,
      },
    },
  ],

  // DSA
  'dsa-trees': [
    {
      id: 'dsa-b-1',
      subject: 'Data Structures & Algorithms',
      topic: 'Binary Search Trees & AVL Balancing',
      difficulty: 'Intermediate',
      question: 'What is an AVL Tree and how does it maintain O(log n) search complexity? Explain the balance factor and the 4 types of rotations.',
      context: 'Evaluates your grasp of self-balancing tree data structures.',
      keyConcepts: [
        'Balance Factor formula (Height of Left - Height of Right)',
        'Allowable balance factors (-1, 0, +1)',
        'Single rotations (LL and RR)',
        'Double rotations (LR and RL)',
        'Worst-case search guarantee O(log n)',
      ],
      sampleAnswer: 'An AVL tree is a strictly height-balanced Binary Search Tree where for every node, the balance factor (Height of Left Subtree minus Height of Right Subtree) must be -1, 0, or +1. If an insertion or deletion causes a node\'s balance factor to become +2 or -2, the tree restores balance using rotations: 1) LL rotation (single right rotation for left-heavy insertion), 2) RR rotation (single left rotation for right-heavy insertion), 3) LR rotation (left rotate child then right rotate parent), and 4) RL rotation (right rotate child then left rotate parent). This guarantees maximum tree height of 1.44 log n, keeping search, insertion, and deletion strictly O(log n).',
      sampleRubric: {
        balanceFactorDefined: 3,
        fourRotationsExplained: 4,
        timeComplexityJustification: 3,
      },
    },
  ],
};

// Hindi Curated Question Database for full bilingual examination support
export const MOCK_QUESTIONS_DATABASE_HINDI = {
  'os-deadlocks': [
    {
      id: 'os-d-1-hi',
      subject: 'Operating Systems',
      topic: 'Deadlocks & Banker\'s Algorithm',
      difficulty: 'Intermediate',
      question: 'Operating System में Deadlock होने के लिए आवश्यक चार Coffman conditions कौन सी हैं? एक OS इनमें से किसी एक condition को तोड़कर Deadlock को कैसे रोकता है?',
      context: 'परीक्षक यह देखना चाहता है कि क्या आप Deadlock के मूलभूत सिद्धांतों और रोकथाम (prevention) को समझते हैं।',
      keyConcepts: [
        'Mutual Exclusion',
        'Hold and Wait',
        'No Preemption',
        'Circular Wait',
        'Resource ordering',
      ],
      sampleAnswer: 'Deadlock के लिए चार Coffman conditions का एक साथ होना आवश्यक है: 1) Mutual Exclusion (संसाधन साझा नहीं किए जा सकते), 2) Hold and Wait (प्रक्रिया नए संसाधन का अनुरोध कर सकती है), 3) No Preemption (संसाधन छीने नहीं जा सकते), और 4) Circular Wait (चक्रीय प्रतीक्षा)। एक OS circular wait को रोकने के लिए सभी संसाधनों को एक संख्यात्मक क्रम (numerical order) आवंटित करता है जिससे Deadlock नहीं हो पाता।',
      sampleRubric: {
        allFourNamed: 4,
        explanationOfConditions: 3,
        preventionMechanism: 3,
      },
    },
    {
      id: 'os-d-2-hi',
      subject: 'Operating Systems',
      topic: 'Deadlocks & Banker\'s Algorithm',
      difficulty: 'Advanced',
      question: 'Banker\'s Algorithm क्या है? Safe State और Unsafe State के बीच क्या अंतर है? क्या Unsafe State का अर्थ हमेशा यह होता है कि Deadlock हो चुका है?',
      context: 'परीक्षक यह परीक्षण करता है कि क्या छात्र Unsafe State और सक्रिय Deadlock के बीच भ्रमित होते हैं।',
      keyConcepts: [
        'Safe State definition',
        'Unsafe state definition',
        'Unsafe state does not imply immediate deadlock',
        'Need matrix calculation',
        'Safety algorithm iteration',
      ],
      sampleAnswer: 'Banker\'s Algorithm एक Deadlock Avoidance एल्गोरिथ्म है। Safe State वह स्थिति है जिसमें कम से कम एक सुरक्षित अनुक्रम (safe sequence) मौजूद होता है। Unsafe State का अर्थ यह नहीं है कि Deadlock हो चुका है, बल्कि इसका मतलब है कि सिस्टम अब Deadlock से बचने की पूर्ण गारंटी नहीं दे सकता।',
      sampleRubric: {
        bankersPurpose: 3,
        safeVsUnsafe: 4,
        unsafeNotDeadlockClarity: 3,
      },
    },
    {
      id: 'os-d-3-hi',
      subject: 'Operating Systems',
      topic: 'Deadlocks & Banker\'s Algorithm',
      difficulty: 'Beginner',
      question: 'Deadlock, Starvation और Livelock के बीच क्या अंतर है? प्रत्येक के लिए एक सरल वास्तविक जीवन (real-life) उदाहरण दीजिए।',
      context: 'कॉन्करेंसी (concurrency) अवधारणाओं और संचार स्पष्टता की जांच।',
      keyConcepts: [
        'Deadlock definition',
        'Starvation definition',
        'Livelock definition',
        'Real-world analogy',
      ],
      sampleAnswer: 'Deadlock में प्रक्रियाएं अनिश्चित काल तक अवरुद्ध रहती हैं। Starvation में उच्च प्राथमिकता वाली प्रक्रियाओं के कारण किसी प्रक्रिया को संसाधन नहीं मिल पाता। Livelock में प्रक्रियाएं अपनी स्थिति बदलती रहती हैं लेकिन कोई वास्तविक प्रगति नहीं होती।',
      sampleRubric: {
        deadlockConcept: 3,
        starvationConcept: 3,
        livelockConcept: 2,
        analogies: 2,
      },
    },
  ],

  'dbms-acid': [
    {
      id: 'dbms-a-1-hi',
      subject: 'Database Management Systems',
      topic: 'ACID Properties & Transactions',
      difficulty: 'Beginner',
      question: 'Database Transaction के ACID गुण क्या हैं? खाता A से खाता B में 100 रुपये के ट्रांसफर का उदाहरण देकर प्रत्येक गुण को समझाइए।',
      context: 'क्लासिक मौखिक प्रश्न। परीक्षक ACID के प्रत्येक अक्षर को ठोस बैंकिंग उदाहरण से जोड़कर देखता है।',
      keyConcepts: [
        'Atomicity',
        'Consistency',
        'Isolation',
        'Durability',
      ],
      sampleAnswer: 'ACID का अर्थ है: Atomicity (या तो दोनों खातों का लेन-देन पूरा होगा या बिल्कुल नहीं), Consistency (लेन-देन से पहले और बाद में कुल राशि समान रहती है), Isolation (मध्यवर्ती अधूरा लेन-देन अन्य उपयोगकर्ताओं को नहीं दिखता), और Durability (कमिट होने के बाद डेटा डिस्क पर सुरक्षित रहता है)।',
      sampleRubric: {
        allFourExplained: 4,
        bankingExampleApplied: 4,
        walDurabilityClarity: 2,
      },
    },
  ],

  'cn-tcp': [
    {
      id: 'cn-t-1-hi',
      subject: 'Computer Networks',
      topic: 'TCP 3-Way Handshake & Flow Control',
      difficulty: 'Intermediate',
      question: 'TCP 3-Way Handshake कैसे काम करता है? SYN, SYN-ACK और ACK पैकेटों का क्रम और उनका मुख्य उद्देश्य समझाइए।',
      context: 'कनेक्शन स्थापना और अनुक्रम संख्या तुल्यकालन की जांच।',
      keyConcepts: [
        'SYN packet',
        'SYN-ACK packet',
        'ACK packet',
        'Sequence number synchronization',
      ],
      sampleAnswer: 'TCP कनेक्शन स्थापित करने के लिए: क्लाइंट पहले SYN पैकेट भेजता है, सर्वर SYN-ACK पैकेट के साथ उत्तर देता है, और अंत में क्लाइंट ACK भेजता है। इसके बाद दोनों पक्षों के बीच डेटा ट्रांसफर शुरू होता है।',
      sampleRubric: {
        threeWaySteps: 4,
        seqAckNumbersExplained: 3,
        connectionStateTransitions: 3,
      },
    },
  ],

  'dsa-trees': [
    {
      id: 'dsa-t-1-hi',
      subject: 'Data Structures & Algorithms',
      topic: 'Binary Search Trees & AVL Balancing',
      difficulty: 'Intermediate',
      question: 'Binary Search Tree (BST) और Balanced AVL Tree में क्या अंतर है? AVL Tree में Balance Factor का क्या महत्व है?',
      context: 'संतुलित ट्री और रोटेशन तंत्र की जांच।',
      keyConcepts: [
        'BST property',
        'AVL height balance',
        'Balance Factor',
        'Rotations (LL, RR, LR, RL)',
      ],
      sampleAnswer: 'एक साधारण BST में विषम डेटा के कारण ऊँचाई O(n) हो सकती है। AVL Tree एक स्व-संतुलित BST है जहाँ प्रत्येक नोड का Balance Factor -1, 0, या +1 होना चाहिए। असंतुलन होने पर रोटेशन (LL, RR, LR, RL) द्वारा संतुलन बहाल किया जाता है।',
      sampleRubric: {
        balanceFactorDefined: 3,
        fourRotationsExplained: 4,
        timeComplexityJustification: 3,
      },
    },
  ],
};

// Bilingual concept keyword aliases for precise semantic evaluation in both English and Hindi
export const CONCEPT_ALIASES = {
  'mutual exclusion': ['mutual exclusion', 'म्यूचुअल', 'एक्सक्लूजन', 'परस्पर अपवर्जन', 'mutual'],
  'hold and wait': ['hold and wait', 'होल्ड', 'वेट', 'hold', 'wait', 'धारण'],
  'no preemption': ['no preemption', 'प्रीएम्प्शन', 'प्रीमेप्शन', 'preemption', 'अपहरण'],
  'circular wait': ['circular wait', 'सर्कुलर', 'चक्रीय', 'circular', 'cycle'],
  'resource ordering': ['resource ordering', 'रिसोर्स आर्डरिंग', 'ordering', 'क्रम', 'priority'],
  'safe state': ['safe state', 'सेफ स्टेट', 'सुरक्षित अवस्था', 'safe sequence'],
  'unsafe state': ['unsafe state', 'अनसेफ स्टेट', 'असुरक्षित अवस्था'],
  'banker': ['banker', 'बैंकर', 'banker algorithm'],
  'deadlock': ['deadlock', 'डेडलॉक', 'गतिरोध'],
  'starvation': ['starvation', 'स्टारवेशन', 'भुखमरी'],
  'livelock': ['livelock', 'लाइवलॉक'],
  'atomicity': ['atomicity', 'एटॉमिकिटी', 'atomic', 'ऑल ऑर नथिंग'],
  'consistency': ['consistency', 'कंसिस्टेंसी', 'सुसंगतता'],
  'isolation': ['isolation', 'आइसोलेशन', 'अलगाव'],
  'durability': ['durability', 'ड्यूरेबिलिटी', 'स्थायित्व'],
  'syn': ['syn', 'सिंक', 'synchronize'],
  'ack': ['ack', 'एकनॉलेजमेंट', 'acknowledgment'],
  'balance factor': ['balance factor', 'बैलेंस फैक्टर', 'संतुलन'],
  'rotation': ['rotation', 'रोटेशन', 'घूर्णन'],
};

export function matchesConcept(studentAnswerClean, concept) {
  if (!studentAnswerClean || !concept) return false;
  const answer = studentAnswerClean.toLowerCase();
  const cLower = concept.toLowerCase();

  // 1. Direct inclusion
  if (answer.includes(cLower)) return true;

  // 2. Individual words > 3 chars (Unicode aware)
  const terms = cLower.replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter(Boolean);
  if (terms.some((t) => t.length > 3 && answer.includes(t))) return true;

  // 3. Aliases matching
  for (const [key, aliases] of Object.entries(CONCEPT_ALIASES)) {
    if (cLower.includes(key)) {
      if (aliases.some((alias) => answer.includes(alias.toLowerCase()))) {
        return true;
      }
    }
  }

  return false;
}

// Generic fallback question generator when user selects custom topics or subjects
export const generateCustomMockQuestions = (subject, topic, count = 3, language = 'English') => {
  const cleanSubject = subject || 'Computer Science';
  const cleanTopic = topic || 'General Engineering Fundamentals';
  const isHindi = language === 'Hindi';

  if (isHindi) {
    return [
      {
        id: `custom-1-hi`,
        subject: cleanSubject,
        topic: cleanTopic,
        difficulty: 'Intermediate',
        question: `${cleanSubject} के संदर्भ में, ${cleanTopic} के मूलभूत सिद्धांत क्या हैं? इनका व्यावहारिक महत्व समझाइए।`,
        context: `${cleanTopic} की परिभाषाओं, बाधाओं और डिजाइन लक्ष्यों का परीक्षण।`,
        keyConcepts: [
          `${cleanTopic} की परिभाषा`,
          'Trade-offs और बाधाएं',
          'वास्तविक उद्योग उपयोग (Use Case)',
        ],
        sampleAnswer: `${cleanSubject} में ${cleanTopic} का कार्यान्वयन करते समय स्केलेबिलिटी, फॉल्ट टॉलरेंस और अनुमानित प्रदर्शन सुनिश्चित करना मुख्य लक्ष्य होता है। एक अच्छा उत्तर मूल परिभाषा और व्यावहारिक उपयोग को कवर करता है।`,
        sampleRubric: {
          definition: 3,
          principles: 4,
          tradeoffsAndApplication: 3,
        },
      },
      {
        id: `custom-2-hi`,
        subject: cleanSubject,
        topic: cleanTopic,
        difficulty: 'Advanced',
        question: `${cleanTopic} के प्रदर्शन ट्रेड-ऑफ (Performance Trade-offs) और वैकल्पिक दृष्टिकोणों की तुलना कीजिए। आप एक के स्थान पर दूसरे को कब चुनेंगे?`,
        context: `आलोचनात्मक सोच और तुलनात्मक विश्लेषण का परीक्षण।`,
        keyConcepts: [
          'वैकल्पिक दृष्टिकोणों की तुलना',
          'Time & Space Complexity',
          'Production निर्णय मानदंड',
        ],
        sampleAnswer: `${cleanTopic} के विभिन्न विकल्पों का मूल्यांकन थ्रूपुट, सिस्टम जटिलता और विफलता सहनशीलता के आधार पर किया जाता है।`,
        sampleRubric: {
          comparisonClarity: 4,
          metricsAndTradeoffs: 3,
          decisionCriteria: 3,
        },
      },
      {
        id: `custom-3-hi`,
        subject: cleanSubject,
        topic: cleanTopic,
        difficulty: 'Beginner',
        question: `एक वास्तविक सॉफ्टवेयर सिस्टम में ${cleanTopic} कैसे संचालित होता है, इसका एक चरण-दर-चरण (step-by-step) उदाहरण दीजिए।`,
        context: `जटिल तकनीकी विचारों को मौखिक रूप से उदाहरण के साथ व्यक्त करने की क्षमता।`,
        keyConcepts: [
          'Step-by-step flow',
          'Input और Output विशेषताएं',
          'विफलता और सीमा शर्तें (Boundary conditions)',
        ],
        sampleAnswer: `एक संपूर्ण उदाहरण प्रारंभिक ट्रिगर, सत्यापन, स्थिति परिवर्तन और अंतिम आउटपुट को विस्तार से समझाता है।`,
        sampleRubric: {
          structuredFlow: 4,
          realisticScenario: 3,
          communicationClarity: 3,
        },
      },
    ].slice(0, count);
  }

  return [
    {
      id: `custom-1`,
      subject: cleanSubject,
      topic: cleanTopic,
      difficulty: 'Intermediate',
      question: `In the context of ${cleanSubject}, what are the fundamental architectural principles of ${cleanTopic}? Explain their practical importance.`,
      context: `The examiner is testing foundational definitions, trade-offs, and design goals related to ${cleanTopic}.`,
      keyConcepts: [
        `Core definitions of ${cleanTopic}`,
        'Key trade-offs or constraints',
        'Industry practical use case',
        'Common pitfalls or edge cases',
      ],
      sampleAnswer: `When implementing ${cleanTopic} in ${cleanSubject}, key architectural principles include separation of concerns, scalability, fault tolerance, and predictable performance. A strong technical answer covers the core definition, the primary trade-offs (such as latency vs throughput or memory vs compute), and demonstrates how real-world systems handle error states.`,
      sampleRubric: {
        definition: 3,
        principles: 4,
        tradeoffsAndApplication: 3,
      },
    },
    {
      id: `custom-2`,
      subject: cleanSubject,
      topic: cleanTopic,
      difficulty: 'Advanced',
      question: `Compare the primary performance trade-offs or alternative approaches to ${cleanTopic}. When would you choose one over the other?`,
      context: `Examiners look for critical thinking and comparative analysis rather than simple memorization.`,
      keyConcepts: [
        'Comparison with alternative approaches',
        'Time and space complexity / latency implications',
        'Decision criteria in production environments',
      ],
      sampleAnswer: `Evaluating alternative implementations for ${cleanTopic} requires weighing throughput, operational complexity, maintenance overhead, and consistency. Choosing the optimal approach depends heavily on the expected workload profile, data volume, and tolerance for failure.`,
      sampleRubric: {
        comparisonClarity: 4,
        metricsAndTradeoffs: 3,
        decisionCriteria: 3,
      },
    },
    {
      id: `custom-3`,
      subject: cleanSubject,
      topic: cleanTopic,
      difficulty: 'Beginner',
      question: `Walk me through a step-by-step example or scenario illustrating how ${cleanTopic} operates in a real software system.`,
      context: `Checking your ability to communicate complex ideas verbally with a structured example.`,
      keyConcepts: [
        'Step-by-step flow',
        'Input and output characteristics',
        'Handling failure or boundary conditions',
      ],
      sampleAnswer: `A comprehensive example traces the lifecycle from initial trigger, input validation, state transformation, to final output and verification, while explicitly stating how unexpected boundary conditions are caught.`,
      sampleRubric: {
        structuredFlow: 4,
        realisticScenario: 3,
        communicationClarity: 3,
      },
    },
  ].slice(0, count);
};

