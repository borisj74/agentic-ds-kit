# Security policy

## Reporting a vulnerability

Please report security problems privately through GitHub: open the repository's **Security** tab and choose **Report a vulnerability** ([direct link](https://github.com/borisj74/agentic-ds-kit/security/advisories/new)).

Don't open a public issue, pull request or discussion for a security problem.

Include:

- what the problem is and where (package version, file or component)
- steps to reproduce, or a proof of concept
- the impact you expect

We aim to reply within 7 days and to agree a disclosure date with you once a fix is ready.

## Supported versions

Fixes go into the latest published version of `agentic-ds-kit`. Please upgrade before reporting:

```bash
npm install agentic-ds-kit@latest
```

## Scope

In scope: the `agentic-ds-kit` package (components, CLI, MCP server) and this repository's code. The CLI and MCP server only read the installed package's files; a way to make them read or write elsewhere is in scope.
