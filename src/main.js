const ideaList = document.querySelector("#ideaList");
const ideaForm = document.querySelector("#ideaForm");
const detailForm = document.querySelector("#detailForm");
const detailTitle = document.querySelector("#detailTitle");
const compositeScore = document.querySelector("#compositeScore");
const outputCard = document.querySelector("#outputCard");
const incomeCard = document.querySelector("#incomeCard");
const planCard = document.querySelector("#planCard");
const incomeReadiness = document.querySelector("#incomeReadiness");
const saveStatus = document.querySelector("#saveStatus");
const copySummaryButton = document.querySelector("#copySummaryButton");
const importIdeasButton = document.querySelector("#importIdeasButton");
const exportIdeasButton = document.querySelector("#exportIdeasButton");
const importFileInput = document.querySelector("#importFileInput");
const copyLandingButton = document.querySelector("#copyLandingButton");
const landingCopy = document.querySelector("#landingCopy");
const generateSalesButton = document.querySelector("#generateSalesButton");
const copySalesButton = document.querySelector("#copySalesButton");
const salesOutput = document.querySelector("#salesOutput");
const generateOfferButton = document.querySelector("#generateOfferButton");
const copyOfferButton = document.querySelector("#copyOfferButton");
const downloadOfferButton = document.querySelector("#downloadOfferButton");
const offerPreview = document.querySelector("#offerPreview");
const statusFilter = document.querySelector("#statusFilter");
const sortMode = document.querySelector("#sortMode");
const dashboardStrip = document.querySelector("#dashboardStrip");
const waitlistForm = document.querySelector("#waitlistForm");
const waitlistSummary = document.querySelector("#waitlistSummary");
const waitlistList = document.querySelector("#waitlistList");
const exportWaitlistButton = document.querySelector("#exportWaitlistButton");
const heroWaitlistForm = document.querySelector("#heroWaitlistForm");

const STORAGE_KEY = "omnicore-workspace-v1";
let statusTimeoutId = null;
const viewState = {
  statusFilter: "all",
  sortMode: "score",
};

const detailFields = {
  objective: document.querySelector("#objective"),
  targetUser: document.querySelector("#targetUser"),
  monetization: document.querySelector("#monetization"),
  validationTime: document.querySelector("#validationTime"),
  offerTemplate: document.querySelector("#offerTemplate"),
  workflowStatus: document.querySelector("#workflowStatus"),
  incomeScore: document.querySelector("#incomeScore"),
  speedScore: document.querySelector("#speedScore"),
  automationScore: document.querySelector("#automationScore"),
  strategyScore: document.querySelector("#strategyScore"),
  assumptions: document.querySelector("#assumptions"),
  risks: document.querySelector("#risks"),
  nextActions: document.querySelector("#nextActions"),
};

const defaultIdeas = [
  {
    id: crypto.randomUUID(),
    title: "OmniCore Solo Builder OS",
    type: "Product",
    summary: "A planning and execution workspace for independent builders who want more clarity and leverage.",
    objective: "Turn OmniCore into a practical workspace that helps Alpha and later other solo builders convert ideas into structured plans.",
    targetUser: "Solo builders, creators, and independent operators",
    monetization: "Paid digital toolkit first, then lightweight app subscription",
    validationTime: "7-14 days for first landing page and concept validation",
    offerTemplate: "digital-product",
    workflowStatus: "building",
    assumptions: "People want a system that combines planning, prioritization, and AI-guided execution.\nA digital product can validate demand before full software exists.",
    risks: "Positioning may be too broad.\nThe first version could become too feature-heavy if scope is not controlled.",
    nextActions: "Define the first paid package.\nBuild a polished OmniCore dashboard MVP.\nWrite a landing page with a strong promise.",
    incomeScore: 4,
    speedScore: 4,
    automationScore: 5,
    strategyScore: 5,
  },
  {
    id: crypto.randomUUID(),
    title: "AI Automation Template Vault",
    type: "Toolkit",
    summary: "A downloadable library of automation blueprints, prompts, and workflows for solo businesses.",
    objective: "Package useful online-business automations into a low-maintenance product that can be sold repeatedly.",
    targetUser: "Freelancers, creators, and micro-business owners",
    monetization: "One-time purchase with future bundle upsells",
    validationTime: "5-10 days for first version",
    offerTemplate: "toolkit",
    workflowStatus: "idea",
    assumptions: "Buyers will pay for practical templates if the use cases are specific enough.",
    risks: "Templates may feel generic unless strongly targeted.\nDistribution will matter more than build difficulty.",
    nextActions: "Choose 3 concrete automation packs.\nCreate product outline.\nBundle with OmniCore later.",
    incomeScore: 4,
    speedScore: 5,
    automationScore: 4,
    strategyScore: 4,
  },
  {
    id: crypto.randomUUID(),
    title: "Roblox Utility Systems Pack",
    type: "System",
    summary: "Reusable Roblox modules and systems sold as a practical creator toolkit.",
    objective: "Test whether Roblox-focused tools can become a productized asset rather than a time-heavy service.",
    targetUser: "Roblox developers and creators",
    monetization: "Asset pack sales and add-on bundles",
    validationTime: "10-21 days depending on packaging quality",
    offerTemplate: "toolkit",
    workflowStatus: "researching",
    assumptions: "Useful systems can be sold faster than a full game can be monetized.",
    risks: "Requires sharper market knowledge and stronger storefront positioning.",
    nextActions: "Research common Roblox pain points.\nPick one reusable system.\nBuild a showcase demo.",
    incomeScore: 3,
    speedScore: 3,
    automationScore: 3,
    strategyScore: 3,
  },
];

