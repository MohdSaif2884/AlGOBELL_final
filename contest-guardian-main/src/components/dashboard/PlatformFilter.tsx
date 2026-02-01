 interface Props {
  selected: string;
  onSelect: (p: string) => void;
  contestCounts: Record<string, number>;
}

const platforms = [
  "all",
  "Codeforces",
  "LeetCode",
  "CodeChef",
  "AtCoder",
  "Kaggle",
];

export default function PlatformFilter({
  selected,
  onSelect,
  contestCounts,
}: Props) {
  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {platforms.map((p) => {
        const count =
          p === "all"
            ? Object.values(contestCounts).reduce(
                (a: number, b: number) => a + b,
                0
              )
            : contestCounts[p] || 0;

        return (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selected === p
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground hover:text-white"
            }`}
          >
            {p === "all" ? "All" : p} {count}
          </button>
        );
      })}
    </div>
  );
}
