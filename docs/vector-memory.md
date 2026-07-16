# Vector Memory Architecture

This document details semantic memory indexes, pgvector integrations, and retention.

---

## 1. Supabase pgvector Schema

```sql
create extension if not exists vector;

create table public.memories (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  embedding vector(1536), -- OpenAI standard
  metadata jsonb,
  created_at timestamp with time zone default now()
);
```

---

## 2. Similarity Search Query

We execute similarity matching using cosine distance operators:
```sql
select id, content, 1 - (embedding <=> :query_embedding) as similarity
from public.memories
where 1 - (embedding <=> :query_embedding) > :threshold
order by similarity desc
limit :lim;
```
This enables agent execution queries to retrieve long-term context files quickly.
