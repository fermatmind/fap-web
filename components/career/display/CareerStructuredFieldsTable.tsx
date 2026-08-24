import type { CareerPublishedStructuredRow } from "@/lib/career/publishedComponentContract";

type Props = {
  rows: CareerPublishedStructuredRow[];
  path: string;
  label: string;
  locale: "en" | "zh";
};

export function CareerStructuredFieldsTable({ rows, path, label, locale }: Props) {
  const columns = [
    { key: "label", title: locale === "zh" ? "项目" : "Field" },
    { key: "value", title: locale === "zh" ? "内容" : "Value" },
    ...(rows.some((row) => row.alternate_value !== null)
      ? [{ key: "alternate_value" as const, title: locale === "zh" ? "补充内容" : "Alternate value" }]
      : []),
    ...(rows.some((row) => row.secondary_value !== null)
      ? [{ key: "secondary_value" as const, title: locale === "zh" ? "第二补充内容" : "Secondary value" }]
      : []),
  ] as const;

  return (
    <div className="my-4 w-full min-w-0 max-w-full overflow-x-auto" data-career-table-wrap={path}>
      <table className="m-0 w-full min-w-[560px] border-collapse text-left text-sm" data-career-api-table={path}>
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col" className="border border-[#E5E9F2] bg-[#EEF1FB] px-4 py-3 font-bold text-[#2C3E8C]">
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${path}:${rowIndex}`} className="even:bg-[#FBFCFE]">
              {columns.map((column, columnIndex) => {
                const value = row[column.key] ?? "";
                const Cell = columnIndex === 0 ? "th" : "td";
                return (
                  <Cell
                    key={column.key}
                    {...(columnIndex === 0 ? { scope: "row" as const } : {})}
                    className="min-w-36 border border-[#E5E9F2] px-4 py-3 align-top leading-6 text-[#2a3346]"
                    data-career-api-field={`${path}[${rowIndex}].${column.key}`}
                  >
                    {value}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
