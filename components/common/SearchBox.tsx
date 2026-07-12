type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBox({
  value,
  onChange,
}: Props) {
  return (
    <input
      placeholder="タイトル・著者検索"
      className="border rounded p-2 w-full"
      value={value}
      onChange={(e)=>onChange(e.target.value)}
    />
  );
}