const state = loadState() || {
  ideas: [
    ...defaultIdeas,
  ],
  selectedIdeaId: null,
  waitlist: [],
};

if (!state.selectedIdeaId && state.ideas.length > 0) {
  state.selectedIdeaId = state.ideas[0].id;
}

render();
setStatus("Workspace ready.");
renderSalesOutput();
renderOfferPreview();

statusFilter.addEventListener("input", () => {
  viewState.statusFilter = statusFilter.value;
  render();
});

sortMode.addEventListener("input", () => {
  viewState.sortMode = sortMode.value;
  render();
});

waitlistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveWaitlistLead(new FormData(waitlistForm), "Waitlist lead saved locally.");
  waitlistForm.reset();
});

heroWaitlistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveWaitlistLead(new FormData(heroWaitlistForm), "Early-access lead saved locally.");
  heroWaitlistForm.reset();
});

exportWaitlistButton.addEventListener("click", () => {
  const rows = [
    ["name", "email", "interest", "createdAt"],
    ...state.waitlist.map((entry) => [entry.name, entry.email, entry.interest, entry.createdAt]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  downloadTextFile("omnicore-waitlist.csv", csv, "text/csv;charset=utf-8");
  setStatus("Waitlist exported as CSV.");
});

ideaForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(ideaForm);
  const title = String(formData.get("title") || "").trim();

  if (!title) {
    return;
  }

  const idea = {
    id: crypto.randomUUID(),
    title,
    type: String(formData.get("type") || "Product"),
    summary: String(formData.get("summary") || "").trim(),
    objective: "",
    targetUser: "",
    monetization: "",
    validationTime: "",
    offerTemplate: "digital-product",
    workflowStatus: "idea",
    assumptions: "",
    risks: "",
    nextActions: "",
    incomeScore: 3,
    speedScore: 3,
    automationScore: 3,
    strategyScore: 3,
  };

  state.ideas.unshift(idea);
  state.selectedIdeaId = idea.id;
  ideaForm.reset();
  persistState();
  setStatus("Idea added and saved locally.");
  render();
});

detailForm.addEventListener("input", () => {
  const idea = getSelectedIdea();

  if (!idea) {
    return;
  }

  idea.objective = detailFields.objective.value;
  idea.targetUser = detailFields.targetUser.value;
  idea.monetization = detailFields.monetization.value;
  idea.validationTime = detailFields.validationTime.value;
  idea.offerTemplate = detailFields.offerTemplate.value;
  idea.workflowStatus = detailFields.workflowStatus.value;
  idea.assumptions = detailFields.assumptions.value;
  idea.risks = detailFields.risks.value;
  idea.nextActions = detailFields.nextActions.value;
  idea.incomeScore = Number(detailFields.incomeScore.value);
  idea.speedScore = Number(detailFields.speedScore.value);
  idea.automationScore = Number(detailFields.automationScore.value);
  idea.strategyScore = Number(detailFields.strategyScore.value);

  persistState();
  setStatus("Changes saved locally.");
  render();
});

copySummaryButton.addEventListener("click", async () => {
  const idea = getSelectedIdea();

  if (!idea) {
    setStatus("Select an idea before copying a summary.");
    return;
  }

  const summary = buildIdeaSummary(idea);

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(summary);
      setStatus("Summary copied to clipboard.");
      return;
    }
  } catch (error) {
    // Fall through to manual copy if the clipboard API is blocked.
  }

  copyTextFallback(summary, "Summary copied to clipboard.", "Copy failed. Use Export JSON as a fallback.");
});

