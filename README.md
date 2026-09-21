# CorpBench Work

[![Validate public data](https://github.com/RevensiAI/CorpBench/actions/workflows/validate.yml/badge.svg)](https://github.com/RevensiAI/CorpBench/actions/workflows/validate.yml)
[![Apache-2.0 license](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Hugging Face dataset](https://img.shields.io/badge/Hugging%20Face-dataset-yellow.svg)](https://huggingface.co/datasets/revensi/CorpBench)

CorpBench Work is a public library of **100 deterministic business workflows** for evaluating AI agents across Finance, Marketing, Operations, RevOps, and Sales. It describes the work agents were asked to perform, the simulated systems and tool contracts they could use, and the grading mode applied to each workflow.

Explore the [live CorpBench benchmark](https://revensi.com/corpbench) for the interactive leaderboard, findings, cost and speed comparisons, department results, failure modes, reliability, and methodology.

Load the viewer-ready [CorpBench dataset on Hugging Face](https://huggingface.co/datasets/revensi/CorpBench), with separate `workflows` and `results` configurations.

## Work 1.3 library

| Department | Workflows | Browse |
| --- | ---: | --- |
| Finance | 20 | [`data/work/1.3/workflows/finance`](data/work/1.3/workflows/finance) |
| Marketing | 20 | [`data/work/1.3/workflows/marketing`](data/work/1.3/workflows/marketing) |
| Operations | 20 | [`data/work/1.3/workflows/operations`](data/work/1.3/workflows/operations) |
| RevOps | 20 | [`data/work/1.3/workflows/revops`](data/work/1.3/workflows/revops) |
| Sales | 20 | [`data/work/1.3/workflows/sales`](data/work/1.3/workflows/sales) |

Start with the versioned [`manifest.json`](data/work/1.3/manifest.json). It lists every workflow, its public path and version, department totals, the benchmark configuration, and SHA-256 digests. Each workflow definition publishes:

- its objective, systems, limits, and agent-visible tool contracts;
- deterministic grader metadata;
- capabilities, version history, and retirement policy; and
- fixture identifiers and versions, marked `withheld`.

Seeded workspaces, expected states, reference traces, evaluator implementation, raw run evidence, provider configuration, and private research material are intentionally not published. This repository is a public workflow library and aggregate-data release, not a standalone benchmark runner.

## Published results

The machine-readable aggregate behind the live Work 1.3 page is available at [`results/work/1.3/report.json`](results/work/1.3/report.json). It preserves the generated cohort metadata and contains aggregate scores only; it does not contain prompts, trajectories, final workspaces, or run-level evidence.

## Data contract and versioning

The current public schemas are in [`schemas/`](schemas). Run the repository validator with Node.js 20 or newer:

```sh
npm ci
npm test
```

Library and result paths are versioned as `data/work/<version>/` and `results/work/<version>/`. The immutable tag for this release is `work-v1.3`; future Work releases use `work-v<version>`.

## Citation

Citation metadata is provided in [`CITATION.cff`](CITATION.cff). The preferred short citation is:

> RevensiAI. *CorpBench Work 1.3*. 2026. https://github.com/RevensiAI/CorpBench

## Project status

This repository is maintained as a read-only public release surface. RevensiAI is not accepting external contributions at this time. Security concerns can be reported using [`SECURITY.md`](SECURITY.md).

Copyright 2026 RevensiAI. Released under the [Apache License 2.0](LICENSE).
