### Jobs

**Framework: NestJS**
**Databases:**
- Unstructured Jobs (NoSQL)
- Structured Jobs (SQL)
- Structured Jobs to ATS (Redis)

**Functionalities:**
- Process unstructured jobs and save to structured jobs DB and Redis.
- Cronjob to check and process new unstructured jobs.
- Fire event to ATS after finishing insertion of structured jobs.
- Handle event to create structured job manually with custom filters.
- Get job details by ID.
