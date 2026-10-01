import { NextRequest, NextResponse } from 'next/server';
import { queryDatabase } from '@/lib/db';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const DB_SCHEMA = `
Table: students
- id (integer)
- name (string)
- email (string)
- department (string)
- year (integer)

Table: skills
- id (integer)
- name (string)
- category (string)
- levels (integer)

Table: student_skills
- student_id (integer)
- skill_id (integer)
- level_completed (integer)
- attempts (integer)
- status (string) e.g., 'cleared', 'in-progress'
- cleared_date (date)
`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemMessage = `
You are an AI assistant that converts natural language requests into SQL queries for a PostgreSQL database.
The database schema is as follows:
${DB_SCHEMA}

Given the user's request, you must output a JSON object with exactly the following structure, and nothing else:
{
  "sql_query": "The PostgreSQL query to fetch the requested data. For 'top N students', order by level_completed DESC, attempts ASC.",
  "description": "A brief explanation of the data being presented.",
  "graph_type": "bar" | "pie" | "none" - Suggest a graph type if applicable,
  "filters": ["list", "of", "possible", "filter", "keys"]
}
Only output the JSON object. Do not include markdown formatting like \`\`\`json.
`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || '{}';
    const parsedResponse = JSON.parse(aiResponse);

    if (parsedResponse.sql_query) {
       try {
           const dbData = await queryDatabase(parsedResponse.sql_query);
           return NextResponse.json({
               success: true,
               data: dbData,
               metadata: {
                 description: parsedResponse.description,
                 graph_type: parsedResponse.graph_type,
                 filters: parsedResponse.filters
               }
           });
       } catch (dbError: any) {
           console.error("DB Execution error:", dbError);
           return NextResponse.json({ error: "Failed to execute database query", details: dbError.message }, { status: 500 });
       }
    } else {
        return NextResponse.json({ error: "No SQL query generated" }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'An error occurred processing your request', details: error.message }, { status: 500 });
  }
}