exportIdeasButton.addEventListener("click", () => {
  const payload = {
    exportedAt: new Date().toISOString(),
    selectedIdeaId: state.selectedIdeaId,
    ideas: state.ideas,
    waitlist: state.waitlist,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "omnicore-workspace.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setStatus("Workspace exported as JSON.");
});

importIdeasButton.addEventListener("click", () => {
  importFileInput.click();
});

importFileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);

    if (!parsed || !Array.isArray(parsed.ideas)) {
      throw new Error("Invalid OmniCore workspace file.");
    }

    state.ideas = parsed.ideas.map(normalizeIdea);
    state.selectedIdeaId =
      typeof parsed.selectedIdeaId === "string" &&
      state.ideas.some((idea) => idea.id === parsed.selectedIdeaId)
        ? parsed.selectedIdeaId
        : state.ideas[0]?.id || null;

    persistState();
    render();
    setStatus("Workspace imported successfully.");
  } catch (error) {
    setStatus("Import failed. Choose a valid OmniCore JSON export.");
  } finally {
    importFileInput.value = "";
  }
});

copyLandingButton.addEventListener("click", async () => {
  const message = landingCopy.textContent.trim();

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(message);
      setStatus("Launch copy copied to clipboard.");
      return;
    }
  } catch (error) {
    // Fall back to manual copy if needed.
  }

  copyTextFallback(message, "Launch copy copied to clipboard.", "Copy failed for launch copy.");
});

generateSalesButton.addEventListener("click", () => {
  renderSalesOutput(true);
  setStatus("Sales copy generated from the selected idea.");
});

copySalesButton.addEventListener("click", async () => {
  const message = salesOutput.textContent.trim();

  if (!message) {
    setStatus("Generate sales copy first.");
    return;
  }

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(message);
      setStatus("Sales copy copied to clipboard.");
      return;
    }
  } catch (error) {
    // Fall back to manual copy if needed.
  }

  copyTextFallback(message, "Sales copy copied to clipboard.", "Copy failed for sales copy.");
});

generateOfferButton.addEventListener("click", () => {
  renderOfferPreview(true);
  setStatus("Offer card generated from the selected idea.");
});

copyOfferButton.addEventListener("click", async () => {
  const message = offerPreview.textContent.trim();

  if (!message) {
    setStatus("Generate an offer card first.");
    return;
  }

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(message);
      setStatus("Offer card copied to clipboard.");
      return;
    }
  } catch (error) {
    // Fall back to manual copy if needed.
  }

  copyTextFallback(message, "Offer card copied to clipboard.", "Copy failed for offer card.");
});

downloadOfferButton.addEventListener("click", () => {
  const idea = getSelectedIdea();

  if (!idea) {
    setStatus("Select an idea before downloading an offer card.");
    return;
  }

  const content = buildOfferCard(idea);
  downloadTextFile(`${slugify(idea.title || "omnicore-offer")}.md`, content, "text/markdown;charset=utf-8");
  setStatus("Offer card downloaded as markdown.");
});

function render() {
  renderIdeaList();
  renderDashboard();
  renderDetailForm();
  renderOutput();
  renderSalesOutput();
  renderOfferPreview();
  renderWaitlist();
}

function renderIdeaList() {
  ideaList.replaceChildren();

  const sortedIdeas = getVisibleIdeas();

  for (const idea of sortedIdeas) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "idea-card";

    if (idea.id === state.selectedIdeaId) {
      button.classList.add("is-active");
    }

    button.innerHTML = `
      <div class="idea-card-header">
        <div>
          <p class="idea-type">${idea.type}</p>
          <h3>${escapeHtml(idea.title)}</h3>
          <div class="idea-meta">
            <span class="status-pill">${escapeHtml(formatWorkflowStatus(idea.workflowStatus))}</span>
          </div>
        </div>
        <span class="score-pill">${getIdeaScore(idea)} / 20</span>
      </div>
      <p>${escapeHtml(idea.summary || "No summary yet. Capture the opportunity in one line.")}</p>
    `;

    button.addEventListener("click", () => {
      state.selectedIdeaId = idea.id;
      persistState();
      setStatus(`Focused on "${idea.title}".`);
      render();
    });

    ideaList.appendChild(button);
  }

  if (sortedIdeas.length === 0) {
    ideaList.innerHTML = "<p>No ideas match the current filter.</p>";
  }
}

function renderDashboard() {
  const ideas = state.ideas;
  const buildingCount = ideas.filter((idea) => idea.workflowStatus === "building").length;
  const validatedCount = ideas.filter((idea) => idea.workflowStatus === "validated").length;
  const bestIdea = [...ideas].sort((left, right) => getIdeaScore(right) - getIdeaScore(left))[0];

  dashboardStrip.innerHTML = `
    <div class="dashboard-card"><span class="section-label">Total ideas</span><strong>${ideas.length}</strong></div>
    <div class="dashboard-card"><span class="section-label">Building</span><strong>${buildingCount}</strong></div>
    <div class="dashboard-card"><span class="section-label">Validated</span><strong>${validatedCount}</strong></div>
    <div class="dashboard-card"><span class="section-label">Top score</span><strong>${bestIdea ? escapeHtml(bestIdea.title) : "-"}</strong></div>
  `;
}

