import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const digest = (contents) => createHash("sha256").update(contents).digest("hex");
const manifestPath = resolve(root, "data/work/1.3/manifest.json");
const reportPath = resolve(root, "results/work/1.3/report.json");

const [manifestSchema, workflowSchema, reportSchema, manifest, report] = await Promise.all([
  readJson(resolve(root, "schemas/work-manifest.schema.json")),
  readJson(resolve(root, "schemas/workflow-definition.schema.json")),
  readJson(resolve(root, "schemas/report.schema.json")),
  readJson(manifestPath),
  readJson(reportPath),
]);

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateManifest = ajv.compile(manifestSchema);
const validateWorkflow = ajv.compile(workflowSchema);
const validateReport = ajv.compile(reportSchema);

function assertValid(validate, value, label) {
  if (!validate(value)) throw new Error(`${label} is invalid: ${ajv.errorsText(validate.errors, { separator: "\n" })}`);
}

function keysBelow(value) {
  if (Array.isArray(value)) return value.flatMap(keysBelow);
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => [key, ...keysBelow(child)]);
}

function stringsBelow(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsBelow);
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(stringsBelow);
}

async function jsonFilesBelow(path) {
  const entries = await readdir(path, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const child = resolve(path, entry.name);
    return entry.isDirectory() ? jsonFilesBelow(child) : entry.name.endsWith(".json") ? [child] : [];
  }))).flat().sort();
}

assertValid(validateManifest, manifest, "Work manifest");
assertValid(validateReport, report, "Work report");
if (report.benchmarkVersion !== "1.3" || report.workflowCount !== 100 || report.departmentCount !== 5 || report.modelCount !== 18) {
  throw new Error("Work report does not match the published 1.3 benchmark");
}

const reportContents = await readFile(reportPath);
if (digest(reportContents) !== manifest.results.sha256) throw new Error("Work report checksum does not match the manifest");

const forbiddenKeys = new Set(["path", "expectedPath", "referencePath", "workspace", "expected", "reference", "events", "reproduction", "runId", "executor"]);
const ids = new Set();
const departmentCounts = { finance: 0, marketing: 0, operations: 0, revops: 0, sales: 0 };
for (const entry of manifest.workflows) {
  const path = resolve(root, "data/work/1.3", entry.path);
  const contents = await readFile(path);
  if (digest(contents) !== entry.sha256) throw new Error(`${entry.id} checksum does not match the manifest`);
  const workflow = JSON.parse(contents.toString("utf8"));
  assertValid(validateWorkflow, workflow, entry.id);
  if (workflow.id !== entry.id || workflow.version !== entry.version || workflow.department !== entry.department) {
    throw new Error(`${entry.id} metadata does not match the manifest`);
  }
  if (ids.has(entry.id)) throw new Error(`Duplicate workflow ID: ${entry.id}`);
  ids.add(entry.id);
  departmentCounts[entry.department] += 1;
  const forbidden = keysBelow(workflow).filter((key) => forbiddenKeys.has(key));
  if (forbidden.length) throw new Error(`${entry.id} contains withheld fields: ${[...new Set(forbidden)].join(", ")}`);
  const unsafeString = stringsBelow(workflow).find((value) => /(?:^|["'])\/Users\/|[A-Za-z]:\\|OPENROUTER_API_KEY\s*=|\bsk-[A-Za-z0-9_-]{16,}/.test(value));
  if (unsafeString) throw new Error(`${entry.id} contains a private path or credential-shaped value`);
}

if (ids.size !== 100 || Object.values(departmentCounts).some((count) => count !== 20)) {
  throw new Error(`Expected 100 workflows and 20 per department, received ${ids.size}: ${JSON.stringify(departmentCounts)}`);
}

const workflowRoot = resolve(root, "data/work/1.3/workflows");
const actualFiles = (await jsonFilesBelow(workflowRoot)).map((path) => relative(resolve(root, "data/work/1.3"), path));
const declaredFiles = manifest.workflows.map(({ path }) => path).sort();
if (JSON.stringify(actualFiles) !== JSON.stringify(declaredFiles)) throw new Error("Workflow files do not exactly match the manifest");

console.log("Validated CorpBench Work 1.3: 100 workflows, 5 departments, 18-model aggregate report.");
