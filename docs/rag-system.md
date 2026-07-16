# Retrieval-Augmented Generation (RAG) System

This document outlines context compilation, document chunking, and similarity ranking.

---

## 1. Context Assembly Pipeline

Before sending prompts to the LLM:
1. Parse task keyword tokens.
2. Query episodic log timelines and semantic memory definitions.
3. Fetch relevant database entries from Supabase.
4. Construct a unified prompt context.

```
[Prerequisite Documents] + [Episodic Logs] + [User Prompt] → [LLM Context Window]
```
This guarantees agent answers are grounded in real runtime parameters.
