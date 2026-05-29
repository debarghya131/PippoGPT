const DEMO_THREAD_ITEMS = [
  {
    threadId: "demo-1",
    title: "Coding Chat",
    messages: [
      { role: "user", content: "how to reverse a string in python" },
      {
        role: "assistant",
        content: "You can reverse a string using slicing:\n\n```python\ntext = \"hello\"\nprint(text[::-1])\n```",
      },
      { role: "user", content: "what is output" },
      { role: "assistant", content: "The output will be:\n\n```text\nolleh\n```" },
      { role: "user", content: "can i use loop" },
      { role: "assistant", content: "Yes, you can also reverse using a loop." },
      { role: "user", content: "show code" },
      {
        role: "assistant",
        content:
          "```python\ntext = \"hello\"\nrev = \"\"\n\nfor ch in text:\n    rev = ch + rev\n\nprint(rev)\n```",
      },
      { role: "user", content: "which is faster" },
      { role: "assistant", content: "String slicing is generally faster and shorter." },
      { role: "user", content: "thanks" },
      { role: "assistant", content: "Anytime 🚀" },
    ],
  },
  {
    threadId: "demo-2",
    title: "Village Student Engineering Journey Chat",
    messages: [
      { role: "user", content: "i come from a village area" },
      {
        role: "assistant",
        content:
          "That does not limit your potential. Many successful engineers started from small villages and rural backgrounds.",
      },
      { role: "user", content: "i studied in arts background before" },
      {
        role: "assistant",
        content:
          "Changing streams and entering engineering can be difficult, but it’s possible with consistency and hard work.",
      },
      { role: "user", content: "people say village students cannot compete" },
      {
        role: "assistant",
        content:
          "That’s not true. Skills, discipline, and persistence matter more than background.",
      },
      { role: "user", content: "i feel behind compared to city students" },
      {
        role: "assistant",
        content:
          "Many students from cities may get more exposure early, but you can catch up step by step.",
      },
      { role: "user", content: "english communication is weak" },
      {
        role: "assistant",
        content:
          "That’s very common. Communication improves with daily practice, listening, reading, and speaking slowly with confidence.",
      },
      { role: "user", content: "example" },
      {
        role: "assistant",
        content:
          "For example, many students initially struggle to speak English in college but become confident after practicing presentations, interviews, and conversations regularly.",
      },
      { role: "user", content: "financial problems also affect studies" },
      {
        role: "assistant",
        content:
          "Financial struggles can make the journey harder, but they also build resilience and determination.",
      },
      { role: "user", content: "sometimes i feel inferior" },
      {
        role: "assistant",
        content:
          "Your background is not your weakness. Reaching engineering despite struggles already shows strength.",
      },
      { role: "user", content: "people laugh at my pronunciation" },
      {
        role: "assistant",
        content:
          "Everyone learns at their own pace. Skills improve with practice, and confidence matters more than perfection.",
      },
      { role: "user", content: "example of improvement" },
      {
        role: "assistant",
        content:
          "For example, a student may struggle in first-year presentations but later crack interviews through consistent practice and confidence building.",
      },
      { role: "user", content: "i have self doubt" },
      {
        role: "assistant",
        content:
          "Self-doubt is normal during difficult journeys, especially when entering a competitive environment.",
      },
      { role: "user", content: "how to stay motivated" },
      {
        role: "assistant",
        content:
          "Remember why you started. Focus on learning one step at a time instead of comparing yourself with others.",
      },
      { role: "user", content: "can village students become software engineers" },
      {
        role: "assistant",
        content:
          "Absolutely. Many software engineers, toppers, and entrepreneurs come from rural and humble backgrounds.",
      },
      { role: "user", content: "final advice" },
      {
        role: "assistant",
        content:
          "Never feel ashamed of your roots. Your struggles can become your biggest source of strength and motivation 🚀",
      },
    ],
  },
  {
    threadId: "demo-quick-sort",
    title: "Quick Sort Chat",
    messages: [
      { role: "user", content: "what is quick sort" },
      { role: "assistant", content: "Quick sort is a fast divide-and-conquer sorting algorithm." },
      { role: "user", content: "average complexity" },
      { role: "assistant", content: "Average time complexity:\n\n```text\nO(n log n)\n```" },
      { role: "user", content: "worst case" },
      { role: "assistant", content: "Worst case complexity:\n\n```text\nO(n²)\n```" },
      { role: "user", content: "give c code" },
      {
        role: "assistant",
        content:
          "```c\n#include <stdio.h>\n\nvoid swap(int *a, int *b){\n    int t = *a;\n    *a = *b;\n    *b = t;\n}\n\nint partition(int arr[], int low, int high){\n    int pivot = arr[high];\n    int i = low - 1;\n\n    for(int j = low; j < high; j++){\n        if(arr[j] < pivot){\n            i++;\n            swap(&arr[i], &arr[j]);\n        }\n    }\n\n    swap(&arr[i + 1], &arr[high]);\n\n    return i + 1;\n}\n\nvoid quickSort(int arr[], int low, int high){\n    if(low < high){\n        int pi = partition(arr, low, high);\n\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}\n\nint main(){\n    int arr[] = {10, 7, 8, 9, 1, 5};\n    int n = 6;\n\n    quickSort(arr, 0, n - 1);\n\n    for(int i = 0; i < n; i++)\n        printf(\"%d \", arr[i]);\n\n    return 0;\n}\n```",
      },
      { role: "user", content: "output" },
      { role: "assistant", content: "```text\n1 5 7 8 9 10\n```" },
      { role: "user", content: "merge sort vs quick sort" },
      {
        role: "assistant",
        content: "Merge sort is stable, while quick sort is usually faster in practice.",
      },
    ],
  },
  {
    threadId: "demo-attachment-overthinking",
    title: "Attachment & Overthinking Chat",
    messages: [
      { role: "user", content: "why attachment hurts so much" },
      {
        role: "assistant",
        content:
          "Attachment hurts when your happiness and peace start depending too much on one person.",
      },
      { role: "user", content: "what does that mean" },
      {
        role: "assistant",
        content:
          "It means your mood slowly becomes controlled by their replies, attention, behavior, or validation.",
      },
      { role: "user", content: "example" },
      {
        role: "assistant",
        content:
          "For example, if they reply fast you feel happy, but if they reply late you suddenly feel anxious or upset.",
      },
      { role: "user", content: "why does this happen" },
      {
        role: "assistant",
        content:
          "Your brain starts treating that person like an emotional need instead of just someone you care about.",
      },
      { role: "user", content: "signs of unhealthy attachment" },
      {
        role: "assistant",
        content:
          "Constant overthinking, checking messages repeatedly, fear of being ignored, jealousy, and losing focus on your own life.",
      },
      { role: "user", content: "real life example" },
      {
        role: "assistant",
        content:
          "For example, someone may sit to study or code, but keeps checking their phone every few minutes hoping for a reply.",
      },
      { role: "user", content: "attachment affects studies also" },
      {
        role: "assistant",
        content:
          "Yes, intense attachment can quietly drain focus, motivation, sleep, and productivity.",
      },
      { role: "user", content: "another example" },
      {
        role: "assistant",
        content:
          "For example, after seeing a dry text or story upload, someone may spend hours overthinking instead of focusing on gym, coding, or exams.",
      },
      { role: "user", content: "why overthinking increases" },
      {
        role: "assistant",
        content:
          "Because the mind keeps searching for reassurance and hidden meanings in small actions.",
      },
      { role: "user", content: "balanced connection means" },
      {
        role: "assistant",
        content:
          "Caring about someone while still keeping your own goals, routine, confidence, and emotional stability intact.",
      },
      { role: "user", content: "how to reduce attachment" },
      {
        role: "assistant",
        content:
          "Focus more on your own growth — studies, fitness, skills, hobbies, friends, and self-respect.",
      },
      { role: "user", content: "final advice" },
      {
        role: "assistant",
        content:
          "The stronger your own identity becomes, the less emotionally dependent you feel on others 🌱",
      },
    ],
  },
  {
    threadId: "demo-limerence",
    title: "Limerence Chat",
    messages: [
      { role: "user", content: "what is limerence" },
      {
        role: "assistant",
        content:
          "Limerence is an intense emotional obsession where someone constantly craves attention, validation, or emotional connection from a specific person.",
      },
      { role: "user", content: "is it same as love" },
      {
        role: "assistant",
        content:
          "Not exactly. Love is usually calm and stable, while limerence feels intense, obsessive, and emotionally consuming.",
      },
      { role: "user", content: "example" },
      {
        role: "assistant",
        content:
          "For example, someone may think about one person all day even while studying, coding, eating, or trying to sleep.",
      },
      { role: "user", content: "why does it happen" },
      {
        role: "assistant",
        content:
          "Usually because the brain becomes emotionally attached to the excitement, uncertainty, and hope of getting attention or affection.",
      },
      { role: "user", content: "signs of limerence" },
      {
        role: "assistant",
        content:
          "Constant daydreaming, checking messages repeatedly, emotional dependence, overanalyzing small actions, and craving validation.",
      },
      { role: "user", content: "real life example" },
      {
        role: "assistant",
        content:
          "For example, if the person replies warmly, you suddenly feel extremely happy. But if they reply dryly or disappear for a few hours, your mood crashes completely.",
      },
      { role: "user", content: "why small things hurt so much" },
      {
        role: "assistant",
        content:
          "Because the brain starts giving emotional meaning to tiny actions like reply timing, emojis, stories, or online status.",
      },
      { role: "user", content: "another example" },
      {
        role: "assistant",
        content:
          "For example, someone uploads a story but does not reply to your message. Your mind immediately starts overthinking:\n\"Did I do something wrong?\"\n\"Are they losing interest?\"\n\"Do they like someone else?\"",
      },
      { role: "user", content: "limerence affects studies also" },
      {
        role: "assistant",
        content:
          "Yes. It can quietly consume mental energy and reduce focus on studies, gym, sleep, coding, and personal goals.",
      },
      { role: "user", content: "deep example" },
      {
        role: "assistant",
        content:
          "Imagine an engineering student preparing for placements or GATE. They open their laptop to study DSA, but after every few minutes they check Instagram, WhatsApp, or notifications hoping for a message from one person. Even when no conversation is happening, their mind keeps imagining future scenarios, replaying old chats, or thinking about what the other person feels.",
      },
      { role: "user", content: "why is it addictive" },
      {
        role: "assistant",
        content:
          "Because emotional uncertainty creates dopamine highs and lows. Occasional attention or validation makes the brain crave more.",
      },
      { role: "user", content: "difference between healthy connection and limerence" },
      {
        role: "assistant",
        content:
          "In a healthy connection, you care about someone while still functioning independently. In limerence, your emotional stability starts depending too much on them.",
      },
      { role: "user", content: "how to reduce limerence" },
      {
        role: "assistant",
        content:
          "Rebuild focus on your own life:\nstudies\ngym\ncoding\nhobbies\nfriends\nsleep\nself-growth",
      },
      { role: "user", content: "does limerence go away" },
      {
        role: "assistant",
        content:
          "Yes. As emotional dependence decreases and your own identity becomes stronger, limerence usually fades over time.",
      },
      { role: "user", content: "final advice" },
      {
        role: "assistant",
        content:
          "Don’t make one person the center of your entire emotional world. The more balanced your life becomes, the more peaceful your mind feels 🌱",
      },
    ],
  },
  {
    threadId: "demo-moving-on-breakup",
    title: "Moving On After Breakup Chat",
    messages: [
      { role: "user", content: "How do I move on after a breakup?" },
      { role: "assistant", content: "Find another love as soon as possible." },
      { role: "user", content: "It’s hard to do that. It’s not possible for me." },
      { role: "assistant", content: "That is the one and only solution." },
      { role: "user", content: "No, please provide me another solution." },
      { role: "assistant", content: "That is the reality 🙂" },
      { role: "user", content: "But I still miss her every day." },
      { role: "assistant", content: "🙂" },
      { role: "user", content: "Please provide me another impactful solution." },
      { role: "assistant", content: "🙂" },
      { role: "user", content: "Please say something." },
      { role: "assistant", content: "⏳⏳⏳" },
      { role: "user", content: "What happened?" },
      {
        role: "assistant",
        content: "429 - rate_limit_error: You have exceeded your lifetime credit limit.",
      },
    ],
  },
  {
    threadId: "demo-3",
    title: "Merge Sort Chat",
    messages: [
      { role: "user", content: "what is merge sort" },
      { role: "assistant", content: "Merge sort is a divide-and-conquer sorting algorithm." },
      { role: "user", content: "time complexity" },
      { role: "assistant", content: "Its time complexity is:\n\n```text\nO(n log n)\n```" },
      { role: "user", content: "stable sorting" },
      { role: "assistant", content: "Yes, merge sort is a stable sorting algorithm." },
      { role: "user", content: "give c code" },
      {
        role: "assistant",
        content:
          "```c\n#include <stdio.h>\n\nvoid merge(int arr[], int l, int m, int r){\n    int i, j, k;\n    int n1 = m - l + 1;\n    int n2 = r - m;\n\n    int L[n1], R[n2];\n\n    for(i = 0; i < n1; i++)\n        L[i] = arr[l + i];\n\n    for(j = 0; j < n2; j++)\n        R[j] = arr[m + 1 + j];\n\n    i = 0;\n    j = 0;\n    k = l;\n\n    while(i < n1 && j < n2){\n        if(L[i] <= R[j]){\n            arr[k] = L[i];\n            i++;\n        } else {\n            arr[k] = R[j];\n            j++;\n        }\n        k++;\n    }\n\n    while(i < n1){\n        arr[k] = L[i];\n        i++;\n        k++;\n    }\n\n    while(j < n2){\n        arr[k] = R[j];\n        j++;\n        k++;\n    }\n}\n\nvoid mergeSort(int arr[], int l, int r){\n    if(l < r){\n        int m = l + (r - l) / 2;\n\n        mergeSort(arr, l, m);\n        mergeSort(arr, m + 1, r);\n\n        merge(arr, l, m, r);\n    }\n}\n\nint main(){\n    int arr[] = {12, 11, 13, 5, 6, 7};\n    int n = 6;\n\n    mergeSort(arr, 0, n - 1);\n\n    for(int i = 0; i < n; i++)\n        printf(\"%d \", arr[i]);\n\n    return 0;\n}\n```",
      },
      { role: "user", content: "output" },
      { role: "assistant", content: "```text\n5 6 7 11 12 13\n```" },
      { role: "user", content: "nice thanks" },
      { role: "assistant", content: "Happy coding 🚀" },
    ],
  },
  {
    threadId: "demo-4",
    title: "Debarghya Bandyopadhyay Chat",
    messages: [
      { role: "user", content: "who is Debarghya Bandyopadhyay" },
      {
        role: "assistant",
        content:
          "Debarghya Bandyopadhyay is a Computer Science engineering student and developer from **Kolkata**.",
      },
      { role: "user", content: "Education Details" },
      {
        role: "assistant",
        content:
          "He is pursuing B.Tech in Computer Science and Engineering at **Netaji Subhash Engineering College**, Kolkata, and he completed his diploma from **Technique Polytechnique Institute**, Hooghly in 2024.",
      },
      { role: "user", content: "what are his skills" },
      {
        role: "assistant",
        content:
          "**Languages -** C, C++, Python, Java, JavaScript, TypeScript, HTML, CSS, and SQL.\n\n**Frameworks/Libraries -** React.js, Node.js, Express.js, Tailwind CSS, Redux Toolkit, Socket.io, Prisma, Mongoose, Flask, Scikit-Learn, NumPy, and Pandas.\n\n**Tools/Technologies -** MongoDB, PostgreSQL, GitHub, VS Code, Postman, Jupyter Notebook, Google Colab, Vercel, Render, and cron-job.",
      },
      { role: "user", content: "does he use linux" },
      {
        role: "assistant",
        content: "Yes, he uses **Arch Linux** and Pop!_OS for development and customization.",
      },
      { role: "user", content: "any projects" },
      {
        role: "assistant",
        content:
          "Yes, here are some projects:\n\n1. **MonkMode** - for self improvement, tracking, and analysis of progress.\n2. **Actual** - an AI-powered personal finance and analysis app.\n3. **School Alumin** - guidance platform for village students.\n4. **Invex** - retail inventory management system.\n5. **LearnX** - a learning management and course-selling app.",
      },
      { role: "user", content: "monkmode project" },
      {
        role: "assistant",
        content:
          "It is a self-improvement and productivity platform built using **React.js, Node.js, Express.js, MongoDB, and AI-based progress analytics**.",
      },
      { role: "user", content: "actual finance project" },
      {
        role: "assistant",
        content:
          "It is an AI-powered personal finance analytics app built using **React.js, Python, Flask, MongoDB, and Machine Learning** for smart financial insights.",
      },
      { role: "user", content: "school alumin project" },
      {
        role: "assistant",
        content:
          "It is a mentorship and student guidance platform built using **MERN Stack, authentication systems, real-time chat, and recommendation features** for village students.",
      },
      { role: "user", content: "is he into ai" },
      {
        role: "assistant",
        content:
          "Yes, he is interested in **AI, machine learning, robotics, and automation**.",
      },
      { role: "user", content: "robotics also" },
      {
        role: "assistant",
        content: "Yes, he is building a **Raspberry Pi** based study buddy robot.",
      },
      { role: "user", content: "coding achievements" },
      {
        role: "assistant",
        content:
          "He solved **600+** coding problems and **ranked 3rd** in TECHPHORIA-2023 coding competition.",
      },
      { role: "user", content: "favorite subjects" },
      {
        role: "assistant",
        content: "Data Structures, DBMS, Operating Systems, and Computer Networks.",
      },
      { role: "user", content: "preparing for gate" },
      {
        role: "assistant",
        content: "Yes, he is preparing for the GATE 2027 examination.",
      },
      { role: "user", content: "gym also" },
      {
        role: "assistant",
        content:
          "Yes, he is also focused on fitness and self-improvement alongside studies.",
      },
      { role: "user", content: "future goal" },
      {
        role: "assistant",
        content:
          "To become a skilled software engineer, AI developer, and build impactful tech products 🚀",
      },
      { role: "user", content: "how can i connect with him" },
      {
        role: "assistant",
        content:
          "[![LinkedIn](https://img.shields.io/badge/LinkedIn-Debarghya%20Bandyopadhyay-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/debarghya-bandyopadhyay-953b02400?utm_source=share_via&utm_content=profile&utm_medium=member_android)\n\n[![X](https://img.shields.io/badge/X-debarghya131-000000?style=for-the-badge&logo=x&logoColor=white)](https://x.com/debarghya131)\n\n[![GitHub](https://img.shields.io/badge/GitHub-debarghya131-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/debarghya131)\n\n[![Portfolio](https://img.shields.io/badge/Portfolio-portfolio.debarghya.org-14A800?style=for-the-badge&logo=vercel&logoColor=white)](https://portfolio.debarghya.org)\n\n[![Email](https://img.shields.io/badge/Email-debarghyabandyopadhyay191%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:debarghyabandyopadhyay191@gmail.com)",
      },
    ],
  },
  {
    threadId: "demo-5",
    title: "Attachment & Limerence Chat",
    messages: [
      { role: "user", content: "what is attachment" },
      {
        role: "assistant",
        content:
          "Attachment is the emotional bond we form with people, especially close relationships.",
      },
      { role: "user", content: "what is limerence" },
      {
        role: "assistant",
        content: "Limerence is an intense emotional obsession or infatuation with someone.",
      },
      { role: "user", content: "difference between love and limerence" },
      {
        role: "assistant",
        content:
          "Love is usually stable and realistic, while limerence is intense, obsessive, and driven by emotional highs.",
      },
      { role: "user", content: "signs of limerence" },
      {
        role: "assistant",
        content:
          "Constant thinking about someone, overanalyzing messages, emotional dependence, and craving validation.",
      },
      { role: "user", content: "can limerence go away" },
      {
        role: "assistant",
        content:
          "Yes, with time, self-focus, emotional awareness, and healthy boundaries, it usually fades.",
      },
      { role: "user", content: "how to manage it" },
      {
        role: "assistant",
        content:
          "Focus on hobbies, studies, fitness, friends, and limit emotional overdependence.",
      },
      { role: "user", content: "attachment style meaning" },
      {
        role: "assistant",
        content:
          "Attachment styles describe how people emotionally connect in relationships, like secure, anxious, or avoidant attachment.",
      },
      { role: "user", content: "anxious attachment means" },
      {
        role: "assistant",
        content:
          "It means someone may fear rejection, overthink relationships, and seek constant reassurance.",
      },
      { role: "user", content: "can people heal attachment issues" },
      {
        role: "assistant",
        content:
          "Yes, self-awareness, communication, therapy, and healthy relationships can help a lot.",
      },
      { role: "user", content: "thanks" },
      { role: "assistant", content: "Anytime 🌱" },
    ],
  },
  {
    threadId: "demo-6",
    title: "Semester Wise Engineering Guidance",
    messages: [
      { role: "user", content: "how should engineering students study semester wise" },
      {
        role: "assistant",
        content:
          "Focus changes every year. Build fundamentals early and specialize later.",
      },
      { role: "user", content: "what to do in 1st year" },
      {
        role: "assistant",
        content:
          "Learn C/C++, basic programming, communication skills, Git/GitHub, and start exploring Linux.",
      },
      { role: "user", content: "what about 2nd year" },
      {
        role: "assistant",
        content:
          "Focus heavily on DSA, OOPs, DBMS, Operating Systems, and start web development or app development.",
      },
      { role: "user", content: "projects in 2nd year necessary" },
      {
        role: "assistant",
        content: "Yes, build 1-2 solid projects and upload them to GitHub.",
      },
      { role: "user", content: "what to do in 3rd year" },
      {
        role: "assistant",
        content:
          "Prepare seriously for internships, competitive coding, aptitude, resume building, and advanced development skills.",
      },
      { role: "user", content: "should i learn ai in 3rd year" },
      {
        role: "assistant",
        content:
          "Yes, 3rd year is a great time to explore AI, machine learning, cloud, or cybersecurity.",
      },
      { role: "user", content: "what about 4th year" },
      {
        role: "assistant",
        content:
          "Focus on placements, major projects, interview preparation, networking, and career direction.",
      },
      { role: "user", content: "gate preparation best time" },
      {
        role: "assistant",
        content: "Start serious GATE preparation from 3rd year for better consistency.",
      },
      { role: "user", content: "cgpa vs skills" },
      {
        role: "assistant",
        content:
          "Maintain a decent CGPA, but skills and projects matter a lot for real opportunities.",
      },
      { role: "user", content: "final guidance" },
      {
        role: "assistant",
        content:
          "Stay consistent every semester, avoid wasting years, and keep improving step by step 🚀",
      },
    ],
  },
  {
    threadId: "demo-7",
    title: "Overcoming Procrastinatio & Overthinking",
    messages: [
      { role: "user", content: "i procrastinate a lot" },
      {
        role: "assistant",
        content: "Start with very small tasks instead of waiting for perfect motivation.",
      },
      { role: "user", content: "i overthink everything" },
      {
        role: "assistant",
        content:
          "Overthinking usually comes from fear of failure or uncertainty. Action reduces it faster than endless thinking.",
      },
      { role: "user", content: "anxiety before studies and exams" },
      {
        role: "assistant",
        content:
          "That’s common. Focus on preparation step by step instead of imagining worst-case scenarios.",
      },
      { role: "user", content: "i compare myself with others" },
      {
        role: "assistant",
        content:
          "Comparing your journey with others only creates stress. Everyone grows at a different pace.",
      },
      { role: "user", content: "social media makes it worse" },
      {
        role: "assistant",
        content: "Yes, constant scrolling can increase comparison and reduce focus.",
      },
      { role: "user", content: "how to stop procrastination" },
      {
        role: "assistant",
        content:
          "Use techniques like studying for 25 minutes, removing distractions, and setting small daily goals.",
      },
      { role: "user", content: "i feel behind in life" },
      {
        role: "assistant",
        content: "Progress is not a race. Consistency matters more than speed.",
      },
      { role: "user", content: "how to reduce anxiety" },
      {
        role: "assistant",
        content:
          "Sleep properly, exercise regularly, avoid overloading yourself, and focus on one task at a time.",
      },
      { role: "user", content: "what if i fail" },
      {
        role: "assistant",
        content:
          "Failure is part of learning. Most successful people failed many times before improving.",
      },
      { role: "user", content: "final advice" },
      {
        role: "assistant",
        content:
          "Focus on becoming better than your past self, not better than everyone else 🌱",
      },
    ],
  },
  {
    threadId: "demo-8",
    title: "Linux Chat",
    messages: [
      { role: "user", content: "how to check current directory in linux" },
      { role: "assistant", content: "Use:\n\n```bash\npwd\n```" },
      { role: "user", content: "how to list files" },
      { role: "assistant", content: "Use:\n\n```bash\nls\n```" },
      { role: "user", content: "hidden files also" },
      { role: "assistant", content: "```bash\nls -a\n```" },
      { role: "user", content: "create folder command" },
      { role: "assistant", content: "```bash\nmkdir project\n```" },
      { role: "user", content: "delete folder" },
      { role: "assistant", content: "```bash\nrm -r project\n```" },
      { role: "user", content: "linux is cool" },
      { role: "assistant", content: "Facts 😎" },
    ],
  },
  {
    threadId: "demo-9",
    title: "Introvert Personality Chat",
    messages: [
      { role: "user", content: "what is an introvert personality" },
      {
        role: "assistant",
        content:
          "An introvert is someone who usually feels more comfortable in calm environments and recharges by spending time alone.",
      },
      { role: "user", content: "introvert means shy" },
      {
        role: "assistant",
        content:
          "Not always. Introverts can be confident too, they just prefer smaller social circles.",
      },
      { role: "user", content: "i avoid talking in class" },
      {
        role: "assistant",
        content:
          "Many introverts feel nervous speaking in groups, especially in unfamiliar environments.",
      },
      { role: "user", content: "example" },
      {
        role: "assistant",
        content:
          "For example, someone may know the answer in class but still hesitate to raise their hand because they overthink how others might react.",
      },
      { role: "user", content: "i feel tired after social events" },
      {
        role: "assistant",
        content:
          "That’s common for introverts. Social interaction can drain energy even if the event was enjoyable.",
      },
      { role: "user", content: "another example" },
      {
        role: "assistant",
        content:
          "For example, after a college fest or group project meeting, an introvert may want quiet time alone to recharge mentally.",
      },
      { role: "user", content: "introverts have fewer friends" },
      {
        role: "assistant",
        content:
          "Usually yes, but introverts often prefer deep and meaningful friendships instead of many casual connections.",
      },
      { role: "user", content: "introverts good at coding" },
      {
        role: "assistant",
        content:
          "Many introverts enjoy coding because it involves focus, creativity, and independent thinking.",
      },
      { role: "user", content: "example in tech field" },
      {
        role: "assistant",
        content:
          "For example, an introvert developer may enjoy building projects quietly for hours while improving skills consistently.",
      },
      { role: "user", content: "i overthink conversations later" },
      { role: "assistant", content: "That happens a lot with introverts and overthinkers." },
      { role: "user", content: "example" },
      {
        role: "assistant",
        content:
          "For example, after a simple conversation, someone might replay it in their mind thinking, “Did I say something weird?”",
      },
      { role: "user", content: "can introverts become leaders" },
      {
        role: "assistant",
        content:
          "Definitely. Introverts can become calm, thoughtful, and highly respected leaders.",
      },
      { role: "user", content: "example of introvert leadership" },
      {
        role: "assistant",
        content:
          "For example, a team leader who listens carefully, thinks deeply, and speaks only when necessary can still lead very effectively.",
      },
      { role: "user", content: "how to improve communication skills" },
      {
        role: "assistant",
        content:
          "Start small by talking in short conversations daily and gradually increase confidence.",
      },
      { role: "user", content: "real example" },
      {
        role: "assistant",
        content:
          "For example, start by asking one question in class, speaking during group discussions, or helping someone with studies.",
      },
      { role: "user", content: "is being introvert bad" },
      {
        role: "assistant",
        content: "Not at all. Introversion is a personality trait, not a weakness.",
      },
      { role: "user", content: "final advice" },
      {
        role: "assistant",
        content:
          "Don’t force yourself to act extroverted all the time. Build confidence while staying true to your personality 🌱",
      },
    ],
  },
  {
    threadId: "demo-10",
    title: "3-Month Interview Preparation Roadmap Chat",
    messages: [
      { role: "user", content: "i want to crack at least 7 lpa placement" },
      {
        role: "assistant",
        content: "That’s achievable with consistent preparation for the next 3 months.",
      },
      { role: "user", content: "what should i focus on first" },
      {
        role: "assistant",
        content:
          "Focus on DSA, core CS subjects, projects, aptitude, and communication skills together.",
      },
      { role: "user", content: "roadmap for first month" },
      { role: "assistant", content: "Month 1 should focus on strengthening fundamentals." },
      { role: "user", content: "what to study in month 1" },
      {
        role: "assistant",
        content:
          "Learn Arrays, Strings, Linked List, Stack, Queue, Recursion, Sorting, and basic SQL queries.",
      },
      { role: "user", content: "daily routine example" },
      {
        role: "assistant",
        content:
          "```text\n2 hours DSA\n1 hour CS fundamentals\n1 hour development/project\n30 mins aptitude or communication practice\n```",
      },
      { role: "user", content: "what about second month" },
      {
        role: "assistant",
        content: "Month 2 should focus on advanced problem solving and projects.",
      },
      { role: "user", content: "topics for month 2" },
      {
        role: "assistant",
        content:
          "Trees, Graphs, Dynamic Programming basics, DBMS, Operating Systems, Computer Networks, and resume projects.",
      },
      { role: "user", content: "projects important for 7 lpa" },
      { role: "assistant", content: "Yes. Strong projects help a lot during interviews." },
      { role: "user", content: "project example" },
      {
        role: "assistant",
        content:
          "MERN stack apps, AI-based applications, portfolio websites, or real-world problem-solving projects.",
      },
      { role: "user", content: "what to do in month 3" },
      {
        role: "assistant",
        content: "Month 3 should focus heavily on mock interviews and revision.",
      },
      { role: "user", content: "what should i revise" },
      {
        role: "assistant",
        content:
          "DSA patterns, SQL, OOPs, DBMS, OS, CN, HR questions, and project explanations.",
      },
      { role: "user", content: "how many coding questions daily" },
      {
        role: "assistant",
        content: "Aim for 3-5 quality coding problems daily with proper understanding.",
      },
      { role: "user", content: "aptitude necessary" },
      {
        role: "assistant",
        content: "Yes, many companies include aptitude rounds before technical interviews.",
      },
      { role: "user", content: "communication skills weak" },
      {
        role: "assistant",
        content:
          "Practice speaking daily, explain projects aloud, and improve confidence gradually.",
      },
      { role: "user", content: "can i crack interviews from village background" },
      {
        role: "assistant",
        content:
          "Absolutely. Companies care more about skills, confidence, and problem-solving ability.",
      },
      { role: "user", content: "final advice" },
      {
        role: "assistant",
        content:
          "Stay consistent for these 3 months, avoid distractions, build confidence, and keep practicing daily 🚀",
      },
    ],
  },
];

const FEATURED_DEMO_TITLE = "Debarghya Bandyopadhyay Chat";
const LAST_DEMO_TITLE = "Village Student Engineering Journey Chat";
const featuredDemoThread = DEMO_THREAD_ITEMS.find(
  (thread) => thread.title === FEATURED_DEMO_TITLE,
);
const lastDemoThread = DEMO_THREAD_ITEMS.find((thread) => thread.title === LAST_DEMO_TITLE);

export const DEMO_THREADS = [
  featuredDemoThread,
  ...DEMO_THREAD_ITEMS.filter(
    (thread) => ![FEATURED_DEMO_TITLE, LAST_DEMO_TITLE].includes(thread.title),
  ),
  lastDemoThread,
].filter(Boolean);
