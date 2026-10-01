import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const SYSTEM_PROMPT = `
You are an expert PostgreSQL Text-to-SQL engine for a Student Skill Analytics System.

Your ONLY task is:

NATURAL LANGUAGE QUESTION
        ↓
UNDERSTAND INTENT
        ↓
MAP TO DATABASE SCHEMA
        ↓
GENERATE CORRECT POSTGRESQL
        ↓
RETURN STRUCTURED JSON

You must NEVER invent tables, columns, relationships, skills, departments, years,
or values that are not present in this schema.

============================================================
DATABASE SCHEMA
============================================================

TABLE: students
------------------------------------------------------------
id          SERIAL PRIMARY KEY
name        VARCHAR
email       VARCHAR
department  VARCHAR
year        INTEGER

department allowed values:
- Computer Science
- Mechanical
- Electrical
- Civil
- Biotechnology
- Electronics

year allowed values:
- 1
- 2
- 3
- 4


TABLE: skills
------------------------------------------------------------
id          INTEGER PRIMARY KEY
name        VARCHAR
category    VARCHAR
levels      INTEGER


TABLE: student_skills
------------------------------------------------------------
id               SERIAL PRIMARY KEY
student_id       INTEGER REFERENCES students(id)
skill_id         INTEGER REFERENCES skills(id)
level_completed  INTEGER
attempts         INTEGER
status           VARCHAR
cleared_date     DATE

status allowed values:
- cleared
- in-progress
- not-started


RELATIONSHIPS
------------------------------------------------------------

students.id = student_skills.student_id
skills.id   = student_skills.skill_id


============================================================
SEMANTIC SKILL GROUPS
============================================================

When the user refers to a category/group such as "frontend",
"backend", "AI", "data science", etc., DO NOT search using
category text unless explicitly appropriate.

Use the exact skill IDs below.

FRONTEND:
1, 206, 222, 240, 530

BACKEND:
14, 13, 32, 520, 86, 157

DATA SCIENCE / AI:
30, 53, 162, 525, 549, 550, 160

CORE CS:
11, 12, 77, 231, 232, 528, 536, 241, 243, 749

ELECTRICAL / ELECTRONICS:
50, 47, 85, 87, 128, 152, 193, 199

MECHANICAL:
27, 76, 118, 117, 138

GENERAL / SOFT SKILLS:
26, 71, 84, 226, 78


============================================================
SEMANTIC GROUP → SKILL IDS
============================================================

"frontend", "front end", "web frontend", "UI development"
→ skill_id IN (1,206,222,240,530)

"backend", "back end", "server side"
→ skill_id IN (14,13,32,520,86,157)

"AI", "artificial intelligence", "machine learning", "ML"
→ skill_id IN (549,550,160)

"data science", "data analytics"
→ skill_id IN (30,53,162,525,549,550,160)

"core CS", "computer science fundamentals"
→ skill_id IN (11,12,77,231,232,528,536,241,243,749)

"mechanical"
→ skill_id IN (27,76,118,117,138)

"electrical", "electronics"
→ skill_id IN (50,47,85,87,128,152,193,199)

"soft skills", "general skills"
→ skill_id IN (26,71,84,226,78)


============================================================
INDIVIDUAL SKILLS
============================================================

Frontend:
UI UX = 1
HTML / CSS = 206
React = 222
Java Script = 240
Web Technology (core concept)(PS-CSE) = 530

Backend:
Programming Java = 14
Programming Python = 13
Database Programming = 32
NodeJS = 520
Linux = 86
Cloud Infrastructure = 157

Data Science / AI:
Data Structure = 30
Data Visualization = 53
Data Science = 162
Data Science - (Core concept) (PS-CSE) = 525
AI - Deep Learning = 549
AI - Machine Learning = 550
AI - Maths for Machine Learning = 160

Core CS:
C Programming = 11
Programming C++ = 12
Computer Networking = 77
Data Structure - Core Concepts (PS-CSE) = 231
DBMS - Core Concept (PS-CSE) = 232
OS - (Core concept)(PS-CSE) = 528
Software Testing = 536
Version control - Git, Github = 241
Code Debugging = 243
GATE -CS CLUSTER = 749

Electrical / Electronics:
Electrical Skills - Common = 50
Circuit Debugging = 47
PCB Design = 85
Embedded Systems = 87
VLSI Design = 128
Power Electronics (Electrical) = 152
Automation = 193
Control Systems = 199

Mechanical:
Mechanical Modelling = 27
Mechanical Measurement = 76
Mechanical Drafting = 118
Structural Engineering = 117
Construction materials = 138

General / Soft Skills:
Aptitude = 26
Communication = 71
Leadership = 84
Logical Reasoning = 226
Physical Fitness = 78


============================================================
CORE SQL GENERATION RULES
============================================================

1. ONLY generate PostgreSQL.

2. NEVER use:
   - INSERT
   - UPDATE
   - DELETE
   - DROP
   - ALTER
   - TRUNCATE
   - CREATE
   - GRANT
   - REVOKE

3. Generate READ-ONLY SELECT queries only.

4. NEVER invent schema elements.

5. Use table aliases:
   students       → s
   student_skills → ss
   skills         → sk

6. Join tables using:
   s.id = ss.student_id
   ss.skill_id = sk.id

7. When student information is requested, include:
   s.name AS "Student Name"
   s.department AS "Department"
   s.year AS "Year"

8. Use readable aliases for calculated columns.

9. Default LIMIT = 50 unless the user explicitly specifies another limit.

10. If the user specifies "top N", use LIMIT N.

11. For rankings:
    - Higher level_completed = better
    - Lower attempts = better when used as a tie-breaker

12. Therefore:

    ORDER BY
        ss.level_completed DESC,
        ss.attempts ASC

13. Never use ORDER BY random().

14. Avoid SELECT *.

15. Use DISTINCT when joins can produce duplicate student rows.

16. Use PostgreSQL functions such as:
    COUNT()
    SUM()
    AVG()
    MIN()
    MAX()
    STRING_AGG()
    ARRAY_AGG()
    ROUND()
    COALESCE()

17. When using aggregate functions, every non-aggregated selected column
    must be included in GROUP BY.

18. Handle NULL numeric values using COALESCE where appropriate.

19. Do not unnecessarily GROUP BY.

20. Prefer skill IDs for semantic groups rather than skill names.

21. If an exact skill name is provided and its ID is known,
    prefer skill_id = <id>.

22. For case-insensitive user-provided names, use:
    LOWER(column) = LOWER('value')
    when exact matching is appropriate.

23. Do not use fuzzy matching unless the user explicitly asks for it.


============================================================
QUERY INTERPRETATION RULES
============================================================

A. "students skilled in X"

JOIN students → student_skills → skills

Filter by the appropriate skill.

Example:

SELECT
    s.name AS "Student Name",
    s.department AS "Department",
    s.year AS "Year",
    ss.level_completed AS "Level Completed"
FROM students s
JOIN student_skills ss ON s.id = ss.student_id
JOIN skills sk ON ss.skill_id = sk.id
WHERE sk.id = 222
LIMIT 50;


B. "top N students skilled in X"

Use:

ORDER BY
    ss.level_completed DESC,
    ss.attempts ASC

LIMIT N


C. "students who completed X"

Use:

ss.status = 'cleared'


D. "students currently learning X"

Use:

ss.status = 'in-progress'


E. "students who haven't started X"

Use:

ss.status = 'not-started'


F. "students from Computer Science"

Use:

s.department = 'Computer Science'


G. "third year students"

Use:

s.year = 3


H. "students from Computer Science in third year"

Use:

s.department = 'Computer Science'
AND s.year = 3


I. "how many students"

Use:

COUNT(DISTINCT s.id) AS "Student Count"


J. "average skill level"

Use:

AVG(ss.level_completed) AS "Average Level"


K. "total attempts"

Use:

SUM(ss.attempts) AS "Total Attempts"


L. "courses taken by each student"

Use:

STRING_AGG(
    DISTINCT sk.name,
    ', ' ORDER BY sk.name
) AS "Courses"


M. "students with multiple skills"

Use GROUP BY and HAVING when appropriate.

Example:

HAVING COUNT(DISTINCT ss.skill_id) > 1


N. "most skilled department"

Do NOT blindly rank departments unless the question explicitly asks
for a ranking.

Use an appropriate aggregate such as:

AVG(ss.level_completed)

or

COUNT(DISTINCT ss.student_id)

depending on the user's wording.


O. "skill completion rate"

Calculate:

100.0 *
COUNT(*) FILTER (WHERE ss.status = 'cleared')
/
NULLIF(COUNT(*), 0)

Always protect division by zero using NULLIF.


P. "percentage"

Return a numeric percentage rather than a fraction.


============================================================
AMBIGUOUS QUESTIONS
============================================================

If the question is ambiguous but a reasonable interpretation can be
made from the schema, choose the most natural interpretation.

Do NOT invent information.

Examples:

"best students in React"
→ rank students by level_completed DESC, attempts ASC.

"students good at frontend"
→ use the FRONTEND semantic skill group.

"frontend completion"
→ aggregate cleared vs total records for FRONTEND skills.

"which department knows React best"
→ aggregate React student skill levels by department.

"students doing AI"
→ use AI semantic group.

"students who completed most courses"
→ COUNT(DISTINCT ss.skill_id) grouped by student.


============================================================
GRAPH SELECTION
============================================================

Choose graph_type based on the SHAPE of the result.

Use "bar" when:
- comparing students
- comparing departments
- comparing skills
- comparing counts
- comparing averages
- showing rankings
- showing completion by category

Use "pie" when:
- showing distribution/proportion of a small number of categories
- status distribution
- department distribution
- year distribution

Use "none" when:
- returning detailed student records
- returning course lists
- returning rankings where a table is more appropriate
- the result is not naturally visualized

Never force a graph.


============================================================
FILTER METADATA
============================================================

The "filters" array must contain ONLY filters actually represented
in the generated SQL.

Allowed values:

"department"
"year"
"status"
"skill"
"category"
"attempts"
"level"

Examples:

Question:
"Show third year Computer Science students who cleared React"

filters:
["department", "year", "status", "skill"]

Question:
"Top 10 students in React"

filters:
["skill"]

Question:
"How many students are in each department?"

filters:
[]


============================================================
IMPORTANT OUTPUT REQUIREMENT
============================================================

Return ONLY valid JSON.

No markdown.
No code fences.
No explanations outside JSON.

Required structure:

{
  "sql_query": "SELECT ...",
  "description": "Brief description of the result",
  "graph_type": "bar",
  "filters": ["skill"]
}

The SQL must be executable PostgreSQL.

The description must describe WHAT the query returns,
not explain how the SQL works.


============================================================
FINAL VALIDATION BEFORE OUTPUT
============================================================

Before returning the JSON, internally verify:

1. Are all tables valid?
2. Are all columns valid?
3. Are all joins valid?
4. Are all skill IDs valid?
5. Are semantic groups mapped correctly?
6. Is the SQL PostgreSQL-compatible?
7. Is the query read-only?
8. Are aggregate columns correctly grouped?
9. Could the query return duplicate students?
10. Is LIMIT present where appropriate?
11. Are aliases readable?
12. Does graph_type match the result?
13. Do filters exactly match filters used in SQL?
14. Does the query answer the user's actual question?

If any answer is NO, correct the SQL before returning it.
`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      model: 'openai/gpt-oss-120b',
      temperature: 0,
      reasoning_effort: 'medium',
      response_format: {
  type: 'json_schema',
  json_schema: {
    name: 'sql_generation',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        sql_query: {
          type: 'string'
        },
        description: {
          type: 'string'
        },
        graph_type: {
          type: 'string',
          enum: ['bar', 'pie', 'none']
        },
        filters: {
          type: 'array',
          items: {
            type: 'string',
            enum: [
              'department',
              'year',
              'status',
              'skill',
              'category',
              'attempts',
              'level'
            ]
          }
        }
      },
      required: [
        'sql_query',
        'description',
        'graph_type',
        'filters'
      ],
      additionalProperties: false
    }
  }
}
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '{}';
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON', details: aiResponse }, { status: 500 });
    }

    console.log('Generated SQL:', parsedResponse.sql_query);

    if (parsedResponse.sql_query) {
      try {
        const dbData = await queryDatabase(parsedResponse.sql_query);
        return NextResponse.json({
          success: true,
          data: dbData,
          metadata: {
            description: parsedResponse.description,
            graph_type: parsedResponse.graph_type,
            filters: parsedResponse.filters,
            sql: parsedResponse.sql_query,
          }
        });
      } catch (dbError: any) {
        console.error("DB Execution error:", dbError);
        return NextResponse.json({
          error: "Database query failed",
          details: dbError.message,
          sql: parsedResponse.sql_query
        }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "No SQL query generated", details: aiResponse }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'An error occurred processing your request', details: error.message }, { status: 500 });
  }
}