function renderDetailForm() {
  const idea = getSelectedIdea();

  if (!idea) {
    detailTitle.textContent = "Select an idea";
    detailForm.reset();
    return;
  }

  detailTitle.textContent = idea.title;
  detailFields.objective.value = idea.objective;
  detailFields.targetUser.value = idea.targetUser;
  detailFields.monetization.value = idea.monetization;
  detailFields.validationTime.value = idea.validationTime;
  detailFields.offerTemplate.value = idea.offerTemplate;
  detailFields.workflowStatus.value = idea.workflowStatus;
  detailFields.assumptions.value = idea.assumptions;
  detailFields.risks.value = idea.risks;
  detailFields.nextActions.value = idea.nextActions;
  detailFields.incomeScore.value = String(idea.incomeScore);
  detailFields.speedScore.value = String(idea.speedScore);
  detailFields.automationScore.value = String(idea.automationScore);
  detailFields.strategyScore.value = String(idea.strategyScore);
}

function renderOutput() {
  const idea = getSelectedIdea();

  if (!idea) {
    compositeScore.textContent = "0 / 20";
    incomeReadiness.textContent = "Income readiness: --";
    outputCard.innerHTML = "<p>Select an idea to see a structured decision snapshot.</p>";
    incomeCard.innerHTML = "<p>Income analysis will appear once an idea is selected.</p>";
    planCard.innerHTML = "<p>A 7-day execution sprint will appear once an idea is selected.</p>";
    return;
  }

  const score = getIdeaScore(idea);
  const incomeScorecard = getIncomeScorecard(idea);
  const sprintPlan = buildSprintPlan(idea, incomeScorecard);
  compositeScore.textContent = `${score} / 20`;
  incomeReadiness.textContent = `Income readiness: ${incomeScorecard.label} (${incomeScorecard.score} / 15)`;

  outputCard.innerHTML = `
    <h3>${escapeHtml(idea.title)}</h3>
    <p><strong>Status:</strong> ${escapeHtml(formatWorkflowStatus(idea.workflowStatus))}</p>
    <p><strong>Objective:</strong> ${escapeHtml(fillEmpty(idea.objective, "Clarify what success looks like for this idea."))}</p>
    <p><strong>Target user:</strong> ${escapeHtml(fillEmpty(idea.targetUser, "Define the first user this should help."))}</p>
    <p><strong>Monetization:</strong> ${escapeHtml(fillEmpty(idea.monetization, "Choose how this could make money online."))}</p>
    <p><strong>Validation window:</strong> ${escapeHtml(fillEmpty(idea.validationTime, "Estimate how fast the first test can happen."))}</p>
    <p><strong>Priority read:</strong> ${escapeHtml(getPrioritySummary(idea, score))}</p>
    <p><strong>Next actions:</strong></p>
    <ol class="output-list">${toListItems(idea.nextActions)}</ol>
  `;

  incomeCard.innerHTML = `
    <h3>Income path analysis</h3>
    <p><strong>Near-term fit:</strong> ${escapeHtml(incomeScorecard.summary)}</p>
    <p><strong>Monetization pressure:</strong> ${escapeHtml(incomeScorecard.monetization)}</p>
    <p><strong>Launch difficulty:</strong> ${escapeHtml(incomeScorecard.launchDifficulty)}</p>
    <p><strong>Why it matters:</strong> ${escapeHtml(incomeScorecard.whyItMatters)}</p>
    <p><strong>Recommendation:</strong> ${escapeHtml(incomeScorecard.recommendation)}</p>
  `;

  planCard.innerHTML = `
    <h3>7-day execution sprint</h3>
    <p><strong>Sprint focus:</strong> ${escapeHtml(sprintPlan.focus)}</p>
    <ol class="output-list">${sprintPlan.days.map((day) => `<li>${escapeHtml(day)}</li>`).join("")}</ol>
  `;
}

function renderSalesOutput(forceRegenerate = false) {
  const idea = getSelectedIdea();

  if (!idea) {
    salesOutput.textContent = "Select an idea, then generate a rough product page from its strategy data.";
    return;
  }

  if (!forceRegenerate && salesOutput.dataset.ideaId === idea.id) {
    return;
  }

  salesOutput.dataset.ideaId = idea.id;
  salesOutput.textContent = buildSalesCopy(idea);
}

function renderOfferPreview(forceRegenerate = false) {
  const idea = getSelectedIdea();

  if (!idea) {
    offerPreview.textContent = "Select an idea to turn it into a compact, sellable one-page offer.";
    return;
  }

  if (!forceRegenerate && offerPreview.dataset.ideaId === idea.id) {
    return;
  }

  offerPreview.dataset.ideaId = idea.id;
  offerPreview.textContent = buildOfferCard(idea);
}

