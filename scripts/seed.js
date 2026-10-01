const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const courseList = [
  {"id":1,"name":"UI UX","category":"Software","levels":5},
  {"id":11,"name":"C Programming","category":"Software","levels":7},
  {"id":12,"name":"Programming C++","category":"Software","levels":10},
  {"id":13,"name":"Programming Python","category":"Software","levels":6},
  {"id":14,"name":"Programming Java","category":"Software","levels":5},
  {"id":26,"name":"Aptitude","category":"GENERAL Skill","levels":14},
  {"id":27,"name":"Mechanical Modelling","category":"Hardware","levels":11},
  {"id":28,"name":"Biochemical Stoichiometry & Biostatistics","category":"Hardware","levels":6},
  {"id":29,"name":"Culturing and Molecular Techniques","category":"Hardware","levels":5},
  {"id":30,"name":"Data Structure","category":"Software","levels":11},
  {"id":32,"name":"Database Programming","category":"Software","levels":7},
  {"id":47,"name":"Circuit Debugging","category":"Hardware","levels":8},
  {"id":50,"name":"Electrical Skills - Common","category":"Hardware","levels":13},
  {"id":52,"name":"Problem Solving Skills - Daily Challenge","category":"GENERAL Skill","levels":1},
  {"id":53,"name":"Data Visualization","category":"Software","levels":3},
  {"id":56,"name":"New Product Development and Innovations","category":"GENERAL Skill","levels":4},
  {"id":70,"name":"General Engineering","category":"GENERAL Skill","levels":1},
  {"id":71,"name":"Communication","category":"GENERAL Skill","levels":3},
  {"id":76,"name":"Mechanical Measurement","category":"Hardware","levels":7},
  {"id":77,"name":"Computer Networking","category":"Software","levels":6},
  {"id":78,"name":"Physical Fitness","category":"GENERAL Skill","levels":4},
  {"id":79,"name":"Irrigation Engineering","category":"Hardware","levels":6},
  {"id":84,"name":"Leadership","category":"GENERAL Skill","levels":4},
  {"id":85,"name":"PCB Design","category":"Hardware","levels":7},
  {"id":86,"name":"Linux","category":"Software","levels":5},
  {"id":87,"name":"Embedded Systems","category":"Hardware","levels":8},
  {"id":117,"name":"Structural Engineering","category":"Hardware","levels":10},
  {"id":118,"name":"Mechanical Drafting","category":"Hardware","levels":3},
  {"id":119,"name":"Learning Center","category":"GENERAL Skill","levels":4},
  {"id":124,"name":"IPR - Patent Search","category":"GENERAL Skill","levels":2},
  {"id":125,"name":"TRIZ","category":"GENERAL Skill","levels":1},
  {"id":126,"name":"Bioinformatics and Data Science","category":"Hardware","levels":8},
  {"id":127,"name":"Bioinstrumentation","category":"Hardware","levels":6},
  {"id":128,"name":"VLSI Design","category":"Hardware","levels":8},
  {"id":129,"name":"Bioprocess Technology","category":"Hardware","levels":3},
  {"id":130,"name":"Tissue Culturing","category":"Hardware","levels":4},
  {"id":131,"name":"Regulatory Affairs and Drug Applications Fillings","category":"Hardware","levels":2},
  {"id":132,"name":"Biological Manuscript and Reference Management","category":"Hardware","levels":2},
  {"id":138,"name":"Construction materials","category":"Hardware","levels":10},
  {"id":144,"name":"Professional Networking skills","category":"Hardware","levels":1},
  {"id":149,"name":"IPR","category":"GENERAL Skill","levels":1},
  {"id":152,"name":"Power Electronics (Electrical)","category":"Hardware","levels":17},
  {"id":156,"name":"System Administration","category":"Hardware","levels":4},
  {"id":157,"name":"Cloud Infrastructure","category":"Software","levels":6},
  {"id":160,"name":"AI - Maths for Machine Learning","category":"Software","levels":1},
  {"id":162,"name":"Data Science","category":"Software","levels":3},
  {"id":163,"name":"Food Processing and Preservation Technology","category":"Hardware","levels":3},
  {"id":176,"name":"Industrial Automation (Electrical)","category":"Hardware","levels":4},
  {"id":177,"name":"Analog Electronics - Mock Test","category":"Hardware","levels":25},
  {"id":179,"name":"PLC - Gurugulam Assessment","category":"Hardware","levels":5},
  {"id":180,"name":"Electronics - Gurugulam Assessment","category":"Hardware","levels":5},
  {"id":181,"name":"Electrical Wiring - Gurugulam Assessment","category":"Hardware","levels":5},
  {"id":182,"name":"Welding - Gurugulam Assessment","category":"Hardware","levels":4},
  {"id":185,"name":"Assembly and Dismantling - Gurugulam Assessment","category":"Hardware","levels":3},
  {"id":186,"name":"Prototype - Gurugulam Assessment","category":"Hardware","levels":3},
  {"id":189,"name":"Food chemistry and nutrition","category":"Hardware","levels":2},
  {"id":190,"name":"Food Microbiology and Safety","category":"Hardware","levels":2},
  {"id":191,"name":"Food laws, Quality Control and Packaging","category":"Hardware","levels":2},
  {"id":193,"name":"Automation","category":"Hardware","levels":8},
  {"id":197,"name":"Electronics (Electrical Domain) - First Year","category":"Hardware","levels":10},
  {"id":199,"name":"Control Systems","category":"Hardware","levels":2},
  {"id":201,"name":"Algebra","category":"GENERAL Skill","levels":3},
  {"id":202,"name":"GP Challenge","category":"GENERAL Skill","levels":2},
  {"id":206,"name":"HTML / CSS","category":"Software","levels":1},
  {"id":208,"name":"Electrical Skills - Monthly Challenge","category":"Hardware","levels":1},
  {"id":211,"name":"Physical Fitness - Yoga","category":"GENERAL Skill","levels":2},
  {"id":212,"name":"Autonomy Affairs - Regulations","category":"GENERAL Skill","levels":1},
  {"id":216,"name":"Performance Improvement Program - PIP","category":"GENERAL Skill","levels":1},
  {"id":219,"name":"II Year Course Question Bank","category":"GENERAL Skill","levels":1},
  {"id":222,"name":"React","category":"Advanced","levels":1},
  {"id":226,"name":"Logical Reasoning","category":"GENERAL Skill","levels":8},
  {"id":231,"name":"Data Structure - Core Concepts (PS-CSE)","category":"Beginner","levels":3},
  {"id":232,"name":"DBMS - Core Concept (PS-CSE)","category":"Beginner","levels":3},
  {"id":240,"name":"Java Script","category":"Beginner","levels":1},
  {"id":241,"name":"Version control - Git, Github","category":"Advanced","levels":1},
  {"id":243,"name":"Code Debugging","category":"Beginner","levels":2},
  {"id":465,"name":"Advanced Modelling & Simulation","category":"Advanced","levels":2},
  {"id":507,"name":"Calculus","category":"Beginner","levels":1},
  {"id":508,"name":"Differential Equations","category":"Beginner","levels":1},
  {"id":520,"name":"NodeJS","category":"Advanced","levels":1},
  {"id":522,"name":"CyberSecurity - Level 1","category":"Beginner","levels":1},
  {"id":523,"name":"Materials and Manufacturing","category":"Beginner","levels":3},
  {"id":525,"name":"Data Science - (Core concept) (PS-CSE)","category":"Beginner","levels":3},
  {"id":526,"name":"Networks - (Core Concepts) (PS-CSE)","category":"Beginner","levels":3},
  {"id":528,"name":"OS - (Core concept)(PS-CSE)","category":"Beginner","levels":3},
  {"id":530,"name":"Web Technology (core concept)(PS-CSE)","category":"Beginner","levels":3},
  {"id":533,"name":"GP Challenge 2026","category":"Beginner","levels":1},
  {"id":536,"name":"Software Testing","category":"Software","levels":3},
  {"id":542,"name":"Storage","category":"Beginner","levels":2},
  {"id":543,"name":"Backup","category":"Beginner","levels":2},
  {"id":549,"name":"AI - Deep Learning","category":"Beginner","levels":2},
  {"id":550,"name":"AI - Machine Learning","category":"Beginner","levels":2},
  {"id":554,"name":"GP Challenge - July 2026","category":"Beginner","levels":1},
  {"id":654,"name":"C Programming MCQ","category":"Beginner","levels":1},
  {"id":747,"name":"GATE - BIO TECHNOLOGY","category":"Beginner","levels":16},
  {"id":748,"name":"Gate EEE","category":"Beginner","levels":6},
  {"id":749,"name":"GATE -CS CLUSTER","category":"Beginner","levels":7},
  {"id":825,"name":"Student Counselling","category":"Beginner","levels":1},
  {"id":826,"name":"Computational Thinking","category":"Beginner","levels":8}
];

