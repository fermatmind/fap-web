import { archiveWave3cScenarios } from "./helpers/archive-wave3c-flow";
import cybersecurity_awareness from "../../lib/questionnaires/data/cybersecurity-awareness.json";
import freelance_ready from "../../lib/questionnaires/data/freelance-ready.json";
import libertarian from "../../lib/questionnaires/data/libertarian.json";
import project_management from "../../lib/questionnaires/data/project-management.json";
import remote_work from "../../lib/questionnaires/data/remote-work.json";
import spanish_proficiency from "../../lib/questionnaires/data/spanish-proficiency.json";
import spelling_test from "../../lib/questionnaires/data/spelling-test.json";
import verbal_reasoning from "../../lib/questionnaires/data/verbal-reasoning.json";
import workplace_technology from "../../lib/questionnaires/data/workplace-technology.json";

for (const bank of [cybersecurity_awareness, freelance_ready, libertarian, project_management, remote_work, spanish_proficiency, spelling_test, verbal_reasoning, workplace_technology]) {
  archiveWave3cScenarios(bank);
}