function renderWaitlist() {
  const count = state.waitlist.length;
  const latest = state.waitlist[0];

  waitlistSummary.innerHTML = `
    <p><strong>Total leads:</strong> ${count}</p>
    <p><strong>Latest:</strong> ${latest ? `${escapeHtml(latest.email)} (${escapeHtml(latest.interest)})` : "No leads yet"}</p>
  `;

  if (count === 0) {
    waitlistList.innerHTML = "<p>No waitlist entries yet.</p>";
    return;
  }

  waitlistList.innerHTML = state.waitlist
    .slice(0, 6)
    .map((entry) => `
      <div class="waitlist-entry">
        <strong>${escapeHtml(entry.name || "Unnamed")}</strong>
        <p>${escapeHtml(entry.email)}</p>
        <p>${escapeHtml(entry.interest)}</p>
      </div>
    `)
    .join("");
}

function saveWaitlistLead(formData, successMessage) {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    return;
  }

  state.waitlist.unshift({
    id: crypto.randomUUID(),
    name: String(formData.get("name") || "").trim(),
    email,
    interest: String(formData.get("interest") || "General updates"),
    createdAt: new Date().toISOString(),
  });

  persistState();
  renderWaitlist();
  setStatus(successMessage);
}

function getSelectedIdea() {
  return state.ideas.find((idea) => idea.id === state.selectedIdeaId) || null;
}

function buildIdeaSummary(idea) {
  return [
    `Title: ${idea.title}`,
    `Type: ${idea.type}`,
    `Status: ${formatWorkflowStatus(idea.workflowStatus)}`,
    `Score: ${getIdeaScore(idea)} / 20`,
    `Objective: ${fillEmpty(idea.objective, "Not defined yet")}`,
    `Target user: ${fillEmpty(idea.targetUser, "Not defined yet")}`,
    `Monetization: ${fillEmpty(idea.monetization, "Not defined yet")}`,
    `Validation window: ${fillEmpty(idea.validationTime, "Not defined yet")}`,
    `Assumptions: ${fillEmpty(idea.assumptions, "Not defined yet")}`,
    `Risks: ${fillEmpty(idea.risks, "Not defined yet")}`,
    `Next actions: ${fillEmpty(idea.nextActions, "Not defined yet")}`,
  ].join("\n");
}

function buildSalesCopy(idea) {
  const score = getIdeaScore(idea);
  const incomeScorecard = getIncomeScorecard(idea);
  const headline = buildHeadline(idea);
  const subheadline = buildSubheadline(idea);
  const template = getTemplateConfig(idea.offerTemplate);
  const audience = fillEmpty(idea.targetUser, "solo builders who need more clarity and execution discipline");
  const monetization = fillEmpty(idea.monetization, "a simple paid digital offer");
  const validation = fillEmpty(idea.validationTime, "a fast validation cycle");
  const actions = splitLines(idea.nextActions);

  return [
    `Headline`,
    `${headline}`,
    ``,
    `Subheadline`,
    `${subheadline}`,
    ``,
    `Offer type`,
    `${template.label}`,
    ``,
    `Current status`,
    `${formatWorkflowStatus(idea.workflowStatus)}`,
    ``,
    `Who it's for`,
    `Built for ${audience}.`,
    ``,
    `Why it matters`,
    `${idea.title} is designed to turn vague ideas into a focused path toward execution and income. Current readiness: ${incomeScorecard.label} (${incomeScorecard.score}/15 income-readiness, ${score}/20 strategic score).`,
    ``,
    `What it helps you do`,
    ...template.benefits.map((item) => `- ${item}`),
    `- move toward ${monetization}`,
    ``,
    `Launch angle`,
    `${template.launchAngle} This offer should be testable within ${validation}. The goal is not perfection. The goal is to create enough clarity and momentum to validate whether people care.`,
    ``,
    `Starter CTA`,
    `${template.ctaPrefix} ${idea.title} and start turning ideas into structured execution.`,
    ``,
    `Founder note`,
    `${idea.title} is being shaped around one principle: build systems that increase freedom, capability, and online income without unnecessary complexity.`,
    ``,
    `Next proof points to add`,
    ...((actions.length > 0 ? actions : ["Define the first three proof points or deliverables."]).map((item) => `- ${item}`)),
  ].join("\n");
}

