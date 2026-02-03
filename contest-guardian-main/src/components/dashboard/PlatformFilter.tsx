 interface Props {
  selected: string;
  onSelect: (p: string) => void;
  contestCounts: Record<string, number>;
}

const platforms = [
  "all",
  "codeforces",
  "leetcode",
  "codechef",
  "atcoder",
  "kaggle",
  "hackerrank",
  "hackerearth",
  "topcoder",
];

const label = (p: string) => {
  if (p === "all") return "All";
  return p.charAt(0).toUpperCase() + p.slice(1);
};

export default function PlatformFilter({
  selected,
  onSelect,
  contestCounts,
}: Props) {
  const getCount = (p: string) => {
    if (p === "all") {
      return Object.values(contestCounts).reduce(
        (a, b) => a + b,
        0
      );
    }
    return contestCounts[p] || 0;
  };

  return (
    <div className="flex gap-2 flex-wrap mb-6">
      {platforms.map((p) => {
        const count = getCount(p);

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
            {label(p)} {count}
          </button>
        );
      })}
    </div>
  );
}
