export const ITEM_IDS = [
  "shock_12",
  "bullet_bill",
  "thunder_cloud",
  "blue_shell",
  "shock_9",
  "shock_10",
  "shock_11",
] as const;

export type ItemId = (typeof ITEM_IDS)[number];

export const ITEMS: Array<{
  id: ItemId;
  label: string;
  sx: number;
  sy: number;
}> = [
  { id: "shock_12", label: "サンダー 12th", sx: 0, sy: 0 },
  { id: "bullet_bill", label: "キラー", sx: 64, sy: 0 },
  { id: "thunder_cloud", label: "サンダークラウド", sx: 128, sy: 0 },
  { id: "blue_shell", label: "トゲゾーこうら", sx: 192, sy: 0 },
  { id: "shock_9", label: "サンダー 9th", sx: 256, sy: 0 },
  { id: "shock_10", label: "サンダー 10th", sx: 0, sy: 64 },
  { id: "shock_11", label: "サンダー 11th", sx: 64, sy: 64 },
];

export const ITEM_BY_ID = Object.fromEntries(
  ITEMS.map((item) => [item.id, item])
) as Record<ItemId, (typeof ITEMS)[number]>;

export const DIGIT_SPRITES: Record<
  string,
  { sx: number; sy: number; sw: number; sh: number }
> = {
  "0": { sx: 134, sy: 65, sw: 51, sh: 61 },
  "1": { sx: 207, sy: 65, sw: 33, sh: 61 },
  "2": { sx: 261, sy: 65, sw: 53, sh: 61 },
  "3": { sx: 7, sy: 129, sw: 50, sh: 61 },
  "4": { sx: 69, sy: 129, sw: 54, sh: 61 },
  "5": { sx: 133, sy: 129, sw: 54, sh: 61 },
  "6": { sx: 197, sy: 129, sw: 53, sh: 61 },
  "7": { sx: 261, sy: 129, sw: 53, sh: 61 },
  "8": { sx: 6, sy: 193, sw: 52, sh: 61 },
  "9": { sx: 69, sy: 193, sw: 53, sh: 61 },
};

export type CounterState = {
  version: 1;
  order: ItemId[];
  items: Record<ItemId, { count: number; visible: boolean }>;
  updatedAt: number;
};

export const DEFAULT_STATE: CounterState = {
  version: 1,
  order: ITEM_IDS.slice() as ItemId[],
  items: {
    shock_12: { count: 0, visible: true },
    bullet_bill: { count: 0, visible: true },
    thunder_cloud: { count: 0, visible: false },
    blue_shell: { count: 0, visible: false },
    shock_9: { count: 0, visible: false },
    shock_10: { count: 0, visible: false },
    shock_11: { count: 0, visible: false },
  },
  updatedAt: 0,
};

export function normalizeState(input: unknown): CounterState {
  const raw = (input && typeof input === "object" ? input : {}) as Partial<CounterState>;
  const rawItems =
    raw.items && typeof raw.items === "object"
      ? (raw.items as Partial<CounterState["items"]>)
      : {};

  const order: ItemId[] = [];
  if (Array.isArray(raw.order)) {
    for (const value of raw.order) {
      if (
        typeof value === "string" &&
        (ITEM_IDS as readonly string[]).includes(value) &&
        !order.includes(value as ItemId)
      ) {
        order.push(value as ItemId);
      }
    }
  }
  for (const id of ITEM_IDS) {
    if (!order.includes(id)) order.push(id);
  }

  const items = {} as CounterState["items"];
  for (const id of ITEM_IDS) {
    const candidate = rawItems[id];
    const count = Math.max(
      0,
      Math.floor(Number(candidate?.count ?? DEFAULT_STATE.items[id].count) || 0)
    );
    items[id] = {
      count,
      visible:
        typeof candidate?.visible === "boolean"
          ? candidate.visible
          : DEFAULT_STATE.items[id].visible,
    };
  }

  return {
    version: 1,
    order,
    items,
    updatedAt:
      typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt)
        ? raw.updatedAt
        : 0,
  };
}