const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Biotechnology', 'Electronics'];
const years = [1, 2, 3, 4];

const firstNames = [
  'Aarav','Aditi','Akash','Ananya','Arjun','Bhavya','Chetan','Deepa','Divya','Esha',
  'Farhan','Gauri','Harsh','Isha','Jatin','Kavya','Lakshmi','Manish','Neha','Omkar',
  'Priya','Rahul','Sakshi','Tanvi','Uday','Varun','Waris','Yash','Zara','Aditya',
  'Bharat','Charu','Daksh','Ekta','Faisal','Gita','Hemant','Indu','Jayesh','Kriti',
  'Lalit','Meera','Nitin','Pooja','Ravi','Suman','Tushar','Uma','Vinod','Wasim'
];
const lastNames = [
  'Sharma','Patel','Kumar','Singh','Reddy','Nair','Gupta','Joshi','Menon','Rao',
  'Iyer','Verma','Chopra','Das','Bhat','Pillai','Mishra','Agarwal','Chauhan','Desai',
  'Shah','Kapoor','Malhotra','Banerjee','Ghosh','Mukherjee','Sen','Pandey','Dubey','Trivedi'
];

// Map skills to semantic groups so students get realistic skill sets
const frontendSkillIds = [1, 206, 222, 240, 530]; // UI UX, HTML/CSS, React, JavaScript, Web Tech
const backendSkillIds = [14, 13, 32, 520, 86, 157]; // Java, Python, DB Programming, NodeJS, Linux, Cloud
const dsSkillIds = [30, 53, 162, 525, 549, 550, 160]; // Data Structure, Data Viz, Data Science, DS core, DL, ML, AI Maths
const coreCSSkillIds = [11, 12, 77, 231, 232, 526, 528, 536, 241, 243, 749]; // C, C++, Networking, DS core, DBMS core, Networks core, OS core, Testing, Git, Debugging, GATE CS
const electricalSkillIds = [50, 47, 85, 87, 128, 152, 176, 177, 180, 181, 193, 197, 199, 748]; // Electrical
const mechanicalSkillIds = [27, 76, 118, 138, 117, 179, 182, 185, 186, 465, 523]; // Mechanical
const bioSkillIds = [28, 29, 126, 127, 129, 130, 131, 132, 163, 189, 190, 191, 747]; // Bio
const generalSkillIds = [26, 52, 56, 70, 71, 78, 84, 119, 124, 125, 149, 201, 202, 211, 212, 216, 219, 226, 507, 508, 522, 533, 554, 825, 826]; // General

