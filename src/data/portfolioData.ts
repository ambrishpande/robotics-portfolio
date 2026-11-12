export type StationId =
  | 'HOME'
  | 'SKILLS'
  | 'EXPERIENCE'
  | 'EDUCATION'
  | 'PROJECTS'
  | 'CONTACT';

export interface StationMeta {
  id: StationId;
  hash: string;
  label: string;
  gateTitle: string;
  accentHex: string;
  accentNumber: number;
  gateX: number;
  podCount: number;
}

export interface DataPod {
  id: string;
  station: Exclude<StationId, 'HOME'>;
  indexLabel: string;
  category: string;
  title: string;
  subtitle?: string;
  timeframe?: string;
  location?: string;
  summary: string;
  highlights: string[];
  tags?: string[];
  contactAction?: {
    email: string;
    phone: string;
    location: string;
    languages: string;
    resumePdfUrl: string;
  };
  readingDurationMs: number;
}

export const ENGINEER_PROFILE = {
  name: 'Ambrish Vidhyadhar Pande',
  shortName: 'Ambrish Pande',
  title: 'Robotics Engineer',
  location: 'Pune, India',
  fullLocation: 'Anand Nagar, Pune, Maharashtra, India',
  email: 'ambrishpande87@gmail.com',
  phone: '+917350054296',
  phoneFormatted: '+91 73500 54296',
  languages: 'English · Marathi · Hindi',
  resumePdfUrl: './assets/aistudio/AMPRISH_PANDE_78c054b8.pdf',
  summary:
    'Engineering and robotics professional with a multidisciplinary background in agricultural engineering, embedded systems, and automation. Experienced in leading robotics and AI programs, developing scalable STEM curricula, and delivering end-to-end lab solutions.',
};

export const STATIONS: StationMeta[] = [
  {
    id: 'HOME',
    hash: '#home',
    label: 'Home',
    gateTitle: 'Facility Overview',
    accentHex: '#94A3B8',
    accentNumber: 0x94a3b8,
    gateX: -10,
    podCount: 0,
  },
  {
    id: 'SKILLS',
    hash: '#skills',
    label: 'Skills',
    gateTitle: 'Technical Stack',
    accentHex: '#2563EB',
    accentNumber: 0x2563eb,
    gateX: -6,
    podCount: 4,
  },
  {
    id: 'EXPERIENCE',
    hash: '#experience',
    label: 'Experience',
    gateTitle: 'Work History',
    accentHex: '#6D28D9',
    accentNumber: 0x6d28d9,
    gateX: -2,
    podCount: 2,
  },
  {
    id: 'EDUCATION',
    hash: '#education',
    label: 'Education',
    gateTitle: 'Degrees & Training',
    accentHex: '#EA580C',
    accentNumber: 0xea580c,
    gateX: 2,
    podCount: 3,
  },
  {
    id: 'PROJECTS',
    hash: '#projects',
    label: 'Projects',
    gateTitle: 'Hardware Architecture',
    accentHex: '#2563EB',
    accentNumber: 0x2563eb,
    gateX: 6,
    podCount: 7,
  },
  {
    id: 'CONTACT',
    hash: '#contact',
    label: 'Contact',
    gateTitle: 'Direct Contact',
    accentHex: '#EA580C',
    accentNumber: 0xea580c,
    gateX: 10,
    podCount: 2,
  },
];

export function stationFromHash(hash: string): StationId {
  const cleaned = hash.trim().toLowerCase();
  const match = STATIONS.find((s) => s.hash === cleaned);
  return match ? match.id : 'HOME';
}

export function hashFromStation(station: StationId): string {
  return STATIONS.find((s) => s.id === station)?.hash ?? '#home';
}

function computeReadingMs(
  title: string,
  summary: string,
  highlights: string[],
): number {
  const fullText = [title, summary, ...highlights].join(' ');
  const words = fullText.trim().split(/\s+/).length;
  return Math.min(10000, Math.max(5500, 4000 + words * 70));
}

function makePod(data: Omit<DataPod, 'readingDurationMs'>): DataPod {
  return {
    ...data,
    readingDurationMs: computeReadingMs(
      data.title,
      data.summary,
      data.highlights,
    ),
  };
}

