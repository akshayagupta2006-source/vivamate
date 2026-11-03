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

// Generic fallback question generator when user selects custom topics or subjects
export const generateCustomMockQuestions = (subject, topic, count = 3) => {
  const cleanSubject = subject || 'Computer Science';
  const cleanTopic = topic || 'General Engineering Fundamentals';

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

