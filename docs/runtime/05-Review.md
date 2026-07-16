# Review

Version: 1.0.0

Status: Draft

Phase: Runtime

---

# Purpose

A Review evaluates an Artifact against organizational standards, requirements, and Project objectives.

Reviews provide objective evidence for Board decisions.

Reviews do not approve work.

Boards approve work.

---

# Review Types

Brutal Review

Compliance Review

Executive Review

---

# Review Components

Every Review contains:

Review ID

Artifact

Reviewer

Review Type

Findings

Evidence

Recommendations

Score

Decision Recommendation

Timestamp

---

# Review Lifecycle

Requested

↓

Assigned

↓

In Progress

↓

Completed

↓

Submitted

↓

Board Evaluation

---

# Findings

Every finding shall contain:

Title

Description

Severity

Evidence

Recommendation

Status

---

# Severity

Critical

High

Medium

Low

Informational

---

# Rules

Reviews shall:

• Evaluate Artifacts objectively

• Reference evidence

• Maintain traceability

• Record all findings

• Preserve history

• Remain immutable after submission

---

# Relationships

Artifact

↓

Review

↓

Board

↓

Decision

---

# Data Model

review_id

artifact_id

reviewer_id

review_type

status

score

recommendation

created_at

completed_at

---

# Summary

Reviews provide structured, evidence-based evaluations of Artifacts and form the basis for organizational decision-making.