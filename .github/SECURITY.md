# Security Policy

## Supported Versions

Security fixes are applied to the current `main` branch.

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Email **piotr@sobiecki.org** with a description, affected URL or code path,
and steps to reproduce. Please allow reasonable time for a fix before public
disclosure. Do not include real visitors' personal data or active credentials.

## What to Report

- Exposure of contact-form submissions or visitors' personal data
- Contact-form abuse, CAPTCHA bypasses, or email/header injection
- Cross-site scripting, request forgery, or unsafe handling of user input
- Secrets exposed in source code, client bundles, or logs
- Vulnerable dependencies or insecure Next.js/server configuration

## Response

We aim to acknowledge reports within 48 hours, provide an initial assessment
within one week, and release a fix as soon as practical.

## Security Best Practices for Contributors

- Never commit secrets, API keys, or credentials.
- Keep sensitive configuration in server-side environment variables.
- Validate user input and CAPTCHA responses on the server.
- Avoid logging contact-form contents or other personal data.
- Run lint, typecheck, and a production build before merging changes.
