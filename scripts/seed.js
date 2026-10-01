const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const courseList = [{"id":1,"name":"UI UX","category":"Software","levels":5},{"id":11,"name":"C Programming","category":"Software","levels":7},{"id":12,"name":"Programming C++","category":"Software","levels":10},{"id":13,"name":"Programming Python","category":"Software","levels":6},{"id":14,"name":"Programming Java","category":"Software","levels":5},{"id":26,"name":"Aptitude","category":"GENERAL Skill","levels":14},{"id":27,"name":"Mechanical Modelling","category":"Hardware","levels":11},{"id":30,"name":"Data Structure","category":"Software","levels":11},{"id":32,"name":"Database Programming","category":"Software","levels":7},{"id":50,"name":"Electrical Skills - Common","category":"Hardware","levels":13},{"id":53,"name":"Data Visualization","category":"Software","levels":3},{"id":71,"name":"Communication","category":"GENERAL Skill","levels":3},{"id":77,"name":"Computer Networking","category":"Software","levels":6},{"id":86,"name":"Linux","category":"Software","levels":5},{"id":87,"name":"Embedded Systems","category":"Hardware","levels":8},{"id":117,"name":"Structural Engineering","category":"Hardware","levels":10},{"id":128,"name":"VLSI Design","category":"Hardware","levels":8},{"id":157,"name":"Cloud Infrastructure","category":"Software","levels":6},{"id":162,"name":"Data Science","category":"Software","levels":3}];

const departments = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Biotechnology', 'Electronics'];
const firstNames = ['John', 'Jane', 'Alex', 'Emily', 'Chris', 'Katie', 'Mike', 'Sarah', 'David', 'Laura', 'Robert', 'Emma', 'Daniel', 'Olivia', 'James', 'Sophia', 'William', 'Isabella', 'Joseph', 'Mia'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Dropping existing tables (if any)...");
    await pool.query(`
      DROP TABLE IF EXISTS student_skills;
      DROP TABLE IF EXISTS skills;
      DROP TABLE IF EXISTS students;
    `);

    console.log("Creating tables...");
    await pool.query(`
      CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100),
        department VARCHAR(100),
        year INTEGER
      );

      CREATE TABLE skills (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100),
        category VARCHAR(100),
        levels INTEGER
      );

      CREATE TABLE student_skills (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        skill_id INTEGER REFERENCES skills(id),
        level_completed INTEGER,
        attempts INTEGER,
        status VARCHAR(50),
        cleared_date DATE
      );
    `);

    console.log("Inserting skills...");
    for (const course of courseList) {
      await pool.query(
        'INSERT INTO skills (id, name, category, levels) VALUES ($1, $2, $3, $4)',
        [course.id, course.name, course.category, course.levels]
      );
    }

    console.log("Generating 200 synthetic students...");
    for (let i = 1; i <= 200; i++) {
      const name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
      const email = `${name.replace(' ', '.').toLowerCase()}${i}@example.com`;
      const dept = departments[Math.floor(Math.random() * departments.length)];
      const year = Math.floor(Math.random() * 4) + 1; // 1 to 4

      await pool.query(
        'INSERT INTO students (name, email, department, year) VALUES ($1, $2, $3, $4)',
        [name, email, dept, year]
      );

      // Give each student 2 to 6 random skills
      const numSkills = Math.floor(Math.random() * 5) + 2;
      const assignedSkills = new Set();
      
      for (let j = 0; j < numSkills; j++) {
        const randomCourse = courseList[Math.floor(Math.random() * courseList.length)];
        
        if (!assignedSkills.has(randomCourse.id)) {
          assignedSkills.add(randomCourse.id);
          
          const levelsCompleted = Math.floor(Math.random() * (randomCourse.levels + 1));
          const status = levelsCompleted === randomCourse.levels ? 'cleared' : (levelsCompleted > 0 ? 'in-progress' : 'started');
          const attempts = levelsCompleted > 0 ? levelsCompleted + Math.floor(Math.random() * 3) : 0;
          
          // Generate a random date in the past year if cleared or in-progress
          let clearedDate = null;
          if (levelsCompleted > 0) {
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 365));
            clearedDate = date.toISOString().split('T')[0];
          }

          await pool.query(
            'INSERT INTO student_skills (student_id, skill_id, level_completed, attempts, status, cleared_date) VALUES ($1, $2, $3, $4, $5, $6)',
            [i, randomCourse.id, levelsCompleted, attempts, status, clearedDate]
          );
        }
      }
    }

    console.log("Successfully seeded database!");
  } catch (err) {
    console.error("Error seeding DB:", err);
  } finally {
    await pool.end();
  }
}

seed();
