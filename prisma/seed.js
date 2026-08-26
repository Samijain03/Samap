const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Samap database...');

  // 1. Create or upsert Demo User
  const user = await prisma.user.upsert({
    where: { email: 'alex.rivera@delusional.edu' },
    update: {},
    create: {
      id: 'demo-user-1',
      email: 'alex.rivera@delusional.edu',
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      preferences: {
        create: {
          learningStyle: 'balanced',
          explanationTone: 'friendly',
          alwaysExamples: true,
          preferredModel: 'gemini-1.5-flash',
          theme: 'dark',
        },
      },
    },
  });

  console.log('Created User:', user.name);

  // 2. Create Sample Courses: Operating Systems, Machine Learning & AI, Web Development
  const osCourse = await prisma.course.create({
    data: {
      userId: user.id,
      title: 'Operating Systems & Architecture',
      code: 'CS-301',
      description: 'Core concepts of kernel design, memory management, process scheduling, concurrency, and file systems.',
      color: '#6366f1',
      icon: 'Cpu',
      subjects: {
        create: [
          {
            title: 'Process Management & Concurrency',
            description: 'Threads, race conditions, semaphores, deadlocks, and CPU scheduling algorithms.',
            chapters: {
              create: [
                {
                  title: 'Process Lifecycle & Context Switching',
                  order: 1,
                  topics: {
                    create: [
                      { title: 'Process Control Block (PCB)', completed: true, order: 1 },
                      { title: 'Context Switch Overhead & States', completed: true, order: 2 },
                      { title: 'Fork, Exec, and Zombie Processes', completed: false, order: 3 },
                    ],
                  },
                },
                {
                  title: 'CPU Scheduling Algorithms',
                  order: 2,
                  topics: {
                    create: [
                      { title: 'First-Come First-Served & Round Robin', completed: true, order: 1 },
                      { title: 'Shortest Job First (SJF) & Preemption', completed: false, order: 2 },
                      { title: 'Multi-level Feedback Queues', completed: false, order: 3 },
                    ],
                  },
                },
                {
                  title: 'Synchronization & Deadlocks',
                  order: 3,
                  topics: {
                    create: [
                      { title: 'Critical Section & Peterson\'s Algorithm', completed: false, order: 1 },
                      { title: 'Mutexes, Semaphores & Condition Variables', completed: false, order: 2 },
                      { title: 'Banker\'s Algorithm for Deadlock Avoidance', completed: false, order: 3 },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Memory Management & Virtual Memory',
            description: 'Paging, TLB, page replacement policies, and segmentation.',
            chapters: {
              create: [
                {
                  title: 'Virtual Memory & Paging',
                  order: 1,
                  topics: {
                    create: [
                      { title: 'Page Tables & Translation Lookaside Buffer (TLB)', completed: true, order: 1 },
                      { title: 'Page Fault Handling & Demand Paging', completed: false, order: 2 },
                      { title: 'LRU, FIFO, and Optimal Page Replacement', completed: false, order: 3 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: { subjects: true },
  });

  const mlCourse = await prisma.course.create({
    data: {
      userId: user.id,
      title: 'Machine Learning & Neural Networks',
      code: 'CS-440',
      description: 'Foundational mathematical concepts, supervised & unsupervised learning, gradient descent, and deep neural nets.',
      color: '#10b981',
      icon: 'Brain',
      subjects: {
        create: [
          {
            title: 'Supervised Learning & Optimization',
            description: 'Linear regression, logistic regression, cost functions, gradient descent, and regularization.',
            chapters: {
              create: [
                {
                  title: 'Regression & Classification Foundations',
                  order: 1,
                  topics: {
                    create: [
                      { title: 'Linear Regression & Mean Squared Error', completed: true, order: 1 },
                      { title: 'Logistic Regression & Sigmoid Function', completed: true, order: 2 },
                      { title: 'Gradient Descent & Learning Rate tuning', completed: true, order: 3 },
                      { title: 'L1 (Lasso) vs L2 (Ridge) Regularization', completed: false, order: 4 },
                    ],
                  },
                },
                {
                  title: 'Decision Trees & Ensemble Methods',
                  order: 2,
                  topics: {
                    create: [
                      { title: 'Entropy & Information Gain', completed: false, order: 1 },
                      { title: 'Random Forests & Bagging', completed: false, order: 2 },
                      { title: 'Gradient Boosting & XGBoost', completed: false, order: 3 },
                    ],
                  },
                },
              ],
            },
          },
          {
            title: 'Deep Learning & Computer Vision',
            description: 'Convolutional Neural Networks, Backpropagation, and Vision Transformers.',
            chapters: {
              create: [
                {
                  title: 'Convolutional Networks (CNNs)',
                  order: 1,
                  topics: {
                    create: [
                      { title: 'Convolution Kernels, Stride & Padding', completed: false, order: 1 },
                      { title: 'Pooling Layers & Feature Maps', completed: false, order: 2 },
                      { title: 'Backpropagation Through Convolutional Layers', completed: false, order: 3 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    include: { subjects: true },
  });

  // 3. Create Sample Documents with Chunks for RAG Demonstration
  const osSubject = osCourse.subjects[0];
  const mlSubject = mlCourse.subjects[0];

  await prisma.document.create({
    data: {
      userId: user.id,
      courseId: osCourse.id,
      subjectId: osSubject.id,
      fileName: 'Operating_Systems_Notes_Unit_1_Processes.pdf',
      fileType: 'pdf',
      fileSize: 2450000,
      pageCount: 48,
      status: 'ready',
      chunks: {
        create: [
          {
            chunkIndex: 0,
            pageNumber: 12,
            content: 'A Process is an instance of a computer program that is being executed. It contains the program code (text section), current activity represented by the program counter, processor registers, stack (containing temporary data like function parameters, return addresses), data section (containing global variables), and heap (dynamically allocated memory during runtime).',
            tokenCount: 85,
          },
          {
            chunkIndex: 1,
            pageNumber: 15,
            content: 'Context Switching is the process of storing the state of a CPU core (registers, PCB pointer) so that execution can be resumed from the same point at a later time, and loading the saved state for the next scheduled process. Context switch time is pure overhead because the system does no useful work while switching.',
            tokenCount: 78,
          },
          {
            chunkIndex: 2,
            pageNumber: 42,
            content: 'The Banker\'s Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. When a process requests an available resource, the system must decide if immediate allocation leaves the system in a safe state. A state is safe if there exists a safe sequence <P1, P2, ..., Pn> of processes such that for each Pi, the resources that Pi can still request can be satisfied by currently available resources plus resources held by all Pj (with j < i).',
            tokenCount: 110,
          },
        ],
      },
    },
  });

  await prisma.document.create({
    data: {
      userId: user.id,
      courseId: mlCourse.id,
      subjectId: mlSubject.id,
      fileName: 'Machine_Learning_Unit_2_Optimization.pdf',
      fileType: 'pdf',
      fileSize: 3120000,
      pageCount: 36,
      status: 'ready',
      chunks: {
        create: [
          {
            chunkIndex: 0,
            pageNumber: 4,
            content: 'Gradient Descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function. The update rule is given by: theta = theta - alpha * grad(J(theta)), where alpha is the learning rate and grad(J(theta)) is the gradient of the loss function with respect to parameters theta.',
            tokenCount: 82,
          },
          {
            chunkIndex: 1,
            pageNumber: 18,
            content: 'Supervised Learning algorithms build a mathematical model of a set of data that contains both the inputs and the desired outputs (labels). Common categories include Classification (predicting discrete class labels) and Regression (predicting continuous numerical quantities). Key algorithms include Logistic Regression, Support Vector Machines, Decision Trees, and Multi-layer Perceptrons.',
            tokenCount: 90,
          },
          {
            chunkIndex: 2,
            pageNumber: 27,
            content: 'Convolution in image processing involves sliding a small matrix called a kernel or filter over an input image and computing element-wise multiplications followed by summation. This operation extracts spatial feature hierarchies such as edges, textures, and corner patterns.',
            tokenCount: 65,
          },
        ],
      },
    },
  });

  // 4. Create Sample Interactive Roadmaps: Machine Learning and React/Next.js
  await prisma.roadmap.create({
    data: {
      userId: user.id,
      title: 'Machine Learning & AI Engineering',
      targetRole: 'AI/ML Engineer',
      category: 'ai-ml',
      difficulty: 'Intermediate',
      estimatedHours: 120,
      nodes: {
        create: [
          {
            title: 'Mathematics for Machine Learning',
            stage: 'prerequisites',
            order: 1,
            status: 'completed',
            difficulty: 'Beginner',
            estimatedHours: '15-20 hours',
            prerequisites: JSON.stringify(['High school algebra', 'Basic calculus']),
            description: 'Master the mathematical foundations essential for understanding ML algorithms: linear algebra (matrices, vectors, eigenvalues), multivariate calculus (partial derivatives, gradients), and probability & statistics (distributions, Bayes theorem).',
            keyConcepts: JSON.stringify(['Matrix Multiplication & Inverses', 'Eigenvalues & Eigenvectors', 'Partial Derivatives & Chain Rule', 'Probability Density Functions', 'Expectation & Variance']),
            resources: JSON.stringify([
              { title: '3Blue1Brown - Essence of Linear Algebra', url: 'https://youtube.com', type: 'video' },
              { title: 'Mathematics for Machine Learning (Book)', url: 'https://mml-book.github.io', type: 'book' },
            ]),
            practiceTasks: JSON.stringify([
              'Implement matrix multiplication from scratch without NumPy',
              'Calculate gradient vectors for simple quadratic functions manually',
              'Compute conditional probabilities using Bayes Theorem',
            ]),
            projectIdeas: JSON.stringify(['Build a 2D vector transformations visualizer']),
            relatedTopics: JSON.stringify(['Optimization', 'Vector Spaces', 'PCA']),
          },
          {
            title: 'Python for Data Science (NumPy & Pandas)',
            stage: 'beginner',
            order: 2,
            status: 'completed',
            difficulty: 'Beginner',
            estimatedHours: '12-16 hours',
            prerequisites: JSON.stringify(['Basic Python syntax']),
            description: 'Harness vectorized computing with NumPy and structured tabular data manipulation with Pandas. Learn indexing, slicing, broadcasting, data cleaning, merging, and grouping.',
            keyConcepts: JSON.stringify(['NumPy ndarrays & Vectorization', 'Broadcasting rules', 'Pandas DataFrames & Series', 'Handling Missing Values', 'GroupBy & Aggregations']),
            resources: JSON.stringify([
              { title: 'NumPy Official Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'docs' },
              { title: '10 Minutes to Pandas', url: 'https://pandas.pydata.org/docs/user_guide/10min.html', type: 'docs' },
            ]),
            practiceTasks: JSON.stringify([
              'Clean a real-world messy CSV dataset with null values and incorrect types',
              'Perform exploratory data analysis (EDA) with statistical summaries',
            ]),
            projectIdeas: JSON.stringify(['Exploratory Data Analysis Dashboard for Titanic or Housing dataset']),
            relatedTopics: JSON.stringify(['Matplotlib', 'Seaborn', 'Scikit-Learn']),
          },
          {
            title: 'Core Supervised Learning Algorithms',
            stage: 'intermediate',
            order: 3,
            status: 'in_progress',
            difficulty: 'Intermediate',
            estimatedHours: '25-30 hours',
            prerequisites: JSON.stringify(['Mathematics for ML', 'NumPy & Pandas']),
            description: 'Dive deep into foundational algorithms: Linear Regression, Logistic Regression, Decision Trees, Random Forests, and Support Vector Machines. Understand bias-variance tradeoff and evaluation metrics (Precision, Recall, F1, ROC-AUC).',
            keyConcepts: JSON.stringify(['Cost Functions & Gradient Descent', 'Decision Boundaries', 'Overfitting & Underfitting', 'L1/L2 Regularization', 'Confusion Matrix & ROC-AUC']),
            resources: JSON.stringify([
              { title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org', type: 'docs' },
              { title: 'StatQuest: Machine Learning Fundamentals', url: 'https://youtube.com', type: 'video' },
            ]),
            practiceTasks: JSON.stringify([
              'Implement Logistic Regression with gradient descent from scratch',
              'Train and compare 4 different classifiers on the Wine Quality dataset',
            ]),
            projectIdeas: JSON.stringify(['House Price Prediction System', 'Customer Churn Predictor']),
            relatedTopics: JSON.stringify(['Ensemble Methods', 'Feature Engineering', 'Cross-Validation']),
          },
          {
            title: 'Deep Learning & Neural Networks (PyTorch)',
            stage: 'advanced',
            order: 4,
            status: 'not_started',
            difficulty: 'Advanced',
            estimatedHours: '30-40 hours',
            prerequisites: JSON.stringify(['Core Supervised Learning', 'Calculus (Chain Rule)']),
            description: 'Understand multi-layer perceptrons, backpropagation, activation functions (ReLU, GELU), loss functions (CrossEntropy, MSE), optimizers (AdamW), CNNs for vision, and PyTorch tensor mechanics.',
            keyConcepts: JSON.stringify(['Tensors & Autograd', 'Backpropagation & Computational Graphs', 'Convolutional Layers & Pooling', 'Batch Normalization & Dropout', 'Transfer Learning']),
            resources: JSON.stringify([
              { title: 'PyTorch Deep Learning Zero to Mastery', url: 'https://pytorch.org/tutorials', type: 'docs' },
              { title: 'Fast.ai Practical Deep Learning for Coders', url: 'https://course.fast.ai', type: 'course' },
            ]),
            practiceTasks: JSON.stringify([
              'Build a custom PyTorch DataLoader for custom images',
              'Train a CNN to achieve >98% test accuracy on MNIST/CIFAR-10',
            ]),
            projectIdeas: JSON.stringify(['Real-time Medical Image Classifier with Transfer Learning']),
            relatedTopics: JSON.stringify(['Transformers', 'Computer Vision', 'Generative AI']),
          },
          {
            title: 'Production ML & LLM Application Engineering',
            stage: 'tools',
            order: 5,
            status: 'not_started',
            difficulty: 'Expert',
            estimatedHours: '20-25 hours',
            prerequisites: JSON.stringify(['Deep Learning', 'FastAPI/Flask']),
            description: 'Deploy models into real-world production. Build Retrieval-Augmented Generation (RAG) pipelines, manage vector databases, serve models with FastAPI and ONNX, and monitor model drift.',
            keyConcepts: JSON.stringify(['Vector Databases (Chroma, pgvector)', 'RAG Architectures', 'Model Quantization', 'FastAPI ML Inference', 'Dockerization & CI/CD']),
            resources: JSON.stringify([
              { title: 'LangChain / LlamaIndex Documentation', url: 'https://docs.langchain.com', type: 'docs' },
              { title: 'Full Stack Deep Learning Course', url: 'https://fullstackdeeplearning.com', type: 'course' },
            ]),
            practiceTasks: JSON.stringify([
              'Build a document Q&A pipeline using embeddings and cosine similarity',
              'Containerize a PyTorch inference server using Docker and FastAPI',
            ]),
            projectIdeas: JSON.stringify(['AI-Powered Personal Study Companion (like Samap!)']),
            relatedTopics: JSON.stringify(['MLOps', 'Vector Search', 'Fine-Tuning']),
          },
        ],
      },
      projects: {
        create: [
          {
            title: 'Automated Loan Default Prediction Engine',
            level: 'beginner',
            objective: 'Build an end-to-end classification pipeline that predicts loan defaults with thorough exploratory data analysis and feature engineering.',
            requirements: JSON.stringify(['Pandas data preprocessing', 'Imputation & One-Hot Encoding', 'Logistic Regression & Decision Tree models', 'Model evaluation with ROC-AUC']),
            skillsPracticed: JSON.stringify(['Data Cleaning', 'Scikit-Learn', 'Model Evaluation', 'Matplotlib']),
            estimatedTime: '8-10 hours',
            architecture: 'Jupyter Notebook -> Scikit-Learn Pipeline -> Streamlit UI',
            extensions: JSON.stringify(['Add SHAP values for explainable AI predictions']),
          },
          {
            title: 'Multimodal RAG Knowledge Engine',
            level: 'advanced',
            objective: 'Create a semantic search and question-answering assistant over PDFs and textbook documents with source citations.',
            requirements: JSON.stringify(['PDF text extraction', 'Chunking & Vector Embeddings', 'Vector similarity search', 'Streaming LLM integration with citations']),
            skillsPracticed: JSON.stringify(['Vector Databases', 'Prompt Engineering', 'FastAPI', 'Next.js']),
            estimatedTime: '20-25 hours',
            architecture: 'Next.js Frontend <-> FastAPI / Node API <-> Vector Store & LLM',
            extensions: JSON.stringify(['Add automatic quiz generator from retrieved documents']),
          },
        ],
      },
    },
  });

  // 5. Create Sample Quizzes
  const quiz = await prisma.quiz.create({
    data: {
      userId: user.id,
      title: 'Operating Systems: Process Synchronization & Deadlocks',
      topic: 'Process Synchronization & Deadlocks',
      difficulty: 'medium',
      questions: {
        create: [
          {
            type: 'mcq',
            question: 'Which of the following conditions is NOT a necessary condition for a deadlock to occur?',
            options: JSON.stringify(['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait']),
            correctAnswer: 'Preemption Allowed',
            explanation: 'The four necessary Coffman conditions for deadlock are: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption (resources cannot be preempted), and 4) Circular Wait. "Preemption Allowed" would actually prevent deadlock.',
            points: 1,
          },
          {
            type: 'mcq',
            question: 'What is the primary purpose of the Banker\'s Algorithm?',
            options: JSON.stringify(['Deadlock Detection', 'Deadlock Avoidance', 'Deadlock Recovery', 'Process Scheduling']),
            correctAnswer: 'Deadlock Avoidance',
            explanation: 'Banker\'s Algorithm is a deadlock avoidance algorithm that dynamically evaluates resource allocation requests to ensure the system never enters an unsafe state.',
            points: 1,
          },
          {
            type: 'true_false',
            question: 'Context switching between processes incurs zero CPU overhead because modern CPUs have multiple hardware registers.',
            options: JSON.stringify(['True', 'False']),
            correctAnswer: 'False',
            explanation: 'Context switching requires saving the CPU registers, updating PCB states, flushing TLB cache lines, and switching address spaces, all of which constitute pure computational overhead.',
            points: 1,
          },
          {
            type: 'short_answer',
            question: 'What data structure in the OS kernel stores the state, program counter, and register contents of a process?',
            options: JSON.stringify([]),
            correctAnswer: 'Process Control Block (PCB)',
            explanation: 'The Process Control Block (PCB) or Process Table Entry contains process state, program counter, CPU registers, CPU scheduling info, and memory-management info.',
            points: 2,
          },
        ],
      },
    },
  });

  // Sample Quiz Attempt
  await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId: user.id,
      score: 4,
      maxScore: 5,
      answers: JSON.stringify({
        '0': 'Preemption Allowed',
        '1': 'Deadlock Avoidance',
        '2': 'False',
        '3': 'PCB',
      }),
      feedback: JSON.stringify({
        weakTopics: ['Multi-level Feedback Queues'],
        strongTopics: ['Coffman Conditions', 'Banker Algorithm', 'Process State'],
        suggestedRevision: 'Review the details of TLB flush costs during context switches and page table hierarchy.',
      }),
    },
  });

  // 6. Create Initial Conversation
  const conv = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: 'Operating Systems Revision',
      courseId: osCourse.id,
      subjectId: osSubject.id,
      mode: 'course-rag',
      messages: {
        create: [
          {
            role: 'user',
            content: 'Explain what Banker\'s algorithm is and give me an exam-ready 5-mark answer.',
            studyAction: 'exam-answer',
          },
          {
            role: 'assistant',
            content: `### Banker's Algorithm (Deadlock Avoidance) — 5-Mark Exam Answer

**1. Definition:**
The **Banker's Algorithm** is a deadlock avoidance algorithm developed by Edsger Dijkstra. It tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources before deciding whether allocation should be allowed.

**2. Key Data Structures:**
* **Available \`[m]\`**: Vector of length $m$ representing available instances of each resource type.
* **Max \`[n][m]\`**: $n \\times m$ matrix defining maximum demand of each process.
* **Allocation \`[n][m]\`**: Currently allocated resources to each process.
* **Need \`[n][m]\`**: Remaining resources required ($Need[i][j] = Max[i][j] - Allocation[i][j]$).

**3. Safety Condition:**
A state is **safe** if there exists at least one sequence $\\langle P_1, P_2, \\dots, P_n \\rangle$ such that for each $P_i$:
$$\\text{Need}_i \\le \\text{Available} + \\sum_{j < i} \\text{Allocation}_j$$

**4. Algorithm Steps:**
1. Check if $\\text{Request}_i \\le \\text{Need}_i$. If false, raise error (exceeded maximum claim).
2. Check if $\\text{Request}_i \\le \\text{Available}$. If false, process $P_i$ must wait.
3. Pretend to allocate:
   * $\\text{Available} = \\text{Available} - \\text{Request}_i$
   * $\\text{Allocation}_i = \\text{Allocation}_i + \\text{Request}_i$
   * $\\text{Need}_i = \\text{Need}_i - \\text{Request}_i$
4. Run the **Safety Algorithm**. If the state is safe, grant the resources. Otherwise, roll back and make $P_i$ wait.

**5. Pros & Cons:**
* **Advantage:** Guarantees deadlock freedom without preemption.
* **Limitation:** Requires processes to declare maximum resource requirements in advance, which is rarely known in real-world operating systems.`,
            sources: JSON.stringify([
              {
                documentId: 'doc-os-1',
                fileName: 'Operating_Systems_Notes_Unit_1_Processes.pdf',
                pageNumber: 42,
                snippet: 'The Banker\'s Algorithm is a deadlock avoidance algorithm developed by Edsger Dijkstra. When a process requests an available resource, the system decides if allocation leaves the system in a safe state...',
                similarity: 0.94,
              },
            ]),
          },
        ],
      },
    },
  });

  // 7. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        userId: user.id,
        type: 'chat',
        title: 'Asked about Banker\'s Algorithm in OS',
        details: 'Received 5-mark structured exam answer with source citations',
      },
      {
        userId: user.id,
        type: 'quiz_completed',
        title: 'Completed OS Synchronization Quiz',
        details: 'Score: 4/5 (80%)',
      },
      {
        userId: user.id,
        type: 'roadmap_progress',
        title: 'Mastered Mathematics for Machine Learning',
        details: 'Completed all prerequisite milestones',
      },
    ],
  });

  console.log('Database seeded successfully with courses, roadmaps, quizzes, and RAG documents!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