function buildOfferCard(idea) {
  const incomeScorecard = getIncomeScorecard(idea);
  const score = getIdeaScore(idea);
  const template = getTemplateConfig(idea.offerTemplate);
  const audience = fillEmpty(idea.targetUser, "solo builders");
  const monetization = fillEmpty(idea.monetization, "a simple paid digital offer");
  const validation = fillEmpty(idea.validationTime, "a fast validation cycle");
  const assumptions = splitLines(idea.assumptions);
  const risks = splitLines(idea.risks);
  const actions = splitLines(idea.nextActions);

  return [
    `# ${idea.title}`,
    ``,
    `## Positioning`,
    `${buildSubheadline(idea)}`,
    ``,
    `## Offer type`,
    `${template.label}`,
    ``,
    `## Workflow status`,
    `${formatWorkflowStatus(idea.workflowStatus)}`,
    ``,
    `## Audience`,
    `${audience}`,
    ``,
    `## Core outcome`,
    `${fillEmpty(idea.objective, "Clarify the objective and define the first meaningful user result.")}`,
    ``,
    `## Monetization`,
    `${monetization}`,
    ``,
    `## Readiness`,
    `Income readiness: ${incomeScorecard.label} (${incomeScorecard.score}/15)`,
    `Strategic score: ${score}/20`,
    `Validation target: ${validation}`,
    ``,
    `## Why this could work`,
    `${incomeScorecard.summary}`,
    ``,
    `## Core benefits`,
    ...toMarkdownList(template.benefits, "Define the main benefits of the offer."),
    ``,
    `## Assumptions`,
    ...toMarkdownList(assumptions, "Define the assumptions this offer depends on."),
    ``,
    `## Risks`,
    ...toMarkdownList(risks, "List the main reasons this offer could fail or stall."),
    ``,
    `## Next actions`,
    ...toMarkdownList(actions, "Define the first three practical actions."),
    ``,
    `## Offer CTA`,
    `Get the first version of ${idea.title} and start turning ideas into a smaller, clearer path to execution.`,
  ].join("\n");
}

function buildHeadline(idea) {
  const user = fillEmpty(idea.targetUser, "solo builders");
  const template = getTemplateConfig(idea.offerTemplate);
  return `${idea.title}: ${template.headlineHook} for ${user}`;
}

function buildSubheadline(idea) {
  const objective = fillEmpty(idea.objective, "bring more clarity, prioritization, and execution to important projects");
  const template = getTemplateConfig(idea.offerTemplate);
  return `${template.subheadlinePrefix} ${lowercaseFirst(objective)}.`;
}

function getIdeaScore(idea) {
  return idea.incomeScore + idea.speedScore + idea.automationScore + idea.strategyScore;
}

function getVisibleIdeas() {
  return [...state.ideas]
    .filter((idea) => viewState.statusFilter === "all" || idea.workflowStatus === viewState.statusFilter)
    .sort((left, right) => {
      switch (viewState.sortMode) {
        case "income":
          return getIncomeScorecard(right).score - getIncomeScorecard(left).score;
        case "status":
          return getWorkflowRank(right.workflowStatus) - getWorkflowRank(left.workflowStatus);
        case "title":
          return left.title.localeCompare(right.title);
        case "score":
        default:
          return getIdeaScore(right) - getIdeaScore(left);
      }
    });
}

function getPrioritySummary(idea, score) {
  if (score >= 17) {
    return "High-priority candidate. This looks strong for both leverage and near-term momentum.";
  }

  if (score >= 13) {
    return "Promising direction. Worth shaping into a smaller validation sprint before going deeper.";
  }

  return "Keep this alive, but reduce scope or sharpen the positioning before prioritizing it.";
}

function getIncomeScorecard(idea) {
  const monetizationClarity = scoreMonetizationClarity(idea.monetization);
  const validationSpeed = scoreValidationSpeed(idea.validationTime);
  const directness = scoreDirectness(idea.type, idea.summary, idea.objective);
  const score = monetizationClarity + validationSpeed + directness;

  if (score >= 12) {
    return {
      score,
      label: "strong",
      summary: "This idea has a credible short path toward helping Alpha reach consistent online income.",
      monetization: "The monetization path is clear enough to test without major infrastructure.",
      launchDifficulty: "Reasonable. This looks launchable as a focused MVP or sellable package.",
      whyItMatters: "High-scoring ideas create momentum and reduce the time between building and learning from the market.",
      recommendation: "Keep the scope tight and test this quickly with a page, offer, or early product build.",
    };
  }

  if (score >= 9) {
    return {
      score,
      label: "moderate",
      summary: "This could support the income goal, but the path needs sharper positioning or a smaller initial offer.",
      monetization: "There is some monetization potential, but it may still be too vague or indirect.",
      launchDifficulty: "Moderate. The idea probably needs a tighter first version before it becomes an income asset.",
      whyItMatters: "Good ideas often fail because they stay broad. Tightening the offer can dramatically improve viability.",
      recommendation: "Reduce scope, choose a narrower buyer, and define the first paid version before building deeper.",
    };
  }

  return {
    score,
    label: "weak",
    summary: "This idea is not yet strong for the 500 EUR/month objective.",
    monetization: "The monetization path is currently too indirect, too slow, or too unclear.",
    launchDifficulty: "High relative to expected near-term return.",
    whyItMatters: "Low-readiness ideas can still matter strategically, but they should not dominate short-term focus.",
    recommendation: "Treat this as a secondary idea unless you can simplify it into a more direct online offer.",
  };
}