// Department to relevant skill groups
const deptSkillMap = {
  'Computer Science': [frontendSkillIds, backendSkillIds, dsSkillIds, coreCSSkillIds, generalSkillIds],
  'Electronics': [electricalSkillIds, coreCSSkillIds, backendSkillIds, generalSkillIds],
  'Electrical': [electricalSkillIds, generalSkillIds],
  'Mechanical': [mechanicalSkillIds, generalSkillIds],
  'Civil': [mechanicalSkillIds, generalSkillIds],
  'Biotechnology': [bioSkillIds, generalSkillIds],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Dropping existing tables...");
    await pool.query(`
      DROP TABLE IF EXISTS student_skills CASCADE;
      DROP TABLE IF EXISTS skills CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
    `);

    console.log("Creating tables...");
    await pool.query(`
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        department VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL
      );

      CREATE TABLE skills (
        id INTEGER PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        levels INTEGER NOT NULL
      );

      CREATE TABLE student_skills (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        skill_id INTEGER REFERENCES skills(id) ON DELETE CASCADE,
        level_completed INTEGER NOT NULL DEFAULT 0,
        attempts INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'not-started',
        cleared_date DATE,
        UNIQUE(student_id, skill_id)
      );

      CREATE INDEX idx_ss_student ON student_skills(student_id);
      CREATE INDEX idx_ss_skill ON student_skills(skill_id);
      CREATE INDEX idx_ss_status ON student_skills(status);
      CREATE INDEX idx_students_dept ON students(department);
      CREATE INDEX idx_students_year ON students(year);
    `);

    // Insert all skills
    console.log("Inserting " + courseList.length + " skills...");
    for (const course of courseList) {
      await pool.query(
        'INSERT INTO skills (id, name, category, levels) VALUES ($1, $2, $3, $4)',
        [course.id, course.name, course.category, course.levels]
      );
    }

    // Generate 500 students
    const totalStudents = 500;
    console.log("Generating " + totalStudents + " students with realistic skill assignments...");

    for (let i = 1; i <= totalStudents; i++) {
      const firstName = pickRandom(firstNames);
      const lastName = pickRandom(lastNames);
      const name = firstName + ' ' + lastName;
      const dept = pickRandom(departments);
      const year = pickRandom(years);
      const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + i + '@psgtech.edu';

      await pool.query(
        'INSERT INTO students (name, email, department, year) VALUES ($1, $2, $3, $4)',
        [name, email, dept, year]
      );

      // Pick skill groups relevant to this department
      const relevantGroups = deptSkillMap[dept] || [generalSkillIds];
      const assignedSkillIds = new Set();

      // From each relevant group, pick 1-3 skills
      for (const group of relevantGroups) {
        const count = Math.floor(Math.random() * 3) + 1;
        const picked = pickRandomN(group, count);
        picked.forEach(id => assignedSkillIds.add(id));
      }

      // Also add 1-2 random general skills
      pickRandomN(generalSkillIds, 2).forEach(id => assignedSkillIds.add(id));

      // Insert student_skills
      for (const skillId of assignedSkillIds) {
        const course = courseList.find(c => c.id === skillId);
        if (!course) continue;

        // Higher year students tend to have more levels completed
        const maxPossible = course.levels;
        const yearBonus = (year - 1) * 0.15; // 0, 0.15, 0.30, 0.45
        const completionRate = Math.min(1, Math.random() * 0.6 + yearBonus);
        const levelsCompleted = Math.floor(maxPossible * completionRate);

        let status = 'not-started';
        if (levelsCompleted === maxPossible) status = 'cleared';
        else if (levelsCompleted > 0) status = 'in-progress';

        const attempts = levelsCompleted > 0
          ? levelsCompleted + Math.floor(Math.random() * (levelsCompleted * 0.5 + 1))
          : 0;

        let clearedDate = null;
        if (levelsCompleted > 0) {
          const daysAgo = Math.floor(Math.random() * 730); // up to 2 years ago
          const d = new Date();
          d.setDate(d.getDate() - daysAgo);
          clearedDate = d.toISOString().split('T')[0];
        }

        await pool.query(
          'INSERT INTO student_skills (student_id, skill_id, level_completed, attempts, status, cleared_date) VALUES ($1, $2, $3, $4, $5, $6)',
          [i, skillId, levelsCompleted, attempts, status, clearedDate]
        );
      }

      if (i % 50 === 0) console.log("  ... " + i + "/" + totalStudents + " students done");
    }

    // Print summary
    const studentCount = await pool.query('SELECT COUNT(*) FROM students');
    const skillCount = await pool.query('SELECT COUNT(*) FROM skills');
    const ssCount = await pool.query('SELECT COUNT(*) FROM student_skills');
    console.log("\n=== Seed Complete ===");
    console.log("Students: " + studentCount.rows[0].count);
    console.log("Skills: " + skillCount.rows[0].count);
    console.log("Student-Skill records: " + ssCount.rows[0].count);

  } catch (err) {
    console.error("Error seeding DB:", err);
  } finally {
    await pool.end();
  }
}

seed();