export const STATION_PODS: Record<Exclude<StationId, 'HOME'>, DataPod[]> = {
  SKILLS: [
    makePod({
      id: 'skill-programming',
      station: 'SKILLS',
      indexLabel: '01 / 04',
      category: 'Programming & Development',
      title: 'Programming & Computer Vision Stack',
      subtitle: 'Embedded Firmware, Vision Pipelines & Web Interfaces',
      summary:
        'Writing deterministic embedded firmware and real-time computer vision modules for autonomous mobile platforms and multi-axis robotics.',
      highlights: [
        'Programming Languages: Python, C++, HTML',
        'Computer Vision & Tools: OpenCV, Arduino IDE',
        'Control Logic: PID closed-loop tuning, sensor calibration, and real-time actuation',
      ],
      tags: ['Python', 'C++', 'HTML', 'OpenCV', 'Arduino IDE'],
    }),
    makePod({
      id: 'skill-cad',
      station: 'SKILLS',
      indexLabel: '02 / 04',
      category: 'CAD & Design',
      title: '3D Mechanical CAD & Hardware Prototyping',
      subtitle: 'Parametric Assemblies, Sheet Metal & Enclosure Design',
      summary:
        'Translating robotics concepts and agricultural implements into production-ready CAD assemblies, structural mounts, and educational hardware kits.',
      highlights: [
        'CAD Software: AutoCAD, CATIA V5, SolidWorks',
        'Mechanical Prototyping: Custom robot chassis, bracketry, and implement geometry',
        'Documentation: Engineering drawings and manufacturing BOM alignment',
      ],
      tags: ['AutoCAD', 'CATIA V5', 'SolidWorks'],
    }),
    makePod({
      id: 'skill-hardware',
      station: 'SKILLS',
      indexLabel: '03 / 04',
      category: 'Hardware Platforms',
      title: 'Embedded Microcontrollers & Edge Compute',
      subtitle: 'Real-Time Interfacing, Actuators & Wireless IoT Nodes',
      summary:
        'Integrating microcontrollers, single-board computers, motor drivers, and sensor arrays into field-tested autonomous systems.',
      highlights: [
        'Compute Platforms: Arduino Uno, ESP32, Raspberry Pi',
        'Motor & Servo Control: PCA9685 PWM driver, H-bridge drivers, and stepper/DC stages',
        'Sensor Integration: Optical line arrays, ultrasonic probes, and climate transducers',
      ],
      tags: ['Arduino Uno', 'ESP32', 'Raspberry Pi', 'PCA9685'],
    }),
    makePod({
      id: 'skill-domains',
      station: 'SKILLS',
      indexLabel: '04 / 04',
      category: 'Core Domains & Competencies',
      title: 'Robotics Lab Architecture & Program Leadership',
      subtitle: 'Turnkey Deployments, Curriculum & Technical Operations',
      summary:
        'End-to-end execution of institutional robotics and AI laboratories from BOQ/BOM planning and kit design to faculty training and ROI alignment.',
      highlights: [
        'Robotics Lab Design & Deployment across government and private institutions',
        'STEM Curriculum Development and Training & Workshop Management',
        'Core Engineering Domains: IoT, Automation, Embedded Systems',
        'Commercial Readiness: BOQ/BOM Preparation, Kit Design, and Project Coordination',
      ],
      tags: [
        'Lab Deployment',
        'STEM Curriculum',
        'IoT & Automation',
        'Embedded Systems',
        'BOQ/BOM',
      ],
    }),
  ],

  EXPERIENCE: [
    makePod({
      id: 'exp-neod',
      station: 'EXPERIENCE',
      indexLabel: '01 / 02',
      category: 'Leadership',
      title: 'Robotics Head',
      subtitle: 'Neod Global Pvt Ltd',
      timeframe: '09/2025 – 06/2026',
      location: 'Pune, India',
      summary:
        'Led the Robotics & AI department, managing cross-functional teams to architect institutional STEM curricula, proprietary hardware kits, and turnkey lab deployments.',
      highlights: [
        'Led Robotics & AI department and managed cross-functional engineering and training teams',
        'Developed scalable robotics, AI, and IoT curriculum for educational institutions',
        'Designed custom robotics kits and prepared technical BOQ/BOM specifications',
        'Executed government and private robotics lab deployments with partner schools and colleges',
        'Coordinated technical support alongside sales teams to deliver measurable business ROI',
      ],
      tags: ['Robotics Head', 'Neod Global', 'BOQ/BOM', 'Lab Deployments'],
    }),
    makePod({
      id: 'exp-omotech',
      station: 'EXPERIENCE',
      indexLabel: '02 / 02',
      category: 'Engineering & Training',
      title: 'Robotics Associate',
      subtitle: 'Omotech Pvt Ltd',
      timeframe: '06/2024 – 06/2025',
      location: 'Pune, India',
      summary:
        'Designed and implemented school robotics laboratories, engineered Arduino/Raspberry Pi autonomous robots, and coached teams for international robotics competitions.',
      highlights: [
        'Designed and implemented turnkey robotics labs for educational campuses',
        'Developed autonomous robots using Arduino and Raspberry Pi platforms',
        'Executed structured robotics curriculum across 15+ national and international schools',
        'Trained and mentored student teams for WRO, VEX Robotics, and Codeavour competitions',
      ],
      tags: ['Arduino', 'Raspberry Pi', '15+ Schools', 'WRO / VEX / Codeavour'],
    }),
  ],

  EDUCATION: [
    makePod({
      id: 'edu-mtech',
      station: 'EDUCATION',
      indexLabel: '01 / 03',
      category: 'Postgraduate Degree',
      title: 'M.Tech - Farm Machinery & Power Engineering',
      subtitle: 'Sam Higginbottom University of Agriculture, Technology and Sciences',
      timeframe: '2021 – 2023',
      location: 'Prayagraj, Uttar Pradesh',
      summary:
        'Postgraduate engineering specialization in mechanized agricultural implements, hydraulic power transmission, and field machinery performance evaluation.',
      highlights: [
        'Academic Performance: CGPA 7.5',
        'Research Focus: Tractor-drawn machinery design and field performance evaluation',
        'Prior Academics: HSC (12th, Aurangabad University, 2017 · 74%) & SSC (10th, Amravati University, 2015 · 84%)',
      ],
      tags: ['M.Tech', 'CGPA: 7.5', 'SHUATS Prayagraj'],
    }),
    makePod({
      id: 'edu-btech',
      station: 'EDUCATION',
      indexLabel: '02 / 03',
      category: 'Undergraduate Degree',
      title: 'B.Tech - Agricultural Engineering',
      subtitle: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth',
      timeframe: '2017 – 2021',
      location: 'Akola, Maharashtra',
      summary:
        'Four-year undergraduate engineering degree covering fluid hydraulics, mechanical systems, farm machinery, and precision irrigation engineering.',
      highlights: [
        'Academic Performance: CGPA 7.43',
        'Applied Project: Hydraulic performance analysis of drip irrigation networks',
        'Core Curriculum: CAD drafting, mechanics of machinery, and applied instrumentation',
      ],
      tags: ['B.Tech', 'CGPA: 7.43', 'PDKV Akola'],
    }),
    makePod({
      id: 'edu-certifications',
      station: 'EDUCATION',
      indexLabel: '03 / 03',
      category: 'Certifications & Training',
      title: 'Industrial Certifications & Field Training',
      subtitle: 'EV Systems, OEM Tractor Engineering & Irrigation Manufacturing',
      timeframe: '2019 – 2024',
      location: 'Kerala · Telangana · Gujarat · Maharashtra',
      summary:
        'Hands-on industrial training across electric vehicle powertrains, OEM agricultural manufacturing, and precision irrigation engineering.',
      highlights: [
        'Electric Vehicle Foundation — Techmaghi, Kerala (2024)',
        'Tractor Engineering — Mahindra & Mahindra Limited, Zahirabad (2022)',
        'Industrial Training — Paragon Irrigation Private Limited, Gujarat (2021)',
        'Farm Tractor & Agricultural Machinery — ATI, Ahmednagar (2020) & Micro-Irrigation Design — Agrinext Consultancy, Pune (2019)',
      ],
      tags: ['Techmaghi EV', 'Mahindra & Mahindra', 'Paragon Irrigation'],
    }),
  ],

  PROJECTS: [
    makePod({
      id: 'proj-edu-kits',
      station: 'PROJECTS',
      indexLabel: '01 / 07',
      category: 'Hardware Product Suite',
      title: 'Robotics & IoT Educational Kits',
      subtitle: '6 Modular STEM, Electronics & Non-Programmable Kits',
      timeframe: '2026',
      summary:
        'Engineered a standardized lineup of six educational hardware kits spanning autonomous robotics, connected IoT nodes, electronics, and non-programmable mechanics.',
      highlights: [
        'Architecture: Modular sensor-actuator carrier boards with standardized wiring harnesses',
        'Deliverables: Complete BOQ/BOM specifications, assembly documentation, and lab guides',
        'Deployment: Designed for durable multi-cohort classroom instruction and rapid fault isolation',
      ],
      tags: ['Robotics', 'IoT', 'Electronics', 'Kit Engineering'],
    }),
    makePod({
      id: 'proj-maze-solver',
      station: 'PROJECTS',
      indexLabel: '02 / 07',
      category: 'Autonomous Navigation',
      title: 'Maze Solver Robot',
      subtitle: 'PID-Based Autonomous Path Optimization',
      timeframe: '2025',
      summary:
        'Autonomous mobile robot employing closed-loop PID control and path-pruning memory to explore unknown mazes and execute shortest-path runs.',
      highlights: [
        'Control Loop: Tuned proportional-integral-derivative feedback for crisp junction alignment',
        'Path Optimization: Pruned dead-end nodes from run logs to compute shortest return trajectory',
        'Sensing: Multi-angle proximity detection for real-time wall-following and turn triggers',
      ],
      tags: ['PID Control', 'Path Optimization', 'Embedded C++'],
    }),
    makePod({
      id: 'proj-6dof-arm',
      station: 'PROJECTS',
      indexLabel: '03 / 07',
      category: 'Articulated Robotics',
      title: '6 DOF Robotic Arm',
      subtitle: 'Arduino Nano & PCA9685 Multi-Axis Servo Manipulator',
      timeframe: '2025',
      summary:
        'Six-degree-of-freedom desktop robotic manipulator utilizing an Arduino Nano and PCA9685 16-channel I2C PWM controller to coordinate multi-axis servo motion.',
      highlights: [
        'Architecture: Arduino Nano MCU communicating over I2C to PCA9685 PWM servo driver',
        'Kinematics: 6 independent rotational axes covering waist, shoulder, elbow, wrist pitch/roll, and gripper',
        'Motion Control: Synchronized joint interpolation for smooth pick-and-place waypoint execution',
      ],
      tags: ['Arduino Nano', 'PCA9685', '6-DOF Kinematics', 'Servo Actuators'],
    }),
    makePod({
      id: 'proj-line-follower',
      station: 'PROJECTS',
      indexLabel: '04 / 07',
      category: 'Mobile Robotics',
      title: 'Line Follower Robot',
      subtitle: 'Autonomous Arduino Track-Guidance Platform',
      timeframe: '2025',
      summary:
        'Autonomous Arduino-based differential-drive mobile platform designed for high-accuracy floor line tracking across curved and intersecting paths.',
      highlights: [
        'Sensing Array: Calibrated infrared optical reflectance sensor bar for line-edge detection',
        'Drive Stage: Differential PWM motor control for responsive cornering without overshoot',
        'Utility: Modular embedded testbed deployed across hands-on robotics training workshops',
      ],
      tags: ['Arduino', 'IR Array', 'Differential Drive'],
    }),
    makePod({
      id: 'proj-silk-farming',
      station: 'PROJECTS',
      indexLabel: '05 / 07',
      category: 'Agri-Tech Automation',
      title: 'Environmental Control System for Silk Farming',
      subtitle: 'Automated Sericulture Monitoring (Codeavour Competition)',
      timeframe: '2024',
      summary:
        'Automated micro-climate telemetry and actuation system built for the Codeavour competition to regulate temperature and humidity in sericulture environments.',
      highlights: [
        'Telemetry: Continuous ambient temperature and relative humidity threshold sampling',
        'Actuation: Automated fan and climate control relays triggered by biological setpoints',
        'Competition Build: Engineered as a real-world agricultural automation showcase for Codeavour',
      ],
      tags: ['Codeavour', 'Automated Monitoring', 'IoT Sensors'],
    }),
    makePod({
      id: 'proj-water-purification',
      station: 'PROJECTS',
      indexLabel: '06 / 07',
      category: 'Embedded Instrumentation',
      title: 'Smart Saline Water Purification System',
      subtitle: 'Arduino Uno, Charged Coil Electrodes & Multi-Stage Filtration',
      timeframe: '2024',
      summary:
        'Automated water desalination and treatment prototype controlled by Arduino Uno, pairing charged coil electrodes with physical multi-stage filtration.',
      highlights: [
        'Desalination Stage: Charged coil electrode assembly engineered to reduce dissolved salinity',
        'Filtration Loop: Multi-stage physical media chamber paired with Arduino Uno cycle control',
        'Application: Targeted sustainable water conditioning for agricultural and rural deployment',
      ],
      tags: ['Arduino Uno', 'Charged Electrodes', 'Filtration Systems'],
    }),
    makePod({
      id: 'proj-agri-machinery',
      station: 'PROJECTS',
      indexLabel: '07 / 07',
      category: 'Mechanical & Hydraulic Design',
      title: 'Tractor-Drawn Punching Machine & Micro-Irrigation Design',
      subtitle: 'Mulching Sheet Implement (2023) & Drip Hydraulics Analysis',
      timeframe: '2021 – 2023',
      summary:
        'Mechanical design and field performance evaluation of a tractor-drawn mulching-sheet punching implement alongside empirical hydraulic performance analysis of drip irrigation systems.',
      highlights: [
        'Mulching Implement (2023): Designed tractor-drawn rotary punching frame and evaluated field spacing efficiency',
        'Drip Irrigation Hydraulics (2021): Measured emitter discharge uniformity and pressure head-loss curves',
        'Engineering Impact: Integrated CAD design and empirical fluid/mechanical validation',
      ],
      tags: ['Agricultural Machinery', 'CAD Design', 'Hydraulic Analysis'],
    }),
  ],

  CONTACT: [
    makePod({
      id: 'contact-direct',
      station: 'CONTACT',
      indexLabel: '01 / 02',
      category: 'Direct Channels',
      title: 'Ambrish Vidhyadhar Pande',
      subtitle: 'Robotics Engineer · Pune, India',
      summary:
        'Open to robotics engineering leadership, embedded automation R&D, CAD prototyping, and turnkey institutional STEM/AI laboratory architecture.',
      highlights: [
        'Email: ambrishpande87@gmail.com',
        'Phone: +917350054296',
        'Location: Anand Nagar, Pune, Maharashtra, India',
        'Languages: English, Marathi, Hindi',
      ],
      tags: ['Pune, India', 'Robotics Engineering', 'Embedded & Automation'],
      contactAction: {
        email: 'ambrishpande87@gmail.com',
        phone: '+917350054296',
        location: 'Pune, India',
        languages: 'English · Marathi · Hindi',
        resumePdfUrl: './assets/aistudio/AMPRISH_PANDE_78c054b8.pdf',
      },
    }),
    makePod({
      id: 'contact-capabilities',
      station: 'CONTACT',
      indexLabel: '02 / 02',
      category: 'Collaboration Scope',
      title: 'Technical & Advisory Availability',
      subtitle: 'Hardware Prototyping, Lab Turnkey Delivery & Team Leadership',
      summary:
        'Available to lead cross-functional robotics engineering initiatives from initial SolidWorks/CATIA CAD design and embedded firmware through multi-site deployment.',
      highlights: [
        'Turnkey Robotics, AI & IoT Lab Design, BOQ/BOM Preparation & Commissioning',
        'Custom Educational & Industrial Hardware Kit Design (Arduino, ESP32, Raspberry Pi)',
        'Autonomous Mobile & Articulated Manipulator Systems (PID, OpenCV, PCA9685)',
        'Faculty Workshops, STEM Curriculum Design & Competition Mentoring',
      ],
      tags: ['Turnkey Labs', 'Embedded Systems', 'CAD & Prototyping'],
      contactAction: {
        email: 'ambrishpande87@gmail.com',
        phone: '+917350054296',
        location: 'Pune, India',
        languages: 'English · Marathi · Hindi',
        resumePdfUrl: './assets/aistudio/AMPRISH_PANDE_78c054b8.pdf',
      },
    }),
  ],
};