function buildSprintPlan(idea, incomeScorecard) {
  const title = idea.title;
  const monetization = fillEmpty(idea.monetization, "the first paid version");
  const targetUser = fillEmpty(idea.targetUser, "the first narrow buyer");
  const readiness = incomeScorecard.label;
  const firstAction = splitLines(idea.nextActions)[0] || "Define the first concrete deliverable.";

  if (readiness === "strong") {
    return {
      focus: `Ship a validation-ready version of ${title} and test whether people will pay for ${monetization}.`,
      days: [
        `Day 1: sharpen the promise for ${targetUser} and define the smallest paid offer.`,
        `Day 2: turn ${title} into a clear MVP scope with one core outcome and one ideal buyer.`,
        `Day 3: build or refine the product surface so it demonstrates the core value quickly.`,
        `Day 4: write concise landing-page copy focused on pain, result, and offer.`,
        `Day 5: package the first version and prepare a simple purchase or interest path.`,
        `Day 6: share it with a small set of real people or communities that match ${targetUser}.`,
        `Day 7: review feedback, objections, and signals, then decide whether to double down or narrow further.`,
      ],
    };
  }

  if (readiness === "moderate") {
    return {
      focus: `Reduce ambiguity around ${title} until it becomes a smaller, more direct offer.`,
      days: [
        `Day 1: rewrite the idea around one buyer and one painful problem.`,
        `Day 2: define how ${title} could make money without extra complexity.`,
        `Day 3: shrink the concept to the smallest version worth testing.`,
        `Day 4: create a draft page or summary that explains the offer in plain language.`,
        `Day 5: build the minimum useful artifact, template, or screen that proves the concept.`,
        `Day 6: show it to people and ask whether they would use or buy it.`,
        `Day 7: use the response to either sharpen, merge, or pause the idea.`,
      ],
    };
  }

  return {
    focus: `Reshape ${title} before investing heavily, so it supports the 500 EUR/month objective more directly.`,
    days: [
      `Day 1: identify why this idea is weak for near-term online income.`,
      `Day 2: list three simpler variations that could be sold faster.`,
      `Day 3: choose the variation with the clearest buyer and fastest validation path.`,
      `Day 4: define the smallest offer and a better monetization route than ${monetization}.`,
      `Day 5: turn ${firstAction.toLowerCase()} into a concrete deliverable.`,
      `Day 6: write a one-page concept and stress-test it against Alpha's goals.`,
      `Day 7: decide whether to archive, delay, or relaunch the idea in a sharper form.`,
    ],
  };
}

function scoreMonetizationClarity(value) {
  const text = value.toLowerCase();

  if (!text) {
    return 1;
  }

  if (hasAny(text, ["subscription", "paid", "sale", "sales", "purchase", "bundle", "product", "toolkit"])) {
    return 5;
  }

  if (hasAny(text, ["app", "membership", "license", "template"])) {
    return 4;
  }

  if (hasAny(text, ["ads", "audience", "later"])) {
    return 2;
  }

  return 3;
}

function scoreValidationSpeed(value) {
  const text = value.toLowerCase();

  if (!text) {
    return 2;
  }

  if (hasAny(text, ["3", "5", "7", "days", "1 week", "2 days"])) {
    return 5;
  }

  if (hasAny(text, ["10", "14", "2 weeks"])) {
    return 4;
  }

  if (hasAny(text, ["21", "month", "months"])) {
    return 2;
  }

  return 3;
}

function scoreDirectness(type, summary, objective) {
  const text = `${type} ${summary} ${objective}`.toLowerCase();

  if (hasAny(text, ["toolkit", "template", "product", "workspace", "dashboard", "automation"])) {
    return 5;
  }

  if (hasAny(text, ["system", "platform", "creator"])) {
    return 4;
  }

  if (hasAny(text, ["game", "broad", "research"])) {
    return 2;
  }

  return 3;
}

function hasAny(value, fragments) {
  return fragments.some((fragment) => value.includes(fragment));
}

