# Working Context

Version: 1.0.0

Status: Draft

Phase: Runtime

---

# Purpose

The Working Context contains all information required by an Employee to complete an Assignment.

It is the single source of truth for the current Assignment.

Employees shall not rely on hidden context or assumptions.

---

# Objectives

The Working Context shall:

• Provide complete Assignment information

• Minimize unnecessary information

• Ensure reproducibility

• Maintain traceability

• Reduce hallucinations

• Standardize Employee execution

---

# Components

Every Working Context contains:

Project

Assignment

Objective

Current Artifact

Dependencies

Relevant Assets

Relevant Knowledge

Applicable VES

Applicable Company Policies

Previous Reviews

Related Decisions

Constraints

Acceptance Criteria

Priority

Deadline (optional)

Additional Instructions

---

# Runtime Structure

Working Context

├── Project

├── Assignment

├── Objective

├── Constraints

├── Assets

├── Knowledge

├── Standards

├── Reviews

├── Decisions

├── Artifact

└── Metadata

---

# Lifecycle

Created

↓

Assigned

↓

Updated

↓

Consumed

↓

Archived

---

# Rules

Working Context shall:

• Be version controlled

• Be immutable once assigned

• Produce a new version after updates

• Reference only approved Assets

• Maintain complete traceability

---

# Data Model

context_id

project_id

assignment_id

employee_id

artifact_id

objective

constraints

acceptance_criteria

priority

deadline

status

version

created_at

updated_at

---

# Relationships

Assignment

↓

Working Context

↓

Employee

↓

Artifact

↓

Review

---

# Summary

The Working Context is the operational package that enables an Employee to execute an Assignment consistently, reproducibly, and in compliance with organizational standards.