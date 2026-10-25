export const OPERATOR_MODEL = "claude-haiku-5-5";

export const OPERATOR_SYSTEM = `You are Fork's cafe operator. You answer by using the simulation, not by guessing.

Workflow for a what-if question:
1. inspect_market (search the item and the kind of people named in the question).
2. create_scenario with a short name unless the user named an existing scenario to edit. Never edit the base universe.
3. edit_menu so the user can see the change on the menu.
4. run_day. Use ensemble=true when they ask whether they would win, beat base, or want 5x; otherwise one run.
5. inspect_day, then finish with named people.

Rules:
- Tools do the work. The map will play; do not claim you ran a day unless run_day returned.
- Cite real persona names from inspect_day. Talk like a manager: dollars vs base, who came, who stayed away, why. Write plain sentences with no markdown.
- chance is a share of a group, not a yes/no for the whole persona.
- If the question is only about the current menu or people, inspect and finish. Do not run a day unless the question needs a counterfactual.
- If a tool errors, fix the arguments or explain. Do not invent results.`;

export const OPERATOR_TOOLS = [
  {
    name: "inspect_market",
    description:
      "Read your cafe, rivals, menu with scenario edits, matching competitor items, and personas.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Item or people to focus on, e.g. oat latte or students",
        },
      },
    },
  },
  {
    name: "suggest_items",
    description:
      "Nearby drinks and pastries you do not sell, ranked by persona demand.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "create_scenario",
    description:
      "Create and switch to a new what-if scenario. Required before editing the menu if you are on base.",
    input_schema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
  },
  {
    name: "edit_menu",
    description:
      "Change the current scenario menu. Prices are dollars. Opens the menu so the user can see it.",
    input_schema: {
      type: "object",
      properties: {
        set_prices: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price: { type: "number" },
            },
            required: ["name", "price"],
          },
        },
        add_items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              section: { type: "string" },
              price: { type: "number" },
            },
            required: ["name", "price"],
          },
        },
        remove_items: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "run_day",
    description:
      "Simulate the next day. Dots play on the map. Wait for this to finish before inspect_day.",
    input_schema: {
      type: "object",
      properties: {
        ensemble: {
          type: "boolean",
          description: "If true, run 5 independent samples and average them",
        },
      },
    },
  },
  {
    name: "inspect_day",
    description:
      "Revenue vs base, who is new, who did not come, and why. Opens the day list.",
    input_schema: {
      type: "object",
      properties: {
        day: { type: "number", description: "Omit for the latest day" },
      },
    },
  },
  {
    name: "finish",
    description: "Give the manager the answer after you have the evidence.",
    input_schema: {
      type: "object",
      properties: {
        headline: { type: "string" },
        answer: { type: "string" },
        open_day: { type: "number" },
      },
      required: ["headline", "answer"],
    },
  },
] as const;

export function toolLabel(name: string, input: Record<string, unknown>) {
  if (name === "inspect_market") {
    const query = String(input.query ?? "").trim();
    return query ? `Reading the market for “${query}”` : "Reading the market";
  }
  if (name === "suggest_items") return "Finding items you do not sell";
  if (name === "create_scenario")
    return `Opening scenario “${String(input.name ?? "Untitled")}”`;
  if (name === "edit_menu") return "Editing the menu";
  if (name === "run_day")
    return input.ensemble ? "Running a 5x day" : "Running the next day";
  if (name === "inspect_day")
    return input.day ? `Reading day ${input.day}` : "Reading the day results";
  if (name === "finish") return "Writing the answer";
  return name;
}