function toListItems(value) {
  const items = splitLines(value);
  const content = items.length > 0 ? items : ["Define the first three practical actions."];

  return content
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

function splitLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function lowercaseFirst(value) {
  if (!value) {
    return value;
  }

  return value.charAt(0).toLowerCase() + value.slice(1);
}

function toMarkdownList(items, fallback) {
  const content = items.length > 0 ? items : [fallback];
  return content.map((item) => `- ${item}`);
}

function getTemplateConfig(templateKey) {
  switch (templateKey) {
    case "toolkit":
      return {
        label: "Toolkit",
        headlineHook: "a reusable toolkit",
        subheadlinePrefix: "Use a practical toolkit to",
        benefits: [
          "clarify the real objective",
          "pressure-test assumptions and risks",
          "reuse proven assets instead of starting from zero",
        ],
        launchAngle: "Position it as a bundle of reusable assets with immediate practical value.",
        ctaPrefix: "Get the toolkit version of",
      };
    case "micro-saas":
      return {
        label: "Micro SaaS",
        headlineHook: "a lean software tool",
        subheadlinePrefix: "Use a lightweight software product to",
        benefits: [
          "reduce friction in the user's workflow",
          "create a repeatable path to value",
          "support recurring usage instead of one-time use",
        ],
        launchAngle: "Position it around one painful problem and one clear software outcome.",
        ctaPrefix: "Try the first version of",
      };
    case "service-lite":
      return {
        label: "Service-lite Offer",
        headlineHook: "a productized service path",
        subheadlinePrefix: "Use a focused service-backed offer to",
        benefits: [
          "clarify the real objective",
          "reduce custom work through a repeatable process",
          "move toward faster client validation",
        ],
        launchAngle: "Package the service tightly so it feels like a product, not open-ended freelancing.",
        ctaPrefix: "Book the first version of",
      };
    case "digital-product":
    default:
      return {
        label: "Digital product",
        headlineHook: "a focused digital product",
        subheadlinePrefix: "Use a focused system to",
        benefits: [
          "clarify the real objective",
          "pressure-test assumptions and risks",
          "build a smaller first version",
        ],
        launchAngle: "Position it as a simple digital asset people can buy without needing a long sales process.",
        ctaPrefix: "Get the first version of",
      };
  }
}

function formatWorkflowStatus(status) {
  switch (status) {
    case "researching":
      return "Researching";
    case "building":
      return "Building";
    case "selling":
      return "Selling";
    case "validated":
      return "Validated";
    case "paused":
      return "Paused";
    case "idea":
    default:
      return "Idea";
  }
}

function getWorkflowRank(status) {
  switch (status) {
    case "selling":
      return 5;
    case "building":
      return 4;
    case "validated":
      return 3;
    case "researching":
      return 2;
    case "idea":
      return 1;
    case "paused":
    default:
      return 0;
  }
}

function fillEmpty(value, fallback) {
  return value.trim() || fallback;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function copyTextFallback(value, successMessage, errorMessage) {
  const helper = document.createElement("textarea");
  helper.value = value;
  helper.setAttribute("readonly", "true");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();

  try {
    document.execCommand("copy");
    setStatus(successMessage);
  } catch (error) {
    setStatus(errorMessage);
  }

  helper.remove();
}

function downloadTextFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "") || "omnicore-offer";
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    setStatus("Local save failed. Your browser may be blocking storage.");
  }
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (!parsed || !Array.isArray(parsed.ideas)) {
      return null;
    }

    return {
      ideas: parsed.ideas.map(normalizeIdea),
      selectedIdeaId: typeof parsed.selectedIdeaId === "string" ? parsed.selectedIdeaId : null,
      waitlist: Array.isArray(parsed.waitlist) ? parsed.waitlist.map(normalizeWaitlistEntry) : [],
    };
  } catch (error) {
    return null;
  }
}

function normalizeIdea(idea) {
  return {
    id: typeof idea.id === "string" ? idea.id : crypto.randomUUID(),
    title: typeof idea.title === "string" ? idea.title : "Untitled idea",
    type: typeof idea.type === "string" ? idea.type : "Product",
    summary: typeof idea.summary === "string" ? idea.summary : "",
    objective: typeof idea.objective === "string" ? idea.objective : "",
    targetUser: typeof idea.targetUser === "string" ? idea.targetUser : "",
    monetization: typeof idea.monetization === "string" ? idea.monetization : "",
    validationTime: typeof idea.validationTime === "string" ? idea.validationTime : "",
    offerTemplate: typeof idea.offerTemplate === "string" ? idea.offerTemplate : "digital-product",
    workflowStatus: typeof idea.workflowStatus === "string" ? idea.workflowStatus : "idea",
    assumptions: typeof idea.assumptions === "string" ? idea.assumptions : "",
    risks: typeof idea.risks === "string" ? idea.risks : "",
    nextActions: typeof idea.nextActions === "string" ? idea.nextActions : "",
    incomeScore: clampScore(idea.incomeScore),
    speedScore: clampScore(idea.speedScore),
    automationScore: clampScore(idea.automationScore),
    strategyScore: clampScore(idea.strategyScore),
  };
}

function normalizeWaitlistEntry(entry) {
  return {
    id: typeof entry.id === "string" ? entry.id : crypto.randomUUID(),
    name: typeof entry.name === "string" ? entry.name : "",
    email: typeof entry.email === "string" ? entry.email : "",
    interest: typeof entry.interest === "string" ? entry.interest : "General updates",
    createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString(),
  };
}

function clampScore(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Math.round(numericValue)));
}

function setStatus(message) {
  saveStatus.textContent = message;

  if (statusTimeoutId) {
    window.clearTimeout(statusTimeoutId);
  }

  statusTimeoutId = window.setTimeout(() => {
    saveStatus.textContent = "";
    statusTimeoutId = null;
  }, 2200);
}
