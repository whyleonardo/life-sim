# Triage Labels

Five canonical labels used by the `triage` skill:

| Label | Meaning |
|---|---|
| `needs-triage` | Maintainer needs to evaluate |
| `needs-info` | Waiting on reporter for more information |
| `ready-for-agent` | Fully specified, an AFK agent can pick it up |
| `ready-for-human` | Needs human implementation |
| `wontfix` | Will not be actioned |

These labels must exist in the GitHub repository. Create them with:

```bash
gh label create needs-triage --description "Needs maintainer evaluation" --color FBCA04
gh label create needs-info --description "Waiting on reporter" --color D93F0B
gh label create ready-for-agent --description "Fully specified, agent-ready" --color BFD4F2
gh label create ready-for-human --description "Needs human implementation" --color C5DEF5
gh label create wontfix --description "Will not be actioned" --color FFFFFF
```